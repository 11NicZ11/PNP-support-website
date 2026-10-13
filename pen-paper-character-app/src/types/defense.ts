// Defense types used by character defenses and the DefensesModal.
// Migrated from src/components/character/modals/DefensesModal.tsx.
export type DefenseType =
  | 'damage_immunity'
  | 'damage_resistance'
  | 'condition_immunity';

export type DefenseSource = 'class' | 'race' | 'equipment' | 'manual';

export interface DefenseItem {
  id: string;
  type: DefenseType;
  name: string;
  description: string | null;
  source: DefenseSource;
  sourceName: string | null;
  isCustom: boolean;
  libraryEntryId?: string | null;
}

