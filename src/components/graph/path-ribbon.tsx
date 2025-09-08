"use client"

import type { StandardNode, OutcomeProfile, PathState } from "@/types/standards"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ShareButton } from "./share-button"
import { ExportMenu } from "./export-menu"
import { getRecommendedPath } from "@/lib/scoring"
import { Plus, X, RotateCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PathRibbonProps {
  path: PathState
  standards: StandardNode[]
  profile?: OutcomeProfile
  profiles: OutcomeProfile[]
  onPathChange: (path: PathState) => void
  onProfileChange: (profileId: string | undefined) => void
}

export function PathRibbon({ path, standards, profile, profiles, onPathChange, onProfileChange }: PathRibbonProps) {
  const addRecommendedPath = () => {
    if (!profile) return

    const recommendedPath = getRecommendedPath(profile, standards)
    const newStandards = recommendedPath.filter((id) => !path.selectedStandards.includes(id))

    onPathChange({
      ...path,
      selectedStandards: [...path.selectedStandards, ...newStandards],
    })
  }

  const addPhase = (items: string[]) => {
    const additions = items.filter((id) => standards.some((s) => s.id === id) && !path.selectedStandards.includes(id))
    if (additions.length === 0) return
    onPathChange({
      ...path,
      selectedStandards: [...path.selectedStandards, ...additions],
      customOrder: [...path.customOrder, ...additions],
    })
  }

  const clearPath = () => {
    onPathChange({
      ...path,
      selectedStandards: [],
      customOrder: [],
    })
  }

  const removeFromPath = (standardId: string) => {
    onPathChange({
      ...path,
      selectedStandards: path.selectedStandards.filter((id) => id !== standardId),
      customOrder: path.customOrder.filter((id) => id !== standardId),
    })
  }

  if (!profile && path.selectedStandards.length === 0) {
    return (
      <Card className="border-b border-border rounded-none bg-muted/30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-sm">Implementation Path</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">What are you trying to achieve?</span>
              <Select value={undefined} onValueChange={(v) => onProfileChange(v === "none" ? undefined : v)}>
                <SelectTrigger size="sm"><SelectValue placeholder="Select outcome..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No profile</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShareButton />
            <ExportMenu path={path} standards={standards} profile={profile} />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="border-b border-border rounded-none bg-muted/30">
      <div className="container mx-auto px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-medium text-sm">Implementation Path</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Outcome:</span>
              <Select value={profile?.id || "none"} onValueChange={(v) => onProfileChange(v === "none" ? undefined : v)}>
                <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No profile</SelectItem>
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShareButton />
            <ExportMenu path={path} standards={standards} profile={profile} />
            {profile && (
              <Button variant="outline" size="sm" onClick={addRecommendedPath} className="text-xs bg-transparent">
                <Plus className="mr-1 h-3 w-3" />
                Add All
              </Button>
            )}
            {path.selectedStandards.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearPath} className="text-xs bg-transparent">
                <RotateCcw className="mr-1 h-3 w-3" />
                Clear Path
              </Button>
            )}
          </div>
        </div>

        {profile && profile.phases?.length > 0 && (
          <div className="flex items-start gap-4 overflow-x-auto pb-1">
            {profile.phases.map((phase) => (
              <div key={phase.name} className="min-w-56 rounded-md border bg-card">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                  <div className="text-xs font-medium">{phase.name}</div>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => addPhase(phase.items)}>
                    <Plus className="h-3 w-3 mr-1" /> Add phase
                  </Button>
                </div>
                <div className="p-2 flex flex-wrap gap-1">
                  {phase.items.map((id) => (
                    <Badge key={id} variant={path.selectedStandards.includes(id) ? "default" : "outline"} className="text-xs">
                      {id}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {path.selectedStandards.length === 0 ? (
              <span className="text-sm text-muted-foreground">{profile ? `Select phases or add all for ${profile.name}` : "No standards selected"}</span>
            ) : (
              path.selectedStandards.map((standardId, index) => {
                const standard = standards.find((s) => s.id === standardId)
                if (!standard) return null
                return (
                  <div key={standardId} className="flex items-center gap-1">
                    <Badge variant="default" className="flex items-center gap-1 pr-1">
                      <span className="text-xs font-mono">{index + 1}</span>
                      <span>{standard.id}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-primary-foreground/20"
                        onClick={() => removeFromPath(standardId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                    {index < path.selectedStandards.length - 1 && <span className="text-muted-foreground">→</span>}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
