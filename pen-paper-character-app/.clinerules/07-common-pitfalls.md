# 07-common-pitfalls.md

## 1. `params` is a Promise
Always `await` it (Next.js 15+, installed 16.2.3).
```ts
{ params }: { params: Promise<{ id: string }> }
const { id } = await params;
```

## 2. Scope child queries by `characterId`
No auth exists, but queries must never touch another character's rows.
```ts
// ❌ update({ where: { id: actionId }, data })
await prisma.action.updateMany({ where: { id: actionId, characterId: id }, data });
const updated = await prisma.action.findFirst({ where: { id: actionId, characterId: id } });
if (!updated) return apiError('Nicht gefunden', 404);
```

## 3. `fetch` does not throw on 4xx/5xx
A `try/catch` around `await fetch(...)` never sees a 400 or 500. Check `res.ok` and handle the failure (`setError`). This is how actions were lost silently on create, and how a failed load can fill the form with blanks.
```ts
const res = await fetch(url, init);
if (!res.ok) { state.setError('...'); return; }
```

## 4. JSON helpers, no double parsing
DB JSON columns are strings. Read with `parseJsonArray` / `parseJsonObject` (`@/lib/utils`), write with `asJsonArray` / `asJsonObject` (`@/lib/api/helpers`). The write helpers are idempotent (strings pass through). Never `JSON.parse(JSON.parse(x))`. Cast `Prisma.JsonValue` explicitly when mapping.

## 5. PUT rebuilds collections with new IDs
A collection present in a PUT payload is deleted and recreated, so its rows get new IDs. Never store such IDs elsewhere (`linkedResourceId`, `spellcastingClassLevelId`). Send a collection only when it really changed. Details: `03-state-and-sync.md`.

## 6. Falsy values and `undefined` vs `null`
- Prisma ignores `undefined` on update, `null` sets NULL.
- `notes: x || ''` wipes notes on every partial PUT. `shieldBonus: n || 2` makes 0 impossible. `currentHp || totalHp` heals a 0-HP character.
```ts
const data: Prisma.EquipmentUpdateInput = {};
if (body.description !== undefined) data.description = body.description;
```

## 7. The PUT trap: `libraryEntryId`
A collection built without `libraryEntryId` sets the FK to NULL on the next save. Every client payload and every PUT/POST mapping must carry it.

## 8. Untyped buttons and nested forms
`<button>` without `type` submits `CharacterForm`'s `<form>` and fires a silent PUT. Always `type="button"`. Don't nest `<form>` elements; dialogs with their own form must render outside the main form.

## 9. `isNew`
`characterId === 'new'` or `isNew === true`: no API calls, local state only, one POST at the end.
```ts
if (isNew) { setActions([...actions, localAction]); return; }
await fetch(...);
```

## 10. Hooks
- `useLibrary` once per component. Not in `.map()`, loops or conditions. Load, then `filter`.
- Modals: `if (!isOpen) return null;` after all hooks.

## 11. `.sort()` mutates
```ts
const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
```

## 12. Sync effects and stable dependencies
Use primitive keys: `join('|')` for string arrays, `map((p) => p.skillName).join('|')` for object arrays. See `03-state-and-sync.md`.

## 13. Attribute display names are not keys
Existing code looks up attributes by German name (`'Konstitution'`, default `'Stärke'`) and by `attr.name` in the ASI sync. Renaming an attribute silently breaks these. Don't add new name-based lookups; if unavoidable, keep them in one helper.

## 14. Cascade
New relation to `Character` needs `onDelete: Cascade`, otherwise `DELETE /api/characters/[id]` fails. The DELETE handler also lists some deletes manually, but not all; the schema cascade is what protects you.

## 15. Seeds are idempotent
`upsert` on `type_category_name`, never `create` (a second `prisma db seed` would fail).

## 16. Toast vs error state
Info ("Ritual gewirkt", "Level-Up") goes to a toast. Failures ("Speichern fehlgeschlagen") go to `setError(...)`, the form error state.

## 17. No Prisma in client code
`'use client'` files never import `@/lib/prisma`.

## 18. React keys
Stable `item.id`, not the index, in editable lists.

## 19. Temp IDs
Locally created rows have temp IDs (`temp-...`, `skill-<ts>`). Never send them to the server as real IDs. Server routes treat `temp-` IDs as "create".