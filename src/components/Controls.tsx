'use client';
import { useMemo } from 'react';
import type { OutcomeProfile, StandardNode } from '@/types/standards';

export interface ControlsProps {
  profiles: OutcomeProfile[];
  nodes: StandardNode[];
  selectedProfileId: string;
  onChangeProfile: (id: string) => void;
  dimTag?: string;
  onChangeDimTag: (tag?: string) => void;
  onResetSelection: () => void;
}

export default function Controls({ profiles, nodes, selectedProfileId, onChangeProfile, dimTag, onChangeDimTag, onResetSelection }: ControlsProps) {
  const tags = useMemo(() => Array.from(new Set(nodes.flatMap(n => n.tags))).sort(), [nodes]);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border p-3">
      <label className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Profile</span>
        <select
          className="rounded-md border px-2 py-1"
          value={selectedProfileId}
          onChange={(e) => onChangeProfile(e.target.value)}
        >
          {profiles.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2">
        <span className="text-sm text-slate-600">Filter by tag</span>
        <select
          className="rounded-md border px-2 py-1"
          value={dimTag ?? ''}
          onChange={(e) => onChangeDimTag(e.target.value || undefined)}
        >
          <option value="">All</option>
          {tags.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </label>

      <button className="ml-auto rounded-md bg-slate-900 px-3 py-1 text-white hover:bg-slate-800" onClick={onResetSelection}>Reset selection</button>
    </div>
  );
}
