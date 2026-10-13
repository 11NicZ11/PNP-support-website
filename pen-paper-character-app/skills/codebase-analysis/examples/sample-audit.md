# Architecture Audit — 2026-10-13

## Baseline

| Check | Result |
|---|---|
| tsc | clean |
| tests | 132 / 132 |
| git status | clean |
| HEAD | b5a473c sprint-1c: language sync only replaces its own rows |

## 1. Current structure

Layer-based with feature-shaped pockets inside `components/character/`.
`lib/` and `types/` are clean. `app/api/` still has fat handlers.
168 TS/TSX files. 36 API routes. 25 Prisma models.

## 2. Duplication

| What | Where | Identical? | Risk |
|---|---|---|---|
| `parseInt(x) ?? parseInt(y) ?? 1` | `app/api/characters/route.ts:300`, `[id]/route.ts:581`, `forms/route.ts:55`, `companions/route.ts:55` | yes | high |

## 3. Dead code

| Symbol | Location | Classification |
|---|---|---|
| `SavingThrowsEditor.tsx` | `src/components/character/editors/` | orphan export — imported nowhere |
| `PassiveStats.tsx` | `src/components/character/views/` | truly dead — recomputed inline in StatusTab |

## 4. Type-system issues

| File:line | Issue | Severity |
|---|---|---|
| `types/character.ts:2-10` | 6 imports from `@/components/` | high — cycle |

## 5. API / data flow

| Route | Method | Flags |
|---|---|---|
| `/api/characters/[id]` | PUT | delete-and-recreate for 9 collections |
| `/api/characters/[id]` | PUT | N+1 writes for spells, forms, companions |
| `/api/library` | GET | no pagination |

## 6. Circular imports

| Pair | Kind | Severity |
|---|---|---|
| `types/character.ts ⇄ components/.../ClassLevelsEditor.tsx` | runtime (CLASS_PROGRESSION_LABELS) | high |
| `types/character.ts ⇄ components/.../AttributesEditor.tsx` | type-only | medium |

## 7. Test gaps

- No tests for `app/api/**` route handlers
- No E2E suite
- `src/lib/api/*` at 0% coverage

## 8. Top 3 risks

1. PUT endpoint delete-and-recreate is a last-writer-wins corruption machine.
2. 24 remaining `parseInt` NaN sites in API routes.
3. Zero test coverage on 36 API routes.

## 9. Recommended next sprint

Sprint 1E — parseInt NaN sweep across 28 sites in API routes. Apply the
`toInt` helper consistently. Each site is a 1-line change; verification
via existing tests plus one new test per file.