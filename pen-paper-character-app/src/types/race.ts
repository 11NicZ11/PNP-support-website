// Race types used by RaceEditor and character state.
// Migrated from src/components/character/editors/RaceEditor.tsx.
import type { AbilityScoreIncrease } from './abilityScoreIncrease';

export interface RaceData {
  name: string;
  size: string;
  sizeCategory: string;
  height: string;
  weight: string;
  age: string;
  speed: number;
  description: string;
  languages: string[];
  traits: { name: string; description: string }[];
  abilityScoreIncrease: AbilityScoreIncrease;
  hasSubrace: boolean;
  subraces: { name: string; description: string }[];
  skillProficiencies: { skillName: string; source: string }[];
  faith: string;
  personality: string;
  bonds: string;
  ideals: string;
  flaws: string;
  bonusArmorClass: number;
  bonusHp: number;
}
