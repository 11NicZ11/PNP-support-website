// pen-paper-character-app\src\types\inventory.ts
import type { EquipmentType } from './equipment';

export type ContainerType = 'container';
export type WeightUnit = 'kg' | 'lb';

export interface InventoryContainer {
  id: string;
  name: string;
  type: ContainerType;
  description?: string;
  capacity?: number | null;
  weightLimit?: number | null;
  weightUnit: WeightUnit; // for now just Kg und lb
  sourceReference?: string;
  libraryEntryId?: string | null;
  parentId?: string;
  characterId: string;
  children: InventoryContainer[];
  items: InventoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type?: EquipmentType;
  subtype?: string;
  description?: string;
  quantity: number;
  weight?: number | null;
  value?: number | null;
  equipped: boolean;
  notes?: string;
  sourceReference?: string;
  libraryEntryId?: string | null;
  equipmentId?: string;
  
  // Waffen-spezifisch
  attackBonus?: number | null;
  damageDice?: string;
  damageType?: string;
  range?: string;
  weaponProperties?: string[];
  
  // Rüstungs-spezifisch
  armorClassBonus?: number | null;
  armorType?: 'light' | 'medium' | 'heavy';
  maxDexBonus?: number | null;
  stealthDisadvantage?: boolean;
  strengthRequirement?: number | null;
  
  // Schild-spezifisch
  shieldBonus?: number | null;
  
  // Allgemein
  magicBonus?: number | null;
  attunement?: boolean;
  attuned?: boolean;
  
  containerId: string;
  characterId: string;
  createdAt: string;
  updatedAt: string;
}

export const CONTAINER_ICON = '📦';

// 🔥 NEU: Umrechnungsfunktionen
export const KG_TO_LB = 2.20462;
export const LB_TO_KG = 0.453592;

export function convertWeight(value: number, fromUnit: WeightUnit, toUnit: WeightUnit): number {
  if (fromUnit === toUnit) return value;
  if (fromUnit === 'kg' && toUnit === 'lb') return value * KG_TO_LB;
  if (fromUnit === 'lb' && toUnit === 'kg') return value * LB_TO_KG;
  return value;
}

export function formatWeight(value: number, unit: WeightUnit): string {
  return `${value.toFixed(1)} ${unit}`;
}