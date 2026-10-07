// src/components/character/editors/BackgroundEditTab.tsx
'use client';

import { useState } from 'react';
import { AbilityScoreIncreaseEditor } from './AbilityScoreIncreaseEditor';
import { AbilityScoreIncrease } from '@/types/abilityScoreIncrease';
import { SkillPicker } from '@/components/ui/SkillPicker';
import { NotesEditor } from '@/components/character/editors/NotesEditor';
import { NotesCategory } from '@/types/character';
import { useLibrary } from '@/hooks/useLibrary';

export interface BackgroundData {
  name: string;
  traits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  features: string;
  bonusSkills: string[];
  bonusLanguages: string[];
  allies: string;
  organizations: string;
  abilityScoreIncrease: AbilityScoreIncrease;
  toolProficiencies: string[];
}

interface BackgroundEditTabProps {
  characterId: string;
  background: BackgroundData;
  onUpdateBackground: (background: BackgroundData) => void;
  alignment: string;
  onAlignmentChange: (alignment: string) => void;
  availableSkills: string[];
  availableAttributes: string[];
  onSkillsUpdate: (skills: any[]) => void;
  proficiencies?: any[];
  onProficienciesUpdate?: (proficiencies: any[]) => void;
  notesCategories: NotesCategory[];
  onNotesCategoriesUpdate: (categories: NotesCategory[]) => void;
}

const alignmentOptions = [
  { value: 'Rechtschaffen Gut', label: 'Rechtschaffen Gut' },
  { value: 'Rechtschaffen Neutral', label: 'Rechtschaffen Neutral' },
  { value: 'Rechtschaffen Böse', label: 'Rechtschaffen Böse' },
  { value: 'Neutral Gut', label: 'Neutral Gut' },
  { value: 'Neutral', label: 'Neutral' },
  { value: 'Neutral Böse', label: 'Neutral Böse' },
  { value: 'Chaotisch Gut', label: 'Chaotisch Gut' },
  { value: 'Chaotisch Neutral', label: 'Chaotisch Neutral' },
  { value: 'Chaotisch Böse', label: 'Chaotisch Böse' },
];

