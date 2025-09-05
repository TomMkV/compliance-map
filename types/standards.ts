export type EdgeType = "precedes" | "complementary" | "supersedes" | "overlaps"

export type ControlFamily = "Security" | "Privacy" | "BCM" | "ServiceMgmt" | "RiskGovernance" | "AIGovernance"

export interface RelatedStandard {
  id: string
  type: EdgeType
  description?: string
}

export interface StandardNode {
  id: string
  title: string
  summary: string
  url: string
  tags: string[]
  families: ControlFamily[]
  version?: string
  status?: "active" | "draft" | "withdrawn"
  jurisdiction?: string
  related: RelatedStandard[]
}

export interface ProfilePhase {
  name: string
  description: string
  standards: string[]
}

export interface OutcomeProfile {
  id: string
  name: string
  description: string
  weights: Record<ControlFamily, number>
  phases: ProfilePhase[]
  required?: string[]
}

export interface FilterState {
  profile?: string
  families: ControlFamily[]
  tags: string[]
  search: string
  showWhyMatters: boolean
}

export interface PathState {
  selectedStandards: string[]
  customOrder: string[]
}
