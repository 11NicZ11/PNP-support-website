// src/lib/enums/rechargeTypes.ts
// Einzige Quelle für Rage/Recharge-Listen (Sprint 1B).
// bewusst 4 Einträge (short/long/never/manual) — die in der Aufgabe
// genannte 5. Option 'Per day' existiert in keiner bisherigen Kopie
// und wurde nicht neu eingeführt (User-Entscheidung).
// Hinweis: Die Labels sind überall identisch ausser ActionCard, das
// bisher 'Nie' statt 'Nie / Permanent' anzeigte — jetzt vereinheitlicht.
export const RECHARGE_TYPES = [
  { value: 'short', label: 'Kurze Rast', icon: '☕' },
  { value: 'long', label: 'Lange Rast', icon: '🛌' },
  { value: 'never', label: 'Nie / Permanent', icon: '♾️' },
  { value: 'manual', label: 'Manuell', icon: '✋' },
] as const;

export type RechargeType = (typeof RECHARGE_TYPES)[number]['value'];
