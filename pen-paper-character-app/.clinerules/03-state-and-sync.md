# 03-state-and-sync.md

## Hook chain (call order in `CharacterForm.tsx`, all share one state object)
1. `useCharacterState`: every field as `useState`
2. `useCharacterMemos`: derived values (`totalHp`, `proficiencyBonus`, `activeForm`, aggregated defenses)
3. `useCharacterDataLoader`: library templates (new) or server data (existing)
4. `useCharacterSyncs`: auto-sync effects
5. `useCharacterHandlers`: event handlers with API calls (skipped when `isNew`)
6. `useCharacterSubmit`: collect state, validate, POST/PUT

New state goes into `useCharacterState`. New effects go into `Syncs` or `DataLoader`. Never derive state with an effect.

## Auto-sync (`useCharacterSyncs`)
- Race skill proficiencies -> `Skill.isProficient` (`proficiencySource: 'Rasse'`)
- Background skills -> `Skill.isProficient` (`'Hintergrund'`)
- Race languages -> Proficiencies (`category: 'language'`)
- Race + background ability bonuses -> `Attribute.value = baseValue + bonus`
- Race bonus AC / HP -> `combatValueSources` / `hpSources`

Rules:
- Removing the source must reset the synced value (`isProficient: false`, `proficiencySource: ''`).
- Sync must not delete entries it doesn't own (custom or library entries).
- Dependency lists use stable primitives, not fresh array/object references:
  - strings: `bonusSkills.join('|')`
  - object arrays: `skillProficiencies.map((p) => p.skillName).join('|')` (a plain `.join` on objects gives `[object Object]`)

## New characters (`isNew === true`)
- No API calls. State stays local (`fetch('/api/characters/new/...')` is always a bug).
- At the end, one `POST /api/characters` with the complete payload. Child resources (actions, forms, companions, containers) are created server-side in one transaction.
- Every child entry created from a template carries its `libraryEntryId`.

## Existing characters
- Update state, call the API, check `res.ok`. On failure revert and `setError`. Never swallow errors.
- After success, use the server response. No `window.location.reload()`.
- Single-purpose updates (HP, exhaustion, rests, form activation) send a partial `PUT /api/characters/[id]` with only the changed fields.

## Partial PUT semantics
- Each collection in `PUT /api/characters/[id]` is guarded by `if (collection)`. Absent means untouched.
- A collection that IS present is rebuilt completely (`deleteMany` + `createMany`) and gets **new IDs**. This affects attributes, skills, saving throws, proficiencies, hpSources, defenses, combatValueSources, spells, spellSlots, resources, hitDice, statusEffects. Class levels, alternate forms and companions are upserted by key/ID instead.
- Consequences: send a collection only when the user actually changed it. Never store the ID of a rebuilt row elsewhere as a reference (`linkedResourceId`, `spellcastingClassLevelId`, ...).
- Always round-trip `libraryEntryId` in every collection you send. A PUT without it sets the FK to NULL.
- Scalars must pass `undefined` through when absent (see `01-code-style.md`).

## Submit (`useCharacterSubmit`)
- Validate attribute method only when creating.
- Runtime state (current HP, temp HP, exhaustion, rests, status effects) belongs to the partial-PUT handlers. Don't overwrite it from stale form state on edit-save.
- Every `fetch` result must be checked with `res.ok`, and failures reported through `state.setError`.
- Preserve stored values when cleaning payloads. Don't hardcode `description: ''`, `modifier: 0` or empty source fields.

## Rename flow for entries with `libraryEntryId`
Never rename silently. Show the rename dialog: `10-library-reference.md`.