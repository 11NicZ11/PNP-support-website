# Projekt: Pen & Paper Character Manager

Next.js (App Router) + TypeScript + Prisma + SQLite. Vollständig freie
Charakterverwaltung ohne Regelwerk-Bindung. Zielgruppe: D&D, Pathfinder,
DSA, Homebrew.

## Grundregeln

- **Sprache UI:** Deutsch. **Sprache Code-Kommentare:** Deutsch.
- **Sprache Code-Identifier:** Englisch (camelCase / PascalCase).
- **Kein `any`** ohne Kommentar warum.
- **Kein `console.log`** in committed Code — nur `console.error` bei echten Fehlern.
- **Keine neuen npm-Pakete** (siehe `06-do-not.md`).
- **Bestehende Patterns kopieren**, nicht neu erfinden. Lies immer erst 2–3
  vergleichbare Dateien, bevor du etwas Neues baust.

## Verzeichnis-Layout

- `src/app/` — Routen & API-Handler (`app/api/.../route.ts`)
- `src/components/character/` — Charakter-UI (Editoren, Views, Modals, Hooks)
- `src/lib/` — Utils, Dice, Units, Prisma-Client
- `src/types/` — TypeScript-Typen (shared)
- `src/hooks/` — React-Hooks
- `prisma/schema.prisma` — Datenmodell
- `prisma/seed.ts` — Seeds für "Bibliothek von Babylon"

## Wichtige Konzepte

### Bibliothek von Babylon (BvB) — Single Source of Truth

**Kernprinzip:** Die Bibliothek ist die zentrale Sammlung aller
wiederverwendbaren Bausteine. Charaktere **referenzieren** die
Bibliothek über `libraryEntryId` — sie kopieren nicht blind.

- Jeder Charakter-Eintrag (Skill, Action, Equipment, ...) hat ein
  `libraryEntryId String?` FK auf `LibraryEntry`.
- Der Charakter behält **lokale Snapshot-Felder** (Name, Description,
  typ-spezifische Werte), damit Bibliothek-Änderungen nicht
  automatisch propagieren.
- Wenn der User einen Charakter-Eintrag mit `libraryEntryId` ändert,
  wird gefragt: "Nur hier / Global / Neuer Eintrag".
- Details: `10-library-reference.md`.

### Character-Relations

`Character` hat viele 1-n-Relationen. Komplexe verschachtelte Daten
(Traits, Attacks, Abilities) liegen als JSON-String in einer Spalte —
**nicht** als eigene Tabelle.

### Unit-System

DB speichert IMMER metrisch (kg, m; ft bleibt ft). Umrechnung nur in
`src/lib/units.ts` bei Anzeige/Eingabe.

### Defenses

Zentral in `Defense`-Tabelle mit `source` ∈
{class, race, manual, equipment}. Equipment-Defenses werden **live im
Client** aggregiert, NICHT in der DB gespeichert.

### Seeds vs. User-Daten

- **System-Seeds (`isSeed: true`):** Grundwissen (Attribute, Damage-Types,
  Conditions). Geschützt vor Edit/Delete.
- **Standard-Seeds (`isSeed: true`, aber Nutzwert):** Skills wie
  "Wahrnehmung", Sprachen. Geschützt, aber als Vorschlag.
- **User-Einträge (`isSeed: false`):** Alles, was der User selbst
  anlegt. Editier-/löschbar.
- **Nur das absolute Minimum seeden.** Lieber zu wenig als zu viel.