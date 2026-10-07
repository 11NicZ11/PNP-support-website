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