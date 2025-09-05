import { z } from "zod"

const EdgeTypeSchema = z.enum(["precedes", "complementary", "supersedes", "overlaps"])
const ControlFamilySchema = z.enum(["Security", "Privacy", "BCM", "ServiceMgmt", "RiskGovernance", "AIGovernance"])

const RelatedStandardSchema = z.object({
  id: z.string(),
  type: EdgeTypeSchema,
  description: z.string().optional(),
})

const StandardNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  url: z.string().url(),
  tags: z.array(z.string()),
  families: z.array(ControlFamilySchema),
  version: z.string().optional(),
  status: z.enum(["active", "draft", "withdrawn"]).optional(),
  jurisdiction: z.string().optional(),
  related: z.array(RelatedStandardSchema),
})

const ProfilePhaseSchema = z.object({
  name: z.string(),
  description: z.string(),
  standards: z.array(z.string()),
})

const OutcomeProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  weights: z.record(ControlFamilySchema, z.number().min(0).max(1)),
  phases: z.array(ProfilePhaseSchema),
  required: z.array(z.string()).optional(),
})

export const StandardsDataSchema = z.object({
  standards: z.array(StandardNodeSchema),
})

export const ProfilesDataSchema = z.object({
  profiles: z.array(OutcomeProfileSchema),
})

export function validateStandardsData(data: unknown) {
  try {
    return StandardsDataSchema.parse(data)
  } catch (error) {
    console.warn("Standards data validation failed:", error)
    return null
  }
}

export function validateProfilesData(data: unknown) {
  try {
    return ProfilesDataSchema.parse(data)
  } catch (error) {
    console.warn("Profiles data validation failed:", error)
    return null
  }
}
