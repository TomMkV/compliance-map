"use client"

import type { StandardNode, OutcomeProfile, PathState } from "@/types/standards"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ExternalLink, Plus, Info } from "lucide-react"

interface DetailsDrawerProps {
  selectedNode: string | null
  standards: StandardNode[]
  profile?: OutcomeProfile
  path: PathState
  onPathChange: (path: PathState) => void
  onClose: () => void
}

export function DetailsDrawer({ selectedNode, standards, profile, path, onPathChange, onClose }: DetailsDrawerProps) {
  const standard = selectedNode ? standards.find((s) => s.id === selectedNode) : null
  const isInPath = selectedNode ? path.selectedStandards.includes(selectedNode) : false

  const addToPath = () => {
    if (selectedNode && !isInPath) {
      onPathChange({
        ...path,
        selectedStandards: [...path.selectedStandards, selectedNode],
      })
    }
  }

  const removeFromPath = () => {
    if (selectedNode && isInPath) {
      onPathChange({
        ...path,
        selectedStandards: path.selectedStandards.filter((id) => id !== selectedNode),
      })
    }
  }

  const getWhyMatters = (standard: StandardNode, profile?: OutcomeProfile) => {
    if (!profile) return null

    const relevantFamilies = standard.families.filter((family) => (profile.weights?.[family] ?? 0) > 0)

    if (relevantFamilies.length === 0) return null

    const totalWeight = relevantFamilies.reduce((sum, family) => sum + (profile.weights?.[family] ?? 0), 0)
    return `This standard is important for ${profile.name} because it addresses ${relevantFamilies.join(", ")} requirements, which have a combined weight of ${Math.round(totalWeight * 100)}% in your compliance profile.`
  }

  return (
    <Sheet open={!!selectedNode} onOpenChange={() => onClose()}>
      <SheetContent className="w-96 sm:max-w-96 p-0">
        {standard && (
          <>
            <SheetHeader className="px-4 pt-6">
              <div className="space-y-1 pr-10">
                <SheetTitle className="text-lg">{standard.id}</SheetTitle>
                <p className="text-sm text-muted-foreground">{standard.title}</p>
              </div>
            </SheetHeader>

            <div className="mt-6 space-y-6 px-4 pb-6">
              {/* Summary */}
              <div className="space-y-2">
                <h3 className="font-medium">Summary</h3>
                <p className="text-sm text-muted-foreground text-pretty">{standard.summary}</p>
              </div>

              {/* Metadata */}
              <div className="space-y-3">
                <h3 className="font-medium">Details</h3>
                <div className="space-y-2 text-sm">
                  {standard.version && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <span>{standard.version}</span>
                    </div>
                  )}
                  {standard.status && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={standard.status === "active" ? "default" : "secondary"}>{standard.status}</Badge>
                    </div>
                  )}
                  {standard.jurisdiction && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Jurisdiction:</span>
                      <span>{standard.jurisdiction}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Control Families */}
              <div className="space-y-2">
                <h3 className="font-medium">Control Families</h3>
                <div className="flex flex-wrap gap-2">
                  {standard.families.map((family) => (
                    <Badge key={family} variant="outline">
                      {family}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <h3 className="font-medium">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {standard.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Why This Matters */}
              {profile && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Info className="h-4 w-4" />
                      Why this matters for {profile.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-pretty">{getWhyMatters(standard, profile)}</p>
                  </CardContent>
                </Card>
              )}

              {/* Relationships */}
              {standard.related.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Relationships</h3>
                  <div className="space-y-2">
                    {standard.related.map((rel) => (
                      <div key={`${standard.id}-${rel.target}-${rel.type}`} className="rounded-lg border p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{rel.target}</span>
                          <Badge variant="outline" className="text-xs">
                            {rel.type}
                          </Badge>
                        </div>
                        {rel.note && <p className="mt-1 text-xs text-muted-foreground">{rel.note}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={isInPath ? removeFromPath : addToPath}
                  variant={isInPath ? "outline" : "default"}
                  className="w-full"
                >
                  {isInPath ? (
                    <>Remove from Path</>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Path
                    </>
                  )}
                </Button>

                <Button variant="outline" className="w-full bg-transparent" asChild>
                  <a href={standard.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Official Documentation
                  </a>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
