# 05-new-feature-recipe.md: add a new library type

Example: `race`. Follow the steps in order. Skip a step only if it clearly doesn't apply.

## 1. Decide: FK or pure template?
Do character instances of this type need to point back to the library?
- Yes: add `libraryEntryId` to the character table and follow `10-library-reference.md` (FK, snapshot, rename dialog).
- No: pure template without FK (like `weapon_property`).

## 2. Schema (only if FK)
```prisma
libraryEntryId String?
library        LibraryEntry? @relation(fields: [libraryEntryId], references: [id], onDelete: SetNull)
@@index([libraryEntryId])
```
Add the opposite relation list on `LibraryEntry`. Run `npx prisma migrate dev --name add_library_entry_fk_to_<table>`. Never `db push`. FK is `SetNull`, never `Cascade`.

## 3. Seed (`prisma/seed.ts` + `src/lib/defaults/<type>.ts`)
- Always `upsert` on `type_category_name`, never `create`.
- Set `isSeed: true` and `seedKind` (`'system'` or `'template'`).
- Seed the minimum.

```ts
await prisma.libraryEntry.upsert({
  where: { type_category_name: { type: 'race', category: '', name } },
  update: { description, data: JSON.stringify(data), isSeed: true, seedKind: 'template' },
  create: { type: 'race', category: '', name, description, icon, data: JSON.stringify(data), isSeed: true, seedKind: 'template', isPublic: true },
});
```

## 4. Library page
- `LibraryPage.tsx`: add the entry to `TYPE_TABS`.
- `LibraryEntryCard.tsx`: add the entry to `TYPE_LABELS`.

## 5. Editor
- Load suggestions with `useLibrary({ type })` (once per component). Use `<input list>` + `<datalist>` or chips. No new packages.
- When the user picks an entry: set `libraryEntryId` and fill every snapshot field.
- When the user creates a new name: `create({ ..., mode: 'reuse' })` and store the returned `id` as `libraryEntryId`.
- Check `src/hooks/useLibrary.ts` for the exact signatures of `create` and `createWithMode` before using them.

## 6. New-character flow
- `useCharacterDataLoader` (`isNew`): fetch `/api/library?type=<type>` and set `libraryEntryId` + snapshot on the copies.
- `POST /api/characters`: map `libraryEntryId` into the create payload. Add a server-side library fallback only if new characters should start with those entries.
- `PUT /api/characters/[id]`: map `libraryEntryId` too (otherwise the next save sets the FK to NULL).

## 7. Never
- A Prisma table for the library type itself.
- A new API endpoint for the library (`/api/library` is enough).
- `fetch` to the library in a component (use `useLibrary`).
- Setting the FK without filling the snapshot fields.