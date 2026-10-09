# 09-library-reference-pattern.md

Character entries reference a library entry via FK **and** keep a local snapshot. The library is the truth for reusable blocks without silently changing existing characters.

```
LibraryEntry (truth)
   ▲  libraryEntryId (FK, onDelete: SetNull)
Skill / SavingThrow / Proficiency / Defense / StatusEffect / Action / Spell /
Equipment / InventoryItem / InventoryContainer / AlternateForm / Companion
   ▲  characterId (FK, onDelete: Cascade)
Character
```

Each such table has three relevant parts: `libraryEntryId String?`, `name` (snapshot at creation), `description` + type-specific fields (snapshot).

Why snapshot + FK:
- No cascade: deleting a library entry leaves the character's value intact (FK becomes NULL).
- No silent propagation: library changes reach characters only when the user decides.
- The FK enables the rename dialog and the usage count.

## Which tables have the FK
| Has FK | No FK |
|---|---|
| Skill, SavingThrow, Proficiency, Defense, StatusEffect, Action, Spell, Equipment, InventoryItem, InventoryContainer, AlternateForm, Companion | Attribute (materialized special case), HpSource, CombatValueSource, CharacterResource, CharacterHitDice, SpellSlot, CharacterClassLevel, Race, Background |

Classes, races and backgrounds get an FK only when their library type exists (see `05-new-feature-recipe.md`).

## `POST /api/library` and `mode`
| mode | behavior |
|---|---|
| `reuse` (default) | Entry exists: return it. Otherwise create. |
| `update` | Update the existing entry. 403 for protected seeds, 409 on name collision. |
| `force-new` | Always create; add suffix `(2)`, `(3)`, ... on collision. |

Response always contains `status: 'created' | 'reused' | 'updated'` plus the entry (`id`, `name`, ...).

`GET /api/library/[entryId]/usage` returns how many character entries reference the entry.

## Rename dialog (`RenameLibraryDialog`)
Shown when a character entry **with** `libraryEntryId` is renamed. Never for entries without FK (plain local rename). Shows the usage count.

| Choice | Effect |
|---|---|
| Only here | Change the local snapshot name. FK and library untouched. |
| Global | Rename the library entry (`mode='update'`). Other characters keep their snapshots, they are not changed retroactively. |
| New entry | Create a new library entry (`reuse` or `force-new`), re-point this character's FK to it. |
| Use existing | Target name already exists: re-point FK to it, no copy. |

Rules:
- "Global" is disabled for `seedKind === 'system'` and on a name collision.
- `seedKind === 'template'`: allowed only with an explicit warning.
- Warn on "Global" when other characters use the entry.
- Currently wired only in `SkillsEditor`. Other editors that rename FK entries must use the same dialog. Renaming an attribute also renames its saving throw (`handleRenameAttribute`); don't extend that path without the dialog.

## Keeping the FK
- Loader (new characters) and `POST /api/characters` fallback set `libraryEntryId` from the template.
- Every client payload for a collection with FK includes `libraryEntryId` (`libraryEntryId: x.libraryEntryId ?? null`).
- `PUT` and `POST` mappings pass it through. A save without it sets the FK to NULL (the "PUT trap").

```ts
const lib = entries.find((s) => s.name === choice);
const skill = {
  libraryEntryId: lib?.id ?? null,
  name: lib?.name ?? userInput,
  // ... remaining snapshot fields
};
```

## Client (`useLibrary`)
```ts
const { entries, loading, create, createWithMode } = useLibrary({ type: 'skill' });
await create({ type: 'skill', name: 'Aufspüren' });             // reuse
await createWithMode({ type: 'skill', name: 'Aufspüren', mode: 'update', targetEntryId: 'lib-xyz' });
```
Check `src/hooks/useLibrary.ts` for the exact signatures before use.

## Never
- `libraryEntryId` with `onDelete: Cascade`. Always `SetNull`.
- Delete library entries when deleting a character.
- Show the dialog when `libraryEntryId === null` (free text).
- Change `seedKind='system'` entries (403).
- Set the FK without filling the snapshot fields.
- Call `PUT /api/library/[entryId]` from a character edit unless the user chose "Global".