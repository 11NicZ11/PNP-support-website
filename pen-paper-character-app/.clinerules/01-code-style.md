# Code-Style

## TypeScript

- `strict: true`. Kein `any` außer an JSON-Grenzen (mit Kommentar).
- Bevorzuge `interface` für Objekt-Formen, `type` für Unions.
- Nutze existierende Typen aus `src/types/`, dupliziere sie nicht.

## React / Next.js

- **Client-Komponenten** brauchen `'use client'` ganz oben.
- **API-Routen** sind Server-Code: kein `'use client'`.
- **Kein `useEffect`** zum Ableiten von State — nutze `useMemo` oder
  berechne direkt im Render.
- **useCallback** nur wenn die Funktion als Prop an memoisierte Kinder
  geht oder in einer Dependency-Liste steht.
- **Kein direkter `fetch`** in Komponenten, wenn es einen Hook gibt
  (`useLibrary`, `useActions`, `useSpells`, `useEquipment`, `useInventory`).

## API-Routen (Next.js App Router)

Jeder Handler folgt diesem Muster:

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

- **NIE `findUnique`** auf Relationen, die dem User gehören → immer
  `findFirst` mit `where: { id, characterId }`.
- **NIE `update`/`delete`** mit nur `id` → immer `updateMany`/`deleteMany`
  mit `characterId`-Filter (Ownership-Check).
- **HTTP-Status**: 201 bei Create, 400 bei Validation, 403 bei
  System-Schutz, 404 bei nicht gefunden.

## Prisma

- **Keine neuen Tabellen** ohne zwingenden Grund. Komplexe Strukturen als
  JSON-String.
- **Keine Migration zerstören**: neue Felder mit `@default(...)`.
- **Indices nur auf Felder, die wirklich gefiltert werden** (`characterId`,
  `type`, `category`, `isSeed`).
- **Cascade-Delete**: `onDelete: Cascade` für alle Kind-Relationen.
- `@@unique([characterId, name])` für 1:1-Charakter-Felder.

## Styling (Tailwind)

- Dark-Theme. Farben aus dem bestehenden Schema:
  - Hintergrund: `bg-gray-900/50`, `bg-gray-800/30`
  - Border: `border-purple-500/20`, `border-gray-700/50`
  - Akzent: `bg-purple-600 hover:bg-purple-700`
  - Text sekundär: `text-gray-400`
- **Keine Inline-Styles** außer bei dynamischen Werten (z. B. Balkenbreite).
- **Keine neuen Farben** — halte dich an die bestehenden.