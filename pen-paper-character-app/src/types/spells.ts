// src/types/spells.ts

import { SPELL_SCHOOLS, type SpellSchool } from '@/lib/enums/spellSchools';
export { SPELL_SCHOOLS, type SpellSchool };

export type SpellComponent = 'V' | 'S' | 'M';

export type SpellType = 'melee' | 'ranged' | 'Self';
export type AttackType = 'saving_throw' | 'Attack' | 'Direct Hit' | 'none';

export type AoeShape = 'line' | 'cone' | 'circle' | 'sphere' | 'Single';

export type UpcastType = 'dice' | 'targets' | 'other';

export type RangeCategory = 'Selbst' | 'Touch' | 'Distanz';

export type CastingTimeValue = 'Aktion' | 'Bonusaktion' | 'Reaktion';

export interface Spell {
  id: string;
  name: string;
  level: number;
  school?: SpellSchool;
  castingTime?: string;
  range?: string;
  rangeValue?: number;
  components: SpellComponent[];
  materialComponent?: string;
  duration?: string;
  description?: string;
  higherLevels?: string;
  concentration: boolean;
  ritual: boolean;
  prepared: boolean;
  alwaysPrepared: boolean;

  spellType?: SpellType;
  attackType?: AttackType;
  savingThrow?: string;

  damageDice?: string;
  damageType?: string;

  aoeShape?: AoeShape;
  aoeSize?: number;

  upcastEnabled: boolean;
  upcastType?: UpcastType;
  upcastValue?: string;

  spellcastingClassLevelId?: string | null;
  libraryEntryId?: string | null;

  characterId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpellSlot {
  id?: string;
  rank: number;
  total: number;
  used: number;
  spellcastingClassLevelId?: string | null;
}

// 🔥 NEU: Spellcasting-Info pro Klasse
export interface SpellcastingInfo {
  classLevelId: string;
  className: string;
  ability: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha' | 'none';
  saveDC: number;
  attackBonus: number;
  proficiencyBonus: number;
  abilityModifier: number;
}


export const AOE_SHAPES: { value: AoeShape; label: string; icon: string }[] = [
  { value: 'Single', label: 'Einzelziel', icon: '🎯' },
  { value: 'line', label: 'Linie', icon: '➡️' },
  { value: 'cone', label: 'Kegel', icon: '🔺' },
  { value: 'circle', label: 'Kreis', icon: '⭕' },
  { value: 'sphere', label: 'Sphäre', icon: '🔵' },
];

export const UPCAST_TYPES: { value: UpcastType; label: string }[] = [
  { value: 'dice', label: '+X Schadenswürfel' },
  { value: 'targets', label: '+X Ziele' },
  { value: 'other', label: 'Sonstiges' },
];

export const SPELL_LEVEL_LABELS: Record<number, string> = {
  0: 'Zaubertricks',
  1: 'Grad 1',
  2: 'Grad 2',
  3: 'Grad 3',
  4: 'Grad 4',
  5: 'Grad 5',
  6: 'Grad 6',
  7: 'Grad 7',
  8: 'Grad 8',
  9: 'Grad 9',
};

export const CASTING_TIME_OPTIONS: {
  value: CastingTimeValue;
  short: string;
  label: string;
  tooltip: string;
}[] = [
  {
    value: 'Aktion',
    short: 'A',
    label: 'Aktion',
    tooltip: 'Aktion – die Standardaktion in einer Runde',
  },
  {
    value: 'Bonusaktion',
    short: 'BA',
    label: 'Bonusaktion',
    tooltip: 'Bonusaktion – zusätzlich zur Aktion nutzbar',
  },
  {
    value: 'Reaktion',
    short: 'R',
    label: 'Reaktion',
    tooltip: 'Reaktion – außerhalb deines Zuges als Antwort auf ein Ereignis',
  },
];

export const RANGE_CATEGORIES: {
  value: RangeCategory;
  label: string;
  icon: string;
}[] = [
  { value: 'Selbst', label: 'Selbst', icon: '👤' },
  { value: 'Touch', label: 'Berührung', icon: '🖐️' },
  { value: 'Distanz', label: 'Distanz', icon: '📏' },
];