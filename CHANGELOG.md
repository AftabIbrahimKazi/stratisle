# Changelog

## [0.7.1] — 2026-07-17

### Changed
- Engine subsystem folders renamed for clarity: `engine/loop` → `engine/animation-loop`, `engine/core.ts` split into `engine/core/Engine.ts` behind a new thin `engine/index.ts` entry point, `engine/debug` → `engine/helperDebugFunctions`, `engine/utils` → `engine/resourceManager` (now holds only the two GPU-teardown functions `Engine.ts` depends on; `clamp` moved into `DevFlyCameraController.ts`, its only caller)

## [0.7.0] — 2026-07-17

### Added
- Island terrain mesh (Stage 1): `engine/assets` decodes the baked heightmap (fetch + `createImageBitmap` + `OffscreenCanvas` → single-channel elevation grid), `engine/materials/Island.ts` builds it via Triforge `Grid` → `SetPosition` → `evaluateGraph`, displayed with a placeholder `MeshNormalMaterial` (no texture yet)
- Sea plane (`engine/materials/SeaPlane.ts`): a large flat low-poly `Grid` at sea level surrounding the island — free false-horizon effect from a grounded camera, built with the same Triforge pipeline minus displacement
- `materials/` restructured into a barrel (`index.ts`) + one file per material (`Island.ts`, `SeaPlane.ts`), mirroring the existing `debug/` folder pattern, to hold future per-weather texture variants cleanly

### Changed
- Camera, debug grid, and dev fly-camera speed rescaled for the island/map's real-world unit scale (were tuned for an early 40-unit placeholder)
- `next.config.ts`: fixed `allowedDevOrigins` replacing rather than extending Next's default local-origin allow-list, which had started blocking `127.0.0.1` alongside the intended LAN IP

## [0.6.0] — 2026-07-17

### Added
- First 3D pixels: `SceneEngine` orchestrator class in `src/client/engine/core.ts` wiring a persistent Three.js render pipeline — `camera/` (stateless builder), `loop/` (`RenderLoop`, rAF with clamped delta), `controller/` (`ViewportController`, permanent resize sync), `debug/` (`DebugGrid` origin grid, `DevFlyCameraController` — WASD + pointer-lock mouse-look + scroll-wheel FOV zoom, all removable via marked comment blocks)
- `IslandCanvas` component, mounted in the root layout so the engine persists across all page navigations (not per-route)
- Fixed, full-viewport canvas stacking via new `layout.css` — `.sl-scene-canvas` (`position: fixed`, viewport-sized), `.sl-header`/`.sl-main`/`.sl-footer` positioned above it using the existing `--sl-z-*` tokens
- `DEV_LAN_ORIGIN` env var (`.env.local`, gitignored) wired into `next.config.ts`'s `allowedDevOrigins`, so the dev server can optionally be reached from another device on the same network
- `client-only` and `@types/three` dependencies

### Changed
- `--sl-z-canvas` token: `-10` → `1` (canvas is now a positive-stacked fixed layer, not a negative background layer)
- `main.css` returned to its placeholder role; its prior (layout-role) rules moved into the new `layout.css`
- Landing page content simplified to a placeholder heading while the engine work is in progress
- `SceneEngine.destroy()` now calls `renderer.forceContextLoss()` before `dispose()`, to fully release the WebGL context across React Strict Mode's double-effect dev remounts

## [0.5.0] — 2026-07-16

### Added
- Header component (`src/client/components/header/`) — Strata navbar, brand + nav via Next `Link` for client-side navigation
- Footer component (`src/client/components/footer/`) — Strata utilities, carries the Strata/Triforge credits
- Core design tokens in `src/styles/variables.css` (renamed from `tokens.css`): typography, spacing, island colour palette, semantic colours, opacity, cinematic durations, fixed sizes, radii, z-index plan — all `--sl-` prefixed, all numeric values even
- Light/dark theme semantic remaps via `:root[data-st-theme]` — `data-st-theme` is the whole-site toggle on `<html>` only, by decision

### Changed
- Root layout renders Header and Footer around page content
- Landing page credits paragraph removed (footer owns it now)

## [0.4.0] — 2026-07-15

### Added
- Client/server source split: `src/client/` (3D engine + React components) and `src/server/` (server-only data logic), with `src/app/` reserved as the thin routing layer
- 3D engine scaffold `src/client/engine/` — orchestrator (`core.ts`) plus loop, camera, controller, assets, hdr, materials, lighting, state, utils, debug, and post subsystem placeholders documenting each one's role, activating stage, and rules
- `scripts/bake/` — build-time baking pipeline placeholder (Stage 9)

### Removed
- `CLAUDE.md` and `AGENTS.md` untracked (moved to `.gitignore`) — local AI-tooling docs, not site code

## [0.3.0] — 2026-07-15

### Added
- `three` 0.185.1 and `@triforge/geometry-nodes` 0.1.1 (pinned) — Stage 1 dependencies for the South Nicobar Island heightmap-to-mesh work
- Project landing page introducing the 3D island experience (stage badge, terrain/weather/cinematics cards, library links)

### Changed
- Site metadata: real title ("Stratisle — 3D South Nicobar Island Experience") and description replace the create-next-app placeholders
- `.gitignore` covers `handover/` and `project-plan-docs/` (local dev docs, not published)

### Removed
- Root `handover.md` (session state moved to the gitignored `handover/` folder)

## [0.2.0] — 2026-07-15

### Added
- Strata CSS framework via npm (`strata-css` 1.4.10) wired through PostCSS (`postcss.config.mjs`)
- Role-based CSS architecture in `src/styles/`: `strata.css` (framework entry), `tokens.css` (project token file, `--sl-` prefix), `main.css` (cross-component custom CSS), `responsive.css` (locked six-range breakpoint set)
- `data-st-theme="light"` on the root `<html>` element

### Changed
- Home page rebuilt with Strata component classes and utilities (card, buttons, badge, flex utilities)
- Root layout imports the four `src/styles/` files instead of `globals.css`

### Removed
- `src/app/globals.css` and `src/app/page.module.css` (replaced by the `src/styles/` structure; Strata's base layer supersedes the template reset)
