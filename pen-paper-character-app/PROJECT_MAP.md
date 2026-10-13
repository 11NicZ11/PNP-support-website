# PROJECT_MAP.md

Einstiegspunkt für Agents vor jeder Analyse oder jedem Refactor.
Erklärt **Zweck und Struktur**, nicht **mechanische Details** — die
kommen aus `codescope` (`stats`, `context`, `search_symbols`).

Regeln und Tabus: siehe `AGENTS.md`.
Diese Karte dupliziert sie nicht.

---

## Was die App ist

Web-App zur Verwaltung von Pen-&-Paper-Charakteren. Nutzer bauen
Charaktere aus wiederverwendbaren Bausteinen (Skills, Zauber, Ausrüstung,
Klassen, Rassen) frei zusammen. Keine Regelwerk-Bindung.

Bausteine leben zentral in der **Bibliothek von Babylon**
(`LibraryEntry`). Charakter-Einträge referenzieren einen Library-Eintrag
via FK und halten einen lokalen Snapshot.

Detail: `README.md`, `AGENTS.md`, `.clinerules/02-library-of-babylon.md`.

---

## Top-Level-Struktur

```
src/
├── app/          Next.js Routen (Pages + API)
│   └── api/      36 API-Routen, gruppiert nach Domäne
├── components/   UI-Komponenten (charakter-, library-, dice-, ui-)
├── contexts/     React-Contexts (Toast, DiceLog)
├── hooks/        Wiederverwendbare Hooks (useDice, useLibrary*)
├── lib/          Framework-freie Logik (dice, units, utils, enums, …)
└── types/        Shared TypeScript-Typen (18 Domänen-Dateien)
```

**Layer-Regel (seit Sprint 1D):** `src/types/*` importiert nichts aus
`src/components/*` oder `src/app/*`. Kein Zyklus.

---

## Datenfluss — Charakter-Editor (Kern)

Der Charakter-Editor ist der komplexeste Teil der App. Sechs Hooks in
`CharacterForm.tsx` teilen sich **ein** State-Objekt:

```
useCharacterState       Felder als useState (Fundament)
       ↓
useCharacterMemos       abgeleitete Werte (useMemo, kein Sync)
       ↓
useCharacterDataLoader  Server-Daten oder Library-Templates
       ↓
useCharacterSyncs       Auto-Sync (Rasse → Skills, Hintergrund → …)
       ↓
useCharacterHandlers    Event-Handler mit API-Calls (übersprungen bei isNew)
       ↓
useCharacterSubmit      Payload sammeln, validieren, POST/PUT
```

**Reihenfolge ist nicht zufällig.** Loader vor Syncs vor Handlers.

**Spezialfälle:**
- `isNew === true`: keine API-Calls, alles lokal, ein POST am Ende.
- Bestehender Charakter: partielle PUTs für HP/Rests/Exhaustion.
- **Partielle PUT-Semantik:** fehlende Collections bleiben unangetastet,
  gesendete Collections werden komplett neu aufgebaut (neue IDs).

Detail: `.clinerules/03-state-and-sync.md`.

---

## Kanonische Quellen (Single Source of Truth)

Wenn ein Wert, eine Regel oder eine Konstante an mehreren Stellen
gebraucht wird, gehört sie hierhin:

| Bereich | Kanonische Datei | Warum |
|---|---|---|
| Würfel-Logik | `src/lib/dice.ts` | Alle Rollen, Damage-Parsing, Healing |
| Einheiten | `src/lib/units.ts` | Weight + Distance, metric/imperial |
| JSON-Helper (client) | `src/lib/utils.ts` | `parseJsonArray`, `parseJsonObject`, `toInt` |
| JSON-Helper (server) | `src/lib/api/helpers.ts` | `asJsonArray`, `asJsonObject`, `apiError`, `apiSuccess` |
| Bibliotheks-Templates | `src/lib/defaults/*.ts` | Nur vom Seed importiert |
| Runtime-Enums | `src/lib/enums/*.ts` | UI-Kategorien (Equipment-Typen, Spell-Schools, …) |
| Charakter-Typen | `src/types/*.ts` | Nicht in Komponenten duplizieren |
| API-Fehler-Klassifizierung | `src/lib/api/errors.ts` | `ApiError` + Prisma-Code-Mapping |

---

## API-Routen — Gruppierung

Alle Routen folgen demselben Pattern: `try/catch`, `apiError`/`apiSuccess`,
Ownership-Check via `characterId`-Filter, `updateMany`/`deleteMany` +
`findFirst` für Bestätigung. Details: `.clinerules/01-code-style.md`.

**Gruppen:**

| Gruppe | Pfad | Zweck |
|---|---|---|
| Charaktere | `api/characters/` | CRUD + Kinder-Collections |
| Bibliothek | `api/library/` | Zentrale Bausteine + Usage-Count + `mode`-Parameter |
| Templates | `api/templates/` | Legacy-Alias für Library-Lookups |
| Status-Effekte | `api/status-effects/predefined/` | Legacy-Tabelle (Ablösung geplant) |

**Kinder-Collection-Routen** (unter `api/characters/[id]/`): `actions`,
`companions`, `defenses`, `equipment`, `forms`, `hit-dice`, `hp-sources`,
`inventory`, `resources`, `spell-slots`, `spells`, `status-effects`.

---

## Wo was zu finden ist

| Frage | Werkzeug |
|---|---|
| „Was macht Ordner X?" | Diese Karte |
| „Welche Regeln gelten?" | `AGENTS.md`, `.clinerules/` |
| „Wo ist Symbol Y definiert?" | codescope `search_symbols` oder `get_symbol` |
| „Wer ruft Funktion Z auf?" | codescope `find_callers` / `impact` |
| „Welche Symbole hängen an Aufgabe X?" | codescope `context` |
| „Welche Tests laufen bei Änderung Y?" | codescope `affected` |
| „Wie sieht Datei F aus?" | codescope `file_outline` |

**Nicht mehr manuell scannen.** codescope ist der primäre Weg für
symbolbasierte Fragen.

---

## Wartungsregeln für diese Datei

**Selten ändern.** Sie ist klein gehalten, damit sie aktuell bleibt.

**Aktualisieren nur wenn:**
- Ein Top-Level-Ordner hinzukommt, wegfällt oder seinen Zweck ändert
- Die Hook-Kette sich in Reihenfolge oder Anzahl ändert
- Eine kanonische Quelle umzieht oder eine neue dazukommt
- Eine API-Routen-Gruppe sich grundlegend ändert

**Nicht aktualisieren für:**
- Neue Dateien in bestehenden Ordnern (codescope weiß das)
- Neue API-Routen innerhalb bestehender Gruppen
- Umbenennungen einzelner Symbole

Faustregel: wenn die Änderung in `codescope` sichtbar ist, gehört sie
nicht hierher.