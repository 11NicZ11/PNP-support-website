# 08-test-checklist.md: Checklist before reporting "done"

Go through it. Skip what doesn't apply. Fix what applies and fails before you report.

## 1. Build
- [ ] `npx tsc --noEmit` has no errors.
- [ ] `npx eslint .` has no new warnings compared to the baseline you recorded.
- [ ] `npm run build` succeeds (only when routes, types or config changed).
- [ ] No new `any` without comment, no `@ts-ignore`, all imports resolve.

## 2. API routes
- [ ] `params` typed as `Promise<...>` and awaited.
- [ ] Every child query scoped by `characterId`; `updateMany`/`deleteMany` followed by `findFirst`.
- [ ] Status codes correct (201 / 400 / 403 / 404 / 409 / 500), `try/catch` with `handleApiError`.
- [ ] Validation uses `=== undefined` / `typeof` where `''` or `0` is valid.
- [ ] PUT scalars pass `undefined` through; no `|| ''` or `|| 0` on optional values.
- [ ] JSON fields via `asJsonArray` / `parseJsonArray` helpers.
- [ ] Long transactions have `{ timeout: 20000 }`.

## 3. Client calls
- [ ] Every `fetch` checks `res.ok`; failures reach `setError` (or a rollback).
- [ ] No `try/catch` that only does `console.error`.
- [ ] No `window.location.reload()`.

## 4. Library and FK (if touched)
- [ ] FK is `libraryEntryId String?` with `onDelete: SetNull`; Character relations `Cascade`.
- [ ] `libraryEntryId` set on creation from a template and mapped in POST **and** PUT.
- [ ] Snapshot fields filled.
- [ ] Rename of an entry with FK shows the dialog; "Global" disabled for `seedKind='system'`.
- [ ] Seeds use `upsert`, `isSeed: true`, `seedKind` set.
- [ ] New type added to `TYPE_TABS` and `TYPE_LABELS`; editor uses `useLibrary`.

## 5. State and flows
- [ ] New state lives in `useCharacterState`; no `useEffect` that derives state.
- [ ] Sync effects reset when the source is removed, use stable dependencies, and cause no loop in the console.
- [ ] `isNew`: no request to `/api/characters/new/...`; one POST with the complete payload.
- [ ] Existing character: partial PUT sends only changed fields; HP/rest/exhaustion actions don't wipe attributes, skills or notes.
- [ ] Rebuilt collections (see `03-state-and-sync.md`) are not sent unnecessarily and their IDs are not stored elsewhere.

## 6. UI
- [ ] Every `<button>` has `type`; no nested `<form>`.
- [ ] German UI texts, existing color classes, dark theme.
- [ ] Modals follow the pattern; `key={item.id}`.

## 7. Prisma
- [ ] New fields have `@default`. Migration created with `migrate dev --name`, not `db push`.
- [ ] No new tables or JSON columns unless the task asked for it.

## 8. Anti-regression
- [ ] No export, type or endpoint renamed or removed.
- [ ] No unrelated file touched. No new npm packages.

## 9. Manual smoke test (list what you could NOT run)
1. Create a character, save, reload: data intact.
2. Edit it, save again: skills, notes and HP unchanged.
3. Click a dice button inside a tab: no network request to `PUT /api/characters`.
4. Add an action without a description to a new character, save: it persists.
5. Short rest / long rest: HP and resources update, nothing else changes.

## 10. Report format
```
## Summary
Changed:
- <file>: <what>

Checked:
- ✅ tsc / eslint / build (counts vs. baseline)
- ✅ <flow tested>
- ⚠️ <not tested and why>

Risks:
- <what could break>

Out-of-scope findings:
- <file:line>: <one sentence>
```