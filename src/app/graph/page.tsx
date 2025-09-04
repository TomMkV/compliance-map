import { Suspense } from 'react';
import GraphClient from './GraphClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <GraphClient />
    </Suspense>
  );
}
