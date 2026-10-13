// Saving throw types used by SavingThrowsEditor and character state.
// Migrated from src/components/character/editors/SavingThrowsEditor.tsx.
export interface SavingThrow {
  id: string;
  name: string;
  attributeName: string;
  isProficient: boolean;
  expertise: boolean;
  proficiencySource?: string;
  sourceDetail?: string;
  modifier?: number;
  // Library-Reference: FK auf LibraryEntry (nullable, SetNull).
  libraryEntryId?: string | null;
}

