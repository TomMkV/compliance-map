export type EdgeType = 'precedes' | 'complementary' | 'supersedes' | 'overlaps';

export type ControlFamily =
  | 'Security'
  | 'Privacy'
  | 'BCM'
  | 'ServiceMgmt'
  | 'RiskGovernance'
  | 'AIGovernance';

export interface RelatedEdge {
  target: string;
  type: EdgeType;
  weight?: number;
  note?: string;
}

export interface StandardNode {
  id: string;
  title: string;
  summary: string;
  url: string;
  tags: string[];
  families: ControlFamily[];
  version?: string;
  status?: 'active' | 'deprecated' | 'superseded';
  jurisdiction?: string[];
  related: RelatedEdge[];
}

export interface OutcomeProfile {
  id: string;
  name: string;
  description: string;
  weights: Partial<Record<ControlFamily, number>>;
  phases: { name: string; items: string[] }[];
  required?: string[];
}
