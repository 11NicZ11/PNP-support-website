// src/types/actions.ts
import { RECHARGE_TYPES, type RechargeType } from '@/lib/enums/rechargeTypes';

// Bestehende Export-Namen bleiben erhalten (06-do-not: exports nicht umbenennen).
export { RECHARGE_TYPES as ACTION_RECHARGE_TYPES };
export type ActionRechargeType = RechargeType;

export type ActionType =
  | 'action'
  | 'bonus_action'
  | 'reaction'
  | 'legendary_action'
  | 'lair_action'
  | 'free_action';

export type ActionSourceType = 'equipment' | 'spell' | 'feature' | 'custom';

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