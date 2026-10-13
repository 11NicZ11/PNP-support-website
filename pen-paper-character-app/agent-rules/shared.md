# Shared rules

Read for every task, before the task-specific file.

## Absolute taboos

1. No package changes (`npm install`, `package.json` edits). Ask first.
2. No schema changes without explicit user approval. Never `db push`.
3. No silent failures. `fetch` does not throw on 4xx/5xx — check
   `res.ok`, call `setError` on failure.
4. No `any` without a comment. No `@ts-ignore`.
5. No renames or deletions of exports, types, or endpoints without
   explicit authorization.
6. No commits while `tsc` or `test` is red.
7. Do not edit `AGENTS.md` or `agent-rules/`. These are user-owned.

Full list: `AGENTS.md`.

## Code style baseline

- TypeScript `strict`. `interface` for object shapes, `type` for unions.
- Import types from `src/types/`, never redeclare in components.
- Client components start with `'use client'`. API routes never do.
- Every `<button>` gets `type="button"`, except the form's submit button.
- German UI texts, English code identifiers.
- Lists use `key={item.id}`, never the index.
- No `console.log` in committed code. `console.error` only together
  with user-visible error handling.
- No `window.location.reload()` after API calls.

## Falsy values

`||` turns valid `0` and `''` into the fallback. Use `??` or an
explicit check.

```ts
// ❌ 0 becomes 2
shieldBonus: parseInt(v) || 2

// ✅
const n = parseInt(v);
shieldBonus: Number.isNaN(n) ? 2 : n
```

## Per-edit verification (mandatory)

After **every file edit**: `npm run typecheck`.
After every 3–5 file edits: `npm run test`.
Never batch edits and check once at the end. A broken intermediate
state is worse than a slow agent.

## Report format

```
## Summary
Changed:
- <file>: <what>

Checked:
- ✅ tsc / tests
- ✅ <flow tested>
- ⚠️ <not tested and why>

Risks:
- <what could break>

Out-of-scope findings:
- <file:line>: <one sentence>
```