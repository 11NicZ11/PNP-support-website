# ❌ VERBOTEN

## Keine neuen Pakete

- **KEINE** `npm install` / `pnpm add` / `yarn add`.
- **KEIN** `package.json` editieren ohne explizite Anweisung.
- Wenn du eine Lib brauchst: **frag nach** oder **bau es selbst** mit
  Bordmitteln (`fetch`, `Intl`, `Date`, `Math`, `crypto.randomUUID`).

Erlaubt sind nur bereits installierte Pakete (siehe `package.json`):
Next.js, React, Prisma, Tailwind, TypeScript.

## Keine DB-Migration ohne Anweisung

- Neue Felder in `schema.prisma` erlaubt (mit `@default`).
- **KEINE** neuen Tabellen, außer die Aufgabe verlangt es explizit.
- **KEINE** `prisma migrate reset` — nutze `prisma db push` oder
  `prisma migrate dev --name <beschreibung>`.

## Keine Refactors "nebenbei"

- Wenn du Datei X anpasst, fasse nur X an (und direkte Imports).
- Keine "Aufräum-Aktionen" in unrelated Dateien.
- Keine Umbenennung bestehender Exports/Typen.
- Keine Reformatierung des gesamten Files, wenn nur 3 Zeilen geändert
  werden sollen.

## Kein Big-Bang

- Eine Aufgabe = ein logischer Change. Nicht 5 Features auf einmal.
- Bei Unklarheit: **frag**, statt zu raten.
- Wenn eine Aufgabe zu groß ist: **schlage eine Aufteilung vor** und
  warte auf Bestätigung.

## Keine UI-Sprachwechsel

- Deutsche UI-Texte. Keine Übersetzung ins Englische.
- Emojis in Buttons/Labels beibehalten.

## Kein `window.location.reload()`

- Nach API-Calls State updaten, nicht die Seite neu laden.
- Bestehende Ausnahme: `InventoryContainer.tsx handleMoveItem` — darf
  gerne in einem separaten Task entfernt werden.

## Keine doppelten Typen

- Wenn ein Typ in `src/types/` existiert, importiere ihn.
- Keine `interface Action { ... }` in Komponenten-Dateien.

## Kein `any` ohne Kommentar

```ts
// ❌
function parse(data: any) { /* ... */ }

// ✅
// data kommt als JSON-String von der DB (Prisma-Feld `components`)
function parse(data: any) { /* ... */ }
```

## Keine erfundenen APIs

- Bevor du eine Route aufrufst: **prüfe, ob sie existiert**.
- Bevor du einen Hook nutzt: **prüfe, ob er existiert**.
- Bevor du einen Typ importierst: **prüfe den Pfad**.

## Kein Silent-Fail

- API-Fehler **immer** an den User kommunizieren (State `error` setzen).
- `try/catch` ohne `setError(...)` oder `throw` ist verboten.

## Keine Änderungen an `.clinerules/`

- **NIE** eine Datei in `.clinerules/` ändern, anlegen oder löschen.
- **NIE** den Inhalt kopieren, umformulieren oder „verbessern".
- Wenn dir eine Regel unklar erscheint: **frag**, statt sie eigenmächtig
  zu ändern.
- Wenn du der Meinung bist, eine Regel sollte ergänzt werden: schlage es
  im Bericht vor, aber warte auf explizite Freigabe durch den User.
- Ausnahme: Der User sagt explizit „ändere Regel X".

## Kein Library-Eintrag ohne Rückfrage global ändern

- Wenn ein Char-Eintrag mit `libraryEntryId` umbenannt wird, MUSS der
  Rückfrage-Dialog kommen (siehe `10-library-reference.md`).
- **NIE** direkt `PUT /api/library/[entryId]` aufrufen, ohne dass der
  User "Global" gewählt hat.
- **NIE** `isSeed: true`-Einträge ändern (Backend blockt das bereits mit 403).

## Kein `libraryEntryId` mit `onDelete: Cascade`

- FK zu `LibraryEntry` IMMER mit `onDelete: SetNull`.
- Cascade würde Char-Daten löschen, wenn ein Library-Eintrag entfernt wird.