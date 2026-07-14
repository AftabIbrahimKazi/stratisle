@AGENTS.md

# CLAUDE.md — Stratisle

This file is auto-loaded by Claude Code at the start of every session. It defines the project context, active standards, and behavioural contract for all AI work on this project.

---

## Session Start Protocol

At the start of every session Claude must:

1. Read `coding-standards/index.md` — loads the full standards map
2. Confirm active standards below are loaded
3. Begin every response with `[CX]` — signals context is active
4. Declare loaded standards on the first response of the session

If `[CX]` is ever missing from a response the session has lost context. Stop immediately, discard the response, and start a new session.

---

## Active Standards

| Standard | Active |
|---|---|
| CSS standard | `coding-standards/css-standards.md` |
| HTML standard | `coding-standards/html-standards.md` |
| Script standard | `coding-standards/ts-standards.md` |
| Git standard | `coding-standards/git-standards.md` |
| Versioning standard | `coding-standards/versioning-standards.md` |
| SEO standard | `coding-standards/seo-standards.md` |
| Performance standard | `coding-standards/performance-standards.md` |
| Accessibility standard | `coding-standards/accessibility-standards.md` |
| QA standard | `coding-standards/qa-standards.md` |
| AI standard | `coding-standards/ai-standards.md` |

---

## Project-Specific Context

| Property | Value |
|---|---|
| Project name | Stratisle |
| Framework | Next.js 16.2.10 (App Router) |
| CSS framework | None (global CSS + CSS Modules) |
| Script standard | TS only |
| CSS token prefix | `--sl-` (`--st-` is reserved by Strata CSS) |
| Selector signature | `sl-` (`st-` is reserved by Strata CSS) |
| Token file | `src/styles/tokens.css` |
| Global stylesheet | `src/styles/` (strata.css → tokens.css → main.css → responsive.css) |

### CSS architecture

- Strata CSS handles the majority of styling by design; custom CSS is for edge cases only.
- `src/styles/strata.css` — framework entry (`@strata` directives), never custom rules.
- `src/styles/tokens.css` — the project's single token file (`--sl-` prefix).
- `src/styles/main.css` — custom CSS shared across components.
- `src/styles/responsive.css` — breakpoint overrides for main.css (range-based queries only, RULE 17).
- Component CSS lives in its own file per component: top half rules, bottom half media queries (RULE 22).
- Media queries are locked to the six RULE 17 ranges scaffolded in `responsive.css` (xs → xxl). No new breakpoints may ever be introduced anywhere in the project; every override — component files included — uses those exact ranges. No min-width-only shortcuts.
| Entry scripts | `src/app/layout.tsx`, `src/app/page.tsx` |

---

## How to Load Standards Per File

Before editing any file identify its role using the table in `coding-standards/index.md` then load:

1. The relevant discipline global standard (`css-standards.md`, `html-standards.md`, etc.)
2. The relevant file-role partial (`css-standards/component-files.md`, etc.)
3. The relevant framework file if applicable

Never edit a file without loading its standard chain first.

---

## AI Behavioural Contract

- Every response starts with `[CX]`
- First response of every session declares which standards are loaded
- No restating the task before acting
- No trailing summaries after completing work
- No filler phrases
- No invented rules — gaps in standards are flagged to the developer
- Full rules in `coding-standards/ai-standards.md`

---

## Project State

Parallel-session mode is active. Project state lives in the `handover/` folder (role-session skill protocol):

- `handover/project.md` — shared, role-agnostic baseline (state, decisions, gotchas). Read first.
- `handover/board.md` — lane dashboard (one row per active task).
- `handover/locks.md` — file claims + git token/queue.
- `handover/roles/<role>.md` — role charters; `handover/<role>.md` — per-role lane handover.

Follow `.claude/skills/role-session/SKILL.md`: claim files in `locks.md` before editing, never run git without holding the token, stay inside your role's charter paths.
