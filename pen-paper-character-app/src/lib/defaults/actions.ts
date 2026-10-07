// pen-paper-character-app\src\lib\defaults\actions.ts

import type { ActionType } from '@/types/actions';

export interface DefaultAction {
  name: string;
  type: ActionType;
  description: string;
}

// ==================== D&D 5e STANDARD-AKTIONEN (SRD) ====================
// `type` ist zugleich die Library-Kategorie:
// action | bonus_action | reaction
export const DND_ACTIONS: DefaultAction[] = [
  // ==================== AKTIONEN ====================
  {
    name: 'Nahkampfangriff',
    type: 'action',
    description: 'Angriff mit einer Nahkampfwaffe gegen ein Ziel in Reichweite.',
  },
  {
    name: 'Fernkampfangriff',
    type: 'action',
    description: 'Angriff mit einer Fernkampfwaffe auf ein Ziel in Reichweite.',
  },
  {
    name: 'Ausweichen',
    type: 'action',
    description: 'Angriffe gegen dich haben Nachteil, Geschick-Rettungswürfe haben Vorteil.',
  },
  {
    name: 'Helfen',
    type: 'action',
    description: 'Gib einem Verbündeten Vorteil auf seinen nächsten Angriff gegen ein Ziel in Reichweite.',
  },
  {
    name: 'Verstecken',
    type: 'action',
    description: 'Heimlichkeitswurf, um dich zu verstecken, während du nicht klar sichtbar bist.',
  },
  {
    name: 'Zurückweichen',
    type: 'action',
    description: 'Deine Bewegung löst bis zum Ende des Zuges keine Gelegenheitsangriffe gegen dich aus.',
  },
  {
    name: 'Spurt',
    type: 'action',
    description: 'Zusätzliche Bewegung in Höhe deiner Bewegungsrate in diesem Zug.',
  },
  {
    name: 'Vorbereiten',
    type: 'action',
    description: 'Lege eine Aktion samt Auslöser fest und führe sie später als Reaktion aus.',
  },
  {
    name: 'Suchen',
    type: 'action',
    description: 'Weisheits-Wurf (Wahrnehmung oder Nachforschung), um etwas zu entdecken.',
  },
  {
    name: 'Zauber wirken',
    type: 'action',
    description: 'Wirke einen Zauber mit einer Wirkzeit von einer Aktion.',
  },
  {
    name: 'Gegenstand benutzen',
    type: 'action',
    description: 'Benutze einen Gegenstand oder interagiere mit einem Objekt in Reichweite.',
  },

  // ==================== BONUSAKTIONEN ====================
  {
    name: 'Zwei-Waffen-Kampf',
    type: 'bonus_action',
    description: 'Zusätzlicher Angriff mit einer leichten Waffe in der anderen Hand (ohne Attributsbonus auf Schaden).',
  },

  // ==================== REAKTIONEN ====================
  {
    name: 'Gelegenheitsangriff',
    type: 'reaction',
    description: 'Nahkampfangriff gegen eine Kreatur, die deine Reichweite freiwillig verlässt.',
  },
];
