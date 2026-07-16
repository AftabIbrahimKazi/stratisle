# Changelog

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
