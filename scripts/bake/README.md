# scripts/bake — build-time baking pipeline (Stage 9)

Build-time preprocessing that runs on the dev machine / CI, never at
request time and never in the browser. Outputs land in `/public` as
static files the engine fetches at runtime.

## heightmap.ts (Stage 1, active)

`npm run bake:heightmap` — crops the raw South Nicobar DEM to the
island's square bounding box (with natural water margin) and
downsamples it to a real-time-safe resolution. Reads from
`scripts/bake/source/` (gitignored — supply the raw source locally to
rerun this), writes to `public/assets/height-map/`.

The raw source is developer-side tooling input only: never imported by
the app, never bundled, never served — only the small baked PNG in
`public/` ever reaches a visitor's browser. A fresh clone needs the raw
source file placed at `scripts/bake/source/nicobar_heightmap.png`
before this script can be rerun; the already-baked output in `public/`
works without it.

## Planned jobs (deferred to Stage 9 unless a stage needs one early)

- texture compression (KTX2/basis) and LOD generation
- mesh compression (Draco-style)
- lighting bakes where dynamic light isn't needed

Open item from the project plan: check what Triforge's baking library
already supports before writing anything custom here.
