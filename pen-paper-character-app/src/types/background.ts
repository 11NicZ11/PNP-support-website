// src/types/background.ts
// Einzige Quelle für BackgroundData (Sprint 1B, verschoben aus
// components/character/editors/BackgroundEditTab.tsx).
import { AbilityScoreIncrease } from './abilityScoreIncrease';

export interface BackgroundData {
  name: string;
  traits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  features: string;
  bonusSkills: string[];
  bonusLanguages: string[];
  allies: string;
  organizations: string;
  abilityScoreIncrease: AbilityScoreIncrease;
  toolProficiencies: string[];
}
