"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { FilterState, OutcomeProfile, StandardNode, ControlFamily } from "@/types/standards"
import { Search, Filter, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react"

interface ControlPanelProps {
  filters: FilterState
  profiles: OutcomeProfile[]
  standards: StandardNode[]
  onFiltersChange: (filters: FilterState) => void
}

const controlFamilies: ControlFamily[] = ["Security", "Privacy", "BCM", "ServiceMgmt", "RiskGovernance", "AIGovernance"]

export function ControlPanel({ filters, profiles, standards, onFiltersChange }: ControlPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const allTags = Array.from(new Set(standards.flatMap((s) => s.tags))).sort()

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const toggleFamily = (family: ControlFamily) => {
    const newFamilies = filters.families.includes(family)
      ? filters.families.filter((f) => f !== family)
      : [...filters.families, family]
    updateFilters({ families: newFamilies })
  }

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag]
    updateFilters({ tags: newTags })
  }

  if (isCollapsed) {
    return (
      <div className="w-12 border-r border-border bg-card">
        <div className="p-2">
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(false)} className="w-full">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 border-r border-border bg-card">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-semibold">Controls</h2>
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(true)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Profile Selection */}
          <div className="space-y-2">
            <Label>Outcome Profile</Label>
            <Select
              value={filters.profile || "none"}
              onValueChange={(value) => updateFilters({ profile: value === "none" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select profile..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No profile</SelectItem>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="space-y-2">
            <Label>Search Standards</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          {/* Control Families */}
          <div className="space-y-3">
            <Label>Control Families</Label>
            <div className="space-y-2">
              {controlFamilies.map((family) => (
                <div key={family} className="flex items-center space-x-2">
                  <Checkbox
                    id={family}
                    checked={filters.families.includes(family)}
                    onCheckedChange={() => toggleFamily(family)}
                  />
                  <Label htmlFor={family} className="text-sm font-normal">
                    {family}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={filters.tags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Why This Matters Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="why-matters">Why this matters</Label>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <Switch
              id="why-matters"
              checked={filters.showWhyMatters}
              onCheckedChange={(checked) => updateFilters({ showWhyMatters: checked })}
            />
          </div>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() =>
              onFiltersChange({
                profile: undefined,
                families: [],
                tags: [],
                search: "",
                showWhyMatters: false,
              })
            }
            className="w-full"
          >
            <Filter className="mr-2 h-4 w-4" />
            Clear All Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
