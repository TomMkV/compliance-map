import type { ControlFamily, OutcomeProfile, StandardNode } from '@/types/standards';

export interface ScoreBreakdownItem {
  family: ControlFamily;
  covered: number;
  weight: number;
  contribution: number;
}

export interface ScoreResult {
  score: number;
  maxScore: number;
  percent: number;
  breakdown: ScoreBreakdownItem[];
  drivers: ScoreBreakdownItem[];
}

const FAMILIES: ControlFamily[] = ['Security','Privacy','BCM','ServiceMgmt','RiskGovernance','AIGovernance'];

export function computeCoverageByFamily(selected: StandardNode[]): Record<ControlFamily, number> {
  const coverage: Record<ControlFamily, number> = Object.fromEntries(FAMILIES.map(f => [f, 0])) as Record<ControlFamily, number>;
  for (const node of selected) {
    for (const fam of node.families) {
      coverage[fam] = 1;
    }
  }
  return coverage;
}

export function computeReadinessScore(selected: StandardNode[], profile: OutcomeProfile): ScoreResult {
  const coverage = computeCoverageByFamily(selected);
  const entries = Object.entries(profile.weights) as [ControlFamily, number][];
  const breakdown: ScoreBreakdownItem[] = entries.map(([fam, weight]) => ({
    family: fam,
    covered: coverage[fam] ?? 0,
    weight,
    contribution: (coverage[fam] ?? 0) * weight,
  }));
  const score = breakdown.reduce((s, b) => s + b.contribution, 0);
  const maxScore = breakdown.reduce((s, b) => s + b.weight, 0) || 1;
  const percent = score / maxScore;
  const drivers = breakdown.filter(b => b.contribution >= 0.1 * maxScore)
                           .sort((a,b) => b.contribution - a.contribution);
  return { score, maxScore, percent, breakdown, drivers };
}

export function getRecommendedPath(profile: OutcomeProfile, standards: StandardNode[]): string[] {
  const phases = profile.phases?.flatMap((p) => p.items) ?? []
  const unique = Array.from(new Set(phases))
  // Filter to only IDs that exist in standards
  const idSet = new Set(standards.map((s) => s.id))
  return unique.filter((id) => idSet.has(id))
}

// ---------- Planning metrics ----------
export interface PlanningMetrics {
  totalEffortPoints: number;
  timelineWeeks: number;
  complexityScore: number;
  evidenceLoad: number;
  mandatoryGaps: number;
  criticalPath: string[];
  quickWins: string[];
  highImpact: string[];
}

function effortWeightForFamilies(families: ControlFamily[]): number {
  // Heuristic weights by family burdens
  let w = 0;
  for (const f of families) {
    if (f === 'Privacy' || f === 'ServiceMgmt') w += 1.2;
    else if (f === 'Security') w += 1.0;
    else if (f === 'BCM') w += 0.8;
    else if (f === 'AIGovernance') w += 1.0;
    else if (f === 'RiskGovernance') w += 0.6;
  }
  return w;
}

function computeNodeEffort(node: StandardNode): number {
  const base = 1.5;
  const fam = effortWeightForFamilies(node.families);
  const cert = node.certifiable ? 1.0 : 0;
  const audit = node.auditable ? 0.8 : 0;
  return base + fam + cert + audit;
}

function buildPrecedesGraph(nodes: StandardNode[]) {
  const indexById = new Map<string, number>();
  nodes.forEach((n, i) => indexById.set(n.id, i));
  const adj: number[][] = nodes.map(() => []);
  for (let i = 0; i < nodes.length; i++) {
    for (const r of nodes[i].related) {
      if (r.type === 'precedes') {
        const j = indexById.get(r.target);
        if (j !== undefined) adj[i].push(j);
      }
    }
  }
  return adj;
}

