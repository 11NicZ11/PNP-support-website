# Prisma.md / schema rules

Read `shared.md` first. Applies to `prisma/schema.prisma`, migrations,
and any schema-touching code.

## Rules

- **New fields need `@default(...)`.** Never break existing migrations.
- **New tables only when the approved task says so.** Structured data
  goes relational; never add JSON columns.
- **Relations to `Character`:** `onDelete: Cascade`. Without it,
  `DELETE /api/characters/[id]` fails for any character that has rows
  in the new relation.
- **Relations to `LibraryEntry`:** `onDelete: SetNull`. Never Cascade.
  Deleting a library entry must not destroy character data.
- **Index only fields that are filtered:** `characterId`, `type`,
  `category`, `isSeed`, and FKs.
- **Optional FK columns:** `String?` with `@relation` and an index.

## Migrations

Schema changes only via:

```
npx prisma migrate dev --name <descriptive_name>
```

**Never `prisma db push`** — it can drop columns without warning.
**Never `prisma migrate reset`** without explicit user permission.

## Seed

`prisma/seed.ts` is idempotent — always `upsert` on
`type_category_name`, never `create`. A second `db seed` would fail
with `create` on duplicates.

Seed sources live in `src/lib/defaults/*.ts`. Runtime code reads them
through `useLibrary`, never by direct import. **Known exception:**
`notesCategories.ts` is imported at runtime by
`initializeNotesCategories` — do not add further exceptions.

Every seed entry sets `isSeed: true` and a `seedKind` (`'system'` or
`'template'`).

## JSON columns

The only remaining JSON columns are:
- `LibraryEntry.data` — variable by type, by design.
- `Character.attributeMethodState` — transient UI state during
  character creation.
- `Character.expThresholds` — a map without query needs.

Everything else is relational. Do not add new JSON columns.