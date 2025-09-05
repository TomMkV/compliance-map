"use client"

import type { StandardNode, OutcomeProfile, PathState } from "@/types/standards"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ShareButton } from "./share-button"
import { ExportMenu } from "./export-menu"
import { computeReadinessScore } from "@/lib/scoring"

interface ReadinessPanelProps {
  path: PathState
  standards: StandardNode[]
  profile?: OutcomeProfile
}

export function ReadinessPanel({ path, standards, profile }: ReadinessPanelProps) {
  const selected = standards.filter((s) => path.selectedStandards.includes(s.id))
  const score = profile ? computeReadinessScore(selected, profile) : null

  if (!profile || path.selectedStandards.length === 0) {
    return (
      <Card className="border-t border-border rounded-none bg-muted/30">
        <CardContent className="py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Select a profile and add standards to see your readiness score
              </p>
              <ShareButton />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-t border-border rounded-none bg-muted/30">
      <CardContent className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Readiness Score */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Readiness Score</span>
                  <Badge variant="outline">{Math.round((score?.score || 0) * 100)}%</Badge>
                </div>
                <Progress value={(score?.score || 0) * 100} className="w-48" />
              </div>

              {/* Family Breakdown */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Coverage by family:</span>
                <div className="flex gap-2">
                  {score?.breakdown
                    .filter((item) => item.weight > 0)
                    .sort((a, b) => b.contribution - a.contribution)
                    .slice(0, 3)
                    .map((item) => (
                      <Badge key={item.family} variant="secondary" className="text-xs">
                        {item.family}: {Math.round((item.covered || 0) * 100)}%
                      </Badge>
                    ))}
                </div>
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-2">
              <ShareButton />
              <ExportMenu path={path} standards={standards} profile={profile} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
