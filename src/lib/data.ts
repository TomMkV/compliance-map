import { z } from 'zod';
import type { ControlFamily, EdgeType, OutcomeProfile, StandardNode } from '@/types/standards';
import standardsJson from '@/data/iso-standards.json';
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

export function getStandards(): StandardNode[] {
  return z.array(StandardNodeSchema).parse(standardsJson);
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
