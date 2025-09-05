"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Keyboard, X } from "lucide-react"
import { useState } from "react"

interface KeyboardShortcutsProps {
  onSearch?: () => void
  onClearSelection?: () => void
  onToggleHelp?: () => void
}

export function KeyboardShortcuts({ onSearch, onClearSelection, onToggleHelp }: KeyboardShortcutsProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.key) {
        case "/":
          event.preventDefault()
          onSearch?.()
          break
        case "Escape":
          event.preventDefault()
          onClearSelection?.()
          break
        case "?":
          event.preventDefault()
          setIsVisible((prev) => !prev)
          onToggleHelp?.()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onSearch, onClearSelection, onToggleHelp])

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm"
      >
        <Keyboard className="h-4 w-4 mr-1" />
        Shortcuts
      </Button>
    )
  }

  return (
    <Card className="absolute top-4 left-4 w-64 bg-background/95 backdrop-blur-sm z-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Focus search</span>
            <Badge variant="outline" className="text-xs font-mono">
              /
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Clear selection</span>
            <Badge variant="outline" className="text-xs font-mono">
              Esc
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Toggle help</span>
            <Badge variant="outline" className="text-xs font-mono">
              ?
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
