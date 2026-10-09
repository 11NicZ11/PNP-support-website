# 01-code-style.md
TypeScript
`strict`. No `any` except at JSON boundaries, with a comment saying why.
`interface` for object shapes, `type` for unions.
Import existing types from `src/types/`. Never redeclare them in components.
No `@ts-ignore` / `@ts-expect-error`.
React / Next.js
Client components start with `'use client'`. API routes never do.
No `useEffect` to derive state: use `useMemo` or compute in render.
`useCallback` only for props to memoized children or dependency lists.
No direct `fetch` in components when a hook exists (`useLibrary`, `useActions`, `useSpells`, `useEquipment`, `useInventory`).
Never import `@/lib/prisma` in client code.
Lists: `key={item.id}`, never the index.
No `console.log` in committed code. `console.error` only together with user-visible error handling.
No new npm packages.
Falsy values
`||` turns valid `0` and `''` into the fallback. Use `??` or an explicit check.
```ts
// ❌ 0 becomes 2
shieldBonus: parseInt(v) || 2
// ✅
const n = parseInt(v);
shieldBonus: Number.isNaN(n) ? 2 : n
```
API routes
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
    return handleApiError(error, 'Fehler beim ...');
  }
}
```
Scope every query on child data by `characterId`: `findFirst({ where: { id, characterId } })`. Never `findUnique`/`update`/`delete` by `id` alone on child data. Use `updateMany`/`deleteMany` with `characterId`, then `findFirst` to confirm (404 if missing).
Status codes: 201 create, 400 validation, 403 protected seed, 404 not found, 409 name collision, 500 error.
Validate presence with `=== undefined` / `typeof`, not truthiness, whenever `''` or `0` is a valid value.
PUT scalars: pass `undefined` through when the field is absent. Never `x || ''` (wipes the stored value on partial payloads).
JSON helpers: `asJsonArray`, `asJsonObject` from `@/lib/api/helpers`; `parseJsonArray`, `parseJsonObject` from `@/lib/utils`. Use them at every API boundary.
Transactions that rebuild many rows: pass `{ timeout: 20000 }`.
Prisma
New fields need `@default(...)`. Never break existing migrations.
New tables only when the approved task says so. Structured data goes relational; never add JSON columns.
Relation to `Character`: `onDelete: Cascade`. Relation to `LibraryEntry`: `onDelete: SetNull`, never Cascade.
Index only fields that are filtered (`characterId`, `type`, `category`, `isSeed`, FKs).
Schema changes: `npx prisma migrate dev --name <name>`. Never `db push`, never `migrate reset` without explicit permission.
Styling (Tailwind, dark theme)
Background `bg-gray-900/50`, `bg-gray-800/30`. Border `border-purple-500/20`, `border-gray-700/50`. Accent `bg-purple-600 hover:bg-purple-700`. Secondary text `text-gray-400`. Success/error/warning `text-green-400` / `text-red-400` / `text-yellow-400`.
No new colors. No inline styles except dynamic values (bar width, percentages).
Buttons and forms
Every `<button>` gets `type="button"`, except the intended submit button of a form. The whole character editor lives inside one `<form>` (`CharacterForm`); an untyped button triggers a silent save.
Never nest `<form>` elements. A dialog with its own `<form>` must not render inside another form (React bubbles `onSubmit` through the component tree).
Modals: inline, no portal, `if (!isOpen) return null;` after all hooks.
```tsx
<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
  <div className="bg-gray-800 rounded-xl max-w-lg w-full border border-purple-500/30">
    {/* header with ✕ button, body, footer with buttons */}
  </div>
</div>
```