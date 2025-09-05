import { z } from 'zod';
import type { ControlFamily, EdgeType, OutcomeProfile, StandardNode } from '@/types/standards';
import expandedJson from '@/data/expanded_compliance_standards.json';
import profilesJson from '@/data/profiles.json';

const EDGE_TYPES = ['precedes', 'complementary', 'supersedes', 'overlaps'] as const;
const FAMILY_TYPES = ['Security', 'Privacy', 'BCM', 'ServiceMgmt', 'RiskGovernance', 'AIGovernance'] as const;

const RelatedEdgeSchema = z.object({
  target: z.string(),
  type: z.enum(EDGE_TYPES),
  weight: z.number().min(0).max(1).optional(),
  note: z.string().optional(),
});

const StandardNodeSchema: z.ZodType<StandardNode> = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  url: z.string().url(),
  tags: z.array(z.string()),
  families: z.array(z.enum(FAMILY_TYPES)),
  version: z.string().optional(),
  status: z.enum(['active', 'deprecated', 'superseded']).optional(),
  jurisdiction: z.array(z.string()).optional(),
  related: z.array(RelatedEdgeSchema),
});

const PhasesSchema = z.array(z.object({ name: z.string(), items: z.array(z.string()) }));

const OutcomeProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  weights: z.object({
    Security: z.number().optional(),
    Privacy: z.number().optional(),
    BCM: z.number().optional(),
    ServiceMgmt: z.number().optional(),
    RiskGovernance: z.number().optional(),
    AIGovernance: z.number().optional(),
  }).partial(),
  phases: PhasesSchema,
  required: z.array(z.string()).optional(),
});

// Normalize expanded dataset → canonical StandardNode
const EDGE_TYPES_SET = new Set(EDGE_TYPES);
const FAMILY_TYPES_SET = new Set(FAMILY_TYPES);

const edgeMap: Record<string, EdgeType> = {
  foundational: 'precedes',
  audits: 'complementary',
  governs: 'complementary',
  extension: 'complementary',
  integrates: 'complementary',
  supplements: 'complementary',
  aligned: 'overlaps',
  aligns: 'overlaps',
  mapped: 'overlaps',
  parallel: 'overlaps',
  sibling: 'overlaps',
  derived: 'overlaps',
  based_on: 'overlaps',
};

const familyMap: Record<string, ControlFamily> = {
  Governance: 'RiskGovernance',
  Cybersecurity: 'Security',
  Assurance: 'RiskGovernance',
  Compliance: 'RiskGovernance',
  Finance: 'RiskGovernance',
  Legal: 'RiskGovernance',
  Regional: 'RiskGovernance',
  Healthcare: 'RiskGovernance',
  AuditGovernance: 'RiskGovernance',
  Benchmark: 'Security',
  AppSec: 'Security',
};

type ExpandedNode = {
  id: string;
  title: string;
  summary: string;
  url: string;
  tags?: string[];
  families?: string[];
  version?: string;
  status?: string;
  jurisdiction?: string[];
  related?: { target: string; type: string; weight?: number; note?: string; description?: string }[];
};

function normalizeExpanded(nodes: ExpandedNode[]): StandardNode[] {
  const normalized: StandardNode[] = nodes.map((n) => {
    const familiesRaw = n.families ?? [];
    const families = Array.from(
      new Set(
        familiesRaw
          .map((f) => (FAMILY_TYPES_SET.has(f as ControlFamily) ? (f as ControlFamily) : familyMap[f] as ControlFamily))
          .filter(Boolean)
      )
    ) as ControlFamily[];
    const safeFamilies = families.length ? families : (['RiskGovernance'] as ControlFamily[]);

    const related = (n.related ?? [])
      .map((r) => {
        const t = (EDGE_TYPES_SET.has(r.type as EdgeType) ? (r.type as EdgeType) : edgeMap[r.type]);
        if (!t) return undefined;
        return { target: r.target, type: t, weight: r.weight, note: r.note ?? r.description };
      })
      .filter(Boolean) as { target: string; type: EdgeType; weight?: number; note?: string }[];

    const node: StandardNode = {
      id: n.id,
      title: n.title,
      summary: n.summary,
      url: n.url,
      tags: n.tags ?? [],
      families: safeFamilies,
      version: n.version,
      status: (n.status as any) as 'active' | 'deprecated' | 'superseded' | undefined,
      jurisdiction: n.jurisdiction,
      related,
    };
    return node;
  });

  // Validate against canonical schema
  return z.array(StandardNodeSchema).parse(normalized);
}

export function getStandards(): StandardNode[] {
  // Accept either canonical or expanded dataset structure
  const raw = expandedJson as unknown as ExpandedNode[];
  return normalizeExpanded(raw);
}

export function getProfiles(): OutcomeProfile[] {
  return z.array(OutcomeProfileSchema).parse(profilesJson) as OutcomeProfile[];
}

export type Edge = { source: string; target: string; type: EdgeType };

export function buildEdges(nodes: StandardNode[]): Edge[] {
  const edges: Edge[] = [];
  const idSet = new Set(nodes.map(n => n.id));
  for (const node of nodes) {
    for (const rel of node.related) {
      if (idSet.has(rel.target)) {
        edges.push({ source: node.id, target: rel.target, type: rel.type });
      }
    }
  }
  return edges;
}

export function listAllTags(nodes: StandardNode[]): string[] {
  return Array.from(new Set(nodes.flatMap(n => n.tags))).sort();
}

export const CONTROL_FAMILIES: ControlFamily[] = [...FAMILY_TYPES];
