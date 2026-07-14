# Changelog

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
