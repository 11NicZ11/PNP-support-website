# Bibliothek von Babylon

Zentrale Tabelle `LibraryEntry`. **Jeder wiederverwendbare Baustein MUSS
hier gespeichert werden**, nicht hardcoded im Code.

## Struktur

```prisma
model LibraryEntry {
  id          String   @id @default(cuid())
  type        String
  category    String   @default("")
  name        String
  description String   @default("")
  icon        String   @default("📚")
  data        String   @default("{}")
  isSeed      Boolean  @default(false)
  isPublic    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@unique([type, category, name])
}
```

## Bestehende Types

| type | category | Beispiel | isSeed |
|---|---|---|---|
| `attribute` | '' | Stärke | ✅ immer |
| `saving_throw` | '' | Weisheits-Rettungswurf | ✅ |
| `skill` | '' | Wahrnehmung | ✅ |
| `proficiency` | language/armor/weapon/tool | Elfisch | ✅ |
| `defense` | damage_immunity/damage_resistance/condition_immunity | Feuer | ✅ |
| `status_effect` | '' | Betäubt | ✅ |
| `action` | action/bonus_action/reaction | Nahkampfangriff | ✅ |
| `weapon_property` | '' | Finesse | ✅ |

## Regeln

1. **Neue hardcoded Liste** ⇒ sofort in `prisma/seed.ts` + `LibraryEntry`.
2. **`isSeed: true`** für System-Einträge (nicht editierbar/löschbar).
3. **`isSeed: false`** für User-Einträge (im Library-Page editierbar).
4. **`data`** für strukturelle Zusatz-Infos (JSON). Beispiele:
   - `skill`: `{ attributeName: 'Geschick' }`
   - `attribute`: `{ order: 0, isDefault: true }`
   - `status_effect`: `{ defaultDuration, durationUnit, immunityKey }`
5. **API-Endpunkte**:
   - `GET /api/library?type=X&category=Y` → Liste
   - `POST /api/library` → upsert mit `mode`-Parameter (siehe `10-library-reference.md`)
   - `PUT /api/library/[entryId]` → nur wenn `isSeed === false`
   - `DELETE /api/library/[entryId]` → nur wenn `isSeed === false`

## Client-Anbindung

Immer über `useLibrary({ type, category })`:

```ts
const { entries, loading, create, createWithMode } = useLibrary({ type: 'skill' });
```

**NIE** direkt `fetch('/api/library...')` in Komponenten.

## Geplante Types (Roadmap)

| type | category | Felder in `data` |
|---|---|---|
| `race` | '' | `{ speed, sizeCategory, abilityScoreIncrease, languages, traits }` |
| `class` | '' | `{ hitDie, savingThrowProficiencies, spellcastingAbility }` |
| `spell` | '0'..'9' | `{ school, castingTime, range, components, damageDice, ... }` |
| `equipment` | weapon/armor/shield/... | `{ damageDice, armorClassBonus, weaponProperties, ... }` |
| `form` | wild_shape/polymorph/... | `{ armorClass, hpMax, ..., attacks, abilities }` |
| `companion` | familiar/animal_companion/... | `{ armorClass, hpMax, ..., attacks, abilities }` |
| `feat` | '' | `{ prerequisites, description }` |
| `combat_value` | armorClass/speed/initiativeBonus/proficiencyBonus | `{ value }` |
| `hp_source` | '' | `{ value }` |

## Verweis auf das Reference-Pattern

Die Char-Tabellen referenzieren Library-Einträge über
`libraryEntryId`. Details, Modus-Parameter und Rückfrage-UI:
**`10-library-reference.md`**.