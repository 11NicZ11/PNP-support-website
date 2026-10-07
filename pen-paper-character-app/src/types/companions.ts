// src/types/companions.ts

import { FormAbility } from './forms';

export type CompanionType =
  | 'familiar'
  | 'animal_companion'
  | 'mount'
  | 'summoned'
  | 'steed'
  | 'custom';

export type CompanionSource =
  | 'find_familiar'
  | 'beast_master'
  | 'find_steed'
  | 'summon'
  | 'racial'
  | 'item'
  | 'custom';

export type CompanionSize =
  | 'tiny'
  | 'small'
  | 'medium'
  | 'large'
  | 'huge'
  | 'gargantuan';

export type CompanionBehavior =
  | 'follow'
  | 'guard'
  | 'attack'
  | 'stay'
  | 'scout'
  | 'custom';

export interface CompanionAttack {
  id: string;
  name: string;
  attackBonus: number;
  damageDice: string;
  damageType: string;
  range: string;
  properties: string;
}

export interface Companion {
  id: string;
  characterId: string;
  name: string;
  type: CompanionType;
  source: CompanionSource;
  sourceReference: string;
  libraryEntryId?: string | null;
  icon: string;

  creatureType: string;
  size: CompanionSize;
  challengeRating: string;

  armorClass: number;
  hpMax: number;
  hpCurrent: number;
  tempHp: number;

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

  senses: string;
  languages: string;

  attacks: CompanionAttack[];
  abilities: FormAbility[];

  isActive: boolean;
  isDismissed: boolean;
  behavior: CompanionBehavior;
  behaviorNote: string;

  linkedResourceId: string | null;
  linkedFeatureId: string | null;

  notes: string;

  createdAt?: string;
  updatedAt?: string;
}

export const COMPANION_TYPES: { value: CompanionType; label: string; icon: string }[] = [
  { value: 'familiar', label: 'Vertrauter', icon: '🦉' },
  { value: 'animal_companion', label: 'Tiergefährte', icon: '🐺' },
  { value: 'mount', label: 'Reittier', icon: '🐴' },
  { value: 'summoned', label: 'Beschworen', icon: '✨' },
  { value: 'steed', label: 'Find Steed', icon: '🐎' },
  { value: 'custom', label: 'Benutzerdefiniert', icon: '📝' },
];

export const COMPANION_SOURCES: { value: CompanionSource; label: string }[] = [
  { value: 'find_familiar', label: 'Find Familiar' },
  { value: 'beast_master', label: 'Beast Master' },
  { value: 'find_steed', label: 'Find Steed' },
  { value: 'summon', label: 'Beschwörungszauber' },
  { value: 'racial', label: 'Rasse' },
  { value: 'item', label: 'Gegenstand' },
  { value: 'custom', label: 'Benutzerdefiniert' },
];

export const COMPANION_SIZES: { value: CompanionSize; label: string; icon: string }[] = [
  { value: 'tiny', label: 'Winzig', icon: '🐜' },
  { value: 'small', label: 'Klein', icon: '🐈' },
  { value: 'medium', label: 'Mittel', icon: '🐕' },
  { value: 'large', label: 'Groß', icon: '🐻' },
  { value: 'huge', label: 'Riesig', icon: '🐘' },
  { value: 'gargantuan', label: 'Gigantisch', icon: '🦕' },
];

export const COMPANION_BEHAVIORS: { value: CompanionBehavior; label: string; icon: string }[] = [
  { value: 'follow', label: 'Folgt', icon: '👣' },
  { value: 'guard', label: 'Bewacht', icon: '🛡️' },
  { value: 'attack', label: 'Greift an', icon: '⚔️' },
  { value: 'stay', label: 'Bleibt', icon: '🪑' },
  { value: 'scout', label: 'Kundschaftet', icon: '🔭' },
  { value: 'custom', label: 'Benutzerdefiniert', icon: '📝' },
];

export function parseCompanionAttacks(json: string): CompanionAttack[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseCompanionAbilities(json: string): FormAbility[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function createEmptyCompanion(characterId: string): Companion {
  return {
    id: `temp-comp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    characterId,
    name: '',
    type: 'familiar',
    source: 'find_familiar',
    sourceReference: '',
    icon: '🦉',
    creatureType: '',
    size: 'tiny',
    challengeRating: '0',
    armorClass: 10,
    hpMax: 1,
    hpCurrent: 1,
    tempHp: 0,
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
    senses: '',
    languages: '',
    attacks: [],
    abilities: [],
    isActive: true,
    isDismissed: false,
    behavior: 'follow',
    behaviorNote: '',
    linkedResourceId: null,
    linkedFeatureId: null,
    notes: '',
  };
}

export function createEmptyCompanionAttack(): CompanionAttack {
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