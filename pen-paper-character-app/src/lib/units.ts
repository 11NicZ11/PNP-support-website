// src/lib/units.ts
// Zentrale Umrechnungsfunktionen für Einheiten
// WICHTIG: DB speichert IMMER in Basiseinheit (kg, m).
// Die Umrechnung passiert nur bei Anzeige und Eingabe.

import { UnitSystem } from '@/types/character';

// ==================== GEWICHT ====================
// Base relationship (D&D 5e convention):
//   1 kg = 2 lb
// This is the single source of truth for weight conversion.
// Do not hardcode conversion factors elsewhere.
export const KG_TO_LB = 2.0;
export const LB_TO_KG = 1 / KG_TO_LB;

export const kgToLb = (kg: number): number => kg * KG_TO_LB;
export const lbToKg = (lb: number): number => lb * LB_TO_KG;

// ==================== DISTANZ ====================
// Basis-Beziehung (D&D-5e-Gitter-Konvention): 1.5 m = 5 ft
// Das ist die einzige Quelle der Wahrheit für Distanz-Umrechnung.
// Nirgendwo sonst Umrechnungsfaktoren hartkodieren.
export const BASE_METERS = 1.5;
export const BASE_FEET = 5;

// Abgeleitete Faktoren — nicht direkt in Komponenten verwenden.
export const FT_TO_M = BASE_METERS / BASE_FEET; // = 0.3
export const M_TO_FT = BASE_FEET / BASE_METERS; // = 10/3

export const mToFt = (m: number): number => m * M_TO_FT;
export const ftToM = (ft: number): number => ft * FT_TO_M;

// ==================== FORMATIERUNG ====================
/**
 * Formatiert einen kg-Wert in der Nutzer-Einheit.
 * @param kgFromDb Wert aus der Datenbank (immer kg)
 * @param unitSystem Ziel-Einheit
 */
export const formatWeight = (kgFromDb: number | null | undefined, unitSystem: UnitSystem): string => {
  if (kgFromDb === null || kgFromDb === undefined) return '';
  if (unitSystem === 'imperial') {
    const lb = kgToLb(kgFromDb);
    return `${roundForDisplay(lb)} lb`;
  }
  return `${roundForDisplay(kgFromDb)} kg`;
};

/**
 * Formatiert einen Meter-Wert in der Nutzer-Einheit.
 * @param mFromDb Wert aus der Datenbank (immer m)
 * @param unitSystem Ziel-Einheit
 */
export const formatDistance = (mFromDb: number | null | undefined, unitSystem: UnitSystem): string => {
  if (mFromDb === null || mFromDb === undefined) return '';
  if (unitSystem === 'imperial') {
    return `${roundForDisplay(mToFt(mFromDb))} ft`;
  }
  return `${roundForDisplay(mFromDb)} m`;
};

/**
 * Formatiert eine Distanz, die als String in der DB steht (z.B. aus range-Feld).
 * Erkennt automatisch die Einheit im String und konvertiert sie.
 * Beispiele: "30/120" (ft), "9/36" (m), "1.5 m", "5 ft"
 */
export const formatDistanceString = (
  rangeFromDb: string | null | undefined,
  unitSystem: UnitSystem
): string => {
  if (!rangeFromDb) return '';
  // Wenn "30/120" ohne Einheit → als ft interpretieren (D&D-Standard)
  const trimmed = rangeFromDb.trim();
  if (/^\d+\s*\/\s*\d+$/.test(trimmed)) {
    const [a, b] = trimmed.split('/').map((s) => parseFloat(s.trim()));
    if (unitSystem === 'metric') {
      return `${roundForDisplay(ftToM(a))}/${roundForDisplay(ftToM(b))} m`;
    }
    return `${a}/${b} ft`;
  }
  if (/ft$/i.test(trimmed)) {
    const ft = parseFloat(trimmed);
    if (unitSystem === 'metric') return `${roundForDisplay(ftToM(ft))} m`;
    return `${ft} ft`;
  }
  if (/m$/i.test(trimmed)) {
    const m = parseFloat(trimmed);
    if (unitSystem === 'imperial') return `${roundForDisplay(mToFt(m))} ft`;
    return `${m} m`;
  }
  return trimmed;
};

/**
 * Parst eine Nutzereingabe (in der aktuellen Einheit) und gibt den Wert
 * in der Basiseinheit (kg) zurück.
 */
export const parseWeightInput = (
  input: string | number | null | undefined,
  unitSystem: UnitSystem
): number | null => {
  if (input === null || input === undefined || input === '') return null;
  const value = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(value)) return null;
  return unitSystem === 'imperial' ? lbToKg(value) : value;
};

/**
 * Parst eine Nutzereingabe (in der aktuellen Einheit) und gibt den Wert
 * in der Basiseinheit (m) zurück.
 */
export const parseDistanceInput = (
  input: string | number | null | undefined,
  unitSystem: UnitSystem
): number | null => {
  if (input === null || input === undefined || input === '') return null;
  const value = typeof input === 'string' ? parseFloat(input) : input;
  if (isNaN(value)) return null;
  return unitSystem === 'imperial' ? ftToM(value) : value;
};

/**
 * Zeigt einen Wert aus der DB in der Nutzer-Einheit an (für Input-Felder).
 * Der Input-Wert wird ohne Einheit zurückgegeben.
 */
export const displayWeightValue = (
  kgFromDb: number | null | undefined,
  unitSystem: UnitSystem
): string => {
  if (kgFromDb === null || kgFromDb === undefined) return '';
  if (unitSystem === 'imperial') return String(roundForDisplay(kgToLb(kgFromDb)));
  return String(roundForDisplay(kgFromDb));
};

export const displayDistanceValue = (
  mFromDb: number | null | undefined,
  unitSystem: UnitSystem
): string => {
  if (mFromDb === null || mFromDb === undefined) return '';
  if (unitSystem === 'imperial') return String(roundForDisplay(mToFt(mFromDb)));
  return String(roundForDisplay(mFromDb));
};

// ==================== HILFSFUNKTIONEN ====================
/**
 * Rundet für die Anzeige auf max. 2 Dezimalstellen und entfernt trailing zeros.
 */
const roundForDisplay = (value: number): string => {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
};

/**
 * Gibt das Einheiten-Kürzel für die aktuelle Einstellung zurück.
 */
export const getWeightUnitLabel = (unitSystem: UnitSystem): string =>
  unitSystem === 'imperial' ? 'lb' : 'kg';

export const getDistanceUnitLabel = (unitSystem: UnitSystem): string =>
  unitSystem === 'imperial' ? 'ft' : 'm';