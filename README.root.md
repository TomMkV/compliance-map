# Compliance Map

A simple way to answer: “What standards matter for us, in what order, and why?”

This tool shows a graph of standards (ISO, NIST, SOC, etc.), how they relate, and a suggested path based on your goal (e.g., enterprise SaaS, PII processing, AI platform). You can filter, select a profile, and export a checklist.

## What you can do

- Explore standards as a map
- Pick an outcome profile to re-weight what’s important
- See a recommended implementation path
- Track readiness across control families
- Export a Markdown/CSV checklist
- Share a permalink of your current view

## Data

- Main dataset: `src/data/expanded_compliance_standards.json`
  - Nodes include: id, title, summary, url, tags, families, related edges
  - Extra metadata (jurisdiction, enforceability, certifiable, auditable, source)
- Profiles: `src/data/profiles.json`
- Data is validated and normalized in `src/lib/data.ts` (Zod). Unknown edge types and families are mapped to a small set used by the app.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000 (Next picks a free port if 3000 is busy)
```

## Where things live

- App pages: `src/app` (`/` home, `/graph` map)
- Graph UI: `src/components/graph/*`
- URL state and share links: `src/lib/url-state.ts`
- Scoring: `src/lib/scoring.ts`

## Add or change standards

1) Edit `src/data/expanded_compliance_standards.json`
2) Keep `id` unique. Use `related` with `target` ids from the same file.
3) Run `npm run build` to check types.

Tip: you can also add new outcome profiles in `src/data/profiles.json`.

## Notes

- Dark theme is on by default. Text uses theme variables for contrast.
- The dataset is intentionally simple. We can add deeper control mappings later (e.g., ISO 27002 ↔ SOC 2) without changing the basic shape.
