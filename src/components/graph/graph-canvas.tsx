"use client"

import { useEffect, useRef, useState } from "react"
import type { StandardNode, FilterState, PathState, EdgeType } from "@/types/standards"
import { GraphControls } from "./graph-controls"
import { GraphLegend } from "./graph-legend"

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
  const [relFilter, setRelFilter] = useState<EdgeType | undefined>(undefined)
  const [famFilter, setFamFilter] = useState<string | undefined>(undefined)
  const prevSelectedRef = useRef<Set<string>>(new Set())

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

  const handleZoomIn = () => { if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 1.2) }
  const handleZoomOut = () => { if (cyRef.current) cyRef.current.zoom(cyRef.current.zoom() * 0.8) }
  const handleFit = () => { if (cyRef.current) cyRef.current.fit(undefined, 50) }
  const handleReset = () => { if (cyRef.current) cyRef.current.layout({ name: "cose", animate: true, animationDuration: 800, nodeRepulsion: 4000, idealEdgeLength: 110, edgeElasticity: 100, nestingFactor: 1.2, gravity: 1, numIter: 1000, initialTemp: 200, coolingFactor: 0.95, minTemp: 1.0 }).run() }

  useEffect(() => {
    if (!cytoscape || !containerRef.current || isLoading) return

    const filteredStandards = standards.filter((standard) => {
      if (filters.families.length > 0 && !standard.families.some((f) => filters.families.includes(f))) return false
      if (filters.tags.length > 0 && !standard.tags.some((t) => filters.tags.includes(t))) return false
      if (filters.search && !standard.title.toLowerCase().includes(filters.search.toLowerCase()) && !standard.id.toLowerCase().includes(filters.search.toLowerCase())) return false
      return true
    })

    const nodes = filteredStandards.map((standard) => ({
      data: { id: standard.id, label: standard.id, title: standard.title, families: standard.families, isSelected: path.selectedStandards.includes(standard.id), isSOC2: standard.id === "SOC2" },
    }))

    const edges: any[] = []
    filteredStandards.forEach((standard) => {
      standard.related.forEach((rel) => {
        if (filteredStandards.some((s) => s.id === rel.target)) {
          edges.push({ data: { id: `${standard.id}-${rel.target}`, source: standard.id, target: rel.target, type: rel.type, note: (rel as any).note } })
        }
      })
    })

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      wheelSensitivity: 0.2,
      style: [
        { selector: "node", style: { "background-color": "var(--card)", "border-color": "var(--border)", "border-width": 1.5, color: "var(--foreground)", label: "data(label)", "text-valign": "center", "text-halign": "center", "font-size": "10px", "font-family": "var(--font-sans)", width: "60px", height: "28px", shape: "round-rectangle", "transition-property": "background-color, border-width, border-color", "transition-duration": "300ms" } },
        { selector: "node[isSOC2]", style: { "background-color": "var(--accent)", "border-color": "var(--accent)", color: "var(--accent-foreground)" } },
        { selector: "node[isSelected]", style: { "background-color": "var(--primary)", "border-color": "var(--primary)", color: "var(--primary-foreground)", "border-width": 2 } },
        { selector: "node:selected", style: { "border-color": "var(--ring)", "border-width": 2 } },
        { selector: "node.selected", style: { "border-color": "var(--ring)", "border-width": 2 } },
        { selector: "node.flash", style: { "border-color": "var(--ring)", "border-width": 3 } },
        { selector: "edge", style: { width: 1.25, opacity: 0.85, "line-color": "var(--muted-foreground)", "target-arrow-color": "var(--muted-foreground)", "target-arrow-shape": "triangle", "arrow-scale": 0.7, "curve-style": "straight", "transition-property": "line-color, width, opacity", "transition-duration": "300ms" } },
        { selector: 'edge[type = "precedes"]', style: { "line-color": "var(--primary)", "target-arrow-color": "var(--primary)" } },
        { selector: 'edge[type = "complementary"]', style: { "line-color": "var(--accent)", "target-arrow-color": "var(--accent)", "line-style": "dashed" } },
        { selector: 'edge[type = "supersedes"]', style: { "line-color": "var(--destructive)", "target-arrow-color": "var(--destructive)", "line-style": "dotted" } },
        { selector: 'edge[type = "overlaps"]', style: { "line-color": "var(--muted-foreground)", "target-arrow-color": "var(--muted-foreground)", "line-style": "dashed" } },
        { selector: "edge.flash-edge", style: { width: 2, opacity: 1 } },
        { selector: ".dim", style: { opacity: 0.2 } },
        { selector: ".emph", style: { opacity: 1, "border-width": 2 } },
      ],
      layout: { name: "cose", animate: true, animationDuration: 800, nodeRepulsion: 4000, idealEdgeLength: 110, edgeElasticity: 100, nestingFactor: 1.2, gravity: 1, numIter: 1000, initialTemp: 200, coolingFactor: 0.95, minTemp: 1.0 },
    })

    // Hover emphasis
    cyRef.current.on("mouseover", "node", (evt: any) => {
      const node = evt.target
      const neighborhood = node.closedNeighborhood()
      cyRef.current.elements().addClass("dim")
      neighborhood.removeClass("dim").addClass("emph")
      node.removeClass("dim")
    })
    cyRef.current.on("mouseout", "node", () => {
      cyRef.current.elements().removeClass("dim emph")
    })

    // Click select
    cyRef.current.on("tap", "node", (evt: any) => onNodeSelect(evt.target.data("id")))
    cyRef.current.on("tap", (evt: any) => { if (evt.target === cyRef.current) onNodeSelect(null) })

    return () => { if (cyRef.current) cyRef.current.destroy() }
  }, [standards, filters, path.selectedStandards, onNodeSelect, isLoading])

  // Apply legend filters dynamically
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.elements().removeClass("dim")
    if (relFilter) {
      cy.edges().not(`[type = "${relFilter}"]`).addClass("dim")
    }
    if (famFilter) {
      cy.nodes().filter((n: any) => !(n.data("families") as string[]).includes(famFilter)).addClass("dim")
    }
  }, [relFilter, famFilter])

  // Selection highlight syncing
  useEffect(() => {
    if (!cyRef.current) return
    cyRef.current.nodes().removeClass("selected")
    if (selectedNode) cyRef.current.getElementById(selectedNode).addClass("selected")
  }, [selectedNode])

  // Flash newly-added standards (e.g., when adding phases)
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    const prev = prevSelectedRef.current
    const current = new Set(path.selectedStandards)
    const added = path.selectedStandards.filter((id) => !prev.has(id))
    if (added.length > 0) {
      const selectors = added.map((id) => `#${CSS.escape(id)}`)
      const collection = cy.$(selectors.join(", "))
      collection.addClass("flash")
      const edges = collection.connectedEdges()
      edges.addClass("flash-edge")
      if (added.length <= 6) {
        cy.fit(collection, 80)
      }
      setTimeout(() => {
        collection.removeClass("flash")
        edges.removeClass("flash-edge")
      }, 1200)
    }
    prevSelectedRef.current = current
  }, [path.selectedStandards])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading graph...</div>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative">
      <div ref={containerRef} className="h-full w-full p-4" />
      <GraphControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onFit={handleFit} onReset={handleReset} />
      <GraphLegend onFilterRelationship={(t) => setRelFilter(t)} onFilterFamily={(f) => setFamFilter(f)} />
    </div>
  )
}
