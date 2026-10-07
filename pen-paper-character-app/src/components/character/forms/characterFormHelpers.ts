// src/components/character/forms/characterFormHelpers.ts
import { ClassLevel } from '../editors/ClassLevelsEditor';
import { ClassProgression } from '@/types/character';
import { DEFAULT_RACE_DATA } from './characterFormDefaults';

export function migrateClassProgression(
  value: string | undefined | null
): ClassProgression {
  if (value === 'dual') return 'dual';
  return 'normal';
}

export function migrateClassLevels(raw: any[]): ClassLevel[] {
  return (raw || []).map((cl) => ({
    ...cl,
    track: cl.track === 1 ? 1 : 0,
    savingThrowProficiencies: Array.isArray(cl.savingThrowProficiencies)
      ? cl.savingThrowProficiencies
      : [],
    features: Array.isArray(cl.features) ? cl.features : [],
  }));
}

export function migrateRaceData(raw: any) {
  if (!raw) return DEFAULT_RACE_DATA;
  return {
    ...DEFAULT_RACE_DATA,
    ...raw,
    hasSubrace: raw.hasSubrace ?? (raw.subraces?.length > 0),
    subraces: (raw.subraces || []).map((sr: any) => ({
      name: sr.name || '',
      description: sr.description || '',
    })),
    bonusArmorClass: raw.bonusArmorClass ?? 0,
    bonusHp: raw.bonusHp ?? 0,
  };
}

export function parseEquipmentDefenseList(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}