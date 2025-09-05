"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"
import { Share2, Copy, Check } from "lucide-react"
import { useEffect, useState } from "react"

interface ShareButtonProps {
  className?: string
}

export function ShareButton({ className }: ShareButtonProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [href, setHref] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHref(window.location.href)
    }
  }, [])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : href)
      setCopied(true)
      toast({
        title: "Link copied",
        description: "The permalink has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link. Please copy it manually.",
      })
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={`bg-transparent ${className}`}>
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Share Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="permalink" className="text-xs">
                Permalink
              </Label>
              <div className="flex gap-2">
                <Input id="permalink" value={href} readOnly className="text-xs" />
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="shrink-0 bg-transparent">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              This link preserves your current profile selection, filters, and implementation path.
            </p>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}
