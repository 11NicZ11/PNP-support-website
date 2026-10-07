// src/components/character/editors/RaceEditor.tsx
'use client';

import { useState } from 'react';
import { AbilityScoreIncreaseEditor } from './AbilityScoreIncreaseEditor';
import { AbilityScoreIncrease } from '@/types/abilityScoreIncrease';
import {
  DefensesModal,
  DefenseItem,
} from '@/components/character/modals/DefensesModal';

export interface RaceData {
  name: string;
  size: string;
  sizeCategory: string;
  height: string;
  weight: string;
  age: string;
  speed: number;
  description: string;
  languages: string[];
  traits: { name: string; description: string }[];
  abilityScoreIncrease: AbilityScoreIncrease;
  hasSubrace: boolean;
  subraces: { name: string; description: string }[];
  skillProficiencies: { skillName: string; source: string }[];
  faith: string;
  personality: string;
  bonds: string;
  ideals: string;
  flaws: string;
  bonusArmorClass: number;
  bonusHp: number;
}

interface RaceEditorProps {
  raceData: RaceData;
  onChange: (raceData: RaceData) => void;
  availableAttributes: string[];
  availableSkills: string[];
  unitSystem: 'metric' | 'imperial';
  alignment: string;
  onAlignmentChange: (alignment: string) => void;
  defenses: DefenseItem[];
  onDefensesChange: (defenses: DefenseItem[]) => void;
  characterId?: string;
}

const sizeCategoryOptions = [
  'Winzig',
  'Klein',
  'Mittel',
  'Groß',
  'Riesig',
  'Gigantisch',
];

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

