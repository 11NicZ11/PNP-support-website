// src/lib/utils.ts
// Zentrale Hilfsfunktionen für das gesamte Projekt

// ==================== JSON PARSE ====================
export const parseJsonArray = (val: any): any[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
};

export const parseJsonObject = (val: any): any => {
  if (!val) return {};
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return {}; }
};

export const stringifyJsonArray = (val: any): string => {
  if (!val) return '[]';
  if (typeof val === 'string') return val;
  try { return JSON.stringify(val); } catch { return '[]'; }
};

export const stringifyJsonObject = (val: any): string => {
  if (!val) return '{}';
  if (typeof val === 'string') return val;
  try { return JSON.stringify(val); } catch { return '{}'; }
};

// ==================== ATTRIBUT-MODIFIER ====================
export const getModifier = (value: number): number => Math.floor((value - 10) / 2);

export const getModifierText = (value: number): string => {
  const mod = getModifier(value);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export const getAttributeValue = (attributes: { name: string; value: number }[], name: string): number => {
  const attr = attributes.find(a => a.name === name);
  return attr ? attr.value : 10;
};

// ==================== BONUS-KALKULATION ====================
export const getCombinedBonuses = (
  raceBonuses: Record<string, number> = {},
  bgBonuses: Record<string, number> = {}
): Record<string, number> => {
  const result: Record<string, number> = {};
  const keys = new Set([...Object.keys(raceBonuses), ...Object.keys(bgBonuses)]);
  keys.forEach(key => {
    result[key] = (raceBonuses[key] || 0) + (bgBonuses[key] || 0);
  });
  return result;
};

// ==================== STORAGE HELPERS ====================
export const getStorageKey = (characterId: string, prefix: string): string => 
  `${prefix}_${characterId}`;

export const saveToStorage = (key: string, data: any): void => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
};

export const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
};

// ==================== DEFENSE HELPERS ====================
export const isImmune = (immunities: string[], damageType: string): boolean =>
  immunities.some(i => i.toLowerCase() === damageType.toLowerCase());

export const isResistant = (resistances: string[], damageType: string): boolean =>
  resistances.some(r => r.toLowerCase() === damageType.toLowerCase());

export const calculateDamage = (
  amount: number,
  damageType: string,
  immunities: string[],
  resistances: string[]
): number => {
  if (isImmune(immunities, damageType)) return 0;
  if (isResistant(resistances, damageType)) return Math.floor(amount / 2);
  return amount;
};