# Refactor-Targets: Hardcoded → Library/Seed

Diese Stellen enthalten hardcoded Daten, die in die Bibliothek gehören:

## `src/components/character/forms/characterFormDefaults.ts`

- `DEFAULT_COMBAT_VALUE_SOURCES` — Basis-RK, Speed, Initiative, Prof-Bonus
  → in `LibraryEntry` (type `combat_value`, category `armorClass`/`speed`/...)
- `DEFAULT_HP_SOURCES` — Basis HP
  → in `LibraryEntry` (type `hp_source`)

## `src/lib/defaults/*.ts`

- Alle Dateien in `src/lib/defaults/` sind **Seeds-Quellen**, keine
  Runtime-Imports. Wenn ein Editor etwas davon braucht, lädt er es über
  `useLibrary`. Ausnahme: reine Konstanten ohne Editierbedarf.

## Icon-Listen in Editoren

- `AlternateFormsEditor.tsx`: `ICON_SUGGESTIONS`
- `CompanionsEditor.tsx`: `ICON_SUGGESTIONS`
- `ResourceEditor.tsx`: `ICON_SUGGESTIONS`

→ Diese dürfen hardcoded bleiben (rein UI, kein Mehrwert in DB).

## `src/types/exhaustion.ts`

- `EXHAUSTION_LEVELS` — bleibt hardcoded (Regelwerk-Referenz, unveränderlich).

## `src/types/classFeatures.ts`

- `CLASS_FEATURE_SOURCES`, `CLASS_FEATURE_TYPES`, `CLASS_FEATURE_KINDS`,
  `CLASS_FEATURE_RECHARGE` — bleiben hardcoded (UI-Enums, keine User-Daten).

## Regel für Refactor

Wenn du eine hardcoded Liste findest:
1. Wird sie im UI **angezeigt und vom User gewählt**? → Library
2. Ist sie ein **festes Enum** (z. B. `ActionType`)? → bleibt Code
3. Ist sie **Fachwissen** (z. B. Exhaustion-Level)? → bleibt Code