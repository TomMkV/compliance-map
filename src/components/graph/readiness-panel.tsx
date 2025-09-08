"use client"

import type { StandardNode, OutcomeProfile, PathState } from "@/types/standards"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ShareButton } from "./share-button"
import { ExportMenu } from "./export-menu"
import { computeReadinessScore, computePlanningMetrics } from "@/lib/scoring"

interface ReadinessPanelProps {
  path: PathState
  standards: StandardNode[]
  profile?: OutcomeProfile
}

export function ReadinessPanel({ path, standards, profile }: ReadinessPanelProps) {
  const selected = standards.filter((s) => path.selectedStandards.includes(s.id))
  const readiness = profile ? computeReadinessScore(selected, profile) : null
  const planning = computePlanningMetrics(selected, profile, standards)

  if (!profile || path.selectedStandards.length === 0) {
    return (
      <Card className="border-t border-border rounded-none bg-muted/30">
        <CardContent className="py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Select a profile and add standards to see planning metrics
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
            <div className="flex items-center gap-8 flex-wrap">
              {/* Outcome coverage (formerly readiness) */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Outcome Coverage</span>
                  <Badge variant="outline">{Math.round((readiness?.score || 0) * 100)}%</Badge>
                </div>
                <Progress value={(readiness?.score || 0) * 100} className="w-48" />
              </div>

              {/* Planning metrics */}
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Estimated Effort</div>
                  <div className="text-sm font-medium">{planning.totalEffortPoints} pts</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Timeline (critical)</div>
                  <div className="text-sm font-medium">~{planning.timelineWeeks} weeks</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Complexity</div>
                  <div className="text-sm font-medium">{planning.complexityScore}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Evidence Load</div>
                  <div className="text-sm font-medium">{planning.evidenceLoad}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Mandatory Gaps</div>
                  <div className="text-sm font-medium">{planning.mandatoryGaps}</div>
                </div>
              </div>

              {/* Quick wins / high impact */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Next best actions:</span>
                <div className="flex gap-1">
                  {planning.quickWins.map((id) => (
                    <Badge key={id} variant="secondary" className="text-xs">{id}</Badge>
                  ))}
                </div>
              </div>

              {/* Critical path */}
              {planning.criticalPath.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Critical path:</span>
                  <div className="flex items-center gap-1">
                    {planning.criticalPath.map((id, i) => (
                      <div key={`${id}-${i}`} className="flex items-center gap-1">
                        <Badge variant="outline" className="text-xs">{id}</Badge>
                        {i < planning.criticalPath.length - 1 && <span className="text-muted-foreground">→</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
