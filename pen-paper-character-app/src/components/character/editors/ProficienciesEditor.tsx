// src/components/character/editors/ProficienciesEditor.tsx
'use client';

import { useState } from 'react';
import { useLibrary } from '@/hooks/useLibrary';

interface Proficiency {
  id: string;
  name: string;
  category: 'language' | 'armor' | 'weapon' | 'tool';
  description?: string;
  icon: string;
  isProficient: boolean;
  proficiencySource: string;
  sourceDetail: string;
  // Library-Reference: FK auf LibraryEntry (nullable, SetNull).
  libraryEntryId?: string | null;
}

interface ProficienciesEditorProps {
  proficiencies: Proficiency[];
  onUpdate: (proficiencies: Proficiency[]) => void;
  characterId?: string;
}

const sourceOptions = [
  { value: 'class', label: 'Klasse' },
  { value: 'background', label: 'Hintergrund' },
  { value: 'race', label: 'Rasse' },
  { value: 'feat', label: 'Talent' },
  { value: 'custom', label: 'Benutzerdefiniert' },
];

const CATEGORY_TABS: { key: 'language' | 'armor' | 'weapon' | 'tool'; label: string }[] = [
  { key: 'language', label: '🗣️ Sprachen' },
  { key: 'armor', label: '🛡️ Rüstungen' },
  { key: 'weapon', label: '⚔️ Waffen' },
  { key: 'tool', label: '🔧 Werkzeuge' },
];

const DEFAULT_ICON: Record<string, string> = {
  language: '🗣️',
  armor: '🛡️',
  weapon: '⚔️',
  tool: '🔧',
};

export function ProficienciesEditor({
  proficiencies,
  onUpdate,
}: ProficienciesEditorProps) {
  const [activeCategory, setActiveCategory] = useState<
    'language' | 'armor' | 'weapon' | 'tool'
  >('language');
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSource, setNewSource] = useState('custom');
  const [newSourceDetail, setNewSourceDetail] = useState('');

  const { entries: libraryEntries, loading, create } = useLibrary({
    type: 'proficiency',
  });

  const currentProficiencies = proficiencies.filter(
    (p) => p.category === activeCategory
  );

  const suggestions = libraryEntries
    .filter((e) => e.category === activeCategory)
    .sort((a, b) => a.name.localeCompare(b.name));

  const isAdded = (name: string) =>
    currentProficiencies.some((p) => p.name === name);

  const addProficiency = (
    name: string,
    icon: string,
    src = 'library',
    srcDetail = '',
    libraryEntryId: string | null = null
  ) => {
    if (!name.trim()) return;
    if (
      proficiencies.some(
        (p) => p.name === name && p.category === activeCategory
      )
    ) {
      return;
    }
    const newProf: Proficiency = {
      id: `prof-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      category: activeCategory,
      icon,
      isProficient: true,
      proficiencySource: src,
      sourceDetail: srcDetail,
      libraryEntryId,
    };
    onUpdate([...proficiencies, newProf]);
  };

  const removeProficiency = (id: string) => {
    onUpdate(proficiencies.filter((p) => p.id !== id));
  };

  const addCustomAndPersist = async () => {
    const name = newName.trim();
    if (!name) return;

    const created = await create({
      type: 'proficiency',
      category: activeCategory,
      name,
      icon: DEFAULT_ICON[activeCategory] || '📚',
    });

    addProficiency(
      name,
      DEFAULT_ICON[activeCategory] || '📚',
      newSource,
      newSourceDetail,
      created?.id ?? null
    );

    setNewName('');
    setNewSource('custom');
    setNewSourceDetail('');
    setShowForm(false);
  };

  const libraryUrl = `/library?type=proficiency&category=${activeCategory}`;

  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <h3 className="text-lg font-semibold">
          📚 Übungen (Sprachen, Rüstungen, Waffen, Werkzeuge)
        </h3>
        <a
          href={libraryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          title="Bibliothek in neuem Tab öffnen"
        >
          📚 Bibliothek
        </a>
      </div>

      <div className="flex border-b border-gray-700 mb-4">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveCategory(tab.key)}
            className={`px-3 py-1 text-sm ${
              activeCategory === tab.key
                ? 'border-b-2 border-purple-500 text-purple-400'
                : 'text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {currentProficiencies.map((prof) => (
          <div
            key={prof.id}
            className="bg-purple-600/30 border border-purple-500 rounded-lg px-2 py-1 flex items-center gap-1 group"
          >
            <span>{prof.icon}</span>
            <span className="text-sm">{prof.name}</span>
            {prof.proficiencySource && (
              <span className="text-xs text-gray-300 ml-1">
                (
                {sourceOptions.find((s) => s.value === prof.proficiencySource)
                  ?.label || prof.proficiencySource}
                {prof.sourceDetail && `: ${prof.sourceDetail}`})
              </span>
            )}
            <button
              type="button"
              onClick={() => removeProficiency(prof.id)}
              className="ml-1 text-red-400 opacity-0 group-hover:opacity-100"
            >
              ✕
            </button>
          </div>
        ))}
        {currentProficiencies.length === 0 && (
          <div className="text-gray-500 text-sm italic">
            Keine Übungen in dieser Kategorie
          </div>
        )}
      </div>

      <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs font-semibold text-gray-400">
            Aus Bibliothek
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="px-3 py-1 bg-purple-600 rounded text-sm"
          >
            {showForm ? 'Abbrechen' : '+ Eigene'}
          </button>
        </div>

        {showForm && (
          <div className="bg-gray-900 rounded-lg p-3 mb-3 border border-purple-500/40 space-y-2">
            <div className="text-xs text-gray-400">
              Neuer Eintrag — landet in deiner Bibliothek und wird sofort hinzugefügt.
            </div>
            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomAndPersist()}
              className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
              autoFocus
            />
            <div className="flex gap-2">
              <select
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                className="px-2 py-1 bg-gray-700 rounded text-sm"
              >
                {sourceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Quelle (z.B. 'Kämpfer')"
                value={newSourceDetail}
                onChange={(e) => setNewSourceDetail(e.target.value)}
                className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm"
              />
            </div>
            <button
              type="button"
              onClick={addCustomAndPersist}
              disabled={!newName.trim()}
              className="w-full py-1 bg-green-600 rounded text-sm disabled:opacity-50"
            >
              Anlegen & hinzufügen
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center text-gray-500 text-xs py-2">Lade…</div>
        )}

        {!loading && suggestions.length === 0 && (
          <div className="text-center text-gray-500 text-xs py-2 italic">
            Keine Vorschläge
          </div>
        )}

        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {suggestions.map((s) => {
            const added = isAdded(s.name);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() =>
                  !added &&
                  addProficiency(
                    s.name,
                    s.icon || DEFAULT_ICON[activeCategory] || '📚',
                    'library',
                    '',
                    s.id
                  )
                }
                disabled={added}
                className={`px-2 py-1 rounded text-sm transition ${
                  added
                    ? 'bg-purple-600/50 cursor-not-allowed'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {added ? '✓ ' : ''}
                {s.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}