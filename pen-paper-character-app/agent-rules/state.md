# State and sync rules

Read `shared.md` first. Applies to `src/components/character/hooks/`
and any state-handling code.

## Hook chain

`CharacterForm.tsx` calls six hooks in this order. All share one state
object:

```
useCharacterState       every field as useState
       ↓
useCharacterMemos       derived values (useMemo, no side effects)
       ↓
useCharacterDataLoader  server data (existing) or library templates (new)
       ↓
useCharacterSyncs       auto-sync effects (race → skills, background → …)
       ↓
useCharacterHandlers    event handlers with API calls (skipped when isNew)
       ↓
useCharacterSubmit      collect state, validate, POST/PUT
```

New state goes into `useCharacterState`. New effects go into `Syncs`
or `DataLoader`. **Never derive state with an effect.**

## Auto-sync rules

Race and background changes propagate to skills, languages, attribute
bonuses, AC, and HP sources. When removing the source, the synced
value must be reset (`isProficient: false`, `proficiencySource: ''`).

Sync must not delete entries it doesn't own (custom or library
entries).

**Stable dependencies** — no fresh array/object references:

```ts
// ❌ new array every render
}, [raceData.skillProficiencies]);

// ✅ primitive string
}, [raceData.skillProficiencies.map((p) => p.skillName).join('|')]);
```

For string arrays: `bonusSkills.join('|')`.

## New characters (`isNew === true`)

- No API calls. State stays local.
- `fetch('/api/characters/new/...')` is always a bug — branch on `isNew`.
- One `POST /api/characters` at the end with the complete payload.
- Child resources (actions, forms, companions, containers) are created
  server-side in one transaction.
- Every child entry created from a template carries its
  `libraryEntryId`.

## Existing characters

- Update state, call the API, check `res.ok`.
- On failure: revert state, call `setError`. Never swallow errors.
- After success: use the server response. No
  `window.location.reload()`.
- Single-purpose updates (HP, exhaustion, rests, form activation)
  send a **partial** PUT with only the changed fields.

## Partial PUT semantics — critical

- Each collection in `PUT /api/characters/[id]` is guarded by
  `if (collection)`. Absent means untouched.
- A collection that **is** present is **rebuilt completely** —
  `deleteMany` + `createMany`. Its rows get **new IDs**.
- Consequence: never store the ID of a rebuilt row elsewhere
  (`linkedResourceId`, `spellcastingClassLevelId`, ...). Send a
  collection only when the user actually changed it.
- **Always round-trip `libraryEntryId`** in every collection you send.
- Scalars must pass `undefined` through when absent — never `|| ''`.

## Rename flow

Never rename a library-backed entry silently. Show the rename dialog
(`RenameLibraryDialog`). Details: `library.md`.