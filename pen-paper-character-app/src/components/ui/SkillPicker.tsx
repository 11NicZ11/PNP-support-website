// src/components/ui/SkillPicker.tsx
'use client';

import { useState } from 'react';
import { useLibrary } from '@/hooks/useLibrary';

export interface SkillPickerProps {
  selectedSkills: { skillName: string; source: string }[];
  onChange: (skills: { skillName: string; source: string }[]) => void;
  label?: string;
  sourceLabel?: string;
  defaultSource?: string;
  readOnly?: boolean;
  maxHeight?: string;
  allowCustom?: boolean;
  characterId?: string;
}

export function SkillPicker({
  selectedSkills,
  onChange,
  label = 'Fertigkeiten',
  sourceLabel = 'Rasse',
  defaultSource,
  readOnly = false,
  maxHeight = 'max-h-48',
  allowCustom = true,
}: SkillPickerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const [source, setSource] = useState(defaultSource || sourceLabel);

  const { entries: libraryEntries, loading, create } = useLibrary({
    type: 'skill',
  });

  const isSelected = (skillName: string) =>
    selectedSkills.some((s) => s.skillName === skillName);

  const addSkillLocal = (name: string, src: string) => {
    if (isSelected(name)) return;
    onChange([
      ...selectedSkills,
      { skillName: name, source: src.trim() || sourceLabel },
    ]);
  };

  const addCustomAndPersist = async () => {
    const name = customSkill.trim();
    if (!name) return;

    await create({
      type: 'skill',
      name,
      description: '',
      icon: '🎯',
      data: { attributeName: 'Stärke' },
    });

    addSkillLocal(name, source);

    setCustomSkill('');
    setSource(defaultSource || sourceLabel);
    setShowAddForm(false);
  };

  const toggleSkill = (skillName: string) => {
    if (isSelected(skillName)) {
      onChange(selectedSkills.filter((s) => s.skillName !== skillName));
    } else {
      onChange([
        ...selectedSkills,
        { skillName, source: defaultSource || sourceLabel },
      ]);
    }
  };

  const removeSkill = (skillName: string) => {
    onChange(selectedSkills.filter((s) => s.skillName !== skillName));
  };

  // Wichtig: .sort() mutiert das Array aus dem Hook-State → erst kopieren.
  const suggestions = [...libraryEntries].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-medium">{label}</label>
        {!readOnly && allowCustom && (
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="text-xs px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded"
          >
            {showAddForm ? 'Abbrechen' : '+ Eigene Fertigkeit'}
          </button>
        )}
      </div>

      {/* Ausgewählte */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedSkills.length === 0 && (
          <div className="text-xs text-gray-500 italic">
            Noch keine Fertigkeiten ausgewählt.
          </div>
        )}
        {selectedSkills.map((skill) => (
          <div
            key={skill.skillName}
            className="bg-indigo-600/30 border border-indigo-500/40 rounded-lg px-2 py-1 flex items-center gap-1 group"
          >
            <span className="text-sm">{skill.skillName}</span>
            {skill.source && (
              <span className="text-xs text-gray-400">({skill.source})</span>
            )}
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeSkill(skill.skillName)}
                className="ml-1 text-red-400 opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Neue Fertigkeit */}
      {showAddForm && !readOnly && (
        <div className="bg-gray-800 rounded-lg p-3 space-y-2 mb-3 border border-purple-500/40">
          <div className="text-xs text-gray-400">
            Neue eigene Fertigkeit — landet in Bibliothek und wird sofort ausgewählt.
          </div>
          <input
            type="text"
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomAndPersist()}
            placeholder="Name der neuen Fertigkeit"
            className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder={`Quelle (z.B. "${sourceLabel}")`}
              className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm"
            />
            <button
              type="button"
              onClick={addCustomAndPersist}
              disabled={!customSkill.trim()}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm disabled:opacity-50"
            >
              Anlegen & auswählen
            </button>
          </div>
        </div>
      )}

      {/* Bibliothek */}
      {!readOnly && (
        <>
          {loading && (
            <div className="text-center text-gray-500 text-xs py-2">
              Lade Bibliothek…
            </div>
          )}
          {!loading && suggestions.length === 0 && (
            <div className="text-center text-gray-500 text-xs py-2 italic">
              Bibliothek ist leer — lege mit „+ Eigene Fertigkeit" eine an.
            </div>
          )}
          <div
            className={`flex flex-wrap gap-2 ${maxHeight} overflow-y-auto p-2 bg-gray-800/50 rounded-lg`}
          >
            {suggestions.map((skill) => {
              const active = isSelected(skill.name);
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => toggleSkill(skill.name)}
                  className={`px-2 py-1 rounded text-sm transition ${
                    active
                      ? 'bg-indigo-600 text-white ring-1 ring-indigo-400'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {skill.name}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}