export function BackgroundEditTab({
  characterId,
  background,
  onUpdateBackground,
  alignment,
  onAlignmentChange,
  availableAttributes,
  proficiencies = [],
  onProficienciesUpdate,
  notesCategories,
  onNotesCategoriesUpdate,
}: BackgroundEditTabProps) {
  const [newTool, setNewTool] = useState('');
  const [newCustomLanguage, setNewCustomLanguage] = useState('');

  const {
    entries: libraryBackgrounds,
    create: createBackground,
  } = useLibrary({ type: 'background' });

  const {
    entries: libraryLanguages,
    loading: loadingLangs,
    create: createLang,
  } = useLibrary({ type: 'proficiency', category: 'language' });

  const { entries: libraryTools, loading: loadingTools, create: createTool } =
    useLibrary({ type: 'proficiency', category: 'tool' });

  const persistBackgroundIfNew = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (libraryBackgrounds.some((b) => b.name === trimmed)) return;
    await createBackground({
      type: 'background',
      name: trimmed,
      icon: '📜',
    });
  };

  // ==================== WERKZEUGE ====================
  const addTool = async (tool: string) => {
    const trimmed = tool.trim();
    if (!trimmed) return;

    if (!background.toolProficiencies.includes(trimmed)) {
      onUpdateBackground({
        ...background,
        toolProficiencies: [...background.toolProficiencies, trimmed],
      });
    }

    if (!libraryTools.some((t) => t.name === trimmed)) {
      await createTool({
        type: 'proficiency',
        category: 'tool',
        name: trimmed,
        icon: '🔧',
      });
    }
    setNewTool('');
  };

  const removeTool = (tool: string) => {
    onUpdateBackground({
      ...background,
      toolProficiencies: background.toolProficiencies.filter(
        (t) => t !== tool
      ),
    });
  };

  // ==================== FELDER ====================
  const updateField = (field: keyof BackgroundData, value: any) => {
    const updated = { ...background, [field]: value };
    onUpdateBackground(updated);
    if (field === 'bonusLanguages') {
      syncLanguagesToProficiencies(updated);
    }
  };

  // ==================== SKILLS ====================
  const selectedSkillObjects = background.bonusSkills.map((s) => ({
    skillName: s,
    source: background.name || 'Hintergrund',
  }));

  const handleSkillsChange = (
    skills: { skillName: string; source: string }[]
  ) => {
    const updated = {
      ...background,
      bonusSkills: skills.map((s) => s.skillName),
    };
    onUpdateBackground(updated);
  };

  // ==================== SPRACHEN ====================
  const toggleLanguage = (lang: string) => {
    const updated = {
      ...background,
      bonusLanguages: background.bonusLanguages.includes(lang)
        ? background.bonusLanguages.filter((l) => l !== lang)
        : [...background.bonusLanguages, lang],
    };
    onUpdateBackground(updated);
    syncLanguagesToProficiencies(updated);
  };

  const addCustomLanguage = async () => {
    const trimmed = newCustomLanguage.trim();
    if (!trimmed) return;

    if (!libraryLanguages.some((l) => l.name === trimmed)) {
      await createLang({
        type: 'proficiency',
        category: 'language',
        name: trimmed,
        icon: '🗣️',
      });
    }

    if (!background.bonusLanguages.includes(trimmed)) {
      const updated = {
        ...background,
        bonusLanguages: [...background.bonusLanguages, trimmed],
      };
      onUpdateBackground(updated);
      syncLanguagesToProficiencies(updated);
    }
    setNewCustomLanguage('');
  };

    const syncLanguagesToProficiencies = (
    updatedBackground: BackgroundData
  ) => {
    if (!onProficienciesUpdate) return;
    const existingNonLanguages = proficiencies.filter(
      (p) => p.category !== 'language'
    );
    const backgroundLanguages = updatedBackground.bonusLanguages.map(
      (lang) => {
        const lib = libraryLanguages.find((l) => l.name === lang);
        return {
          id: `bg-lang-${lang}`,
          name: lang,
          category: 'language' as const,
          icon: '🗣️',
          isProficient: true,
          proficiencySource: 'Hintergrund',
          sourceDetail: updatedBackground.name || 'Hintergrund',
          libraryEntryId: lib?.id ?? null,
        };
      }
    );
    onProficienciesUpdate([...existingNonLanguages, ...backgroundLanguages]);
  };

  const allToolOptions = libraryTools
    .map((t) => t.name)
    .sort((a, b) => a.localeCompare(b));

  const allLanguageOptions = libraryLanguages
    .map((l) => l.name)
    .sort((a, b) => a.localeCompare(b));

  const backgroundSuggestions = libraryBackgrounds
    .map((b) => b.name)
    .sort((a, b) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm block mb-1">Gesinnung</label>
        <select
          value={alignment || ''}
          onChange={(e) => onAlignmentChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
        >
          <option value="">Keine Angabe</option>
          {alignmentOptions.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Synchronisiert mit dem Rassen-Tab
        </p>
      </div>

      {/* 🔥 Hintergrundname mit Bibliothek-Auswahl */}
      <div>
        <label className="text-sm block mb-1">Hintergrundname</label>
        <input
          type="text"
          list="background-suggestions"
          value={background.name}
          onChange={(e) => updateField('name', e.target.value)}
          onBlur={(e) => persistBackgroundIfNew(e.target.value)}
          placeholder="Hintergrundname (aus Bibliothek wählen oder neu anlegen)"
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
        />
        <datalist id="background-suggestions">
          {backgroundSuggestions.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <p className="text-xs text-gray-500 mt-1">
          Freitext möglich — beim Verlassen wird ein unbekannter Name in deiner
          Bibliothek gespeichert.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <textarea
          value={background.traits}
          onChange={(e) => updateField('traits', e.target.value)}
          rows={3}
          placeholder="Persönlichkeitsmerkmale"
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 resize-none"
        />
        <textarea
          value={background.ideals}
          onChange={(e) => updateField('ideals', e.target.value)}
          rows={3}
          placeholder="Ideale"
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 resize-none"
        />
        <textarea
          value={background.bonds}
          onChange={(e) => updateField('bonds', e.target.value)}
          rows={3}
          placeholder="Bindungen"
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 resize-none"
        />
        <textarea
          value={background.flaws}
          onChange={(e) => updateField('flaws', e.target.value)}
          rows={3}
          placeholder="Schwächen"
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 resize-none"
        />
      </div>

      <textarea
        value={background.features}
        onChange={(e) => updateField('features', e.target.value)}
        rows={2}
        placeholder="Feature / Besonderheit"
        className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 resize-none"
      />

      <div>
        <label className="text-sm block mb-1">Verbündete</label>
        <textarea
          value={background.allies}
          onChange={(e) => updateField('allies', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 resize-none"
        />
      </div>

      <div>
        <label className="text-sm block mb-1">Organisationen</label>
        <textarea
          value={background.organizations}
          onChange={(e) => updateField('organizations', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 resize-none"
        />
      </div>

      <AbilityScoreIncreaseEditor
        value={background.abilityScoreIncrease}
        onChange={(newValue) => updateField('abilityScoreIncrease', newValue)}
        availableAttributes={availableAttributes}
        label="Attributs-Boni"
      />

      <div>
        <label className="text-sm block mb-1">Werkzeug-Übungen</label>
        <div className="flex flex-wrap gap-1 mb-2">
          {background.toolProficiencies.map((tool) => (
            <span
              key={tool}
              className="px-2 py-0.5 bg-blue-600/30 rounded-full text-sm flex items-center gap-1"
            >
              {tool}
              <button type="button" onClick={() => removeTool(tool)} className="text-red-400">
                ×
              </button>
            </span>
          ))}
        </div>
        <select
          onChange={(e) => {
            if (e.target.value) {
              addTool(e.target.value);
              e.target.value = '';
            }
          }}
          disabled={loadingTools}
          className="w-full px-2 py-1 bg-gray-800 rounded text-sm disabled:opacity-50"
        >
          <option value="">
            {loadingTools ? 'Lade Werkzeuge…' : 'Werkzeug auswählen'}
          </option>
          {allToolOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div className="flex gap-1 mt-1">
          <input
            type="text"
            value={newTool}
            onChange={(e) => setNewTool(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTool(newTool);
              }
            }}
            placeholder="Eigenes Werkzeug anlegen (landet in Bibliothek)"
            className="flex-1 px-2 py-1 bg-gray-800 rounded text-sm"
          />
          <button
            type="button"
            onClick={() => addTool(newTool)}
            disabled={!newTool.trim()}
            className="px-3 py-1 bg-purple-600 rounded text-sm disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      <SkillPicker
        label="Bonus-Fertigkeiten (Hintergrund)"
        sourceLabel="Hintergrund"
        defaultSource={background.name || 'Hintergrund'}
        selectedSkills={selectedSkillObjects}
        onChange={handleSkillsChange}
        allowCustom
      />

      <div>
        <label className="block text-sm font-medium mb-2">Bonus-Sprachen</label>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-gray-800/50 rounded-lg">
          {loadingLangs && (
            <div className="text-xs text-gray-500 italic">Lade Sprachen…</div>
          )}
          {!loadingLangs && allLanguageOptions.length === 0 && (
            <div className="text-xs text-gray-500 italic">
              Keine Sprachen in Bibliothek — lege unten eine eigene an.
            </div>
          )}
          {allLanguageOptions.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`px-2 py-1 rounded text-sm transition ${
                background.bonusLanguages.includes(lang)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        <div className="flex gap-1 mt-2">
          <input
            type="text"
            value={newCustomLanguage}
            onChange={(e) => setNewCustomLanguage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustomLanguage()}
            placeholder="Eigene Sprache anlegen (landet in Bibliothek)"
            className="flex-1 px-2 py-1 bg-gray-800 rounded text-sm"
          />
          <button
            type="button"
            onClick={addCustomLanguage}
            disabled={!newCustomLanguage.trim()}
            className="px-3 py-1 bg-purple-600 rounded text-sm disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      <NotesEditor
        categories={notesCategories}
        onUpdate={onNotesCategoriesUpdate}
      />

      <div className="text-xs text-gray-500 mt-2">
        Eigene Werkzeuge und Sprachen werden in deiner Bibliothek gespeichert.
      </div>
    </div>
  );
}