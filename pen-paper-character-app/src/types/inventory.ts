// pen-paper-character-app\src\types\inventory.ts
import type { EquipmentType } from './equipment';
import type { WeaponPropertyRow } from './equipment';

export type ContainerType = 'container';

export interface InventoryContainer {
  id: string;
  name: string;
  type: ContainerType;
  description?: string;
  capacity?: number | null;
  weightLimit?: number | null;
  containerWeight?: number | null;
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
  rangeType?: 'melee' | 'ranged' | null;
  rangeValue?: number | null;
  rangeMaxValue?: number | null;
  weaponProperties?: string[];
  weaponPropertyRows?: WeaponPropertyRow[];
  
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