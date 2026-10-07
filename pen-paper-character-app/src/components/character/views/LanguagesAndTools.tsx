// pen-paper-character-app\src\components\character\view\LanguagesAndTools.tsx

'use client';

interface Proficiency {
  id: string;
  name: string;
  category: string;
  proficiencySource: string;
  sourceDetail: string;
}

interface LanguagesAndToolsProps {
  proficiencies: Proficiency[];
}

const sourceLabels: Record<string, string> = {
  class: 'Klasse',
  background: 'Hintergrund',
  race: 'Rasse',
  feat: 'Talent',
  custom: 'Benutzerdefiniert',
};

export function LanguagesAndTools({ proficiencies }: LanguagesAndToolsProps) {
  const languages = proficiencies.filter(p => p.category === 'language');
  const tools = proficiencies.filter(p => p.category === 'tool');

  if (languages.length === 0 && tools.length === 0) {
    return <div className="text-gray-500 text-sm italic">Keine Sprachen oder Werkzeuge vorhanden</div>;
  }

  return (
    <div className="space-y-3">
      {languages.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-1">🗣️ Sprachen</div>
          <div className="flex flex-wrap gap-2">
            {languages.map(lang => (
              <div key={lang.id} className="relative group">
                <span className="px-2 py-0.5 bg-gray-700 rounded-full text-xs cursor-help">
                  {lang.name}
                </span>
                {/* Tooltip */}
                <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-xs text-gray-300 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                  Quelle: {sourceLabels[lang.proficiencySource] || lang.proficiencySource}
                  {lang.sourceDetail && ` (${lang.sourceDetail})`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tools.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-1">🔧 Werkzeuge</div>
          <div className="flex flex-wrap gap-2">
            {tools.map(tool => (
              <div key={tool.id} className="relative group">
                <span className="px-2 py-0.5 bg-gray-700 rounded-full text-xs cursor-help">
                  {tool.name}
                </span>
                <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-xs text-gray-300 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                  Quelle: {sourceLabels[tool.proficiencySource] || tool.proficiencySource}
                  {tool.sourceDetail && ` (${tool.sourceDetail})`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}