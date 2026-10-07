// src/components/character/forms/characterFormDefaults.ts
import { BackgroundData } from '../editors/BackgroundEditTab';
import { RaceData } from '../editors/RaceEditor';
import { CombatValueSource } from '../editors/CombatValuesEditor';
import { HpSource } from '@/types/character';

// ============================================================
// Nur noch NICHT-Bibliothek-Defaults.
// Skills / Attributes / SavingThrows / Proficiencies kommen
// jetzt aus der Library of Babylon (siehe /api/library).
// ============================================================

export const DEFAULT_HP_SOURCES: HpSource[] = [
  { name: 'Basis', value: 10, sourceType: 'manual', sourceName: '' },
];

export const DEFAULT_COMBAT_VALUE_SOURCES: CombatValueSource[] = [
  { id: 'base-ac', type: 'armorClass', name: 'Basis', value: 10 },
  { id: 'base-speed', type: 'speed', name: 'Basis', value: 30 },
  { id: 'base-init', type: 'initiativeBonus', name: 'Basis', value: 0 },
  { id: 'base-prof', type: 'proficiencyBonus', name: 'Basis', value: 2 },
];

export const DEFAULT_RACE_DATA: RaceData = {
  name: '',
  size: 'Mittel',
  sizeCategory: 'Mittel',
  height: '',
  weight: '',
  age: '',
  speed: 30,
  description: '',
  languages: [],
  traits: [],
  abilityScoreIncrease: { type: 'standard', bonuses: {} },
  hasSubrace: false,
  subraces: [],
  skillProficiencies: [],
  faith: '',
  personality: '',
  bonds: '',
  ideals: '',
  flaws: '',
  bonusArmorClass: 0,
  bonusHp: 0,
};

export const DEFAULT_BACKGROUND: BackgroundData = {
  name: '',
  traits: '',
  ideals: '',
  bonds: '',
  flaws: '',
  features: '',
  bonusSkills: [],
  bonusLanguages: [],
  allies: '',
  organizations: '',
  abilityScoreIncrease: { type: 'standard', bonuses: {} },
  toolProficiencies: [],
};