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
