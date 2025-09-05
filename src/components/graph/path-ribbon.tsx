"use client"

import type { StandardNode, OutcomeProfile, PathState } from "@/types/standards"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ShareButton } from "./share-button"
import { ExportMenu } from "./export-menu"
import { getRecommendedPath } from "@/lib/scoring"
import { Plus, X, RotateCcw } from "lucide-react"

interface PathRibbonProps {
  path: PathState
  standards: StandardNode[]
  profile?: OutcomeProfile
  onPathChange: (path: PathState) => void
}

export function PathRibbon({ path, standards, profile, onPathChange }: PathRibbonProps) {
  const addRecommendedPath = () => {
    if (!profile) return

    const recommendedPath = getRecommendedPath(profile, standards)
    const newStandards = recommendedPath.filter((id) => !path.selectedStandards.includes(id))

    onPathChange({
      ...path,
      selectedStandards: [...path.selectedStandards, ...newStandards],
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

  const moveStandard = (standardId: string, direction: "left" | "right") => {
    const currentIndex = path.selectedStandards.indexOf(standardId)
    if (currentIndex === -1) return

    const newOrder = [...path.selectedStandards]
    const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1

    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      ;[newOrder[currentIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[currentIndex]]
      onPathChange({
        ...path,
        selectedStandards: newOrder,
        customOrder: newOrder,
      })
    }
  }

  if (path.selectedStandards.length === 0 && !profile) {
    return null
  }

  return (
    <Card className="border-b border-border rounded-none bg-muted/30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-medium text-sm">Implementation Path</h3>

            {path.selectedStandards.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                {path.selectedStandards.map((standardId, index) => {
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
                })}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                {profile ? `Select standards for ${profile.name}` : "No standards selected"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ShareButton />

            <ExportMenu path={path} standards={standards} profile={profile} />

            {profile && (
              <Button variant="outline" size="sm" onClick={addRecommendedPath} className="text-xs bg-transparent">
                <Plus className="mr-1 h-3 w-3" />
                Add Recommended
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
      </div>
    </Card>
  )
}
