# scripts/bake — build-time baking pipeline (Stage 9)

Build-time preprocessing that runs on the dev machine / CI, never at
request time and never in the browser. Outputs land in `/public` as
static files the engine fetches at runtime.

Planned jobs (all deferred to Stage 9 unless Stage 1 needs one early):

- heightmap → pre-parsed geometry data (skip client-side parsing cost)
- texture compression (KTX2/basis) and LOD generation
- mesh compression (Draco-style)
- lighting bakes where dynamic light isn't needed

Open item from the project plan: check what Triforge's baking library
already supports before writing anything custom here.
