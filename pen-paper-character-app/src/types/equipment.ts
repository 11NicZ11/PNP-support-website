// src/types/equipment.ts
import { DAMAGE_TYPES } from '@/lib/enums/damageTypes';

export type EquipmentType =
  | 'weapon'
  | 'armor'
  | 'shield'
  | 'accessory'
  | 'scroll'
  | 'potion'
  | 'focus'
  | 'wondrous'
  | 'tool'
  | 'instrument'
  | 'mount'
  | 'mount_gear'
  | 'trade_goods'
  | 'clothing'
  | 'other';

export type ArmorType = 'light' | 'medium' | 'heavy';

export type DamageType = (typeof DAMAGE_TYPES)[number];

export interface WeaponPropertyRow {
  id: string;
  name: string;
  valueNumber: number | null;
  libraryEntryId?: string | null;
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: EquipmentType;
  subtype?: string;
  description?: string;
  equipped: boolean;
  quantity: number;
  weight?: number;
  costAmount?: number;
  costUnit?: string;

  magicBonus?: number;

  attackBonus?: number;
  damageDice?: string;
  damageType?: DamageType;
  rangeType?: 'melee' | 'ranged' | null;
  rangeValue?: number | null;
  rangeMaxValue?: number | null;
  weaponPropertyRows?: WeaponPropertyRow[];

  armorClassBonus?: number;
  armorType?: ArmorType;
  maxDexBonus?: number;
  stealthDisadvantage?: boolean;
  strengthRequirement?: number;

  shieldBonus?: number;

  attunement?: boolean;
  attuned?: boolean;
  notes?: string;
  sourceReference?: string;
  libraryEntryId?: string | null;

  // Verteidigungen aus Ausrüstung (greifen nur wenn equipped=true)
  damageImmunities?: string[];
  damageResistances?: string[];
  conditionImmunities?: string[];

  characterId: string;
  createdAt: string;
  updatedAt: string;
}