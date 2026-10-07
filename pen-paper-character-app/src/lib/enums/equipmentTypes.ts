// src/lib/enums/equipmentTypes.ts
// Runtime-Enums: reine Kategorien ohne Editierbedarf (keine Library-Seed-Quelle).
// Siehe .clinerules/04-file-refactor-targets.md: Ausnahme „reine Konstanten".

export const EQUIPMENT_TYPES: Record<string, { label: string; icon: string; category: string }> = {
  weapon: { label: 'Waffe', icon: '⚔️', category: 'Waffen' },
  armor: { label: 'Rüstung', icon: '🛡️', category: 'Rüstungen' },
  shield: { label: 'Schild', icon: '🛡️', category: 'Rüstungen' },
  accessory: { label: 'Schmuck', icon: '💍', category: 'Zubehör' },
  scroll: { label: 'Zauberrolle', icon: '📜', category: 'Magische Gegenstände' },
  potion: { label: 'Trank', icon: '🧪', category: 'Verbrauchsmaterial' },
  focus: { label: 'Magischer Fokus', icon: '🪄', category: 'Magische Gegenstände' },
  wondrous: { label: 'Wunderbarer Gegenstand', icon: '✨', category: 'Magische Gegenstände' },
  tool: { label: 'Werkzeug', icon: '🔧', category: 'Werkzeuge' },
  instrument: { label: 'Musikinstrument', icon: '🎵', category: 'Werkzeuge' },
  mount: { label: 'Reittier', icon: '🐴', category: 'Reittiere' },
  mount_gear: { label: 'Reittier-Ausrüstung', icon: '🛠️', category: 'Reittiere' },
  trade_goods: { label: 'Handelswaren', icon: '💰', category: 'Handelswaren' },
  clothing: { label: 'Kleidung', icon: '👘', category: 'Kleidung' },
  other: { label: 'Andere Gegenstände', icon: '📦', category: 'Sonstiges' },
};

export const ARMOR_TYPES = ['light', 'medium', 'heavy'];

// WICHTIG: Nicht mit `SPELL_SCHOOLS` aus `src/types/spells.ts` verwechseln.
// Diese Version ist eine reine String-Liste für die Formular-Auswahl;
// die dortige Version ist `{ value, label, color }` mit deutschen Labels.
export const SPELL_SCHOOLS = [
  'abjuration',
  'conjuration',
  'divination',
  'enchantment',
  'evocation',
  'illusion',
  'necromancy',
  'transmutation',
];

export const SPELL_COMPONENTS = ['V', 'S', 'M'];

export const ACTION_TYPES = [
  'action',
  'bonus_action',
  'reaction',
  'legendary_action',
  'lair_action',
  'free_action',
];