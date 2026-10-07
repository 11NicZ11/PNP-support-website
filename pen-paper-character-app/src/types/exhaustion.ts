// src/types/exhaustion.ts

export interface ExhaustionLevel {
  level: number;
  effects: string[];
}

export const EXHAUSTION_LEVELS: ExhaustionLevel[] = [
  {
    level: 0,
    effects: ['Keine Erschöpfung'],
  },
  {
    level: 1,
    effects: ['Nachteil auf Attributsproben'],
  },
  {
    level: 2,
    effects: ['Bewegungsrate halbiert'],
  },
  {
    level: 3,
    effects: ['Nachteil auf Angriffs- und Rettungswürfe'],
  },
  {
    level: 4,
    effects: ['Maximale HP halbiert'],
  },
  {
    level: 5,
    effects: ['Bewegungsrate auf 0'],
  },
  {
    level: 6,
    effects: ['Tod'],
  },
];

export const MAX_EXHAUSTION_LEVEL = 6;

export function getExhaustionEffects(level: number): string[] {
  const clamped = Math.max(0, Math.min(MAX_EXHAUSTION_LEVEL, level));
  const all: string[] = [];
  for (let i = 1; i <= clamped; i++) {
    all.push(...(EXHAUSTION_LEVELS[i]?.effects || []));
  }
  return all;
}

export function hasDisadvantageOnAbilityChecks(level: number): boolean {
  return level >= 1;
}

export function hasHalvedSpeed(level: number): boolean {
  return level >= 2;
}

export function hasZeroSpeed(level: number): boolean {
  return level >= 5;
}

export function hasDisadvantageOnAttacksAndSaves(level: number): boolean {
  return level >= 3;
}

export function hasHalvedMaxHp(level: number): boolean {
  return level >= 4;
}

export function isDead(level: number): boolean {
  return level >= 6;
}