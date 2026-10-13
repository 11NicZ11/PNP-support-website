# Pen & Paper Character Manager

Web-App zur Verwaltung von Pen-&-Paper-Charakteren. Keine Bindung an ein
Regelwerk — die App stellt Bausteine (Fertigkeiten, Zauber, Ausrüstung,
Klassen, Rassen) bereit, aus denen Nutzer ihre Charaktere frei
zusammensetzen.

## Tech-Stack

| Ebene | Technologie |
|---|---|
| Framework | Next.js 16 (App Router) |
| Sprache | TypeScript (strict) |
| Datenbank | SQLite via Prisma |
| Styling | Tailwind CSS, Dark Theme |
| Tests | Vitest |
| UI-Sprache | Deutsch |
| Code-Identifier | Englisch (camelCase / PascalCase) |

Keine externen State-Management-Bibliotheken — der State lebt in einer
Hook-Kette (siehe unten). Keine UI-Komponentenbibliothek — alle
Komponenten sind handgeschrieben mit Tailwind.

## Quick Start

```bash
npm install
npx prisma db seed      # Bibliothek mit Standard-Einträgen befüllen
npm run dev             # http://localhost:3000
```

Weitere Befehle:

```bash
npm run typecheck       # tsc --noEmit
npm run test            # Vitest
npm run test:coverage   # mit Coverage-Report
```

## Kernidee — Bibliothek von Babylon

Jeder wiederverwendbare Baustein lebt in einer zentralen Tabelle
`LibraryEntry`. Charakter-Einträge (Skill, Zauber, Waffe, …) referenzieren
einen Bibliothekseintrag über einen Fremdschlüssel und behalten zusätzlich
einen lokalen Snapshot.

```
LibraryEntry (Wahrheit)
   ▲
   │ libraryEntryId (FK, onDelete: SetNull)
   │
Skill / SavingThrow / Proficiency / Defense / StatusEffect /
Action / Spell / Equipment / InventoryItem / InventoryContainer /
AlternateForm / Companion
   ▲
   │ characterId (FK, onDelete: Cascade)
   │
Character
```

**Warum Snapshot + FK?**

- **Kein Cascade**: Wird ein Bibliothekseintrag gelöscht, behält der
  Charakter seinen Wert (FK wird auf NULL gesetzt).
- **Keine stille Propagation**: Änderungen an der Bibliothek wirken sich
  nicht automatisch auf Charaktere aus.
- **Rückfrage-UI möglich**: Beim Umbenennen eines Charaktereintrags mit
  FK kann die App fragen: „Nur hier / Global / Neuer Eintrag /
  Bestehenden nutzen".

`LibraryEntry` hat einen `seedKind`:

| seedKind | Bedeutung |
|---|---|
| `system` | unantastbar, vom Seed geschützt (z. B. Attribute, Damage-Types) |
| `template` | editierbar mit Warnung (z. B. Skills, Actions) |
| `null` | freie Nutzer-Einträge |

## Verzeichnisstruktur

```
pen-paper-character-app/
├── AGENTS.md               Cross-Agent-Regeln, absolute Tabus
├── .clinerules/            Detaillierte Regeln (lokal, gitignored)
├── skills/                 Claude.ai Skills (z. B. codebase-analysis)
├── prisma/
│   ├── schema.prisma       Datenmodell
│   ├── seed.ts             Erstbefüllung der Bibliothek
│   └── dev.db              SQLite-Datenbank (gitignored)
├── src/
│   ├── app/
│   │   ├── api/            API-Routen (Server-Code)
│   │   ├── characters/     Charakter-Seiten
│   │   ├── library/        Bibliothek-Seite
│   │   └── dice/           Würfel-Seite
│   ├── components/
│   │   ├── character/      Charakter-Editor, Tabs, Modale, Views
│   │   ├── library/        Bibliothek-UI
│   │   ├── dice/           Würfel-UI
│   │   └── ui/             Wiederverwendbare UI-Bausteine
│   ├── hooks/              Wiederverwendbare Hooks
│   ├── lib/
│   │   ├── api/            API-Helpers (Server)
│   │   ├── defaults/       Seed-Quellen (nur vom Seed importiert)
│   │   ├── enums/          Runtime-Enums (UI-Kategorien)
│   │   ├── dice.ts         Würfel-Logik
│   │   ├── units.ts        Einheiten-Umrechnung
│   │   └── utils.ts        JSON-/Type-Helpers
│   ├── contexts/           React-Contexts (Toast, DiceLog)
│   └── types/              Shared TypeScript-Typen
└── package.json
```

## State-Management — Hook-Kette

