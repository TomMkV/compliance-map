'use client';
import type { StandardNode } from '@/types/standards';

export default function Drawer({ node, onClose }: { node?: StandardNode; onClose: () => void }) {
  if (!node) return null;
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md border-l bg-white p-4 shadow-xl">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">{node.id}</h2>
          <p className="text-sm text-slate-600">{node.title}</p>
        </div>
        <button className="rounded-md border px-2 py-1" onClick={onClose}>Close</button>
      </div>
      <p className="mb-3 text-sm">{node.summary}</p>
      <div className="mb-2 text-sm">
        <span className="font-medium">Families:</span> {node.families.join(', ')}
      </div>
      <div className="mb-4 text-sm">
        <span className="font-medium">Tags:</span> {node.tags.join(', ')}
      </div>
      <a href={node.url} target="_blank" className="text-sm text-blue-700 underline">Official source</a>
    </div>
  );
}
