'use client';
import type { OutcomeProfile, StandardNode } from '@/types/standards';
import { computeReadinessScore } from '@/lib/scoring';

export default function ScorePanel({ selected, profile }: { selected: StandardNode[]; profile: OutcomeProfile }) {
  const result = computeReadinessScore(selected, profile);
  const pct = Math.round(result.percent * 100);
  return (
    <div className="rounded-xl border p-3">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Readiness score</h3>
          <p className="text-xs text-slate-600">Profile: {profile.name}</p>
        </div>
        <div className="text-sm font-semibold">{pct}%</div>
      </div>
      <div className="mb-3 h-2 w-full overflow-hidden rounded bg-slate-200">
        <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
      </div>
      <div>
        <div className="mb-1 text-xs font-medium text-slate-600">What moved your score</div>
        <ul className="text-xs">
          {result.drivers.map(d => (
            <li key={d.family} className="flex items-center justify-between">
              <span>{d.family}</span>
              <span className="text-slate-600">+{Math.round((d.contribution / result.maxScore) * 100)}%</span>
            </li>
          ))}
          {result.drivers.length === 0 && <li className="text-slate-500">No significant drivers yet.</li>}
        </ul>
      </div>
    </div>
  );
}