Der Charakter-Editor-Zustand wird über sechs Hooks verwaltet, die in
`CharacterForm.tsx` in dieser Reihenfolge aufgerufen werden:

1. **`useCharacterState`** — hält alle Felder als `useState`.
2. **`useCharacterMemos`** — abgeleitete Werte via `useMemo`
   (`totalHp`, `proficiencyBonus`, `aggregatedDefenses`, `activeForm`).
3. **`useCharacterDataLoader`** — lädt Server-Daten (bestehender
   Charakter) oder Library-Templates (neuer Charakter).
4. **`useCharacterSyncs`** — Auto-Sync-Effekte (Rasse → Skills,
   Hintergrund → Sprachen, ASI-Boni → Attribute).
5. **`useCharacterHandlers`** — Event-Handler mit API-Aufrufen
   (übersprungen bei `isNew`).
6. **`useCharacterSubmit`** — sammelt State, validiert, sendet POST/PUT.

Alle sechs arbeiten auf demselben State-Objekt. Reihenfolge ist nicht
zufällig — Loader vor Syncs vor Handlers.

**Bei `isNew === true`:** keine API-Calls, State lebt lokal, am Ende ein
einziger POST mit komplettem Payload.

**Bei bestehendem Charakter:** einzelne Updates (HP, Rests, Exhaustion)
senden partielle Payloads an `PUT /api/characters/:id`. Partielle
Payloads bauen nur die mitgeschickten Collections neu auf — fehlende
Collections bleiben unangetastet.

## API-Patterns

Jede Route folgt demselben Muster:

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

Regeln:

- `params` immer `await`en.
- Jede Query auf Kind-Daten filtert nach `characterId`.
- `updateMany` / `deleteMany` mit `characterId`-Filter, danach
  `findFirst` zur Bestätigung.
- Status-Codes: 201 Create, 400 Validation, 403 geschützter Seed,
  404 nicht gefunden, 409 Kollision, 500 Fehler.

`POST /api/library` unterstützt drei Modi:

| mode | Verhalten |
|---|---|
| `reuse` (Default) | bei Duplikat bestehenden Eintrag zurückgeben |
| `update` | bestehenden aktualisieren (403 bei `system`, 409 bei Kollision) |
| `force-new` | immer neu, Suffix `(2)`, `(3)`, … |

Die Antwort enthält immer `status: 'created' | 'reused' | 'updated'`.

## Einheiten-System

DB speichert immer metrisch (kg, m). Ausnahme: Distanzen bleiben in ft
(D&D-Konvention).

Umrechnung ausschließlich in `src/lib/units.ts` bei Anzeige und Eingabe.
Zum Speichern `parseWeightInput` / `parseDistanceInput` verwenden — nie
rohes `parseFloat`.

## Konventionen

- TypeScript `strict`. Kein `any` außer an JSON-Grenzen (mit Kommentar).
- `interface` für Objekt-Formen, `type` für Unions.
- Bestehende Typen aus `src/types/` importieren, nicht duplizieren.
- Client-Komponenten brauchen `'use client'` ganz oben.
- Kein direkter `fetch` in Komponenten, wenn ein Hook existiert.
- `useEffect` nicht zum Ableiten von State — `useMemo` oder direkte
  Berechnung.
- Keine neuen npm-Pakete ohne explizite Freigabe.
- Jeder `<button>` bekommt `type="button"`, außer dem Submit-Button eines
  Formulars.
- Modale inline rendern (kein Portal), `if (!isOpen) return null;` nach
  allen Hooks.

Die vollständigen Regeln für Agents stehen in `AGENTS.md`.
Orientierung: `PROJECT_MAP.md`.

## Entwicklung

**Branches:** `dev` (Arbeitsbranch, Default), `main` (geschützt, nur
stabile Merges).

**Datenbank-Schema ändern:**

```bash
npx prisma migrate dev --name <beschreibung>
```

Nie `prisma db push`. Nie `prisma migrate reset` ohne explizite
Freigabe.

**Neue Library-Einträge:** in `src/lib/defaults/<type>.ts` ergänzen und
`prisma/seed.ts` erweitern. Seed ist idempotent (überall `upsert`).

## Wo finde ich was

| Thema | Ort |
|---|---|
| Cross-Agent-Regeln | `AGENTS.md` |
| Cline-spezifische Regeln | `.clinerules/` (lokal, gitignored, nur für Cline) |
| Datenmodell | `prisma/schema.prisma` |
| API-Routen | `src/app/api/` |
| Wiederverwendbare Logik | `src/lib/` |
| Shared Types | `src/types/` |
| Claude-Analyse-Skill | `skills/codebase-analysis/` |