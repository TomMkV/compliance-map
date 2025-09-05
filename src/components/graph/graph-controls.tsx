"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from "lucide-react"

interface GraphControlsProps {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onFit?: () => void
  onReset?: () => void
  className?: string
}

export function GraphControls({ onZoomIn, onZoomOut, onFit, onReset, className }: GraphControlsProps) {
  return (
    <Card className={`absolute top-4 right-4 bg-background/80 backdrop-blur-sm ${className}`}>
      <div className="flex flex-col p-2 gap-1">
        <Button variant="ghost" size="sm" onClick={onZoomIn} className="h-8 w-8 p-0" title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onZoomOut} className="h-8 w-8 p-0" title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onFit} className="h-8 w-8 p-0" title="Fit to Screen">
          <Maximize className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset} className="h-8 w-8 p-0" title="Reset Layout">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
