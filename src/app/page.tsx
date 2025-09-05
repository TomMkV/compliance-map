import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="border-r border-border bg-card p-4">
        <div className="mb-6">
          <h1 className="text-lg font-semibold">Compliance Map</h1>
          <p className="text-xs text-muted-foreground">ISO visual roadmap</p>
        </div>
        <nav className="space-y-1 text-sm">
          <Link href="/graph" className="block rounded px-2 py-1 hover:bg-muted">
            Graph
          </Link>
          <Link href="/" className="block rounded px-2 py-1 hover:bg-muted">
            Home
          </Link>
        </nav>
      </aside>
      <main className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Welcome</h2>
        <p className="text-sm text-muted-foreground">
          Choose an outcome profile and explore recommended standards. Start with the graph.
        </p>
        <Link href="/graph" className="inline-block rounded border px-3 py-1 text-sm hover:bg-muted">
          Open Graph →
        </Link>
      </main>
    </div>
  );
}
