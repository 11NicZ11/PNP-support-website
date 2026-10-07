# Pen & Paper Character Manager

Freie Charakterverwaltung für Pen & Paper Rollenspiele — ohne Bindung an
ein Regelwerk. Zielgruppe sind D&D, Pathfinder, DSA und Homebrew-Runden.

Die App ist eine Next.js-Anwendung mit SQLite-Datenbank, die Charaktere
über eine zentrale Wissensbasis („Bibliothek von Babylon") verwaltet.
Nutzer bauen ihre Charaktere aus wiederverwendbaren Bausteinen und
können diese Bausteine zwischen Charakteren teilen.

---

## 1. Tech-Stack

| Ebene | Technologie |
|---|---|
| Framework | Next.js 15+ (App Router, Turbopack) |
| Sprache | TypeScript (strict) |
| Datenbank | SQLite über Prisma 5.22 |
| Styling | Tailwind CSS, Dark Theme |
| UI-Sprache | Deutsch |
| Code-Identifier | Englisch (camelCase / PascalCase) |
| Kommentare | Deutsch |

Keine externen State-Management-Bibliotheken — der State lebt in einer
Hook-Kette (siehe Abschnitt 5). Keine UI-Komponentenbibliothek — alle
Komponenten sind handgeschrieben mit Tailwind.

---

## 2. Kernidee — Bibliothek von Babylon

Das zentrale Architekturprinzip. **Die Bibliothek ist die einzige Quelle
der Wahrheit für wiederverwendbare Bausteine.**

Ein Charaktereintrag (Skill, Zauber, Waffe, …) **referenziert** einen
Bibliothekseintrag über einen Fremdschlüssel und behält zusätzlich einen
lokalen Snapshot (Name, Beschreibung, typ-spezifische Werte). Dadurch
kann sich die Bibliothek weiterentwickeln, ohne dass Charaktere still
überschrieben werden.

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

**Warum Snapshot + FK?**
- **Kein Cascade**: Wird ein Bibliothekseintrag gelöscht, behält der
  Charakter seinen Wert (FK wird auf NULL gesetzt).
- **Keine stille Propagation**: Änderungen an der Bibliothek wirken
  sich nicht automatisch auf Charaktere aus. Der Nutzer entscheidet
  explizit.
- **Rückfrage-UI möglich**: Beim Umbenennen eines Charaktereintrags mit
  FK kann die App fragen: „Nur hier / Global / Neuer Eintrag".

Alle 12 Charaktertabellen mit Library-Bezug sind bereits migriert.

---

## 3. Verzeichnisstruktur
pen-paper-character-app/
├── prisma/
│ ├── schema.prisma Datenmodell
│ ├── seed.ts Erstbefüllung der Bibliothek
│ └── dev.db SQLite-Datenbank (gitignored)
│
├── src/
│ ├── app/
│ │ ├── api/ API-Routen (Server-Code)
│ │ │ ├── characters/ Charakter-CRUD + Kind-Ressourcen
│ │ │ ├── library/ Bibliothek-CRUD + Usage + Mode-Parameter
│ │ │ └── templates/ Template-Lookup
│ │ ├── characters/ Charakter-Seiten
│ │ ├── library/ Bibliothek-Seite
│ │ └── dice/ Würfel-Seite
│ │
│ ├── components/
│ │ ├── character/
│ │ │ ├── editors/ Editoren pro Tab
│ │ │ ├── hooks/ useCharacter*-Hook-Kette
│ │ │ ├── modals/ Modale (DefensesModal, CreateItemModal, …)
│ │ │ ├── forms/ Formular-Zerlegung
│ │ │ ├── tabs/ Tab-Container
│ │ │ └── views/ Read-Only-Ansichten
│ │ ├── library/ Bibliothek-UI
│ │ ├── dice/ Würfel-UI
│ │ └── ui/ Wiederverwendbare UI-Bausteine
│ │
│ ├── hooks/ Wiederverwendbare Hooks (useLibrary, …)
│ ├── lib/
│ │ ├── api/ API-Helpers (Server)
│ │ ├── defaults/ Seed-Quellen (nur vom Seed importiert)
│ │ ├── enums/ Runtime-Enums (UI-Kategorien)
│ │ ├── dice.ts Würfel-Logik
│ │ ├── units.ts Einheiten-Umrechnung
│ │ └── utils.ts JSON/Type-Helpers
│ │
│ ├── contexts/ React-Contexts (Toast, DiceLog)
│ ├── types/ Shared TypeScript-Typen
│ └── config/ Local Config (gitignored Templates)
│
├── .clinerules/ Cline-Regeln (werden nicht editiert)
└── package.json


---

## 4. Datenmodell — Übersicht

Alle Modelle in `prisma/schema.prisma`.

### Kern
- **Character** — Zentrale Entität. Enthält Skalar-Felder (Name, Level,
  HP, Unit-System, Attributsmethode etc.) und 1:n-Relationen zu allen
  Kind-Tabellen.

### Charakter-Kinder (mit Library-FK)
- **Skill**, **SavingThrow** — Fertigkeiten + Rettungswürfe
- **Proficiency** — Sprachen, Rüstungen, Waffen, Werkzeuge
- **Defense** — Immunitäten, Resistenzen, Zustandsimmunitäten
- **StatusEffect** — aktive Zustände
- **Action** — Aktionen / Bonusaktionen / Reaktionen
- **Spell** — Zauber mit Komponenten, Schule, Slots
- **SpellSlot** — verfügbare Zauberplätze pro Grad
- **Equipment** — Waffen, Rüstungen, Ausrüstung
- **InventoryContainer** — Rucksäcke, Truhen, Behälter
- **InventoryItem** — Items innerhalb von Containern
- **AlternateForm** — Wild Shape, Polymorph etc.
- **Companion** — Vertraute, Tiergefährten, Reittiere

### Charakter-Kinder (ohne Library-FK)
- **Attribute**, **HpSource**, **CombatValueSource**,
  **CharacterResource**, **CharacterHitDice** — charakterspezifische
  Werte, keine Vorlagen.

### Race & Background
- **Race**, **Background** — 1:1 zum Character, komplexe Strukturen
  (Traits, Sprachen, ASI-Boni) als eigene Tabellen.

### Klassen
- **CharacterClassLevel** — Klasse, Level, Subklasse, Track, Features
- **CharacterFeature** — Feature pro Klasse/Level (mit Cross-Links zu
  Forms/Companions/Actions)

### Bibliothek
- **LibraryEntry** — `type`, `category`, `name`, `description`, `icon`,
  `data` (JSON), `isSeed`, `seedKind`, `isPublic`.

### Legacy
- **PredefinedStatusEffect** — alte Tabelle, wird in späterer Etappe
  entfernt. Neue Status-Effekte laufen ausschließlich über
  `LibraryEntry type='status_effect'`.

---

## 5. State-Management — Hook-Kette

Der komplette Charakter-Editor-Zustand wird über sechs Hooks verwaltet,
die in dieser Reihenfolge aufgerufen werden (siehe `CharacterForm.tsx`):

1. **`useCharacterState`** — hält alle Felder als `useState`. Fundament
   für alle anderen Hooks.
2. **`useCharacterMemos`** — abgeleitete Werte via `useMemo`:
   `totalHp`, `proficiencyBonus`, `aggregatedDefenses`, `activeForm`.
3. **`useCharacterDataLoader`** — lädt Server-Daten (bestehender
   Charakter) oder Library-Templates (neuer Charakter).
4. **`useCharacterSyncs`** — Auto-Sync-Effekte (Rasse → Skills,
   Hintergrund → Sprachen, ASI-Boni → Attribute).
5. **`useCharacterHandlers`** — Event-Handler mit API-Aufrufen (nur bei
   bestehendem Charakter, nicht bei `isNew`).
6. **`useCharacterSubmit`** — sammelt State, validiert, sendet POST/PUT.

**Wichtig:** Alle sechs Hooks arbeiten auf demselben State-Objekt.
Reihenfolge ist nicht zufällig — Loader vor Syncs vor Handlers.

### Datenfluss (Edit-Mode)

Server (GET /api/characters/:id)
│
▼
useCharacterDataLoader → useCharacterState (setzt Felder)
│
▼
useCharacterSyncs (Effekte auf Race/Background-Änderungen)
│
▼
User bearbeitet → useCharacterHandlers (Einzel-APIs für Aktionen etc.)
│
▼
Submit → useCharacterSubmit → POST /api/characters
PUT /api/characters/:id


**Bei `isNew === true`:** alle API-Calls werden übersprungen. Der State
lebt nur lokal. Am Ende sendet `useCharacterSubmit` einen komplett
gefüllten Payload an POST `/api/characters`.

**Bei bestehendem Charakter:** einzelne Updates (HP, Exhaustion, Rests)
senden partielle Payloads an PUT `/api/characters/:id`. Partielle
Payloads sind so gebaut, dass sie nur die mitgeschickten Collections
neu aufbauen — fehlende Collections bleiben unangetastet.

---

## 6. API-Patterns

Jede Route folgt demselben Muster:

```ts
// import { NextRequest } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';
// 
// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
    // const { id } = await params;  // Next.js 15: params ist ein Promise
    ...
    // return apiSuccess(data);
//   } catch (error) {
    // return handleApiError(error, 'Fehler beim Laden');
//   }
// }


Regeln:

    params wird immer awaited.

    Ownership-Check: jede Query auf User-Daten filtert nach
    characterId. Niemals findUnique auf Relationen ohne Filter.

    Update/Delete: immer updateMany / deleteMany mit
    characterId-Filter, danach findFirst als Bestätigung.

    HTTP-Status: 201 bei Create, 400 bei Validation, 403 bei
    System-Schutz, 404 bei nicht gefunden, 409 bei Kollision, 500 bei
    Fehler.

Library-Endpunkte

POST /api/library mit mode:

    reuse (Default) — bei Duplikat bestehenden zurückgeben

    update — bestehenden aktualisieren (403 bei isSeed, 409 bei
    Namenskollision)

    force-new — immer neu, Suffix (2), (3), …

Response enthält immer status: 'created' | 'reused' | 'updated'.

GET /api/library/[entryId]/usage — Anzahl der Charaktereinträge,
die auf diesen Eintrag zeigen. Wird im Rename-Dialog angezeigt.
7. UI- und Design-System

Dark Theme. Farben aus globals.css:
Rolle	Klasse
Hintergrund	bg-gray-900/50, bg-gray-800/30
Border	border-purple-500/20, border-gray-700/50
Akzent	bg-purple-600 hover:bg-purple-700
Text sekundär	text-gray-400
Erfolg / Fehler / Warnung	text-green-400, text-red-400, text-yellow-400

Keine Inline-Styles außer bei dynamischen Werten (Balkenbreite,
prozentuale Positionen). Keine neuen Farben — bestehende Klassen
verwenden.

Modal-Muster

Alle Modale folgen demselben Aufbau:

// <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
//   <div className="bg-gray-800 rounded-xl max-w-lg w-full border border-purple-500/30">
    // {/* Header mit ✕-Button */}
    // {/* Body */}
    // {/* Footer mit Buttons */}
//   </div>
// </div>

    Kein Portal — alle Modale werden inline gerendert.

    Nicht in <form> rendern, wenn die Komponente außerhalb eines
    Formulars steht — sonst entstehen stille PUT-Trigger.

    if (!isOpen) return null; nach allen Hooks.

Buttons

Immer type="button", außer es ist der Submit-Button eines Formulars.
Emojis in Buttons sind ausdrücklich erwünscht.
8. Code-Style

    TypeScript strict, kein any außer an JSON-Grenzen (mit
    Kommentar).

    interface für Objekt-Formen, type für Unions.

    Bestehende Typen aus src/types/ importieren, nicht duplizieren.

    Client-Komponenten brauchen 'use client' ganz oben.

    Kein direkter fetch in Komponenten, wenn ein Hook existiert
    (useLibrary, useActions, useSpells, useEquipment,
    useInventory).

    useEffect nicht zum Ableiten von State verwenden — useMemo
    oder direkte Berechnung.

    Kein console.log in committed Code — nur console.error bei
    echten Fehlern.

    Keine neuen npm-Pakete ohne explizite Freigabe.

Doppelte JSON-Welten

Seit Etappe 6 werden JSON-Felder in der DB schrittweise aufgelöst.
Verbleibendes JSON:

    LibraryEntry.data — per Design variabel je type.

    Character.attributeMethodState — reiner UI-State während der
    Char-Erstellung.

    Character.expThresholds — Konfigurations-Map ohne Query-Bedarf.

Alle anderen JSON-Felder werden in separaten Sub-Steps auf relationale
Tabellen umgestellt.
9. Einheiten-System

DB speichert immer metrisch (kg, m). Ausnahme: Distanzen bleiben in
ft (D&D-Konvention).

Umrechnung ausschließlich in src/lib/units.ts bei Anzeige und
Eingabe. Formatiert wird über formatWeight / formatDistance /
formatDistanceString. Beim Speichern: parseWeightInput /
parseDistanceInput verwenden — nie rohes parseFloat.
10. Bibliothek vs. Charakter — Bearbeitungsfluss

Wenn der Nutzer einen Charaktereintrag mit gesetztem libraryEntryId
umbenennt:

    Nur hier — Skill.name lokal ändern, FK und Bibliothek bleiben
    unangetastet.

    Global — Bibliothekseintrag umbenennen (via POST /api/library
    mit mode='update'). Alle referenzierenden Charaktere bleiben auf
    ihren Snapshots — sie werden nicht rückwirkend geändert.

    Neuer Eintrag — neuen Bibliothekseintrag anlegen
    (mode='force-new' oder mode='reuse'), FK auf neuen Eintrag
    umhängen.

    Bestehenden nutzen — wenn Zielname bereits existiert: FK auf den
    bestehenden Eintrag umhängen, keine Kopie erzeugen.

Der Dialog (RenameLibraryDialog) zeigt:

    Anzahl referenzierender Charaktere (Usage-Count)

    „Global" ist deaktiviert bei seedKind === 'system'

    „Global" ist deaktiviert bei Namenskollision

11. Seed-System

Der Seed (prisma/seed.ts) ist idempotent (überall upsert) und
füllt die Bibliothek mit Standard-Einträgen.

seedKind-Werte:

    system — unantastbar. Beispiele: Damage-Types, Conditions,
    Attribute.

    template — editierbar mit Warnung. Beispiele: Skills, Actions,
    Weapon-Properties.

    null — Nutzer-Einträge.

Erstbefüllung: npx prisma db seed. Kein automatischer Seed beim
App-Start (kann später via instrumentation.ts ergänzt werden).

Seed-Quellen: src/lib/defaults/*.ts. Diese Dateien werden
ausschließlich von prisma/seed.ts importiert. Kein Runtime-Import.

Runtime-Enums: src/lib/enums/*.ts. Reine UI-Kategorien
(Equipment-Typen, Spell-Schools). Kein DB-Bezug.
12. Entwicklungsworkflow
Phasen und Etappen

Das Projekt läuft in Etappen, jede mit Plan-Mode → Act-Mode.

    Plan-Mode — analysiert, liefert Inventar + Diff + Fragen.
    Keine Edits.

    Act-Mode — setzt einen abgegrenzten Task um.

    13. Glossar
Begriff	Bedeutung
BvB	Bibliothek von Babylon — zentrale Wissensbasis
LibraryEntry	Ein Bibliothekseintrag (Template oder User-Eintrag)
Char-Eintrag	Ein konkreter Eintrag eines Charakters (Skill, Spell, …)
Snapshot	Lokale Kopie eines Bibliothekswerts im Char-Eintrag
FK	Foreign Key (libraryEntryId)
Rename-Dialog	Rückfrage-UI beim Umbenennen mit gesetztem FK
Mode	reuse / update / force-new — Verhalten bei Duplikat
Seed	Erstbefüllung der Datenbank aus src/lib/defaults/
seedKind	system / template — Schutzlevel für Seed-Einträge
Sub-Step	Ein logischer Teil einer Etappe (eine Tabelle / ein Feld)
isNew	Flag für „neuer Charakter" — keine API-Calls im Edit-Flow
PUT-Falle	Bug-Klasse: PUT ohne libraryEntryId setzt FK auf NULL
14. Status und Roadmap
Abgeschlossen

    Etappe 1 — API + Hook (createWithMode, mode-Parameter)

    Etappe 2 — Schema-FK für Skill + SavingThrow

    Etappe 3 — Rename-UI für Skills (Dialog + Usage-Count)

    Etappe 3.5 — Struktur-Trennung (defaults / enums) + seedKind

    Etappe 4 — FK-Rollout: Proficiency, Defense, StatusEffect, Action

    Etappe 5 — FK-Rollout: Spell, Equipment, InventoryItem,
    InventoryContainer, AlternateForm, Companion

In Arbeit

    Etappe 6 — JSON-Aufräumen (9 Sub-Steps)

        Sub-Step 1: Spell.components

        Sub-Step 2–9: Equipment, InventoryItem, Race, Background, Forms,
        Companions, NoteCategory, CharacterFeature

Geplant

    Etappe 7 — Rename-UI-Rollout (Dialog in alle Editoren
    einbinden, die FK-Einträge umbenennen können)

    Etappe 8 — Library-Page „+ Neuer Eintrag"-Button

    Etappe 9 — Auto-Seed via instrumentation.ts

    Etappe 10 — Legacy-Aufräumen (PredefinedStatusEffect entfernen)

    15. Bekannte Bugs und offene Punkte

    # Bekannte Issues

Sammelstelle für Bugs und UX-Wünsche, die **außerhalb** des aktuellen
Tasks liegen. Werden in einem gesammelten "Hygiene-Task" abgearbeitet,
nicht "nebenbei".

**Regel:** Cline fasst nichts aus dieser Liste an, außer der User sagt
explizit "arbeite Issue #X ab". Kein Bugfix "mal eben zwischendurch".

**Prioritäten:**
- 🔴 Blocker / hohe Priorität
- 🟡 Wunsch / Feature
- 🟢 Kleinkram / Code-Hygiene
- 🔧 In Arbeit (aktueller Task)

**Letzte Aktualisierung:** nach Etappe 3.5 + Etappe 4 + Etappe 5,
vor Etappe 6 (JSON-Aufräumen).

---

## 🔴 Blocker / hohe Priorität

### 🔴 F — DiceButton fehlt type="button"

**Symptom:** Klick auf "🎲 Würfeln" in jedem Charakter-Tab, der im
CharakterForm-`<form>` liegt (Equipment, Spells, Forms, Companions,
Actions), triggert einen stillen `PUT /api/characters`. Der User merkt
es nicht, aber die DB wird mit ungewollten Saves geflutet.

**Betroffen:** `src/components/dice/DiceButton.tsx` (Z. ~89).

**Fix:** `type="button"` ergänzen.

**Priorität:** Höchste — nächster Hygiene-Task, erstes Item.

---

### 🔴 G — Aktion ohne Beschreibung geht verloren (isNew)

**Symptom:** Neuer Charakter → Aktion per Hand (nicht über Chip) ohne
Beschreibung anlegen → Speichern → Aktion ist weg. Kein sichtbarer
Fehler (nur `console.error`).

**Ursache (Kette):**
1. `CreateItemModal`: "Beschreibung"-Feld ist NICHT `required`.
2. `POST /api/characters/[id]/actions` verlangt `description` (sonst 400).
3. `useCharacterSubmit` verschluckt den Fehler (`console.error` statt
   `state.setError`).

**Fix-Optionen:**
- (a) Beschreibung im Modal `required` — gilt dann auch für
  Equipment/Zauber/Inventar (prüfen).
- (b) Fehler in `useCharacterSubmit` an `state.setError` melden.
- (c) Fallback-Beschreibung (`''` statt `undefined`) beim POST.

**Betroffen:** `CreateItemModal.tsx`,
`src/app/api/characters/[id]/actions/route.ts`, `useCharacterSubmit.ts`.

**Priorität:** Hoch — stiller Datenverlust.

---

### 🔴 H — Versatile mit zwei Schadenswürfeln

**Wunsch:** Waffen mit `Versatile`-Eigenschaft sollen zwei Würfel haben:
1h (z. B. 1d8) / 2h (z. B. 1d10). Der Nutzer wählt beim Würfeln, welche
Führung gerade genutzt wird.

**Aufwand:** Mittel-groß — braucht Datenmodell-Umbau
(`damageDice1h` + `damageDice2h` in Equipment + InventoryItem) ODER
strukturierte Weapon-Properties (`data`-JSON in Library).

**Priorität:** Hoch — Kern-D&D-Feature.

---

### 🔴 I — Custom Weapon-Properties mit Effekten

**Wunsch:** Nutzer erstellt eigene Waffen-Eigenschaften wie "Bei
Verfehlen: Schaden = Angriffsmod". Property = Name + Beschreibung +
optional strukturierter Effekt.

**Aufwand:** Groß — braucht Effekt-System, keine reine Text-Property
wie aktuell.

**Priorität:** Mittel-Hoch — Feature-Erweiterung mit großem
strukturellem Anteil. Braucht eigene Planungsrunde.

---

### 🔴 K — Default-Container "Ausrüstung"

**Wunsch:** Jeder neue Charakter startet mit einem Container
"Ausrüstung", der Waffen, Rüstungen, Schilde aufnimmt. Der Nutzer
kann dort sofort Gegenstände ablegen.

**Aufwand:** Mittel — Create-Flow erweitern (`useCharacterSubmit` +
`useCharacterDataLoader` + Default-Container in
`characterFormDefaults`).

**Priorität:** Hoch — UX-Verbesserung für Erstellungs-Flow.

---

## 🟡 Wünsche / Features

### 🟡 B — Aktionstyp und Quelle als Combobox

**Wunsch:** Nutzer soll in den Selects für "Aktionstyp" und "Quelle"
eigene Werte eingeben können. Bei Eingabe erscheint ein Dropdown mit
Vorschlägen aus Library bzw. bestehenden Enums.

**Betroffen:** `CreateItemModal.tsx` — `renderActionFields()`.

**Hinweis:** `ACTION_TYPES` ist ein festes Enum
(`src/lib/enums/equipmentTypes.ts`). Combobox = Input + Datalist oder
eigenes Dropdown. Keine neuen Pakete — `datalist` reicht.

**Priorität:** Mittel.

---

### 🟡 C — Schadenswürfel aus Library-Aktion übernehmen

**Symptom:** Bei Klick auf Library-Aktion (z. B. "Nahkampfangriff")
werden Name, Beschreibung, Aktionstyp gefüllt. Schadenswürfel bleiben
leer.

**Wunsch:** Seed-Aktionen sollen Schadenswürfel-Vorschläge mitbringen,
die beim Klick ins Formular übernommen werden.

**Betroffen:** `src/lib/defaults/actions.ts` (Seed),
`CreateItemModal.tsx` (`applyActionSuggestion`).

**Offen:** Welche Würfel für welche Aktion? Vorschlag:
Nahkampf `1d8`, Fernkampf `1d6`, Rest leer.

**Priorität:** Mittel.

---

### 🟡 D — Rettungswurf als Dropdown mit Library-Vorschlägen

**Wunsch:** Im Aktions-Formular soll das Feld "Rettungswurf" ein
Dropdown mit Vorschlägen aus `LibraryEntry` (type `saving_throw`)
bekommen.

**Betroffen:** `CreateItemModal.tsx` — `renderActionFields()`.
Library-Zugriff über `useLibrary({ type: 'saving_throw' })`.

**Priorität:** Mittel.

---

### 🟡 J — Scaling-Attribut für Waffen

**Wunsch:** Feld `scalingAttribute` (STR / DEX / beides) bei Waffen.
Finesse-Waffen: STR **oder** DEX. Bestimmt, welcher Attributs-Mod für
Angriff/Schaden verwendet wird.

**Aufwand:** Klein — 1 neues Feld + Dropdown im Modal.

**Betroffen:** `prisma/schema.prisma` (Equipment + InventoryItem),
`CreateItemModal.tsx`.

**Priorität:** Hoch (aber leicht umzusetzen).

---

### 🟡 L — Attributvergabe optional

**Wunsch:** Bei neuen Charakteren soll die Attributs-Methode nicht
mehr Pflicht sein. Für Test-Charaktere überspringbar.

**Aufwand:** Klein — `validateAttributeMethod` in
`useCharacterSubmit.ts` lockern + Flag `attributeMethod: 'free'` oder
explizite Skip-Option.

**Priorität:** Mittel — Testfreundlichkeit.

---

### 🟡 M — View-Modus: Container/Items erstellen

**Wunsch:** Im View-Modus (`/characters/[id]`) sollen Nutzer
Gegenstände und Container anlegen können, nicht nur im Edit-Modus.

**Konzeptionelle Frage:** Wird der View damit zum Edit? Oder gibt es
ein "Quick-Add"-Overlay?

**Aufwand:** Mittel — `EquipmentTab` muss im View-Modus Create-Buttons
zeigen.

**Priorität:** Niedrig — Workaround existiert (Edit-Modus).

---

### 🟡 N — Ausrüstungs-Slots-Ansicht

**Wunsch:** Neue visuelle Ansicht im Ausrüstungs-Tab mit Boxen für
2 Handschuhe, 2 Ringe (erhöhbar bis 5 pro Hand — Config), 1 Rüstung,
Linker Hand / Rechter Hand, Schuhe, Helm. Jede Box zeigt, welcher
Gegenstand dort ausgerüstet ist. Keine Illustration, nur
CSS/Tailwind-Boxen.

**Aufwand:** Groß — neues UI-Feature + Datenmodell (`equipmentSlot` auf
InventoryItem/Equipment) + User-Config für Ring-Anzahl.

**Priorität:** Mittel — Nice-to-have, komplex. Braucht eigene
Planungsrunde.

---

### 🟡 Y — SavingThrowsEditor ist Dead Code

**Symptom:** Die Komponente `SavingThrowsEditor.tsx` wird nirgends
gerendert. Nur der `SavingThrow`-Typ wird importiert.

**Folge:** Änderungen an der Komponente sind wirkungslos. Der
FK-Wiring-Pfad für SavingThrows läuft ausschließlich über Loader +
POST-Fallback, nicht über UI.

**Optionen:**
- (a) Komponente löschen.
- (b) Komponente reaktivieren in `StatusTab` oder `FeaturesTab`.
- (c) Belassen (Verwirrung bei zukünftigen Änderungen).

**Priorität:** Niedrig — Verwirrung vermeiden.

---

### 🟡 Z — handleRenameAttribute setzt SavingThrow.name ohne Dialog

**Symptom:** `useCharacterHandlers.handleRenameAttribute` setzt bei
SavingThrows `name = newName`. Bei SavingThrows mit FK würde das
einen Library-Eintrag implizit umbenennen wollen — ohne
Rückfrage-Dialog.

**Betroffen:** `src/components/character/hooks/useCharacterHandlers.ts`
(Z. ~182–188).

**Wann relevant:** Sobald der Rename-Dialog auch für SavingThrows
aktiv wird (Etappe 7).

**Priorität:** Mittel — verhindert inkonsistenten Rename-Pfad.

---

### 🟡 AC — Rename-UI-Rollout fehlt

**Symptom:** `RenameLibraryDialog` ist nur im `SkillsEditor`
eingebunden. Für Spell, Equipment, Action, InventoryItem,
InventoryContainer, AlternateForm, Companion fehlt er. Beim Umbenennen
dieser Einträge mit FK kommt aktuell kein Dialog.

**Folge:** Bibliothek und Charakter-Snapshots driften auseinander.

**Priorität:** Mittel — geplant als Etappe 7.

---

### 🟡 AD — Library-Page ohne "+ Neuer Eintrag"-Button

**Symptom:** `/library` kann nur editieren/löschen. Neuanlage läuft
nur über die Char-Editoren. Ohne Charakter ist der User blockiert.

**Wunsch:** Button mit Type-Auswahl + Kategorie + Name, analog zu
`CreateItemModal`.

**Priorität:** Mittel — geplant als Etappe 8.

---

### 🟡 AE — Auto-Seed fehlt

**Symptom:** `npx prisma db seed` muss manuell aufgerufen werden. Bei
frischem Setup ist die Bibliothek leer, bis jemand den Seed ausführt.

**Wunsch:** `instrumentation.ts` ruft beim Server-Start `ensureSeeded()`
auf. Prüft, ob `LibraryEntry` Einträge hat — wenn nein, ruft `seed()`.
Nach erfolgreichem Lauf nie wieder.

**Priorität:** Mittel — geplant als Etappe 9.

---

### 🟡 AF — notesCategories-Keys hardcoded

**Symptom:** Default-IDs (`'backstory'`, `'npcs'`, …) und Labels liegen
in `src/lib/defaults/notesCategories.ts` im Repo. Sollen laut Vorgabe
in gitignored Local-Config.

**Fix:** `NoteCategory`-Tabelle einführen (Sub-Step 8 von Etappe 6).
Defaults nach `src/config/notesCategories.local.ts` (gitignored), plus
`notesCategories.local.example.ts` als Vorlage.

**Priorität:** Mittel — Teil von Etappe 6.

---

## 🟢 Kleinkram / Code-Hygiene

### 🟢 O — Container-Edit speichert nicht (EquipmentEditTab)

**Symptom:** Container-Bearbeitung im Equipment-Tab ändert nur den
lokalen State, kein PUT-Call. Änderungen gehen beim Reload verloren.

**Betroffen:** `src/components/character/edit/EquipmentEditTab.tsx`
(`handleAddContainer`, Edit-Zweig).

**Priorität:** Mittel — Datenverlust bei Bearbeitung.

---

### 🟢 P — Equipment für neue Charaktere geht auf FK-500

**Symptom:** `CreateItemModal` POSTet für `itemType === 'equipment'`
immer an `/api/characters/${characterId}/equipment` — auch bei
`characterId === 'new'` → FK-Fehler, 500.

**Betroffen:** `CreateItemModal.tsx` (kein isNew-Zweig für Equipment),
`useCharacterSubmit` (Equipment nicht im Character-Payload).

**Priorität:** Mittel — betrifft nur direkte Equipment-Anlage; Waffen
im Container funktionieren.

---

### 🟢 Q — parseWeightInput nicht genutzt (Regel-03-Verstoß)

**Symptom:** `CreateItemModal` importiert `parseWeightInput` /
`displayWeightValue`, nutzt beim Speichern aber `parseFloat` roh →
kein metrischer Speicherpfad bei imperialer Eingabe.

**Betroffen:** `CreateItemModal.tsx`.

**Priorität:** Mittel — verletzt Regel 03 (Unit-System).

---

### 🟢 U — Inventory-Item PUT ignoriert sourceReference

**Symptom:** `inventory/[containerId]/items/[itemId]/route.ts` (PUT)
mappt `sourceReference` nicht. Kann der Client die Quellenangabe
ändern, würde sie nicht gespeichert.

**Aktuell nicht kritisch:** Kein Client ruft diese Route (siehe V).

**Priorität:** Niedrig — mit Issue O zusammen.

---

### 🟢 V — PUT-Routen werden von keinem Client aufgerufen

**Symptom:** `useEquipment.updateEquipment` und
`useInventory.updateContainer` existieren, haben aber keine Aufrufer.
`EquipmentEditTab.handleUpdateContainer` ist eine lokale Funktion,
kein API-Call.

**Folge:** Container-Bearbeitung landet nie in der DB (Issue O),
Equipment-Bearbeitung ebenfalls nicht.

**Priorität:** Niedrig — hängt mit Issue O zusammen.

---

### 🟢 AA — prisma generate EPERM auf Windows

**Symptom:** `npx prisma generate` schlägt mit `EPERM:
rename query_engine-windows.dll.node` fehl. Verwaiste Zieldatei aus
früherem Lauf blockiert.

**Ursache:** Windows-Dateilock, kein Code-Problem.

**Fix:** `taskkill /F /IM node.exe`, alte `.dll.node.bak`/`.tmp`-Reste
entfernen, `npx prisma generate` erneut.

**Priorität:** Niedrig — tritt selten auf, Werkzeug bereit haben.

---

### 🟢 AG — prisma migrate reset statt migrate dev (Disziplin)

**Symptom:** In Etappe 5 (Rest) hat Cline `npx prisma db push`
verwendet statt `migrate dev`. Folge: keine Migrationsdatei, später
Drift, manueller `migrate resolve` nötig.

**Regel:** Immer `npx prisma migrate dev --name <name>`, nie `db push`.
Steht auch in `.clinerules/06-do-not.md`.

**Priorität:** Niedrig — Werkzeug-Disziplin.

---

### 🟢 1 — ActionsView DELETE/PUT im isNew-Modus

`handleDelete` / `handleUpdateUses` rufen im isNew-Modus
`/api/characters/new/…` auf → 404.

**Betroffen:** `src/components/actions/ActionsView.tsx`.

**Priorität:** Niedrig — Workaround: erst speichern, dann löschen.

---

### 🟢 2 — useActions.deleteAction throwt auch im Erfolgsfall

`src/hooks/useActions.ts`. Bug, aber Hook wird aktuell nicht von
`ActionsView` benutzt.

**Priorität:** Niedrig.

---

### 🟢 3 — POST actions ohne Existenz-Check

`src/app/api/characters/[id]/actions/route.ts`: kein `findFirst` vor
`create` → FK-Fehler mit 500 statt 404.

**Priorität:** Niedrig — defensives Coding.

---

### 🟢 5 — Toter Import LibraryEntryFull

`src/components/library/LibraryPage.tsx`. ESLint-Warnung
"defined but never used".

**Priorität:** Niedrig — Kosmetik.

---

## Roadmap-Notizen (kein Issue, aber geplant)

- **Etappe 6** — JSON-Aufräumen in 9 Sub-Steps. Sub-Step 1
  (Spell.components) ist in Arbeit. Sub-Steps 2–9 folgen.
- **Etappe 7** — Rename-UI-Rollout (Issue AC).
- **Etappe 8** — Library-Page „+ Neuer Eintrag"-Button (Issue AD).
- **Etappe 9** — Auto-Seed via `instrumentation.ts` (Issue AE).
- **Etappe 10** — Legacy-Aufräumen: `PredefinedStatusEffect` entfernen.

---

## Erledigt (aus dieser Liste entfernt)

- **W** — Usage-Count-Endpunkt. Gelöst in Etappe 3.
  `GET /api/library/[entryId]/usage` existiert.
- **X** — mode='update' Kollision → 500. Gelöst in Etappe 3. Kollisions-
  Check + P2002 → 409 in `api/library/route.ts`.
- **R** — Tote Imports in CreateItemModal. Durch Komplett-Rewrites in
  Etappe 4d/5a/5b implizit bereinigt.
- **4** — CreateItemModal formData initial state. Durch Rewrites
  bereinigt.
- **🔧 Equipment-Polish** — abgeschlossen.

---

## Regeln für diese Datei

- **Neue Einträge oben** unter der passenden Priorität.
- **Bei "erledigt":** Eintrag **löschen** (nicht durchstreichen).
- **Nicht** ohne Auftrag abarbeiten.
- **Bei größeren Features (H, I, N):** Vor Umsetzung eigene
  Planungsrunde einlegen — nicht direkt in Cline werfen.
- **Nach jedem Etappen-Abschluss:** Diese Datei durchgehen und
  erledigte Einträge entfernen.