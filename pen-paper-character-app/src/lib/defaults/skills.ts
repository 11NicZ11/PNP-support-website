// pen-paper-character-app\src\lib\defaults\skills.ts

export interface DefaultSkill {
  name: string;
  attribute: 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';
  description: string;
}

export const DND_SKILLS: DefaultSkill[] = [
  // Stärke
  { name: 'Athletik', attribute: 'strength', description: 'Klettern, Schwimmen, Springen' },
  
  // Geschick
  { name: 'Akrobatik', attribute: 'dexterity', description: 'Balancieren, Überschläge, Flips' },
  { name: 'Fingerfertigkeit', attribute: 'dexterity', description: 'Prestidigitation, Taschendiebstahl' },
  { name: 'Heimlichkeit', attribute: 'dexterity', description: 'Schleichen, Verstecken' },
  
  // Intelligenz
  { name: 'Arkane Kunde', attribute: 'intelligence', description: 'Wissen über Zauber, magische Gegenstände' },
  { name: 'Geschichtswissen', attribute: 'intelligence', description: 'Wissen über historische Ereignisse' },
  { name: 'Nachforschung', attribute: 'intelligence', description: 'Hinweise finden, recherchieren' },
  { name: 'Naturkunde', attribute: 'intelligence', description: 'Pflanzen, Tiere, Wetter' },
  { name: 'Religionswissen', attribute: 'intelligence', description: 'Götter, Kulte, heilige Texte' },
  
  // Weisheit
  { name: 'Einsicht', attribute: 'wisdom', description: 'Lügen erkennen, Motive verstehen' },
  { name: 'Medizin', attribute: 'wisdom', description: 'Erste Hilfe, Krankheiten diagnostizieren' },
  { name: 'Tierkunde', attribute: 'wisdom', description: 'Tiere beruhigen, reiten, lenken' },
  { name: 'Wahrnehmung', attribute: 'wisdom', description: 'Verstecktes entdecken, lauschen' },
  { name: 'Überlebenskunst', attribute: 'wisdom', description: 'Spuren lesen, Nahrung finden' },
  
  // Charisma
  { name: 'Einschüchtern', attribute: 'charisma', description: 'Drohen, einschüchtern' },
  { name: 'Leistung', attribute: 'charisma', description: 'Musizieren, Schauspielern, Reden halten' },
  { name: 'Täuschung', attribute: 'charisma', description: 'Lügen, Bluffen, Verkleiden' },
  { name: 'Überreden', attribute: 'charisma', description: 'Freundlich überzeugen, verhandeln' },
];