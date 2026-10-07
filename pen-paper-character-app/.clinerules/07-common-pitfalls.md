# Häufige Fallen in diesem Projekt

## 1. `params` in Next.js 15 ist ein Promise

Alle API-Routen: `params` MUSS awaited werden.

```ts
// ❌
export async function GET(req, { params }: { params: { id: string } }) {
  const { id } = params; // ERROR in Next.js 15
}

// ✅
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
}
```

## 2. Ownership-Check vergessen

Jede Query auf User-Daten MUSS `characterId` filtern.

```ts
// ❌ — jeder könnte fremde Daten ändern
await prisma.action.update({ where: { id: actionId }, data });

// ✅
await prisma.action.updateMany({
  where: { id: actionId, characterId: id },
  data,
});
```

Bei `updateMany`/`deleteMany` danach prüfen:

```ts
const updated = await prisma.action.findFirst({
  where: { id: actionId, characterId: id },
});
if (!updated) return apiError('Nicht gefunden', 404);
```

## 3. JSON-Felder doppelt parsen

DB speichert JSON als **String**. Beim Lesen parsen, beim Schreiben
stringifizieren.

```ts
// ❌ — doppelt geparst
const traits = JSON.parse(JSON.parse(race.traits));

// ✅ — Helper nutzen
import { parseJsonArray, asJsonArray } from '@/lib/utils';
const traits = parseJsonArray(race.traits);
// Schreiben:
traits: asJsonArray(raceData.traits);
```

`asJsonArray`/`asJsonObject` sind idempotent — sie geben Strings
unverändert zurück. Nutze sie **immer** an API-Grenzen.

## 4. `.sort()` mutiert Hook-State

```ts
// ❌ — mutiert das Array aus useLibrary
const suggestions = libraryEntries.sort((a, b) => a.name.localeCompare(b.name));

// ✅
const suggestions = [...libraryEntries].sort((a, b) =>
  a.name.localeCompare(b.name)
);
```

## 5. Sync-Loops durch falsche Dependencies

In `useCharacterSyncs` werden Effekte über Props gesteuert. Nutze
**stabile Werte** in der Dependency-Liste:

```ts
// ❌ — neue Array-Referenz bei jedem Render
}, [raceData.skillProficiencies]);

// ✅
}, [raceData.skillProficiencies.join('|')]);
```

Oder bei Objekten: nur die Felder, die sich wirklich ändern sollen.

## 6. `isNew` vergessen

Bei `characterId === 'new'` oder `isNew === true`:

- **KEIN** `fetch` an `/api/characters/...`
- State nur lokal ändern
- Am Ende `POST /api/characters` mit komplettem Payload

```ts
// ❌
const res = await fetch(`/api/characters/${characterId}/actions`, ...);
// characterId === 'new' → 404

// ✅
if (isNew) {
  setActions([...actions, localAction]);
  return;
}
await fetch(...);
```

## 7. `useLibrary` in Schleife

`useLibrary` ist ein React-Hook — einmal pro Komponente, nicht in
`.map()` oder Bedingungen.

```ts
// ❌
{types.map(t => {
  const { entries } = useLibrary({ type: t }); // Hook-Regel verletzt!
})}

// ✅ — ein Hook, dann filtern
const { entries } = useLibrary({ type: 'action' });
const filtered = entries.filter(e => e.category === 'bonus_action');
```

## 8. Type-Mismatch bei `Prisma.JsonValue`

Prisma gibt JSON-Felder als `Prisma.JsonValue` zurück. Beim Mapping
immer explizit casten:

```ts
// ✅
const data = parseJsonObject(entry.data) as { attributeName?: string };
```

## 9. Cascade-Delete vergessen

Neue Relationen zu `Character` brauchen `onDelete: Cascade`, sonst
schlägt `DELETE /api/characters/[id]` fehl.

```prisma
character Character @relation(fields: [characterId], references: [id], onDelete: Cascade)
```

## 10. Seed-Idempotenz

Jeder Seed nutzt `upsert`, NIE `create`.

```ts
// ❌ — schlägt bei zweitem `prisma db seed` fehl
await prisma.libraryEntry.create({ data: { /* ... */ } });

// ✅
await prisma.libraryEntry.upsert({
  where: { type_category_name: { type, category, name } },
  update: { description, data, isSeed: true },
  create: {
    type,
    category,
    name,
    description,
    data,
    isSeed: true,
    isPublic: true,
  },
});
```

## 11. `DELETE /api/characters/[id]` — Reihenfolge

Die DELETE-Route löscht Collections **manuell** vor dem Character.
Neue Collections MÜSSEN dort ergänzt werden.

Prüfe `src/app/api/characters/[id]/route.ts` → `DELETE`-Handler.

## 12. Toast vs. Error-State

- **User-Info** ("Ritual gewirkt", "Level-Up") → Toast.
- **Fehler** ("Speichern fehlgeschlagen") → `setError(...)` im State,
  NICHT Toast. Der Error-State ist für Form-Fehler reserviert.

## 13. Keine direkte DB-Query in Client-Code

Client-Komponenten (`'use client'`) dürfen `@/lib/prisma` **NICHT**
importieren. Nur API-Routen (Server-Code) nutzen Prisma.

## 14. `undefined` vs `null` bei Update

Prisma ignoriert `undefined` beim Update, `null` setzt das Feld auf
NULL. Bei partiellen Updates also genau hinschauen.

```ts
// ❌ — setzt description auf NULL, wenn body.description fehlt
await prisma.equipment.update({ data: { description: body.description } });

// ✅ — behält alten Wert, wenn Feld nicht mitgeschickt
const data: any = {};
if (body.description !== undefined) data.description = body.description;
await prisma.equipment.update({ data });
```

## 15. React-Key mit `index`

In Listen mit editierbaren Items: **stabile ID als Key**, nicht Index.

```tsx
// ❌ — nach Löschen eines Items springt State
{items.map((item, i) => <Row key={i} item={item} />)}

// ✅
{items.map(item => <Row key={item.id} item={item} />)}
```