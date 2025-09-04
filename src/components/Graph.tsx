'use client';
import cytoscape, { ElementsDefinition } from 'cytoscape';
import { useEffect, useRef } from 'react';
import type { StandardNode } from '@/types/standards';

export default function Graph({
  nodes,
  edges,
  dimTag,
  highlightIds,
  onNodeClick,
}: {
  nodes: StandardNode[];
  edges: { source: string; target: string; type: string }[];
  dimTag?: string;
  highlightIds?: string[];
  onNodeClick?: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const elements: ElementsDefinition = {
      nodes: nodes.map(n => ({ data: { id: n.id, label: n.id, families: n.families, tags: n.tags } })),
      edges: edges.map(e => ({ data: { id: `${e.source}-${e.target}`, source: e.source, target: e.target, type: e.type } }))
    };

    const cy = cytoscape({
      container: ref.current,
      elements,
      layout: { name: 'cose', animate: false },
      style: [
        { selector: 'node',
          style: {
            'label': 'data(label)',
            'font-size': 12,
            'background-color': '#93c5fd'
          }
        },
        { selector: 'edge',
          style: { 'line-color': '#cbd5e1', 'width': 2, 'target-arrow-shape': 'triangle', 'target-arrow-color': '#cbd5e1', 'curve-style': 'bezier' }
        },
        { selector: 'node.dim', style: { 'opacity': 0.3 } },
        { selector: 'node.highlight', style: { 'border-color': '#1e40af', 'border-width': 3 } }
      ]
    });

    if (dimTag) {
      cy.nodes().forEach(n => {
        const tags = n.data('tags') as string[];
        if (!tags?.includes(dimTag)) n.addClass('dim');
      });
    }

    if (highlightIds?.length) {
      cy.nodes().forEach(n => {
        if (highlightIds.includes(n.id())) n.addClass('highlight');
      });
    }

    if (onNodeClick) {
      cy.on('tap', 'node', (evt) => {
        const id = evt.target.id();
        onNodeClick(id);
      });
    }

    return () => cy.destroy();
  }, [nodes, edges, dimTag, highlightIds, onNodeClick]);

  return <div className="h-[70vh] w-full rounded-2xl border" ref={ref} />;
}
