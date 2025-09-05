'use client';
import { useEffect, useMemo, useState } from 'react';
import type { OutcomeProfile, StandardNode, FilterState, PathState } from '@/types/standards';
import { getStandards, getProfiles } from '@/lib/data';
import { deserializeState, serializeState } from '@/lib/url-state';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ControlPanel } from '@/components/graph/control-panel';
import { GraphCanvas } from '@/components/graph/graph-canvas';
import { DetailsDrawer } from '@/components/graph/details-drawer';
import { PathRibbon } from '@/components/graph/path-ribbon';
import { ReadinessPanel } from '@/components/graph/readiness-panel';

export default function GraphClient() {
  const standards: StandardNode[] = useMemo(() => getStandards(), []);
  const profiles: OutcomeProfile[] = useMemo(() => getProfiles(), []);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initial = useMemo(() => deserializeState(new URLSearchParams(searchParams.toString())), [searchParams]);

  const [filters, setFilters] = useState<FilterState>(
    initial.filters ?? { profile: undefined, families: [], tags: [], search: '', showWhyMatters: false }
  );
  const [path, setPath] = useState<PathState>(initial.path ?? { selectedStandards: [], customOrder: [] });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const profile: OutcomeProfile | undefined = useMemo(
    () => (filters.profile ? profiles.find((p) => p.id === filters.profile) : undefined),
    [profiles, filters.profile]
  );

  // Sync URL when filters/path change
  useEffect(() => {
    const qs = serializeState(filters, path);
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`);
  }, [filters, path, router, pathname]);

  return (
    <div className="h-[calc(100vh-0px)] grid grid-rows-[1fr_auto]">
      <div className="grid grid-cols-[280px_1fr] overflow-hidden">
        {/* Left sidebar controls */}
        <ControlPanel filters={filters} profiles={profiles} standards={standards} onFiltersChange={setFilters} />

        {/* Graph area */}
        <div className="relative">
          <GraphCanvas
            standards={standards}
            filters={filters}
            selectedNode={selectedNode}
            onNodeSelect={setSelectedNode}
            path={path}
          />
        </div>
      </div>

      {/* Bottom ribbon + readiness */}
      <div className="border-t border-border bg-card">
        <PathRibbon path={path} standards={standards} profile={profile} onPathChange={setPath} />
        <ReadinessPanel path={path} standards={standards} profile={profile} />
      </div>

      {/* Drawer for node details */}
      <DetailsDrawer
        selectedNode={selectedNode}
        standards={standards}
        profile={profile}
        path={path}
        onPathChange={setPath}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
