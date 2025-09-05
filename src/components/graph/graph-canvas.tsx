"use client"

import { useEffect, useRef, useState } from "react"
import type { StandardNode, FilterState, PathState } from "@/types/standards"
import { GraphControls } from "./graph-controls"
import { GraphLegend } from "./graph-legend"

// Cytoscape will be loaded dynamically on client side
let cytoscape: any = null

interface GraphCanvasProps {
  standards: StandardNode[]
  filters: FilterState
  selectedNode: string | null
  onNodeSelect: (nodeId: string | null) => void
  path: PathState
}

export function GraphCanvas({ standards, filters, selectedNode, onNodeSelect, path }: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load Cytoscape dynamically
  useEffect(() => {
    async function loadCytoscape() {
      if (typeof window !== "undefined" && !cytoscape) {
        const cytoscapeModule = await import("cytoscape")
        cytoscape = cytoscapeModule.default
        setIsLoading(false)
      }
    }
    loadCytoscape()
  }, [])

  // Graph control functions
  const handleZoomIn = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 1.2)
    }
  }

  const handleZoomOut = () => {
    if (cyRef.current) {
      cyRef.current.zoom(cyRef.current.zoom() * 0.8)
    }
  }

  const handleFit = () => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 50)
    }
  }

  const handleReset = () => {
    if (cyRef.current) {
      cyRef.current
        .layout({
          name: "cose",
          animate: true,
          animationDuration: 800,
          nodeRepulsion: 4000,
          idealEdgeLength: 110,
          edgeElasticity: 100,
          nestingFactor: 1.2,
          gravity: 1,
          numIter: 1000,
          initialTemp: 200,
          coolingFactor: 0.95,
          minTemp: 1.0,
        })
        .run()
    }
  }

  // Initialize graph
  useEffect(() => {
    if (!cytoscape || !containerRef.current || isLoading) return

    // Filter standards based on current filters
    const filteredStandards = standards.filter((standard) => {
      if (filters.families.length > 0 && !standard.families.some((f) => filters.families.includes(f))) {
        return false
      }
      if (filters.tags.length > 0 && !standard.tags.some((t) => filters.tags.includes(t))) {
        return false
      }
      if (
        filters.search &&
        !standard.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !standard.id.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false
      }
      return true
    })

    // Create nodes
    const nodes = filteredStandards.map((standard) => ({
      data: {
        id: standard.id,
        label: standard.id,
        title: standard.title,
        families: standard.families,
        isSelected: path.selectedStandards.includes(standard.id),
        isSOC2: standard.id === "SOC2",
      },
    }))

    // Create edges
    const edges: any[] = []
    filteredStandards.forEach((standard) => {
      standard.related.forEach((rel) => {
        if (filteredStandards.some((s) => s.id === rel.target)) {
          edges.push({
            data: {
              id: `${standard.id}-${rel.target}`,
              source: standard.id,
              target: rel.target,
              type: rel.type,
              note: (rel as any).note,
            },
          })
        }
      })
    })

    // Initialize Cytoscape
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      style: [
        {
          selector: "node",
          style: {
            "background-color": "hsl(var(--card))",
            "border-color": "hsl(var(--border))",
            "border-width": 1.5,
            color: "hsl(var(--foreground))",
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "10px",
            "font-family": "var(--font-sans)",
            width: "60px",
            height: "28px",
            shape: "round-rectangle",
          },
        },
        {
          selector: "node[isSOC2]",
          style: {
            "background-color": "hsl(var(--accent))",
            "border-color": "hsl(var(--accent))",
            color: "hsl(var(--accent-foreground))",
          },
        },
        {
          selector: "node[isSelected]",
          style: {
            "background-color": "hsl(var(--primary))",
            "border-color": "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            "border-width": 2,
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-color": "hsl(var(--ring))",
            "border-width": 2,
          },
        },
        {
          selector: "edge",
          style: {
            width: 1.25,
            opacity: 0.85,
            "line-color": "hsl(var(--muted-foreground))",
            "target-arrow-color": "hsl(var(--muted-foreground))",
            "target-arrow-shape": "triangle",
            "arrow-scale": 0.7,
            "curve-style": "straight",
          },
        },
        {
          selector: 'edge[type="precedes"]',
          style: {
            "line-color": "hsl(var(--primary))",
            "target-arrow-color": "hsl(var(--primary))",
          },
        },
        {
          selector: 'edge[type="complementary"]',
          style: {
            "line-color": "hsl(var(--accent))",
            "target-arrow-color": "hsl(var(--accent))",
            "line-style": "dashed",
          },
        },
        {
          selector: 'edge[type="supersedes"]',
          style: {
            "line-color": "hsl(var(--destructive))",
            "target-arrow-color": "hsl(var(--destructive))",
            "line-style": "dotted",
          },
        },
        {
          selector: 'edge[type="overlaps"]',
          style: {
            "line-color": "hsl(var(--muted-foreground))",
            "target-arrow-color": "hsl(var(--muted-foreground))",
            "line-style": "dashed",
          },
        },
      ],
      layout: {
        name: "cose",
        animate: true,
        animationDuration: 800,
        nodeRepulsion: 4000,
        idealEdgeLength: 110,
        edgeElasticity: 100,
        nestingFactor: 1.2,
        gravity: 1,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
      },
    })

    // Add event listeners
    cyRef.current.on("tap", "node", (evt: any) => {
      const nodeId = evt.target.data("id")
      onNodeSelect(nodeId)
    })

    cyRef.current.on("tap", (evt: any) => {
      if (evt.target === cyRef.current) {
        onNodeSelect(null)
      }
    })

    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
      }
    }
  }, [standards, filters, path.selectedStandards, onNodeSelect, isLoading])

  // Update selected node highlight
  useEffect(() => {
    if (!cyRef.current) return

    cyRef.current.nodes().removeClass("selected")
    if (selectedNode) {
      cyRef.current.getElementById(selectedNode).addClass("selected")
    }
  }, [selectedNode])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading graph...</div>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative">
      <div ref={containerRef} className="h-full w-full" />

      <GraphControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onFit={handleFit} onReset={handleReset} />

      <GraphLegend />
    </div>
  )
}
