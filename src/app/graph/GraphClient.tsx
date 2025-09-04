'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Graph from '@/components/Graph';
import Controls from '@/components/Controls';
import Drawer from '@/components/Drawer';
import ScorePanel from '@/components/ScorePanel';
import { buildEdges, getProfiles, getStandards } from '@/lib/data';
import type { OutcomeProfile, StandardNode } from '@/types/standards';
import { fromQueryString, toQueryString } from '@/lib/permalink';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function GraphClient() {
  const allNodes = useMemo(() => getStandards(), []);
  const profiles = useMemo(() => getProfiles(), []);
  const edges = useMemo(() => buildEdges(allNodes), [allNodes]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initial = useMemo(() => fromQueryString(searchParams.toString()), [searchParams]);
  const [profileId, setProfileId] = useState<string>(initial.profileId || profiles[0]?.id);
  const [selectedIds, setSelectedIds] = useState<string[]>(initial.selectedIds || []);
  const [dimTag, setDimTag] = useState<string | undefined>(initial.dimTag);
  const [activeNodeId, setActiveNodeId] = useState<string | undefined>();

  const profile: OutcomeProfile = useMemo(() => profiles.find(p => p.id === profileId) || profiles[0], [profiles, profileId]);
  const selectedNodes: StandardNode[] = useMemo(() => allNodes.filter(n => selectedIds.includes(n.id)), [allNodes, selectedIds]);

  useEffect(() => {
    const qs = toQueryString({ profileId, selectedIds, dimTag });
    router.replace(`${pathname}${qs}`);
  }, [profileId, selectedIds, dimTag, router, pathname]);

  const handleNodeClick = useCallback((id: string) => {
    setActiveNodeId(id);
    setSelectedIds(prev => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const activeNode = useMemo(() => allNodes.find(n => n.id === activeNodeId), [allNodes, activeNodeId]);

  const highlightIds = useMemo(() => profile.phases.flatMap(ph => ph.items), [profile]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4">
      <h1 className="text-xl font-semibold">ISO Visual Map</h1>
      <Controls
        profiles={profiles}
        nodes={allNodes}
        selectedProfileId={profileId}
        onChangeProfile={setProfileId}
        dimTag={dimTag}
        onChangeDimTag={setDimTag}
        onResetSelection={() => setSelectedIds([])}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Graph nodes={allNodes} edges={edges} dimTag={dimTag} highlightIds={highlightIds} onNodeClick={handleNodeClick} />
        </div>
        <div className="space-y-3">
          <ScorePanel selected={selectedNodes} profile={profile} />
          <div className="rounded-xl border p-3">
            <h3 className="mb-2 text-sm font-semibold">Path suggestion</h3>
            <div className="space-y-2 text-sm">
              {profile.phases.map(ph => (
                <div key={ph.name}>
                  <div className="font-medium">{ph.name}</div>
                  <ul className="ml-4 list-disc">
                    {ph.items.map(id => (
                      <li key={id}>
                        <button
                          className="underline"
                          onClick={() => setSelectedIds(prev => (prev.includes(id) ? prev : [...prev, id]))}
                        >
                          {id}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Drawer node={activeNode} onClose={() => setActiveNodeId(undefined)} />
    </div>
  );
}
