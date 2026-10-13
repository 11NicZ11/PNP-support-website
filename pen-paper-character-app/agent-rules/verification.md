# Verification checklist

Read before reporting done. Fix what applies and fails.

## Build

- [ ] `npm run typecheck` — clean.
- [ ] `npm run test` — all pass.
- [ ] `npm run build` — only when routes, types, or config changed.
- [ ] No new `any` without comment, no `@ts-ignore`, all imports
  resolve.

## API routes (if touched)

- [ ] `params` typed as `Promise<...>` and awaited.
- [ ] Every child query scoped by `characterId`.
- [ ] `updateMany` / `deleteMany` followed by `findFirst` for 404.
- [ ] Status codes correct (201 / 400 / 403 / 404 / 409 / 500).
- [ ] Validation uses `=== undefined` / `typeof` where `''` or `0`
  is valid.
- [ ] PUT scalars pass `undefined` through; no `|| ''` / `|| 0`.
- [ ] JSON fields go through `asJsonArray` / `parseJsonArray`.
- [ ] Long transactions have `{ timeout: 20000 }`.

## Client calls (if touched)

- [ ] Every `fetch` checks `res.ok`; failures reach `setError`.
- [ ] No `try/catch` that only does `console.error`.
- [ ] No `window.location.reload()`.

## Library (if touched)

- [ ] FK is `SetNull`, Character relations are `Cascade`.
- [ ] `libraryEntryId` set on create and mapped in POST **and** PUT.
- [ ] Snapshot fields filled.
- [ ] Seeds use `upsert`, `isSeed: true`, `seedKind` set.

## UI (if touched)

- [ ] Every `<button>` has `type`, no nested `<form>`.
- [ ] German UI texts, existing color classes.
- [ ] `key={item.id}`, not the index.

## Anti-regression

- [ ] No export, type, or endpoint renamed or removed.
- [ ] No unrelated file touched.
- [ ] No new packages.

## Manual smoke test

Run if the change touches runtime behavior. List what you could **not**
run.

1. Create a character → save → reload: data intact.
2. Edit → save again: skills, notes, and HP unchanged.
3. Click a dice button inside a tab: no silent `PUT`.
4. Add an action without a description to a new character, save:
   it persists.
5. Short rest / long rest: HP and resources update, nothing else
   changes.

## Report format

```
## Summary
Changed:
- <file>: <what>

Checked:
- ✅ tsc / tests / build
- ✅ <flow tested>
- ⚠️ <not tested and why>

Risks:
- <what could break>

Out-of-scope findings:
- <file:line>: <one sentence>
```