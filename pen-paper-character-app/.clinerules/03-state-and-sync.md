# State & Auto-Sync

## Datenfluss (Edit-Mode)

1. `useCharacterState` — zentraler State (alle Felder als `useState`)
2. `useCharacterDataLoader` — lädt Library-Templates (new) oder Server-Daten
3. `useCharacterSyncs` — **Auto-Sync-Effekte** (Race→Skills, Background→Languages, Boni→Attributes)
4. `useCharacterMemos` — abgeleitete Werte (`totalHp`, `proficiencyBonus`, `activeForm`, aggregierte Defenses)
5. `useCharacterHandlers` — Event-Handler mit API-Calls (nur wenn `!isNew`)
6. `useCharacterSubmit` — sammelt State, validiert, sendet PUT/POST

## Auto-Sync-Regeln

- **Rassen-Fertigkeiten → Skills.isProficient** (mit `proficiencySource: 'Rasse'`)
- **Hintergrund-Fertigkeiten → Skills.isProficient** (`'Hintergrund'`)
- **Rassen-Sprachen → Proficiencies** (category `language`)
- **Attributs-Boni (Rasse + Background) → Attribute.value = baseValue + bonus**
- **Rassen-BonusAC → CombatValueSources** (`type: 'armorClass'`)
- **Rassen-BonusHp → HpSources** (`sourceType: 'race'`)

Wichtig: **Bei Entfernen der Quelle** muss der Sync **zurücksetzen**
(`isProficient: false`, `proficiencySource: ''` etc.).

## Library-Referenz beim Erstellen

**Kritisch:** Beim Erstellen eines Char-Eintrags aus einem
Library-Template MUSS `libraryEntryId` gesetzt werden:

```ts
// In useCharacterDataLoader (isNew):
const libSkill = libSkills.find(s => s.name === 'Wahrnehmung');
const skill = {
  libraryEntryId: libSkill?.id ?? null,
  name: libSkill?.name ?? 'Wahrnehmung',
  // ... Rest-Snapshot-Felder
};
```

**Ohne diesen FK verliert der Char den Bezug zur Bibliothek.** Details:
`10-library-reference.md`.

## Rückfrage-UI bei Umbenennung

Wenn ein Char-Eintrag mit gesetztem `libraryEntryId` umbenannt wird,
muss der Submit-Handler den Rückfrage-Dialog auslösen:

```ts
// Pseudocode
const handleSkillRename = async (skillId, newName) => {
  const skill = skills.find(s => s.id === skillId);
  if (!skill?.libraryEntryId) {
    // Kein FK → einfach lokal umbenennen
    setSkills(skills.map(s => s.id === skillId ? { ...s, name: newName } : s));
    return;
  }
  // FK vorhanden → Dialog
  const choice = await showRenameDialog(skill, newName);
  // choice ∈ 'local' | 'global' | 'new'
  // → entsprechend Library-PUT / createWithMode / nichts
};
```

## Neue Charaktere (`isNew === true`)

- Alle API-Calls **überspringen**. State nur lokal ändern.
- Am Ende: `POST /api/characters` mit komplettem Payload.
- Kind-Ressourcen (Actions, Forms, Companions) sind im Payload enthalten,
  werden server-side mit `createMany` in einer Transaktion angelegt.
- **`libraryEntryId` in jedem Kind-Eintrag setzen.**

## Bestehende Charaktere

- Optimistic Updates: State ändern, dann API-Call, bei Fehler zurückrollen.
- Für HP/Exhaustion/Rests: einzelne `PUT /api/characters/[id]` mit nur
  den geänderten Feldern (nicht dem ganzen Character!).
- Nach erfolgreichem API-Call die Server-Antwort nutzen, um State zu
  aktualisieren — **nicht** `window.location.reload()`.

## Partielle Payloads

`PUT /api/characters/[id]` akzeptiert partielle Payloads. Die API-Route
prüft jede Collection mit `if (xyz)` — ist sie nicht im Body, wird sie
NICHT geleert. Das ist wichtig: HealthBar sendet z.B. nur
`{ currentHp, tempHp }` — Attribute/Skills bleiben unangetastet.