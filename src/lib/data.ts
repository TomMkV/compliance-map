import { z } from 'zod';
import type { ControlFamily, EdgeType, OutcomeProfile, StandardNode } from '@/types/standards';
import finalJson from '@/data/final_compliance_map_dataset.json';
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
  // augmented metadata
  enforceability?: string;
  certifiable?: boolean;
  auditable?: boolean;
  source?: string;
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

    const statusRaw = typeof n.status === 'string' ? n.status : undefined;
    const statusSanitized = (statusRaw === 'active' || statusRaw === 'deprecated' || statusRaw === 'superseded')
      ? statusRaw
      : undefined;

    const versionSanitized = (typeof n.version === 'string' && n.version.trim().length > 0) ? n.version : undefined;

    const node: StandardNode = {
      id: n.id,
      title: n.title,
      summary: n.summary,
      url: n.url,
      tags: n.tags ?? [],
      families: safeFamilies,
      version: versionSanitized,
      status: statusSanitized,
      jurisdiction: (Array.isArray(n.jurisdiction) ? n.jurisdiction : (n.jurisdiction ? [n.jurisdiction as unknown as string] : undefined)),
      related,
    };
    // Note: we intentionally do not put augmented metadata into StandardNode to keep the core schema tight.
    // If needed for UI display later, we can extend StandardNode or add a parallel metadata map.
    return node;
  });

  // Validate against canonical schema
  const parsed = z.array(StandardNodeSchema).parse(normalized);

  return augmentRelationships(parsed);
}

export function getStandards(): StandardNode[] {
  // Accept either canonical or expanded dataset structure
  const raw = finalJson as unknown as ExpandedNode[];
  return normalizeExpanded(raw);
}

// --- Relationship augmentation rules for better map connectivity ---
function augmentRelationships(nodes: StandardNode[]): StandardNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n] as const));

  const add = (source: string, target: string, type: EdgeType) => {
    const s = byId.get(source);
    const t = byId.get(target);
    if (!s || !t) return;
    if (!s.related) s.related = [];
    const exists = s.related.some((r) => r.target === target && r.type === type);
    if (!exists) s.related.push({ target, type });
  };

  // Core ISO 27001 family
  [
    'ISO-27002','ISO-27003','ISO-27004','ISO-27005','ISO-27034','ISO-27035','ISO-27036','ISO-27050'
  ].forEach((id) => add(id, 'ISO-27001', 'complementary'));
  add('ISO-27031','ISO-22301','complementary');
  add('ISO-22301','ISO-27001','complementary');
  add('ISO-27018','ISO-27701','complementary');
  add('ISO-27017','ISO-27018','complementary');

  // Service management and quality
  add('ISO-20000','ISO-27001','complementary');
  add('ISO-20000','ISO-22301','complementary');
  add('ISO-20000','ISO-9001','complementary');
  add('ISO-9001','ISO-20000','overlaps');
  add('ISO-9001','ISO-27001','overlaps');
  add('ISO-38500','ISO-27001','complementary');
  add('ISO-38500','ISO-20000','complementary');

  // Privacy/legal
  ['GDPR','CCPA','HIPAA'].forEach((id) => add(id,'ISO-27701','overlaps'));

  // SOC
  add('SOC2','ISO-27001','overlaps');
  add('SOC1','SOC2','overlaps');
  add('SOC3','SOC2','overlaps');

  // NIST and companions
  add('NIST-CSF','ISO-27001','overlaps');
  add('NIST-SP-800-53','NIST-CSF','complementary');
  add('CIS-Controls','NIST-CSF','overlaps');
  add('CIS-Controls','ISO-27001','overlaps');
  add('CSA-CCM','ISO-27017','overlaps');
  add('CSA-CCM','NIST-CSF','overlaps');
  add('PCI-DSS','ISO-27001','overlaps');
  add('FedRAMP','NIST-CSF','overlaps');
  add('SS-584','ISO-27017','overlaps');

  // AI
  add('ISO-42001','ISO-27001','complementary');
  add('ISO-42001','ISO-27701','complementary');

  return nodes;
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
