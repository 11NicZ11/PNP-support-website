# Rezept: Neuen Library-Typ hinzufügen

Wenn du einen neuen Bibliothek-Typ einführst (z. B. `race`), mach exakt das:

## 1. Prüfen ob Reference-Pattern nötig ist

**Frage:** Haben Char-Instanzen dieses Typs ein `libraryEntryId`?
- Ja → siehe `10-library-reference.md` (FK + Snapshot + Rückfrage-UI)
- Nein → reines Template, keine FK (z. B. `weapon_property`)

## 2. Seed (prisma/seed.ts)

```ts
async function seedRaces() {
  for (const race of DND_RACES) {
    await prisma.libraryEntry.upsert({
      where: {
        type_category_name: { type: 'race', category: '', name: race.name },
      },
      update: {
        description: race.description,
        data: JSON.stringify(race.data),
        isSeed: true,
      },
      create: {
        type: 'race',
        category: '',
        name: race.name,
        description: race.description,
        icon: race.icon,
        data: JSON.stringify(race.data),
        isSeed: true,
        isPublic: true,
      },
    });
  }
}
```

## 3. Library-Page

In `src/components/library/LibraryPage.tsx`:
- `TYPE_TABS` ergänzen um `{ value: 'race', label: 'Rassen', icon: '🧝' }`.
- In `src/components/library/LibraryEntryCard.tsx`:
  `TYPE_LABELS` ergänzen.

## 4. Editor-Anbindung mit FK

Im zugehörigen Editor (`RaceEditor.tsx`):

```ts
const { entries: libraryRaces, create, createWithMode } = useLibrary({ type: 'race' });

// Auswahl-UI: datalist oder Buttons
<input list="race-suggestions" ... />
<datalist id="race-suggestions">
  {libraryRaces.map((r) => <option key={r.id} value={r.name} />)}
</datalist>

// Beim Übernehmen: libraryEntryId mitschreiben
const applyRace = (lib: LibraryEntry) => {
  setRaceData({
    libraryEntryId: lib.id,
    name: lib.name,
    ...snapshotFields(lib.data),
  });
};

// Beim Anlegen ohne bestehenden Eintrag:
const persistIfNew = async (name: string) => {
  if (!name.trim()) return;
  const result = await create({ type: 'race', name, icon: '🧝', data: {...} });
  // result.status ∈ 'created' | 'reused'
  // → libraryEntryId in Char-Daten setzen
  setRaceData(prev => ({ ...prev, libraryEntryId: result.id }));
};
```

## 5. Bulk-Fetch im Loader

In `useCharacterDataLoader.ts` bei `isNew` das Template mitladen:

```ts
const libRaces = await fetch('/api/library?type=race').then(r => r.json());
// libraryEntryId + Snapshot beim Erstellen setzen
```

## 6. Prisma-Schema (falls FK nötig)

```prisma
model Race {
  // ...
  libraryEntryId String?
  library        LibraryEntry? @relation(fields: [libraryEntryId], references: [id], onDelete: SetNull)
  // ...
}
```

**Wichtig:** `onDelete: SetNull`, nicht `Cascade`.

## 7. NIEMALS

- Neue Prisma-Tabelle für den Library-Typ selbst.
- Neuen API-Endpunkt für Library — `/api/library` reicht.
- Direkten `fetch` in der Komponente — `useLibrary` nutzen.
- FK setzen ohne die Snapshot-Felder zu füllen.