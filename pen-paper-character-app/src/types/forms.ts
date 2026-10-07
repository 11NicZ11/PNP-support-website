// src/types/forms.ts

import { ResourceRechargeType } from './resources';

export type FormSource =
  | 'wild_shape'
  | 'polymorph'
  | 'shapechange'
  | 'true_polymorph'
  | 'racial'
  | 'item'
  | 'custom';

export type FormSize =
  | 'tiny'
  | 'small'
  | 'medium'
  | 'large'
  | 'huge'
  | 'gargantuan';

export type FormActivationType = 'action' | 'bonus_action' | 'reaction';

export type FormDurationType =
  | 'unlimited'
  | 'minutes'
  | 'hours'
  | 'until_hp_zero'
  | 'until_dismissed';

export interface FormAttack {
  id: string;
  name: string;
  attackBonus: number;
  damageDice: string;
  damageType: string;
  range: string;
  properties: string;
}

export interface FormAbility {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'action' | 'bonus_action' | 'reaction';
}

export interface AlternateForm {
  id: string;
  characterId: string;
  name: string;
  description: string;
  source: FormSource;
  sourceReference: string;
  libraryEntryId?: string | null;
  icon: string;

  challengeRating: string;
  size: FormSize;
  creatureType: string;

  armorClass: number;
  hpMax: number;
  hpCurrent: number;
  hpFormula: string;

  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;

  speedWalk: number;
  speedFly: number;
  speedSwim: number;
  speedClimb: number;
  speedBurrow: number;

  attacks: FormAttack[];
  abilities: FormAbility[];

  activationType: FormActivationType;
  durationType: FormDurationType;
  durationValue: number;
  usesPerRest: number | null;
  rechargeType: ResourceRechargeType;
  linkedResourceId: string | null;
  linkedFeatureId: string | null;

  isActive: boolean;
  concentration: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export const FORM_SOURCES: { value: FormSource; label: string; icon: string }[] = [
  { value: 'wild_shape', label: 'Wild Shape', icon: '🐺' },
  { value: 'polymorph', label: 'Polymorph', icon: '🦋' },
  { value: 'shapechange', label: 'Shapechange', icon: '🌀' },
  { value: 'true_polymorph', label: 'True Polymorph', icon: '✨' },
  { value: 'racial', label: 'Rasse', icon: '🧬' },
  { value: 'item', label: 'Gegenstand', icon: '💎' },
  { value: 'custom', label: 'Benutzerdefiniert', icon: '📝' },
];

export const FORM_SIZES: { value: FormSize; label: string; icon: string }[] = [
  { value: 'tiny', label: 'Winzig', icon: '🐜' },
  { value: 'small', label: 'Klein', icon: '🐈' },
  { value: 'medium', label: 'Mittel', icon: '🧍' },
  { value: 'large', label: 'Groß', icon: '🐻' },
  { value: 'huge', label: 'Riesig', icon: '🐘' },
  { value: 'gargantuan', label: 'Gigantisch', icon: '🦕' },
];

export const FORM_ACTIVATION_TYPES: { value: FormActivationType; label: string; icon: string }[] = [
  { value: 'action', label: 'Aktion', icon: '⚡' },
  { value: 'bonus_action', label: 'Bonusaktion', icon: '✨' },
  { value: 'reaction', label: 'Reaktion', icon: '🔄' },
];

export const FORM_DURATION_TYPES: { value: FormDurationType; label: string }[] = [
  { value: 'unlimited', label: 'Unbegrenzt' },
  { value: 'minutes', label: 'Minuten' },
  { value: 'hours', label: 'Stunden' },
  { value: 'until_hp_zero', label: 'Bis HP 0' },
  { value: 'until_dismissed', label: 'Bis aufgehoben' },
];

export function parseFormAttacks(json: string): FormAttack[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseFormAbilities(json: string): FormAbility[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function createEmptyAlternateForm(characterId: string): AlternateForm {
  return {
    id: `temp-form-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    characterId,
    name: '',
    description: '',
    source: 'wild_shape',
    sourceReference: '',
    icon: '🐺',
    challengeRating: '0',
    size: 'medium',
    creatureType: '',
    armorClass: 10,
    hpMax: 1,
    hpCurrent: 1,
    hpFormula: '',
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    speedWalk: 30,
    speedFly: 0,
    speedSwim: 0,
    speedClimb: 0,
    speedBurrow: 0,
    attacks: [],
    abilities: [],
    activationType: 'action',
    durationType: 'hours',
    durationValue: 1,
    usesPerRest: null,
    rechargeType: 'short',
    linkedResourceId: null,
    linkedFeatureId: null,
    isActive: false,
    concentration: false,
  };
}

export function createEmptyFormAttack(): FormAttack {
  return {
    id: `atk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    attackBonus: 0,
    damageDice: '',
    damageType: '',
    range: '',
    properties: '',
  };
}

export function createEmptyFormAbility(): FormAbility {
  return {
    id: `abi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    description: '',
    type: 'passive',
  };
}