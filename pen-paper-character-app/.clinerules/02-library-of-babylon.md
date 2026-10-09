# 02-library-of-babylon.md (Single Source of Truth)

Central table `LibraryEntry`. Every reusable building block lives here, never hardcoded in components.
FK, snapshot, mode and rename rules: `10-library-reference.md`.

## Model
```prisma
model LibraryEntry {
  id          String   @id @default(cuid())
  type        String
  category    String   @default("")
  name        String
  description String   @default("")
  icon        String   @default("📚")
  data        String   @default("{}")   // JSON, per design variable by type
  isSeed      Boolean  @default(false)
  seedKind    String?                   // 'system' | 'template' | null (user entry)
  isPublic    Boolean  @default(true)
  @@unique([type, category, name])
}
```

## Existing types
| type | category | `data` example |
|---|---|---|
| `attribute` | '' | `{ order, isDefault }` |
| `saving_throw` | '' | `{ attributeName }` |
| `skill` | '' | `{ attributeName }` |
| `proficiency` | language / armor / weapon / tool | |
| `defense` | damage_immunity / damage_resistance / condition_immunity | |
| `status_effect` | '' | `{ defaultDuration, durationUnit, immunityKey }` |
| `action` | action / bonus_action / reaction | |
| `weapon_property` | '' | |
| `equipment` | equipment type (weapon, armor, ...) | mirrors the equipment fields without character-specific values (`equipped`, `attuned`, `quantity`) |

Planned: `race`, `class`, `spell`, `form`, `companion`, `feat`, `combat_value`, `hp_source`.

## Rules
1. New hardcoded list the user can pick from: put it in `prisma/seed.ts` + `LibraryEntry`.
2. Protection by `seedKind`: `system` is read-only (403). `template` is editable only after a warning. `null` is freely editable and deletable.
3. `data` holds structural extras as JSON. Keep it small and typed.
4. Endpoints: `GET /api/library?type=&category=`, `POST /api/library` (with `mode`), `PUT` and `DELETE /api/library/[entryId]` (protection per rule 2), `GET /api/library/[entryId]/usage`. Don't add other library endpoints.
5. Never create a Prisma table for a library type itself.

## Client
Always through `useLibrary({ type, category })`. Never `fetch('/api/library...')` in a component. Don't call `useLibrary` in loops or conditions; load once, then `filter`. Copy the array before sorting: `[...entries].sort(...)`.

## New characters
The loader (`useCharacterDataLoader`) fetches library templates and sets `libraryEntryId` on each copy. `POST /api/characters` has a server-side fallback that loads templates when the client sends empty arrays. A new template type needs both. A library fetch that fails must surface an error, never produce a silently empty form.