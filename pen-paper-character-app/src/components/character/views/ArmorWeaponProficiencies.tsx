// pen-paper-character-app\src\components\character\view\ArmorWeaponProficiencies.tsx

'use client';

interface Proficiency {
  id: string;
  name: string;
  category: string;
  proficiencySource: string;
  sourceDetail: string;
}

interface ArmorWeaponProficienciesProps {
  proficiencies: Proficiency[];
}

const sourceLabels: Record<string, string> = {
  class: 'Klasse',
  background: 'Hintergrund',
  race: 'Rasse',
  feat: 'Talent',
  custom: 'Benutzerdefiniert',
};

const iconMap: Record<string, string> = {
  'Leichte Rüstung': '🥋',
  'Mittlere Rüstung': '🛡️',
  'Schwere Rüstung': '⚔️',
  'Schilde': '🛡️',
  'Einfache Waffen': '🗡️',
  'Kriegswaffen': '⚔️',
  'Fernkampfwaffen': '🏹',
};

export function ArmorWeaponProficiencies({ proficiencies }: ArmorWeaponProficienciesProps) {
  const armors = proficiencies.filter(p => p.category === 'armor');
  const weapons = proficiencies.filter(p => p.category === 'weapon');

  if (armors.length === 0 && weapons.length === 0) {
    return <div className="text-gray-500 text-sm italic">Keine Rüstungs- oder Waffenübungen vorhanden</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {armors.map(armor => (
        <div key={armor.id} className="relative group">
          <div className="flex items-center gap-1 text-sm bg-gray-800/50 rounded-lg px-2 py-1 cursor-help">
            <span>{iconMap[armor.name] || '🛡️'}</span>
            <span>{armor.name}</span>
          </div>
          <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-xs text-gray-300 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
            Quelle: {sourceLabels[armor.proficiencySource] || armor.proficiencySource}
            {armor.sourceDetail && ` (${armor.sourceDetail})`}
          </div>
        </div>
      ))}
      {weapons.map(weapon => (
        <div key={weapon.id} className="relative group">
          <div className="flex items-center gap-1 text-sm bg-gray-800/50 rounded-lg px-2 py-1 cursor-help">
            <span>{iconMap[weapon.name] || '⚔️'}</span>
            <span>{weapon.name}</span>
          </div>
          <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-xs text-gray-300 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
            Quelle: {sourceLabels[weapon.proficiencySource] || weapon.proficiencySource}
            {weapon.sourceDetail && ` (${weapon.sourceDetail})`}
          </div>
        </div>
      ))}
    </div>
  );
}