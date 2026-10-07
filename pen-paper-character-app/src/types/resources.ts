// src/types/resources.ts

export type ResourceRechargeType =
  | 'short'
  | 'long'
  | 'never'
  | 'manual';

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

export const RESOURCE_RECHARGE_TYPES: { value: ResourceRechargeType; label: string; icon: string }[] = [
  { value: 'short', label: 'Kurze Rast', icon: '☕' },
  { value: 'long', label: 'Lange Rast', icon: '🛌' },
  { value: 'never', label: 'Nie / Permanent', icon: '♾️' },
  { value: 'manual', label: 'Manuell', icon: '✋' },
];

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