# 04-file-refactor-targets.md: hardcoded -> library / relational

Refactor only when a prompt asks for it. This file says where the debt is and how to classify it.

## Decision rule for a hardcoded list
1. Shown to the user and chosen or edited by them: goes into the library.
2. Fixed enum (e.g. `ActionType`, equipment types, spell schools): stays in code (`src/lib/enums/`).
3. Rules knowledge that never changes (exhaustion levels, class feature kinds): stays in code.
4. Pure UI suggestion lists (`ICON_SUGGESTIONS` in `AlternateFormsEditor`, `CompanionsEditor`, `ResourceEditor`): stay hardcoded.

## Known targets
- `characterFormDefaults.ts`: `DEFAULT_COMBAT_VALUE_SOURCES` (base AC, speed, initiative, proficiency bonus) -> library `combat_value`; `DEFAULT_HP_SOURCES` -> library `hp_source`.
- `src/lib/defaults/notesCategories.ts`: default note categories belong in a gitignored local config (`src/config/notesCategories.local.ts` + `.local.example.ts`), backed by a `NoteCategory` table.
- Remaining JSON columns on `Race`, `Background`, `CharacterClassLevel`, `AlternateForm`, `Companion`, `Equipment`, `InventoryItem` move to relational tables step by step (cleanup phase). Only the step named in the prompt, one table or field at a time.

## Seed sources
- `src/lib/defaults/*.ts` are seed sources. Runtime code reads them through `useLibrary`.
- Known exception: `notesCategories.ts` is imported at runtime (`initializeNotesCategories`). Don't add further runtime imports from `defaults/`.

## When doing a JSON -> relational step
- New table with `onDelete: Cascade` to its parent, `@@index` on the parent FK, `order` column where order matters.
- Migration via `migrate dev`. Backfill existing rows in the migration or seed.
- The API boundary keeps returning the old shape (e.g. `string[]`) unless the prompt says otherwise. Update GET, POST and PUT handlers together, plus the DELETE cascade check.
- Remove the old column only in its own, explicitly requested step.