export function RaceEditor({
  raceData,
  onChange,
  availableAttributes,
  availableSkills,
  unitSystem,
  alignment,
  onAlignmentChange,
  defenses,
  onDefensesChange,
  characterId,
}: RaceEditorProps) {
  const [showAddTrait, setShowAddTrait] = useState(false);
  const [newTrait, setNewTrait] = useState({ name: '', description: '' });
  const [showAddSubrace, setShowAddSubrace] = useState(false);
  const [newSubrace, setNewSubrace] = useState({ name: '', description: '' });
  const [showAddSkillProf, setShowAddSkillProf] = useState(false);
  const [newSkillProf, setNewSkillProf] = useState({
    skillName: '',
    source: '',
  });
  const [newLanguage, setNewLanguage] = useState('');
  const [showDefensesModal, setShowDefensesModal] = useState(false);

  const updateField = (field: keyof RaceData, value: any) => {
    onChange({ ...raceData, [field]: value });
  };

  const addLanguage = (lang: string) => {
    const trimmed = lang.trim();
    if (!trimmed || raceData.languages.includes(trimmed)) return;
    updateField('languages', [...raceData.languages, trimmed]);
    setNewLanguage('');
  };

  const removeLanguage = (lang: string) => {
    updateField(
      'languages',
      raceData.languages.filter((l) => l !== lang)
    );
  };

  const addTrait = () => {
    if (!newTrait.name.trim()) return;
    updateField('traits', [...raceData.traits, { ...newTrait }]);
    setNewTrait({ name: '', description: '' });
    setShowAddTrait(false);
  };

  const removeTrait = (index: number) => {
    const traits = [...raceData.traits];
    traits.splice(index, 1);
    updateField('traits', traits);
  };

  const addSubrace = () => {
    if (!newSubrace.name.trim()) return;
    updateField('subraces', [...raceData.subraces, { ...newSubrace }]);
    setNewSubrace({ name: '', description: '' });
    setShowAddSubrace(false);
  };

  const removeSubrace = (index: number) => {
    const subraces = [...raceData.subraces];
    subraces.splice(index, 1);
    updateField('subraces', subraces);
  };

  const updateSubraceField = (index: number, field: string, value: any) => {
    const subraces = [...raceData.subraces];
    subraces[index] = { ...subraces[index], [field]: value };
    updateField('subraces', subraces);
  };

  const addSkillProficiency = () => {
    if (!newSkillProf.skillName.trim()) return;
    updateField('skillProficiencies', [
      ...raceData.skillProficiencies,
      {
        skillName: newSkillProf.skillName.trim(),
        source: newSkillProf.source.trim() || 'Rasse',
      },
    ]);
    setNewSkillProf({ skillName: '', source: '' });
    setShowAddSkillProf(false);
  };

  const removeSkillProficiency = (index: number) => {
    const profs = [...raceData.skillProficiencies];
    profs.splice(index, 1);
    updateField('skillProficiencies', profs);
  };

  const speedLabel = unitSystem === 'imperial' ? 'ft' : 'm';
  const speedDisplay =
    unitSystem === 'imperial'
      ? raceData.speed
      : Math.round(raceData.speed * 0.3048 * 10) / 10;

  const handleSpeedChange = (value: number) => {
    const ftValue = unitSystem === 'imperial' ? value : value / 0.3048;
    updateField('speed', Math.round(ftValue));
  };

  const heightLabel = unitSystem === 'imperial' ? 'ft/in' : 'm';
  const weightLabel = unitSystem === 'imperial' ? 'lb' : 'kg';

  const defenseIcon = (type: string) =>
    type === 'damage_immunity'
      ? '✨'
      : type === 'damage_resistance'
      ? '🛡️'
      : '💪';

  const bonusAC = raceData.bonusArmorClass ?? 0;
  const bonusHp = raceData.bonusHp ?? 0;
  const hasAnyBonus = bonusAC !== 0 || bonusHp !== 0;

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 space-y-4">
      <h2 className="text-lg font-semibold">🧝 Rasse</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Rassenname</label>
          <input
            type="text"
            value={raceData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="z.B. Elf, Zwerg, Mensch"
            className="w-full px-3 py-2 bg-gray-800 rounded-lg"
          />
        </div>
        <div>
          <label className="text-sm">Größenkategorie</label>
          <select
            value={raceData.sizeCategory || 'Mittel'}
            onChange={(e) => updateField('sizeCategory', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg"
          >
            {sizeCategoryOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm">Größe ({heightLabel})</label>
          <input
            type="text"
            value={raceData.height || ''}
            onChange={(e) => updateField('height', e.target.value)}
            placeholder={unitSystem === 'imperial' ? "z.B. 5'10\"" : 'z.B. 1,80'}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg"
          />
        </div>
        <div>
          <label className="text-sm">Gewicht ({weightLabel})</label>
          <input
            type="text"
            value={raceData.weight || ''}
            onChange={(e) => updateField('weight', e.target.value)}
            placeholder={unitSystem === 'imperial' ? 'z.B. 165' : 'z.B. 75'}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg"
          />
        </div>
        <div>
          <label className="text-sm">Alter</label>
          <input
            type="text"
            value={raceData.age || ''}
            onChange={(e) => updateField('age', e.target.value)}
            placeholder="z.B. 100-200 Jahre"
            className="w-full px-3 py-2 bg-gray-800 rounded-lg"
          />
        </div>
        <div>
          <label className="text-sm">Bewegungsrate ({speedLabel})</label>
          <input
            type="number"
            step={unitSystem === 'imperial' ? 5 : 0.5}
            value={speedDisplay}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Wird in der DB als ft gespeichert
          </p>
        </div>
        <div className="col-span-2">
          <label className="text-sm">Beschreibung</label>
          <textarea
            value={raceData.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={2}
            placeholder="Beschreibung der Rasse"
            className="w-full px-3 py-2 bg-gray-800 rounded-lg resize-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm block mb-1">Gesinnung</label>
        <select
          value={alignment || ''}
          onChange={(e) => onAlignmentChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 rounded-lg"
        >
          <option value="">Keine Angabe</option>
          {alignmentOptions.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Synchronisiert mit dem Hintergrund-Tab
        </p>
      </div>

      <div>
        <label className="text-sm block mb-1">Glaube / Gottheit</label>
        <input
          type="text"
          value={raceData.faith || ''}
          onChange={(e) => updateField('faith', e.target.value)}
          placeholder="z.B. Pelor, Tiamat, Kein Glaube"
          className="w-full px-3 py-2 bg-gray-800 rounded-lg"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm block mb-1">Charakteristiken</label>
        <div>
          <label className="text-xs text-gray-400">
            Persönlichkeitsmerkmale
          </label>
          <textarea
            value={raceData.personality || ''}
            onChange={(e) => updateField('personality', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Verbundenheiten</label>
          <textarea
            value={raceData.bonds || ''}
            onChange={(e) => updateField('bonds', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Ideale</label>
          <textarea
            value={raceData.ideals || ''}
            onChange={(e) => updateField('ideals', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg resize-none"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Makel</label>
          <textarea
            value={raceData.flaws || ''}
            onChange={(e) => updateField('flaws', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg resize-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm block mb-1">Sprachen</label>
        <div className="flex flex-wrap gap-1 mb-1">
          {raceData.languages.map((lang) => (
            <span
              key={lang}
              className="px-2 py-0.5 bg-purple-600/30 rounded-full text-sm flex items-center gap-1"
            >
              {lang}
              <button type="button"
                onClick={() => removeLanguage(lang)}
                className="text-red-400"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          <input
            type="text"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addLanguage(newLanguage)}
            placeholder="Sprache hinzufügen"
            className="flex-1 px-2 py-1 bg-gray-800 rounded text-sm"
          />
          <button
            type="button"
            onClick={() => addLanguage(newLanguage)}
            disabled={!newLanguage.trim()}
            className="px-3 py-1 bg-purple-600 rounded text-sm disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      <AbilityScoreIncreaseEditor
        value={raceData.abilityScoreIncrease}
        onChange={(newValue) => updateField('abilityScoreIncrease', newValue)}
        availableAttributes={availableAttributes}
        label="Attributs-Boni"
      />

      <div className="bg-gray-800/50 rounded-lg p-3 space-y-3">
        <h3 className="text-sm font-semibold text-purple-300">
          ✨ Weitere Rassen-Boni
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400">
              Bonus auf Rüstungsklasse
            </label>
            <input
              type="number"
              value={bonusAC}
              onChange={(e) =>
                updateField('bonusArmorClass', parseInt(e.target.value) || 0)
              }
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Bonus auf HP</label>
            <input
              type="number"
              value={bonusHp}
              onChange={(e) =>
                updateField('bonusHp', parseInt(e.target.value) || 0)
              }
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* 🔥 NEU: Vorschau der Rassen-Boni */}
        {hasAnyBonus && (
          <div className="bg-purple-600/10 border border-purple-500/40 rounded-lg p-3 mt-2">
            <div className="text-xs font-semibold text-purple-300 mb-2">
              📊 Vorschau: So wirken sich diese Boni aus
            </div>
            <div className="space-y-1 text-xs">
              {bonusAC !== 0 && (
                <div className="flex items-center gap-2 text-gray-300">
                  <span>🛡️</span>
                  <span className="flex-1">
                    Rüstungsklasse {bonusAC > 0 ? '+' : ''}
                    {bonusAC}
                  </span>
                  <span className="text-gray-500 italic">
                    wird zu RK-Quellen hinzugefügt
                  </span>
                </div>
              )}
              {bonusHp !== 0 && (
                <div className="flex items-center gap-2 text-gray-300">
                  <span>❤️</span>
                  <span className="flex-1">
                    Trefferpunkte {bonusHp > 0 ? '+' : ''}
                    {bonusHp}
                  </span>
                  <span className="text-gray-500 italic">
                    wird zu HP-Quellen hinzugefügt
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              Wird automatisch mit anderen Quellen (Klassen, Ausrüstung, …)
              verrechnet.
            </p>
          </div>
        )}

        {!hasAnyBonus && (
          <p className="text-xs text-gray-500 italic">
            💡 Trage Boni ein, um zu sehen, wie sie sich auf RK und HP auswirken.
          </p>
        )}

        <div className="border-t border-gray-700 pt-3">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs text-gray-400">
              🛡️ Verteidigungen aus Rasse
            </label>
            <button
              type="button"
              onClick={() => setShowDefensesModal(true)}
              className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded"
            >
              Bearbeiten
            </button>
          </div>
          {defenses.length === 0 && (
            <p className="text-xs text-gray-500 italic">
              Keine Verteidigungen eingetragen.
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            {defenses.map((d) => (
              <span
                key={d.id}
                className="px-2 py-0.5 bg-purple-600/30 rounded text-xs"
                title={d.description || ''}
              >
                {defenseIcon(d.type)} {d.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm block mb-1">
          Fertigkeiten (durch Rasse geübt)
        </label>
        {raceData.skillProficiencies.map((prof, idx) => (
          <div
            key={idx}
            className="bg-gray-800/50 rounded p-2 mb-1 flex justify-between items-center"
          >
            <div>
              <span className="font-semibold">{prof.skillName}</span>
              {prof.source && (
                <span className="text-xs text-gray-400 ml-2">
                  ({prof.source})
                </span>
              )}
            </div>
            <button type="button"
              onClick={() => removeSkillProficiency(idx)}
              className="text-red-400"
            >
              ✕
            </button>
          </div>
        ))}
        {showAddSkillProf ? (
          <div className="bg-gray-800 rounded p-2 space-y-1">
            <div className="flex gap-1">
              <select
                value={newSkillProf.skillName}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '__custom__') {
                    const custom = prompt('Eigene Fertigkeit:');
                    if (custom) {
                      setNewSkillProf({ ...newSkillProf, skillName: custom });
                    }
                  } else {
                    setNewSkillProf({ ...newSkillProf, skillName: val });
                  }
                }}
                className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm"
              >
                <option value="">Fertigkeit auswählen</option>
                {availableSkills.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                <option value="__custom__">+ Eigene Fertigkeit...</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Quelle (z.B. 'Rasse')"
              value={newSkillProf.source}
              onChange={(e) =>
                setNewSkillProf({ ...newSkillProf, source: e.target.value })
              }
              className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
            />
            <div className="flex gap-1">
              <button type="button"
                onClick={addSkillProficiency}
                disabled={!newSkillProf.skillName.trim()}
                className="px-2 py-1 bg-green-600 rounded text-sm disabled:opacity-50"
              >
                Hinzufügen
              </button>
              <button type="button"
                onClick={() => setShowAddSkillProf(false)}
                className="px-2 py-1 bg-gray-600 rounded text-sm"
              >
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddSkillProf(true)}
            className="w-full py-1 px-3 bg-purple-600 rounded text-sm"
          >
            + Fertigkeit hinzufügen
          </button>
        )}
      </div>

      <div>
        <label className="text-sm block mb-1">Rassenmerkmale</label>
        {raceData.traits.map((trait, idx) => (
          <div key={idx} className="bg-gray-800/50 rounded p-2 mb-1">
            <div className="flex justify-between">
              <span className="font-semibold">{trait.name}</span>
              <button type="button" onClick={() => removeTrait(idx)} className="text-red-400">
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-300">{trait.description}</p>
          </div>
        ))}
        {showAddTrait ? (
          <div className="bg-gray-800 rounded p-2 space-y-1">
            <input
              type="text"
              placeholder="Merkmalname"
              value={newTrait.name}
              onChange={(e) =>
                setNewTrait({ ...newTrait, name: e.target.value })
              }
              className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
            />
            <textarea
              placeholder="Beschreibung"
              value={newTrait.description}
              onChange={(e) =>
                setNewTrait({ ...newTrait, description: e.target.value })
              }
              rows={2}
              className="w-full px-2 py-1 bg-gray-700 rounded text-sm resize-none"
            />
            <div className="flex gap-1">
              <button type="button"
                onClick={addTrait}
                className="px-2 py-1 bg-green-600 rounded text-sm"
              >
                Hinzufügen
              </button>
              <button type="button"
                onClick={() => setShowAddTrait(false)}
                className="px-2 py-1 bg-gray-600 rounded text-sm"
              >
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddTrait(true)}
            className="w-full py-1 px-3 bg-purple-600 rounded text-sm"
          >
            + Merkmal hinzufügen
          </button>
        )}
      </div>

      <div className="bg-gray-800/50 rounded-lg p-3 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={raceData.hasSubrace}
            onChange={(e) => {
              const next = e.target.checked;
              onChange({
                ...raceData,
                hasSubrace: next,
                subraces: next ? raceData.subraces : [],
              });
            }}
          />
          <span className="text-sm font-medium">
            Diese Rasse hat Unterrassen
          </span>
        </label>

        {raceData.hasSubrace && (
          <div className="space-y-2">
            {raceData.subraces.length === 0 && (
              <p className="text-xs text-gray-500 italic">
                Noch keine Unterrasse hinzugefügt.
              </p>
            )}
            {raceData.subraces.map((subrace, idx) => (
              <div key={idx} className="bg-gray-800 rounded p-2 space-y-1">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={subrace.name}
                    onChange={(e) =>
                      updateSubraceField(idx, 'name', e.target.value)
                    }
                    placeholder="Unterrassenname"
                    className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm font-semibold"
                  />
                  <button type="button"
                    onClick={() => removeSubrace(idx)}
                    className="ml-2 text-red-400"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  value={subrace.description}
                  onChange={(e) =>
                    updateSubraceField(idx, 'description', e.target.value)
                  }
                  rows={2}
                  placeholder="Beschreibung"
                  className="w-full px-2 py-1 bg-gray-700 rounded text-sm resize-none"
                />
              </div>
            ))}

            {showAddSubrace ? (
              <div className="bg-gray-800 rounded p-2 space-y-1">
                <input
                  type="text"
                  placeholder="Unterrassenname"
                  value={newSubrace.name}
                  onChange={(e) =>
                    setNewSubrace({ ...newSubrace, name: e.target.value })
                  }
                  className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
                />
                <textarea
                  placeholder="Beschreibung"
                  value={newSubrace.description}
                  onChange={(e) =>
                    setNewSubrace({ ...newSubrace, description: e.target.value })
                  }
                  rows={2}
                  className="w-full px-2 py-1 bg-gray-700 rounded text-sm resize-none"
                />
                <div className="flex gap-1">
                  <button type="button"
                    onClick={addSubrace}
                    className="px-2 py-1 bg-green-600 rounded text-sm"
                  >
                    Hinzufügen
                  </button>
                  <button type="button"
                    onClick={() => setShowAddSubrace(false)}
                    className="px-2 py-1 bg-gray-600 rounded text-sm"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddSubrace(true)}
                className="w-full py-1 px-3 bg-purple-600 rounded text-sm"
              >
                + Unterrasse hinzufügen
              </button>
            )}
          </div>
        )}
      </div>

      <DefensesModal
        isOpen={showDefensesModal}
        onClose={() => setShowDefensesModal(false)}
        source="race"
        sourceName={raceData.name || 'Rasse'}
        defenses={defenses}
        onSave={onDefensesChange}
        characterId={characterId}
      />
    </div>
  );
}