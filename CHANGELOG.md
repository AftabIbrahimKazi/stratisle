# Changelog

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
