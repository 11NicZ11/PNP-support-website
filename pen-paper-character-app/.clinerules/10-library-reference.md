# Library-Reference-Pattern (Single Source of Truth)

Der zentrale Vertrag: **Charakter-Einträge referenzieren die Bibliothek
via FK, behalten aber einen lokalen Snapshot.** So kann die Library
Wahrheit sein, ohne Charaktere bei jeder Änderung zu überraschen.

## Grundprinzip

```
LibraryEntry (Wahrheit)
   ▲
   │ libraryEntryId (FK)
   │
Skill / SavingThrow / Proficiency / Defense / StatusEffect / Action (Kopie mit Snapshot + FK)
   ▲
   │ characterId (FK)
   │
Character
```

Jede Char-Tabelle hat DREI relevante Felder:
- `libraryEntryId String?` — FK zu `LibraryEntry` (nullable)
- `name String` — Snapshot zum Zeitpunkt des Erstellens
- `description` + typ-spezifische Felder — Snapshot

**Warum Snapshot + FK?**
- Kein Cascade-Delete: Wenn Library-Eintrag weg ist, behält der Char seinen Wert
- Kein stiller Propagationszwang: Änderungen an Library sind explizit
- FK erlaubt Rückfrage-UI: "Du hast X geändert, soll ich global ändern?"

## Welche Tabellen haben `libraryEntryId`?

| Tabelle | FK? | Grund |
|---|---|---|
| `Skill` | ✅ | Skills sind Library-Bausteine |
| `SavingThrow` | ✅ | dito |
| `Proficiency` | ✅ | dito |
| `Defense` | ✅ | dito |
| `StatusEffect` | ✅ | dito |
| `Action` | ✅ | dito |
| `Spell` | ✅ | Roadmap |
| `Equipment` | ✅ | Roadmap |
| `InventoryItem` | ✅ | Roadmap |
| `Attribute` | ❌ | Materialisiert (Spezialfall, tief verwoben) |
| `CharacterClassLevel` | ⚠️ später | Klassen-Library noch nicht da |
| `AlternateForm` | ⚠️ später | Formen-Library noch nicht da |
| `Companion` | ⚠️ später | Companion-Library noch nicht da |
| `HpSource`, `CombatValueSource`, `CharacterResource` | ❌ | Char-spezifisch |

## POST /api/library — Mode-Parameter

Der `mode`-Parameter steuert das Verhalten bei Duplikaten:

```ts
type PostMode = 'reuse' | 'update' | 'force-new';
```

| Mode | Verhalten | Wann |
|---|---|---|
| `reuse` (Default) | Wenn Eintrag existiert → bestehenden zurückgeben (200). Sonst neu (201). | Standard-Fall |
| `update` | Wenn Eintrag existiert → aktualisieren (200). Sonst 404. | User hat "global ändern" bestätigt |
| `force-new` | Immer neu, ggf. mit Suffix `(2)`, `(3)`... | User will bewusst Kopie |

**Response enthält `status`:**
```json
{ "id": "...", "name": "...", "status": "created" | "reused" | "updated" }
```

## Rückfrage-UI beim Bearbeiten

Wenn der User einen Char-Eintrag mit `libraryEntryId` umbenennt, muss
ein Dialog erscheinen mit drei Optionen:

```
┌─────────────────────────────────────────────────────────────┐
│ "Wahrnehmung" wurde umbenannt zu "Aufspüren".                │
│ Was soll passieren?                                          │
│                                                              │
│ [Nur hier]  — Bibliothek unberührt lassen                    │
│ [Global]    — Bibliothek umbenennen (Warnung: betrifft alle  │
│                Charaktere, die diesen Eintrag nutzen)        │
│ [Neuer Eintrag] — "Aufspüren" als neuen Library-Eintrag      │
│                anlegen, diesen Char umhängen                 │
└─────────────────────────────────────────────────────────────┘
```

**Regeln für den Dialog:**
- Nur zeigen wenn `libraryEntryId !== null`.
- Bei `isSeed: true` **global** deaktivieren (System-Einträge schützen).
- Bei "Neuer Eintrag": prüfen ob Name schon existiert → Hinweis "Schon vorhanden, nutze bestehenden".
- Bei "Global": Warnung ausgeben, wenn andere Chars den Eintrag nutzen.

## Client-Anbindung (`useLibrary`)

`useLibrary` MUSS um `createWithMode` erweitert werden:

```ts
const { entries, loading, create, createWithMode } = useLibrary({ type: 'skill' });

// Standard (reuse):
await create({ type: 'skill', name: 'Aufspüren' });

// Explizit (global):
await createWithMode({
  type: 'skill',
  name: 'Aufspüren',
  mode: 'update',
  targetEntryId: 'lib-xyz',
});
```

## Sync-Erhalt beim Char-Erstellen

In `POST /api/characters` UND in `useCharacterDataLoader` MUSS der
`libraryEntryId` aus dem geladenen Library-Eintrag in die Kopie
übernommen werden.

```ts
// ✅
const libSkill = libraryEntries.find(s => s.name === userChoice);
const skill = {
  libraryEntryId: libSkill?.id ?? null,
  name: libSkill?.name ?? userInput,
  // ...
};
```

## NIEMALS

- `libraryEntryId` mit `onDelete: Cascade` — immer `SetNull`.
- Library-Eintrag bei Char-Löschung löschen.
- Rückfrage-Dialog bei `libraryEntryId === null` (reiner Freitext).
- `isSeed`-Einträge global umbenennen (403).
- FK setzen ohne die Snapshot-Felder zu füllen.

## Roadmap-Status der FK-Einführung

| Etappe | Tabellen | Status |
|---|---|---|
| 1 | `Skill`, `SavingThrow` | ⏳ geplant |
| 2 | `Proficiency`, `Defense`, `StatusEffect` | ⏳ geplant |
| 3 | `Action` | ⏳ geplant |
| 4 | `Spell`, `Equipment`, `InventoryItem` | ⏳ geplant |
| 5 | `CharacterClassLevel`, `AlternateForm`, `Companion` | ⏳ später |