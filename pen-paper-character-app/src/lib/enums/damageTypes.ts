// src/lib/enums/damageTypes.ts

export const DAMAGE_TYPES = [
  'Wucht',
  'Stich',
  'Hieb',
  'Feuer',
  'Kälte',
  'Blitz',
  'Donner',
  'Säure',
  'Gift',
  'Psychisch',
  'Nekrotisch',
  'Strahlend',
  'Kraft',
] as const;

export type DamageType = (typeof DAMAGE_TYPES)[number];