# AGENTS.md

Entry point for AI coding agents working on this repository.
Detailed rules live in `.clinerules/` (local-only; not in git). If that
folder is missing, ask the user — do not proceed blind.

## Project

- **Stack:** Next.js 16 / React 19 / TypeScript / Prisma (SQLite) / Tailwind
- **Purpose:** Pen & Paper RPG character manager. German UI, English code identifiers.
- **Branch:** work on `dev`. `main` is protected; only stable merges.
- **Current status:** Tags `sprint-0-complete`, `sprint-1b-complete`,
  `sprint-1c-complete` are set. Sprint 1D (Type-Inversion) pending.
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
   `console.error` alone is not handling.
4. **No `any` without a comment explaining why. No `@ts-ignore`.**
5. **No renames or deletions of existing exports, types, or endpoints**
   unless the current task explicitly authorizes it.
6. **No commits while `typecheck` or `test` is red.** Never leave a red
   baseline for the next agent.
7. **Do not edit `AGENTS.md` or any file in `.clinerules/`.** These are
   user-owned. If a rule looks wrong, report it — do not change it.

## Per-edit verification (mandatory)

After **every file edit**, run `npm run typecheck` before moving to the
next file. Do not batch edits and check once at the end. A broken
intermediate state is worse than a slow agent — it can silently
propagate.

For multi-file refactors: after every 3-5 files, run `npm run test` as
well. If a test breaks, fix immediately — do not continue.

## Stop and ask when

- You cannot find a rule file that this doc references.
- A task would touch more files than the task says it should.
- A task would contradict a rule in `.clinerules/`.
- You discover a bug outside the current task's scope.
- You are unsure about behavior preservation in a refactor.
- You find a file in a broken intermediate state (e.g., two versions of
  the same line, unbalanced braces, a duplicate import).

## Rule index — read the relevant file before starting

| Task type | Read from `.clinerules/` |
|---|---|
| Any task | `01-code-style.md`, `06-do-not.md` |
| New feature using the Library | `02-library-of-babylon.md`, `05-new-feature-recipe.md`, `09-library-reference-pattern.md` |
| Refactor of existing code | `04-file-refactor-targets.md` |
| API route change | `01-code-style.md`, `07-common-pitfalls.md` |
| State / sync / hooks | `03-state-and-sync.md`, `07-common-pitfalls.md` |
| Schema / Prisma change | `01-code-style.md`, `05-new-feature-recipe.md` |
| Before reporting done | `08-test-checklist.md` |

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
- Report format follows `.clinerules/08-test-checklist.md` #10.

## Git workflow

- Work on `dev`. Never commit directly to `main`.
- Commit messages: `<area>: <what>`, e.g.
  `sprint-1b: consolidation part 2 — alignments, recharge`.
- After every push to `dev`, the working tree must be clean before the
  next task starts.
- Tags mark completed sprints: `sprint-N-complete`.

## When in doubt

STOP. Report. Wait. A round-trip costs a minute; a wrong action costs
an hour.