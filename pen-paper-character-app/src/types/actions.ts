// src/types/actions.ts

export type ActionType =
  | 'action'
  | 'bonus_action'
  | 'reaction'
  | 'legendary_action'
  | 'lair_action'
  | 'free_action';

export type ActionSourceType = 'equipment' | 'spell' | 'feature' | 'custom';

export type ActionRechargeType = 'short' | 'long' | 'never' | 'manual';

export interface Action {
  id: string;
  name: string;
  type: ActionType;
  description: string;
  sourceType: ActionSourceType;
  sourceId?: string;
  isCustom: boolean;

  attackBonus?: number;
  damageDice?: string;
  damageType?: string;
  range?: string;
  areaOfEffect?: string;

  usesPerDay?: number;
  usesRemaining?: number;
  rechargeType: ActionRechargeType;
  rechargeOnShortRest: boolean;
  rechargeOnLongRest: boolean;

  concentration: boolean;
  savingThrow?: string;
  savingThrowDC?: number;
  linkedFeatureId?: string | null;
  linkedClassLevelId?: string | null;
  // Library-Reference: FK auf LibraryEntry (nullable, SetNull).
  libraryEntryId?: string | null;

  characterId: string;
  createdAt: string;
  updatedAt: string;
}

export const ACTION_RECHARGE_TYPES: { value: ActionRechargeType; label: string; icon: string }[] = [
  { value: 'short', label: 'Kurze Rast', icon: '☕' },
  { value: 'long', label: 'Lange Rast', icon: '🛌' },
  { value: 'never', label: 'Nie / Permanent', icon: '♾️' },
  { value: 'manual', label: 'Manuell', icon: '✋' },
];