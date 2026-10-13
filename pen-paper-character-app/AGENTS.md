# AGENTS.md

Universal rules for any AI agent working on this repository.
Cline has its own additional rules (see bottom). Detailed orientation
is in `PROJECT_MAP.md`.

## Project

- **Stack:** Next.js 16 / React 19 / TypeScript / Prisma (SQLite) / Tailwind
- **Purpose:** Pen & Paper RPG character manager. German UI, English code identifiers.
- **Branch:** work on `dev`. `main` is protected; only stable merges.
- **Commands:**
  - `npm run dev` — dev server (port 3000)
  - `npm run test` — Vitest
  - `npm run typecheck` — tsc --noEmit
  - `npx prisma db seed` — reseed library (idempotent)
  - `npx prisma migrate dev --name <name>` — schema change (only when task names it)

## Absolute taboos (do not violate, ever)

1. **No package changes.** No `npm install`, `npm add`, `pnpm add`,
   `yarn add`, `npm audit fix`. No editing `package.json` or
   `package-lock.json`. If you think a package is needed: STOP and ask.
2. **No schema changes without explicit user approval.** No
   `prisma db push`. No `prisma migrate reset`. Migrations only via
   `npx prisma migrate dev --name <name>` when the task names it.
3. **No silent failures.** `fetch` does not throw on 4xx/5xx — always
   check `res.ok`. Every `catch` either calls `setError` or rethrows.
4. **No `any` without a comment explaining why. No `@ts-ignore`.**
5. **No renames or deletions of existing exports, types, or endpoints**
   unless the current task explicitly authorizes it.
6. **No commits while `typecheck` or `test` is red.** Never leave a red
   baseline for the next agent.
7. **Do not edit `AGENTS.md` itself.** It is user-owned. If a rule
   looks wrong, report it — do not change it.

## Per-edit verification (mandatory)

After **every file edit**, run `npm run typecheck` before moving to the
next file. Do not batch edits and check once at the end. A broken
intermediate state is worse than a slow agent — it can silently
propagate.

For multi-file refactors: after every 3-5 files, run `npm run test` as
well. If a test breaks, fix immediately — do not continue.

## Stop and ask when

- A task would touch more files than the task says it should.
- A task would contradict a rule in this file.
- You discover a bug outside the current task's scope.
- You are unsure about behavior preservation in a refactor.
- You find a file in a broken intermediate state (e.g., two versions of
  the same line, unbalanced braces, a duplicate import).
- You cannot find a file this doc references.

## Working style

- One task = one logical change. Do not bundle a refactor with a bug fix.
- Before editing: list files to touch, with one-line reasons. If more
  than 3 files, wait for confirmation (unless the task grants an
  explicit exception).
- After editing: run `npm run typecheck`, `npm run test`, and a manual
  browser smoke test (create character → all tabs render → no red
  console errors).
- Windows environment. Do not use bash-only syntax (`echo >>`). Use the
  editor or PowerShell here-strings. Use `-LiteralPath` when paths
  contain `[` or `]` (Next.js dynamic routes) — PowerShell treats those
  as wildcards otherwise.
- Report format: brief summary, list of files changed, verification
  results (tsc / tests / browser smoke), and any out-of-scope findings.

## Git workflow

- Work on `dev`. Never commit directly to `main`.
- Commit messages: `<area>: <what>`, e.g.
  `sprint-1b: consolidation part 2 — alignments, recharge`.
- After every push to `dev`, the working tree must be clean before the
  next task starts.
- Tags mark completed sprints: `sprint-N-complete`.

## Orientation — where to find what

See `PROJECT_MAP.md` for:
- Top-level folder purpose
- The character editor hook chain
- Canonical sources (dice, units, JSON helpers, enums, types)
- API route grouping
- `codescope` MCP tools for symbol lookups
- Task-scoped rules: see `agent-rules/README.md`.

## If you are Cline

You have additional detailed rules in `.clinerules/`. Before starting a
task, read `.clinerules/00-index.md` — it points to the specific rule
file(s) for the task type.

**No other agent needs to read `.clinerules/`.** It is Cline-specific,
local-only (not in git), and irrelevant to Antigravity, Claude Code,
Cursor, or Claude.ai.

## When in doubt

STOP. Report. Wait. A round-trip costs a minute; a wrong action costs
an hour.