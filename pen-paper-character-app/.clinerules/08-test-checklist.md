# Test-Checkliste — vor jedem „Fertig"

Bevor du einen Task als abgeschlossen meldest, gehst du diese Liste
durch. Was nicht zutrifft, überspringst du. Was zutrifft und **nicht**
passt, behebst du **bevor** du meldest.

## 1. Build & Types

- [ ] `npx tsc --noEmit` läuft ohne Fehler durch.
- [ ] `npm run build` (oder `next build`) bricht nicht ab.
- [ ] Keine neuen `any` ohne Kommentar.
- [ ] Keine neuen `// @ts-ignore` / `// @ts-expect-error`.
- [ ] Alle neuen Imports lösen auf.

## 2. API-Routen (falls neue/geänderte Route)

- [ ] `params` ist als `Promise<{...}>` getypt und wird `await`ed.
- [ ] Jede Query filtert nach `characterId` (Ownership).
- [ ] Bei `updateMany`/`deleteMany` folgt ein `findFirst`-Check.
- [ ] HTTP-Status korrekt: 201/400/403/404/500.
- [ ] `try/catch` mit `handleApiError`.
- [ ] JSON-Felder mit `asJsonArray`/`parseJsonArray`.

## 3. Library-Integration

- [ ] Neuer Typ taucht in `TYPE_TABS` (`LibraryPage.tsx`) auf.
- [ ] `TYPE_LABELS` (`LibraryEntryCard.tsx`) kennt den neuen Typ.
- [ ] Seed nutzt `upsert`.
- [ ] `isSeed: true` gesetzt.
- [ ] Editor lädt über `useLibrary({ type, category })`.

## 4. Library-Reference (neu!)

- [ ] Wenn FK nötig: `libraryEntryId String?` im Schema.
- [ ] FK hat `onDelete: SetNull`.
- [ ] Beim Erstellen wird `libraryEntryId` aus Library-Template gesetzt.
- [ ] Beim Umbenennen mit FK: Rückfrage-Dialog erscheint.
- [ ] Bei `isSeed: true`: "Global"-Option deaktiviert.
- [ ] `createWithMode` wird in `useLibrary` bereitgestellt.
- [ ] `POST /api/library` akzeptiert `mode`-Parameter.
- [ ] Response enthält `status`-Feld.
- [ ] Snapshot-Felder werden mit-gefüllt.

## 5. „Neuer Charakter"-Flow

- [ ] Kein `fetch` an `/api/characters/new/...`.
- [ ] Kind-Daten bleiben lokal im State.
- [ ] `libraryEntryId` in jedem Kind-Eintrag gesetzt (falls Template).
- [ ] Ein `POST /api/characters` mit komplettem Payload.

## 6. „Bestehender Charakter"-Flow

- [ ] `PUT /api/characters/[id]` mit nur geänderten Feldern.
- [ ] Health-Bar-Aktion löscht keine Attribute/Skills.
- [ ] Rest-Aktion aktualisiert HP, Ressourcen, Slots, HitDice.

## 7. Auto-Sync-Effekte

- [ ] Rasse-Fertigkeit → Skill `isProficient: true`.
- [ ] Entfernen der Quelle → Sync setzt zurück.
- [ ] Rassen-Bonus-AC → `combatValueSources`.
- [ ] Kein Sync-Loop in der Console.

## 8. Library-Page (`/library`)

- [ ] Alle Tabs funktionieren.
- [ ] Suche filtert nach Name + Beschreibung.
- [ ] `isSeed: true`: kein Edit/Delete.
- [ ] `isSeed: false`: Edit/Delete funktioniert.

## 9. UI-Patterns

- [ ] Bestehende Farbklassen.
- [ ] Deutsche UI-Texte.
- [ ] Dark-Theme.
- [ ] Modals: `fixed inset-0 bg-black/70 flex items-center justify-center z-50`.
- [ ] `key={item.id}`, nicht `key={index}`.

## 10. State-Hooks

- [ ] Neuer State in `useCharacterState`.
- [ ] Neuer Effekt in `useCharacterSyncs` / `useCharacterDataLoader`.
- [ ] Dependency-Listen mit stabilen Werten.
- [ ] Kein `useEffect` zum Ableiten von State.

## 11. Prisma-Schema

- [ ] Neue Felder mit `@default(...)`.
- [ ] Neue FK zu Character: `onDelete: Cascade`.
- [ ] FK zu Library: `onDelete: SetNull` (nicht Cascade).
- [ ] Keine neuen Tabellen ohne Not.

## 12. Seeds

- [ ] `prisma/seed.ts` idempotent.
- [ ] Neue Quellen in `src/lib/defaults/*.ts`.
- [ ] Nur 🌱/✅-Logs.

## 13. Anti-Regression

- [ ] Kein Type umbenannt.
- [ ] Kein Export entfernt.
- [ ] Kein Endpunkt gelöscht.
- [ ] Keine unrelated Datei aufgeräumt.
- [ ] Keine neuen npm-Pakete.
- [ ] Kein `prisma migrate reset`.

## 14. Selbst-Reflexion

1. Was genau habe ich geändert? (Dateien auflisten)
2. Was könnte kaputtgehen?
3. Alle zutreffenden Punkte oben geprüft?
4. Unsicher → gefragt oder geraten?

## 15. Melde-Format

```
## Zusammenfassung

Geändert:
- <Datei>: <was>

Geprüft:
- ✅ TypeScript-Build
- ✅ Neuer-Charakter-Flow
- ⚠️ <was nicht getestet>