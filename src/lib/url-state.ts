import type { FilterState, PathState } from "@/types/standards"

export function serializeState(filters: FilterState, path: PathState): string {
  const params = new URLSearchParams()

  if (filters.profile) params.set("profile", filters.profile)
  if (filters.families.length > 0) params.set("families", filters.families.join(","))
  if (filters.tags.length > 0) params.set("tags", filters.tags.join(","))
  if (filters.search) params.set("search", filters.search)
  if (filters.showWhyMatters) params.set("why", "true")
  if (path.selectedStandards.length > 0) params.set("selected", path.selectedStandards.join(","))
  if (path.customOrder.length > 0) params.set("order", path.customOrder.join(","))

  return params.toString()
}

export function deserializeState(searchParams: URLSearchParams): {
  filters: FilterState
  path: PathState
} {
  const safeGetArray = (key: string, validValues?: string[]) => {
    const value = searchParams.get(key)
    if (!value) return []

    const items = value.split(",").filter(Boolean)
    if (validValues) {
      return items.filter((item) => validValues.includes(item))
    }
    return items
  }

  const validFamilies = ["Security", "Privacy", "BCM", "ServiceMgmt", "RiskGovernance", "AIGovernance"]

  return {
    filters: {
      profile: searchParams.get("profile") || undefined,
      families: safeGetArray("families", validFamilies) as any[],
      tags: safeGetArray("tags"),
      search: searchParams.get("search") || "",
      showWhyMatters: searchParams.get("why") === "true",
    },
    path: {
      selectedStandards: safeGetArray("selected"),
      customOrder: safeGetArray("order"),
    },
  }
}

export function generateShareableUrl(filters: FilterState, path: PathState, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== "undefined" ? window.location.origin : "")
  const params = serializeState(filters, path)
  return `${base}/graph${params ? `?${params}` : ""}`
}

export function validateUrlState(searchParams: URLSearchParams): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Validate families
  const families = searchParams.get("families")
  if (families) {
    const validFamilies = ["Security", "Privacy", "BCM", "ServiceMgmt", "RiskGovernance", "AIGovernance"]
    const providedFamilies = families.split(",")
    const invalidFamilies = providedFamilies.filter((f) => !validFamilies.includes(f))
    if (invalidFamilies.length > 0) {
      errors.push(`Invalid control families: ${invalidFamilies.join(", ")}`)
    }
  }

  // Validate boolean parameters
  const whyParam = searchParams.get("why")
  if (whyParam && whyParam !== "true" && whyParam !== "false") {
    errors.push("Invalid 'why' parameter - must be 'true' or 'false'")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