function longestPathByEffort(nodes: StandardNode[]): { path: string[]; effort: number } {
  if (nodes.length === 0) return { path: [], effort: 0 };
  const adj = buildPrecedesGraph(nodes);
  const n = nodes.length;
  const memoEffort = new Array<number>(n).fill(Number.NaN);
  const memoNext = new Array<number>(n).fill(-1);
  const visiting = new Array<boolean>(n).fill(false);

  const dfs = (i: number): number => {
    if (!Number.isNaN(memoEffort[i])) return memoEffort[i];
    if (visiting[i]) {
      // Cycle detected: stop traversal beyond this node
      const stop = computeNodeEffort(nodes[i]);
      memoEffort[i] = stop;
      memoNext[i] = -1;
      return stop;
    }
    visiting[i] = true;
    const base = computeNodeEffort(nodes[i]);
    let best = base;
    let nextIdx = -1;
    for (const j of adj[i]) {
      const candidate = base + dfs(j);
      if (candidate > best) { best = candidate; nextIdx = j; }
    }
    visiting[i] = false;
    memoEffort[i] = best;
    memoNext[i] = nextIdx;
    return best;
  };

  let bestEff = 0; let start = 0;
  for (let i = 0; i < n; i++) {
    const e = dfs(i);
    if (e > bestEff) { bestEff = e; start = i; }
  }
  const path: string[] = [];
  let cur = start;
  const guard = new Set<number>();
  while (cur !== -1 && !guard.has(cur)) { path.push(nodes[cur].id); guard.add(cur); cur = memoNext[cur]; }
  return { path, effort: bestEff };
}

function computeMandatoryGaps(selectedIds: Set<string>, profile: OutcomeProfile | undefined, standards: StandardNode[]): number {
  const candidateIds = profile ? new Set(getRecommendedPath(profile, standards)) : new Set<string>(standards.map(s => s.id));
  let gaps = 0;
  for (const s of standards) {
    if (!candidateIds.has(s.id)) continue;
    if (s.enforceability === 'Mandatory' && !selectedIds.has(s.id)) gaps++;
  }
  return gaps;
}

function marginalWeightGain(candidate: StandardNode, selected: StandardNode[], profile?: OutcomeProfile): number {
  if (!profile) return 0;
  const selectedFamilies = new Set<ControlFamily>(selected.flatMap(s => s.families));
  let gain = 0;
  for (const fam of candidate.families) {
    if (!selectedFamilies.has(fam)) {
      const w = profile.weights[fam] ?? 0;
      gain += w;
    }
  }
  return gain;
}

export function computePlanningMetrics(selected: StandardNode[], profile: OutcomeProfile | undefined, standards: StandardNode[]): PlanningMetrics {
  const selectedIds = new Set(selected.map(s => s.id));
  const totalEffortPoints = selected.reduce((sum, s) => sum + computeNodeEffort(s), 0);

  // Critical path timeline: assume 1 effort point ~= 1 week, limited parallelism factor of 2
  const { path: criticalPath, effort: criticalEffort } = longestPathByEffort(selected);
  const parallelismFactor = 2;
  const naiveParallelWeeks = Math.ceil(totalEffortPoints / parallelismFactor);
  const timelineWeeks = Math.max(Math.ceil(criticalEffort), naiveParallelWeeks);

  // Complexity: average of families breadth + cert/audit signals
  const complexityScore = selected.length === 0 ? 0 : Number((selected
    .map(s => (s.families.length * 0.8) + (s.certifiable ? 1 : 0) + (s.auditable ? 0.8 : 0))
    .reduce((a,b) => a+b, 0) / selected.length).toFixed(1));

  // Evidence load heuristic
  const evidenceLoad = selected
    .map(s => (s.certifiable ? 3 : 0) + (s.auditable ? 2 : 0) + (s.families.includes('ServiceMgmt') ? 2 : 0) + (s.families.includes('Privacy') ? 2 : 0) + (s.families.includes('Security') ? 1 : 0) + (s.families.includes('BCM') ? 1 : 0))
    .reduce((a,b) => a+b, 0);

  const mandatoryGaps = computeMandatoryGaps(selectedIds, profile, standards);

  // Recommendations among applicable standards (prefer profile phases if present)
  const applicableIds = profile ? new Set(getRecommendedPath(profile, standards)) : new Set(standards.map(s => s.id));
  const unselected = standards.filter(s => applicableIds.has(s.id) && !selectedIds.has(s.id));
  const scored = unselected.map(s => {
    const mg = marginalWeightGain(s, selected, profile);
    const effort = computeNodeEffort(s);
    return { id: s.id, mg, effort, ratio: effort > 0 ? mg / effort : 0 };
  });
  const quickWins = scored.filter(x => x.mg > 0).sort((a,b) => b.ratio - a.ratio).slice(0,3).map(x => x.id);
  const highImpact = scored.filter(x => x.mg > 0).sort((a,b) => b.mg - a.mg).slice(0,3).map(x => x.id);

  return { totalEffortPoints: Math.round(totalEffortPoints), timelineWeeks, complexityScore, evidenceLoad, mandatoryGaps, criticalPath, quickWins, highImpact };
}
