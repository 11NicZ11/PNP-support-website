// src/types/resources.ts
import { RECHARGE_TYPES, type RechargeType } from '@/lib/enums/rechargeTypes';

// Bestehende Export-Namen bleiben erhalten (06-do-not: exports nicht umbenennen).
export { RECHARGE_TYPES as RESOURCE_RECHARGE_TYPES };
export type ResourceRechargeType = RechargeType;

export type ResourceSource =
  | 'class'
  | 'subclass'
  | 'feat'
  | 'racial'
  | 'item';

export interface CharacterResource {
  id: string;
  name: string;
  max: number;
  current: number;
  rechargeType: ResourceRechargeType;
  source: ResourceSource;
  sourceName: string;
  icon: string;
  description: string;
  classLevelId: string | null;
  characterId: string;
  createdAt?: string;
  updatedAt?: string;
}

export const RESOURCE_SOURCES: { value: ResourceSource; label: string }[] = [
  { value: 'class', label: 'Klasse' },
  { value: 'subclass', label: 'Subklasse' },
  { value: 'feat', label: 'Talent' },
  { value: 'racial', label: 'Rasse' },
  { value: 'item', label: 'Gegenstand' },
];

export interface CharacterHitDice {
  id: string;
  dieType: string;
  total: number;
  used: number;
  classLevelId: string | null;
  characterId: string;
  createdAt?: string;
  updatedAt?: string;
}

export const HIT_DIE_TYPES = ['d6', 'd8', 'd10', 'd12'] as const;
export type HitDieType = (typeof HIT_DIE_TYPES)[number];