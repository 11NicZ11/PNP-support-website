// src/types/character.ts
import { Attribute } from '@/components/character/editors/AttributesEditor';
import { BackgroundData } from './background';
import { RaceData } from '@/components/character/editors/RaceEditor';
import { ClassLevel } from '@/components/character/editors/ClassLevelsEditor';
import { CombatValueSource } from '@/components/character/editors/CombatValuesEditor';
import { SavingThrow } from '@/components/character/editors/SavingThrowsEditor';
import { Skill } from './skills';
import { StatusEffect } from './statusEffects';
import { DefenseItem } from '@/components/character/modals/DefensesModal';
import { CharacterResource, CharacterHitDice } from './resources';
import { AlternateForm } from './forms';
import { Companion } from './companions';

export type LevelingMode = 'milestone' | 'exp';
export type UnitSystem = 'metric' | 'imperial';

// 🔥 GEÄNDERT: Nur noch 'normal' | 'dual'
// Alte Werte 'single' und 'multi' werden als 'normal' behandelt
export type ClassProgression = 'normal' | 'dual';

export type AttributeMethod = 'standard' | 'standard_plus2' | 'pointbuy' | 'roll' | 'free';
export type HpSourceType = 'class' | 'race' | 'background' | 'feature' | 'conMod' | 'manual';

// 🔥 NEU: EXP-Modus und HitDice-Modus
export type ExpMode = 'next_only' | 'per_level';
export type HitDiceMode = 'scaled' | 'manual';

export interface NotesCategory {
  id: string;
  name: string;
  content: string;
  isCustom: boolean;
}

export interface AttributeMethodState {
  standardAssignments: Record<string, number>;
  standardPlus2Assignments: Record<string, number>;
  pointBuyValues: Record<string, number>;
  rolledValues: number[];
  rolledAssignments: Record<string, number>;
}

export const EMPTY_ATTRIBUTE_METHOD_STATE: AttributeMethodState = {
  standardAssignments: {},
  standardPlus2Assignments: {},
  pointBuyValues: {},
  rolledValues: [],
  rolledAssignments: {},
};

export interface HpSource {
  id?: string;
  name: string;
  value: number;
  sourceType: HpSourceType;
  sourceName?: string;
}

export interface Character {
  id: string;
  name: string;
  level: number;
  race: string;
  class: string;
  alignment: string;
  experience: number;
  notes: string;
  levelingMode: LevelingMode;
  unitSystem: UnitSystem;
  classProgression: ClassProgression;
  nextLevelExp: number;
  attributeMethod: AttributeMethod;
  attributeMethodState: AttributeMethodState;
  notesCategories: NotesCategory[];
  currentHp: number;
  tempHp: number;
  tempMaxHp: number;
  tempMaxHpMax: number;
  exhaustionLevel: number;
  lastShortRest: string | null;
  lastLongRest: string | null;
  attributes: Attribute[];
  hpSources: HpSource[];
  skills: Skill[];
  savingThrows: SavingThrow[];
  proficiencies: any[];
  statusEffects: StatusEffect[];
  defenses: DefenseItem[];
  classLevels: ClassLevel[];
  combatValueSources: CombatValueSource[];
  background: BackgroundData | null;
  raceData: RaceData | null;
  damageImmunities: DefenseItem[];
  damageResistances: DefenseItem[];
  conditionImmunities: DefenseItem[];
  resources: CharacterResource[];
  hitDice: CharacterHitDice[];
  alternateForms: AlternateForm[];
  companions: Companion[];
  createdAt: string;
  updatedAt: string;
}

export const ATTRIBUTE_METHODS: { value: AttributeMethod; label: string; tooltip: string }[] = [
  {
    value: 'standard',
    label: 'Standard Array',
    tooltip: '15, 14, 13, 12, 10, 8 – Standard-Verteilung',
  },
  {
    value: 'standard_plus2',
    label: 'Standard Array +2',
    tooltip: '17, 15, 13, 12, 10, 8 – Höhere Werte',
  },
  {
    value: 'pointbuy',
    label: 'Point Buy',
    tooltip: '27 Punkte frei verteilen (Kosten 8→15)',
  },
  {
    value: 'roll',
    label: 'Würfeln',
    tooltip: '4W6, niedrigster wird gestrichen – 6x würfeln',
  },
  {
    value: 'free',
    label: 'Frei',
    tooltip: 'Manuell eintragen – keine Regeln',
  },
];

export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};

export const POINT_BUY_TOTAL = 27;
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
export const STANDARD_ARRAY_PLUS2 = [17, 15, 13, 12, 10, 8];

export type SpellcastingAbility = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha' | 'none';

export const SPELLCASTING_ABILITY_LABELS: Record<SpellcastingAbility, string> = {
  str: 'Stärke',
  dex: 'Geschick',
  con: 'Konstitution',
  int: 'Intelligenz',
  wis: 'Weisheit',
  cha: 'Charisma',
  none: 'Keine',
};

// 🔥 NEU: Progression-Labels
export const CLASS_PROGRESSION_LABELS: Record<ClassProgression, { label: string; tooltip: string }> = {
  normal: {
    label: 'Normalclassing',
    tooltip: 'Alle Klassen teilen sich das Charakter-Level (Standard)',
  },
  dual: {
    label: 'Dualclassing',
    tooltip: 'Zwei getrennte Klassen-Container mit eigenem Level',
  },
};