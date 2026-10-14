// pen-paper-character-app\src\lib\defaults\weaponProperties.ts

export interface DefaultWeaponProperty {
  name: string;
  description: string;
  data?: Record<string, any>;
}

// ==================== D&D 5e WAFFEN-EIGENSCHAFTEN (SRD) ====================
export const DND_WEAPON_PROPERTIES: DefaultWeaponProperty[] = [
  {
    name: 'Ammunition',
    description: 'Zum Schießen brauchst du Munition — jede Attacke verbraucht ein Stück.',
  },
  {
    name: 'Finesse',
    description: 'Für Angriffs- und Schadenswürfe darfst du Stärke oder Geschicklichkeit verwenden.',
  },
  {
    name: 'Heavy',
    description: 'Kleine Kreaturen haben Nachteil auf Angriffswürfe mit dieser Waffe.',
  },
  {
    name: 'Improvised',
    description: 'Ein behelfsmäßiger Gegenstand als Waffe — verursacht meist 1W4 Schaden.',
  },
  {
    name: 'Light',
    description: 'Klein und handlich: ideal für den Kampf mit zwei Waffen.',
  },
  {
    name: 'Loading',
    description: 'Du kannst damit nur einen Schuss pro Aktion, Bonusaktion oder Reaktion abgeben.',
  },
  {
    name: 'Range',
    description: 'Die Waffe hat einen normalen und einen weiten Bereich; außerhalb des normalen Bereichs mit Nachteil.',
  },
  {
    name: 'Reach',
    description: 'Diese Waffe erhöht deine Reichweite um 1,5 Meter (5 Fuß).',
    data: { hasValue: true, defaultValue: 1.5 },
  },
  {
    name: 'Special',
    description: 'Diese Waffe folgt eigenen Regeln, die in ihrer Beschreibung stehen.',
  },
  {
    name: 'Thrown',
    description: 'Du kannst die Waffe werfen, um einen Fernkampfangriff auszuführen.',
  },
  {
    name: 'Two-Handed',
    description: 'Diese Waffe muss mit beiden Händen geführt werden.',
  },
  {
    name: 'Versatile',
    description: 'Diese Waffe kann ein- oder zweihändig geführt werden und verursacht zweihändig höheren Schaden.',
  },
];
