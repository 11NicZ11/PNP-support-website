// src/lib/defaults/defenses.ts

import { DAMAGE_TYPES } from '../enums/damageTypes';

export interface DefaultDefense {
  name: string;
  description: string;
}

export interface DefaultStatusEffect {
  name: string;
  description: string;
  icon: string;
  defaultDuration: number | null;
  durationUnit: string;
  immunityKey: string | null;
}

// ==================== SCHADENSARTEN ====================
// Namen kanonisch in `enums/damageTypes.ts`. Hier nur die Beschreibungen.
// Neuer Schadenstyp: DAMAGE_TYPES ergänzen + Beschreibung hier hinzufügen.
const DAMAGE_TYPE_DESCRIPTIONS: Record<string, string> = {
  Wucht: 'Schaden durch stumpfe Waffen (Hämmer, Keulen)',
  Stich: 'Schaden durch spitze Waffen (Pfeile, Speere, Dolche)',
  Hieb: 'Schaden durch scharfe Waffen (Äxte, Schwerter)',
  Feuer: 'Schaden durch Feuer und Hitze',
  Kälte: 'Schaden durch extreme Kälte und Eis',
  Blitz: 'Schaden durch elektrische Energie',
  Donner: 'Schaden durch Schallwellen und Vibrationen',
  Säure: 'Schaden durch ätzende Substanzen',
  Gift: 'Schaden durch toxische Substanzen',
  Psychisch: 'Schaden durch mentale Energie',
  Nekrotisch: 'Schaden durch todesartige Energie',
  Strahlend: 'Schaden durch heilige oder reine Energie',
  Kraft: 'Schaden durch reine magische Energie',
};

export const DND_DAMAGE_TYPES: DefaultDefense[] = DAMAGE_TYPES.map((name) => ({
  name,
  description: DAMAGE_TYPE_DESCRIPTIONS[name] || '',
}));

// ==================== ZUSTANDS-IMMUNITÄTEN ====================
export const DND_CONDITIONS: DefaultDefense[] = [
  { name: 'Vergiftet', description: 'Nachteil auf Angriffs- und Rettungswürfe' },
  { name: 'Paralyziert', description: 'Kann sich nicht bewegen oder handeln' },
  { name: 'Betäubt', description: 'Kann keine Aktionen durchführen' },
  { name: 'Verängstigt', description: 'Nachteil auf Angriffe solange die Quelle sichtbar ist' },
  { name: 'Bezaubert', description: 'Kann den Verursacher nicht angreifen' },
  { name: 'Bewusstlos', description: 'Liegt am Boden, kann nicht handeln' },
  { name: 'Festgehalten', description: 'Bewegungsgeschwindigkeit 0, Nachteil auf Angriffe' },
  { name: 'Geblendet', description: 'Automatischer Fehlschlag bei Sicht-Abhängigkeiten' },
  { name: 'Taub', description: 'Automatischer Fehlschlag bei Hören-Abhängigkeiten' },
  { name: 'Verkleinert', description: 'Schadenswürfe reduziert, Nachteil auf Stärke' },
  { name: 'Vergrößert', description: 'Schadenswürfe erhöht, Vorteil auf Stärke' },
  { name: 'Unsichtbar', description: 'Angriffe mit Vorteil, Angriffe gegen dich mit Nachteil' },
];

// ==================== STATUS-EFFEKTE ====================
export const DND_STATUS_EFFECTS: DefaultStatusEffect[] = [
  { name: 'Vergiftet', description: 'Nachteil auf Angriffs- und Rettungswürfe', icon: '☠️', defaultDuration: null, durationUnit: 'rounds', immunityKey: 'Vergiftet' },
  { name: 'Paralyziert', description: 'Kann sich nicht bewegen oder handeln', icon: '⛓️', defaultDuration: null, durationUnit: 'rounds', immunityKey: 'Paralyziert' },
  { name: 'Betäubt', description: 'Kann keine Aktionen durchführen', icon: '💫', defaultDuration: null, durationUnit: 'rounds', immunityKey: 'Betäubt' },
  { name: 'Verängstigt', description: 'Nachteil auf Angriffe solange die Quelle sichtbar ist', icon: '😨', defaultDuration: null, durationUnit: 'rounds', immunityKey: 'Verängstigt' },
  { name: 'Bezaubert', description: 'Kann den Verursacher nicht angreifen', icon: '❤️', defaultDuration: null, durationUnit: 'rounds', immunityKey: 'Bezaubert' },
  { name: 'Bewusstlos', description: 'Liegt am Boden, kann nicht handeln', icon: '😵', defaultDuration: null, durationUnit: 'rounds', immunityKey: 'Bewusstlos' },
  { name: 'Festgehalten', description: 'Bewegungsgeschwindigkeit 0, Nachteil auf Angriffe', icon: '🪢', defaultDuration: null, durationUnit: 'rounds', immunityKey: 'Festgehalten' },
  { name: 'Geblendet', description: 'Automatischer Fehlschlag bei Sicht-Abhängigkeiten', icon: '👁️‍🗨️', defaultDuration: null, durationUnit: 'rounds', immunityKey: 'Geblendet' },
  { name: 'Taub', description: 'Automatischer Fehlschlag bei Hören-Abhängigkeiten', icon: '👂', defaultDuration: null, durationUnit: 'rounds', immunityKey: 'Taub' },
  { name: 'Konzentriert', description: 'Konzentriert sich auf einen Zauber', icon: '🧘', defaultDuration: null, durationUnit: 'rounds', immunityKey: null },
  { name: 'Unsichtbar', description: 'Angriffe mit Vorteil, Angriffe gegen dich mit Nachteil', icon: '👻', defaultDuration: 10, durationUnit: 'minutes', immunityKey: null },
];