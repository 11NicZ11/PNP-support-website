# 06-do-not.md

## Scope
- Do only what the current prompt authorizes. Report anything else as a one-liner (`file:line` + sentence), never fix it on the side.
- One task = one logical change. If it's too big, propose a split and wait for confirmation.
- Touch only the files the task needs (plus direct imports). No cleanup, reformatting or renaming in unrelated files.
- Don't rename or remove existing exports, types or endpoints.
- Unclear: ask. Don't guess.

## Packages and tooling
- No `npm install` / `pnpm add` / `yarn add`. Don't edit `package.json` unless told to. Available: Next.js, React, Prisma, Tailwind, TypeScript.
- Need a library? Ask, or build it with built-ins (`fetch`, `Intl`, `Date`, `Math`, `crypto.randomUUID`).
- Schema changes only via `npx prisma migrate dev --name <name>`.
- Never `prisma db push`. Never `prisma migrate reset` without explicit permission.
- No new tables unless the approved task says so. Never add JSON columns.

## Code
- No silent failures. `fetch` doesn't throw on 4xx/5xx: check `res.ok`. Every `catch` either calls `setError(...)` or rethrows. `console.error` alone is not handling.
- No `window.location.reload()` after API calls. Update state instead. (Existing exception: `InventoryContainer.tsx handleMoveItem`, remove only in its own task.)
- No `fetch('/api/characters/new/...')`. Branch on `isNew`.
- No `any` without a comment. No `@ts-ignore`.
- No duplicated types. Import from `src/types/`.
- No invented APIs. Before calling a route, hook or type: confirm it exists and check its path and signature.
- No untyped `<button>` and no nested `<form>` (see `01-code-style.md`).
- No `x || ''` / `x || 0` where `''` or `0` is a valid value.
- No translating UI texts. German UI, emojis stay.

## Library
- Never rename or modify a library entry from a character edit without the rename dialog and the user choosing "Global".
- Never call `PUT /api/library/[entryId]` on `seedKind='system'` entries (backend returns 403).
- Never `libraryEntryId` with `onDelete: Cascade`. Always `SetNull`.
- Never delete library entries when deleting a character.
- Never set the FK without filling the snapshot fields.

## Rules and docs
- Never create, change or delete files in `.clinerules/`, and never rephrase or "improve" them. If a rule looks wrong or missing, say so in your report and wait for approval.
- Exception: the user explicitly says "change rule X".