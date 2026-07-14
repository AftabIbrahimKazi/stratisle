# Handover — Stratisle
Updated: 2026-07-15 · Branch: dev

## Current state
Fresh Next.js 16.2.10 (App Router, TypeScript) learning project with Strata CSS fully integrated and verified end-to-end. The home page renders a Strata-styled card with working component classes, utilities, and JIT arbitrary values. Repo is live at github.com/AftabIbrahimKazi/stratisle (public) with all four standard branches synced at v0.2.0. Working tree clean except this file.

## Last session
- Installed the claude-dev-kit: 22 skills in `.claude/skills/`, `coding-standards/` at root, session protocol merged into CLAUDE.md. All three folders are gitignored (local dev tooling only).
- Installed `strata-css` 1.4.10 via npm, wired through `postcss.config.mjs`; theme pinned with `data-st-theme="light"` on `<html>`.
- Replaced the template's globals.css/page.module.css with the role-based `src/styles/` structure (see CLAUDE.md → CSS architecture).
- Rebuilt `page.tsx` entirely with Strata classes; every class verified present in build output.
- Created the repo: main (default, protected by ruleset — PR required, no deletion/force-push, 0 required reviews because solo owner can't self-approve) → beta → test → dev.

## Decisions & why
- Project CSS prefix is `--sl-`/`sl-`, NOT `--st-` — Strata owns the `st-` namespace; CLAUDE.md originally said `--st-` and was corrected.
- Template reset/body styles deleted, not migrated — Strata's base layer already provides them; body theming uses `--st-bg`/`--st-text` so `data-st-theme` stays the single theme system.
- `responsive.css` holds the six RULE 17 breakpoint ranges as the locked, complete set — no new media queries ever, anywhere, including component files (their bottom halves reuse these exact ranges).
- No `frameworks/nextjs.md` standard yet — deliberately deferred until the user has learned what's good/bad in practice. Don't propose writing it.
- Grammarly extension causes a dev-only hydration warning on `<body>` (`data-gr-*` attributes). User chose NOT to suppress it — leave the warning alone; it's not a code bug.

## Known issues
- None confirmed. (`npm install` reports 2 moderate vulns in dev deps — noted, not acted on.)

## Next steps
1. No task in flight — session ended at a clean release point. Next work: whatever the user wants to build/learn next, starting on `dev`.
2. When releasing: dev → test → beta → main, no skips (first release skipped test/beta as bootstrap; user confirmed the full flow applies from now on). Bump version + CHANGELOG.md at push time.
3. Metadata in `layout.tsx` still says "Create Next App" — worth updating whenever touching the layout.

## Don't touch / gotchas
- This Next.js version has breaking changes vs training data — read `node_modules/next/dist/docs/` before writing Next code (AGENTS.md rule).
- `skills/`, `coding-standards/`, `.claude/` are gitignored on purpose — dev tooling, not site code.
- `src/styles/tokens.css` is near-empty by design (single token file, RULE T-01); Strata supplies theme tokens.
- Empty media-query blocks in `responsive.css` get stripped from prod CSS by minification — expected, it's an authoring template.
- User is learning Next.js — explain framework concepts as they come up; don't just do.
