// Combat value types used by CombatValuesEditor and character state.
// Migrated from src/components/character/editors/CombatValuesEditor.tsx.
export interface CombatValueSource {
  id: string;
  type: string;
  name: string;
  value: number;
  dependsOn?: string;
}

