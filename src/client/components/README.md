# client/components — React UI components

All React components live here (the `app/` router files stay thin and
import from this folder). Everything client-interactive carries
`'use client'` at the top of its file.

Expected residents:

- **IslandCanvas** (Stage 2) — mounts the `<canvas>`, calls
  `createEngine(canvas)` from `../engine/core.ts` exactly once
  (`useEffect` with empty deps), calls `engine.dispose()` on unmount.
  This is the ONE React/engine boundary component.
- **Nav / off-canvas menu** — built with Strata's off-canvas package
  (imported here, which is what pulls it into the client bundle).
- **Weather control panel + HUD** (Stage 8) — dropdown, loading/disabled
  states, toasts; forwards user intent to the engine via core.ts calls.
- **Filter feature UI** (Stage 8) — filter controls synced with live
  weather data and the 3D map through shared React state.

Rules:
- Components never import engine internals — only `engine/core.ts`.
- Component CSS: one file per component, top half rules, bottom half
  media queries (CSS RULE 22), only the six locked RULE 17 ranges.
- Selector signature `sl-`, token prefix `--sl-` (never `st-`/`--st-`).
