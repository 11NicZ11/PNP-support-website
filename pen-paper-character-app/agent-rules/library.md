# Library rules

Read `shared.md` first. Applies to any work touching `LibraryEntry`,
its FKs, the rename dialog, or the seed.

## Model

Central table `LibraryEntry` — every reusable building block lives
here, never hardcoded in components.

```
model LibraryEntry {
  id          String   @id @default(cuid())
  type        String
  category    String   @default("")
  name        String
  description String   @default("")
  icon        String   @default("📚")
  data        String   @default("{}")   // JSON, per type
  isSeed      Boolean  @default(false)
  seedKind    String?                   // 'system' | 'template' | null
  isPublic    Boolean  @default(true)
  @@unique([type, category, name])
}
```

## The FK + snapshot pattern

Character entries reference a library entry via FK **and** keep a
local snapshot (name, description, type-specific fields).

```
LibraryEntry (truth)
   ▲  libraryEntryId (FK, onDelete: SetNull)
   │
Skill / SavingThrow / Proficiency / Defense / StatusEffect /
Action / Spell / Equipment / InventoryItem / InventoryContainer /
AlternateForm / Companion
   ▲
   │ characterId (FK, onDelete: Cascade)
   │
Character
```

**Why both:**
- Deleting a library entry sets FK to NULL — character value survives.
- Library changes do not propagate automatically.
- FK enables the rename dialog and the usage count.

## `seedKind`

| Value | Meaning |
|---|---|
| `system` | uneditable, seed-protected (403 on edit) |
| `template` | editable with warning |
| `null` | free user entry |

## Endpoints

- `GET /api/library?type=&category=` — list
- `POST /api/library` — create with `mode` (`reuse` | `update` |
  `force-new`)
- `PUT /api/library/[entryId]` — update (403 for `system`)
- `DELETE /api/library/[entryId]` — delete (403 for `isSeed`)
- `GET /api/library/[entryId]/usage` — reference count

Do not add other library endpoints.

## Client

Always through `useLibrary({ type, category })`. Never
`fetch('/api/library...')` in a component.

Check `src/hooks/useLibrary.ts` for exact signatures before using
`create` or `createWithMode`.

## Rename dialog

Shown when a character entry **with** `libraryEntryId` is renamed.
Never for entries without FK.

| Choice | Effect |
|---|---|
| Only here | Change local snapshot name. FK untouched. |
| Global | Rename library entry (`mode='update'`). Other characters keep their snapshots. |
| New entry | Create new library entry, re-point FK. |
| Use existing | Target name exists: re-point FK, no copy. |

Rules:
- "Global" is disabled for `seedKind='system'` and on name collision.
- Warn on "Global" when other characters reference the entry.
- Currently wired only in `SkillsEditor`. Other editors need the same
  dialog when they gain rename capability.

## Never

- `libraryEntryId` with `onDelete: Cascade`. Always `SetNull`.
- Delete library entries when deleting a character.
- Show the dialog when `libraryEntryId === null` (free text).
- Edit `seedKind='system'` entries.
- Set the FK without filling the snapshot fields.
- Call `PUT /api/library/[entryId]` from a character edit unless the
  user explicitly chose "Global".