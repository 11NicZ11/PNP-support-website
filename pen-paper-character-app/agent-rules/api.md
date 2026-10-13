# API route rules

Read `shared.md` first. Applies to any file under `src/app/api/`.

## Pattern

Every route follows the same shape:

```ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // ...
    return apiSuccess(data);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden');
  }
}
```

## Rules

- **`params` is a Promise.** Always `await params` (Next.js 15+).
- **Scope child queries by `characterId`.**
  `findFirst({ where: { id, characterId } })`. Never `findUnique` /
  `update` / `delete` by `id` alone on child data.
- Use `updateMany` / `deleteMany` with `characterId` filter, then
  `findFirst` to confirm. `404` if the row is missing.
- **Status codes:** 201 create, 400 validation, 403 protected seed,
  404 not found, 409 name collision, 500 error.
- **Presence checks** use `=== undefined` / `typeof`, not truthiness,
  whenever `''` or `0` is valid.
- **PUT scalars** pass `undefined` through when the field is absent.
  Never `x || ''` — that wipes the stored value on partial payloads.
- **JSON helpers:** `asJsonArray` / `asJsonObject` (from
  `@/lib/api/helpers`) to write, `parseJsonArray` / `parseJsonObject`
  (from `@/lib/utils`) to read. Both are idempotent for strings.
- **Long transactions** that rebuild many rows: `{ timeout: 20000 }`.
- **The PUT trap:** every collection sent in a PUT must round-trip
  `libraryEntryId`. A payload without it sets the FK to NULL.
- **Numeric parsing:** use `toInt(value, fallback, min)` from
  `@/lib/utils` for integers, `parseWeightInput(input, unitSystem)`
  from `@/lib/units` for weights. Never raw `parseInt` / `parseFloat`
  on user input.

## Library endpoints

`POST /api/library` accepts a `mode`:

| mode | behavior |
|---|---|
| `reuse` (default) | return existing if duplicate, else create |
| `update` | update existing (403 for `seedKind='system'`, 409 on name collision) |
| `force-new` | always create, suffix `(2)`, `(3)`, ... on collision |

Response always contains `status: 'created' | 'reused' | 'updated'`.

`GET /api/library/[entryId]/usage` returns how many character entries
reference the entry.

## Do not

- Do not add a new library endpoint. `/api/library` covers it.
- Do not import `@/lib/prisma` from client code.
- Do not swallow Prisma errors — let `handleApiError` classify them.