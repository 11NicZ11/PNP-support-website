// src/lib/enums/alignments.ts
// Einzige Quelle für Ausrichtungs-Optionen (Sprint 1B).
// Identisch zu den bisherigen Kopien in RaceEditor und BackgroundEditTab.
export const ALIGNMENT_OPTIONS = [
  { value: 'Rechtschaffen Gut', label: 'Rechtschaffen Gut' },
  { value: 'Rechtschaffen Neutral', label: 'Rechtschaffen Neutral' },
  { value: 'Rechtschaffen Böse', label: 'Rechtschaffen Böse' },
  { value: 'Neutral Gut', label: 'Neutral Gut' },
  { value: 'Neutral', label: 'Neutral' },
  { value: 'Neutral Böse', label: 'Neutral Böse' },
  { value: 'Chaotisch Gut', label: 'Chaotisch Gut' },
  { value: 'Chaotisch Neutral', label: 'Chaotisch Neutral' },
  { value: 'Chaotisch Böse', label: 'Chaotisch Böse' },
] as const;

export type Alignment = (typeof ALIGNMENT_OPTIONS)[number]['value'];
