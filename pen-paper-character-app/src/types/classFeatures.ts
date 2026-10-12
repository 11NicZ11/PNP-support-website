// src/types/classFeatures.ts
import { RECHARGE_TYPES, type RechargeType } from '@/lib/enums/rechargeTypes';

// Bestehende Export-Namen bleiben erhalten (06-do-not: exports nicht umbenennen).
export { RECHARGE_TYPES as CLASS_FEATURE_RECHARGE };
export type ClassFeatureRecharge = RechargeType;

export type ClassFeatureSource =
  | 'class'
  | 'subclass'
  | 'feat'
  | 'asi'
  | 'racial'
  | 'background';

export type ClassFeatureType =
  | 'passive'
  | 'action'
  | 'bonus_action'
  | 'reaction'
  | 'free_action';

// 🔥 NEU: Feature-Kategorie für Level-Spalten
export type ClassFeatureKind =
  | 'feature'         // Normales Klassen-/Subklassen-Feature
  | 'asi'             // Attributswert-Erhöhung
  | 'extra_attack'    // Zusätzlicher Angriff
  | 'spell'           // Zauber erhalten
  | 'subclass_choice' // Subklassen-Wahl
  | 'other';          // Sonstiges

export interface ClassFeature {
  id: string;
  name: string;
  description: string;
  level: number;
  source: ClassFeatureSource;
  sourceDetail: string;
  type: ClassFeatureType;
  isConcentration: boolean;
  savingThrow: string;
  savingThrowDC: number | null;
  attackRoll: boolean;
  linkedActionId: string | null;
  usesPerRest: number | null;
  rechargeType: ClassFeatureRecharge;
  sourceReference: string;
  prerequisites: string;
  isActive: boolean;

  // Verknüpfungen
  linkedFormId: string | null;
  linkedCompanionId: string | null;

  // 🔥 NEU: Kategorie
  kind: ClassFeatureKind;
}

export const EMPTY_CLASS_FEATURE: ClassFeature = {
  id: '',
  name: '',
  description: '',
  level: 1,
  source: 'class',
  sourceDetail: '',
  type: 'passive',
  isConcentration: false,
  savingThrow: '',
  savingThrowDC: null,
  attackRoll: false,
  linkedActionId: null,
  usesPerRest: null,
  rechargeType: 'never',
  sourceReference: '',
  prerequisites: '',
  isActive: true,
  linkedFormId: null,
  linkedCompanionId: null,
  kind: 'feature',
};

export const CLASS_FEATURE_SOURCES: { value: ClassFeatureSource; label: string; icon: string }[] = [
  { value: 'class', label: 'Klasse', icon: '⚔️' },
  { value: 'subclass', label: 'Subklasse', icon: '🎭' },
  { value: 'feat', label: 'Talent', icon: '🌟' },
  { value: 'asi', label: 'Attributsverbesserung', icon: '📈' },
  { value: 'racial', label: 'Rasse', icon: '🧝' },
  { value: 'background', label: 'Hintergrund', icon: '📜' },
];

export const CLASS_FEATURE_TYPES: { value: ClassFeatureType; label: string; icon: string }[] = [
  { value: 'passive', label: 'Passiv', icon: '💤' },
  { value: 'action', label: 'Aktion', icon: '⚡' },
  { value: 'bonus_action', label: 'Bonusaktion', icon: '✨' },
  { value: 'reaction', label: 'Reaktion', icon: '🔄' },
  { value: 'free_action', label: 'Freie Aktion', icon: '🆓' },
];

// 🔥 NEU: Kind-Labels
export const CLASS_FEATURE_KINDS: {
  value: ClassFeatureKind;
  label: string;
  icon: string;
  color: string;
}[] = [
  { value: 'feature', label: 'Feature', icon: '⚡', color: 'text-purple-300' },
  { value: 'asi', label: 'Attributswert', icon: '📈', color: 'text-blue-300' },
  { value: 'extra_attack', label: 'Extra Angriff', icon: '⚔️', color: 'text-orange-300' },
  { value: 'spell', label: 'Zauber', icon: '✨', color: 'text-cyan-300' },
  { value: 'subclass_choice', label: 'Subklasse', icon: '🎭', color: 'text-pink-300' },
  { value: 'other', label: 'Sonstiges', icon: '📝', color: 'text-gray-300' },
];

export function parseFeatures(json: string): ClassFeature[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((f: any) => ({
      ...EMPTY_CLASS_FEATURE,
      ...f,
      linkedFormId: f.linkedFormId ?? null,
      linkedCompanionId: f.linkedCompanionId ?? null,
      kind: f.kind ?? 'feature',
    }));
  } catch {
    return [];
  }
}

export function stringifyFeatures(features: ClassFeature[]): string {
  try {
    return JSON.stringify(features);
  } catch {
    return '[]';
  }
}