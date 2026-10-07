// pen-paper-character-app\src\lib\defaults\proficiencies.ts

export interface DefaultProficiency {
  name: string;
  category: 'language' | 'armor' | 'weapon' | 'tool' | 'other';
  description: string;
  icon: string;
}

export const DND_LANGUAGES: DefaultProficiency[] = [
  { name: 'Common', category: 'language', description: 'Die Gemeinsprache', icon: '🗣️' },
  { name: 'Elvish', category: 'language', description: 'Die Sprache der Elfen', icon: '🌿' },
  { name: 'Dwarvish', category: 'language', description: 'Die Sprache der Zwerge', icon: '⛏️' },
  { name: 'Orcish', category: 'language', description: 'Die Sprache der Orks', icon: '👹' },
  { name: 'Draconic', category: 'language', description: 'Die Sprache der Drachen', icon: '🐉' },
  { name: 'Gnomish', category: 'language', description: 'Die Sprache der Gnome', icon: '🔧' },
  { name: 'Halfling', category: 'language', description: 'Die Sprache der Halblinge', icon: '🍃' },
  { name: 'Giant', category: 'language', description: 'Die Sprache der Riesen', icon: '🗻' },
  { name: 'Goblin', category: 'language', description: 'Die Sprache der Goblins', icon: '👺' },
];

export const DND_ARMORS: DefaultProficiency[] = [
  { name: 'Leichte Rüstung', category: 'armor', description: 'Gepolsterte, Leder- und Lederschuppenrüstungen', icon: '🥋' },
  { name: 'Mittlere Rüstung', category: 'armor', description: 'Schuppenpanzer, Brustpanzer, Halbplatte', icon: '🛡️' },
  { name: 'Schwere Rüstung', category: 'armor', description: 'Kettenhemd, Plattenpanzer', icon: '⚔️' },
  { name: 'Schilde', category: 'armor', description: 'Ermöglicht das Tragen eines Schildes', icon: '🛡️' },
];

export const DND_WEAPONS: DefaultProficiency[] = [
  { name: 'Einfache Waffen', category: 'weapon', description: 'Keule, Dolch, Speer, Schleuder, etc.', icon: '🗡️' },
  { name: 'Kriegswaffen', category: 'weapon', description: 'Langschwert, Rapier, Kriegshammer, etc.', icon: '⚔️' },
  { name: 'Fernkampfwaffen', category: 'weapon', description: 'Langbogen, Armbrust, Wurfwaffen', icon: '🏹' },
];

export const DND_TOOLS: DefaultProficiency[] = [
  { name: 'Diebeswerkzeuge', category: 'tool', description: 'Zum Öffnen von Schlössern und Deaktivieren von Fallen', icon: '🔧' },
  { name: 'Brauereiwerkzeuge', category: 'tool', description: 'Zum Brauen von Bier und Ale', icon: '🍺' },
  { name: 'Schmiedewerkzeuge', category: 'tool', description: 'Zum Schmieden von Metall', icon: '🔨' },
  { name: 'Alchemistenwerkzeuge', category: 'tool', description: 'Zum Herstellen von Tränken', icon: '🧪' },
  { name: 'Kartographenwerkzeuge', category: 'tool', description: 'Zum Erstellen von Karten', icon: '🗺️' },
  { name: 'Malwerkzeuge', category: 'tool', description: 'Zum Malen und Zeichnen', icon: '🎨' },
  { name: 'Musikinstrumente', category: 'tool', description: 'Zum Spielen von Musik', icon: '🎵' },
];

export const DND_PROFICIENCIES = {
  languages: DND_LANGUAGES,
  armors: DND_ARMORS,
  weapons: DND_WEAPONS,
  tools: DND_TOOLS,
};