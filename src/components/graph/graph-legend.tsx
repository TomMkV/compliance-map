"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info, X } from "lucide-react"
import { useState } from "react"

interface GraphLegendProps {
  className?: string
  onFilterRelationship?: (type?: "precedes" | "complementary" | "supersedes" | "overlaps") => void
  onFilterFamily?: (family?: string) => void
}

export function GraphLegend({ className, onFilterRelationship, onFilterFamily }: GraphLegendProps) {
  const [isVisible, setIsVisible] = useState(false)

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className={`absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm ${className}`}
      >
        <Info className="h-4 w-4 mr-1" />
        Legend
      </Button>
    )
  }

  const rel = (label: string, type: "precedes" | "complementary" | "supersedes" | "overlaps") => (
    <div className="flex items-center justify-between">
      <button
        className="flex items-center gap-2 text-left"
        onClick={() => onFilterRelationship?.(type)}
      >
        {type === "precedes" && <div className="w-6 h-0.5 bg-primary" />}
        {type === "complementary" && <div className="w-6 h-0.5 bg-accent border-dashed border-t" />}
        {type === "supersedes" && <div className="w-6 h-0.5 bg-destructive border-dotted border-t-2" />}
        {type === "overlaps" && <div className="w-6 h-0.5 bg-muted-foreground border-dashed border-t" />}
        <span className="text-xs">{label}</span>
      </button>
    </div>
  )

  const families = ["Security", "Privacy", "BCM", "ServiceMgmt", "RiskGovernance", "AIGovernance"]

  return (
    <Card className={`absolute bottom-4 right-4 w-64 bg-background/95 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Graph Legend</CardTitle>
          <div className="flex items-center gap-2">
            <button className="text-xs text-muted-foreground hover:underline" onClick={() => { onFilterRelationship?.(undefined); onFilterFamily?.(undefined) }}>Reset</button>
            <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Node Types */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Node Types</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-border bg-card"></div>
              <span className="text-xs">ISO Standard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-accent bg-accent"></div>
              <span className="text-xs">SOC2 (US Standard)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-primary bg-primary"></div>
              <span className="text-xs">Selected in Path</span>
            </div>
          </div>
        </div>

        {/* Relationship Types */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Relationships</h4>
          <div className="space-y-1">
            {rel("Precedes", "precedes")}
            {rel("Complementary", "complementary")}
            {rel("Supersedes", "supersedes")}
            {rel("Overlaps", "overlaps")}
          </div>
        </div>

        {/* Control Families */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Control Families</h4>
          <div className="flex flex-wrap gap-1">
            {families.map((family) => (
              <Badge key={family} variant="outline" className="text-xs cursor-pointer" onClick={() => onFilterFamily?.(family)}>
                {family}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
