// src/components/character/edit/ClassLevelsEditor.tsx
'use client';

import { useState } from 'react';
import {
  ClassProgression,
  CLASS_PROGRESSION_LABELS,
  ExpMode,
  HpSource,
  HpSourceType,
  HitDiceMode,
  LevelingMode,
  SpellcastingAbility,
} from '@/types/character';
import {
  ClassFeature,
  ClassFeatureKind,
  CLASS_FEATURE_SOURCES,
  CLASS_FEATURE_TYPES,
  CLASS_FEATURE_RECHARGE,
  CLASS_FEATURE_KINDS,
} from '@/types/classFeatures';
import { CharacterResource, CharacterHitDice } from '@/types/resources';
import { getModifier } from '@/lib/utils';
import { AlternateForm } from '@/types/forms';
import { Companion } from '@/types/companions';
import { ClassFeatureEditor } from './ClassFeatureEditor';
import { ResourceEditor } from './ResourceEditor';
import { HitDiceEditor } from './HitDiceEditor';
import {
  DefensesModal,
  DefenseItem,
} from '@/components/character/modals/DefensesModal';

export interface ClassLevel {
  id?: string;
  className: string;
  subclass?: string;
  subclassLevel?: number;
  level: number;
  hitDie: string;
  features: ClassFeature[];
  spellcastingAbility: SpellcastingAbility;
  isActive: boolean;
  leftAtLevel?: number;
  notes: string;
  sourceReference: string;
  track: 0 | 1;
  savingThrowProficiencies: string[];
}

interface ClassLevelsEditorProps {
  classLevels: ClassLevel[];
  onUpdate: (classLevels: ClassLevel[]) => void;
  characterLevel: number;
  onCharacterLevelChange: (level: number) => void;
  levelingMode: LevelingMode;
  experience: number;
  onExperienceChange: (exp: number) => void;
  nextLevelExp: number;
  onNextLevelExpChange: (exp: number) => void;
  expMode: ExpMode;
  onExpModeChange: (mode: ExpMode) => void;
  expThresholds: Record<number, number>;
  onExpThresholdsChange: (thresholds: Record<number, number>) => void;
  classProgression: ClassProgression;
  onClassProgressionChange: (prog: ClassProgression) => void;
  hpSources: HpSource[];
  onHpSourcesUpdate: (sources: HpSource[]) => void;
  constitutionValue: number;
  resources: CharacterResource[];
  onResourcesUpdate: (resources: CharacterResource[]) => void;
  hitDice: CharacterHitDice[];
  onHitDiceUpdate: (hitDice: CharacterHitDice[]) => void;
  hasHitDice: boolean;
  onHasHitDiceChange: (v: boolean) => void;
  hitDiceMode: HitDiceMode;
  onHitDiceModeChange: (m: HitDiceMode) => void;
  characterId?: string;
  characterName?: string;
  onHeal?: (amount: number) => void;
  availableForms?: AlternateForm[];
  availableCompanions?: Companion[];
  attributeNames: string[];
  // Verteidigungen pro Klasse (Map: className -> DefenseItem[])
  classDefenses: Record<string, DefenseItem[]>;
  onClassDefensesChange: (
    className: string,
    defenses: DefenseItem[]
  ) => void;
}

const HIT_DIE_OPTIONS = ['d6', 'd8', 'd10', 'd12'];

const HP_SOURCE_TYPES: { value: HpSourceType; label: string; icon: string }[] = [
  { value: 'class', label: 'Klasse', icon: '⚔️' },
  { value: 'race', label: 'Rasse', icon: '🧝' },
  { value: 'background', label: 'Hintergrund', icon: '📜' },
  { value: 'feature', label: 'Feature', icon: '⚡' },
  { value: 'conMod', label: 'Konstitutions-Modifikator', icon: '💪' },
  { value: 'manual', label: 'Manuell', icon: '✏️' },
];

const SPELLCASTING_ABILITIES: {
  value: SpellcastingAbility;
  label: string;
}[] = [
  { value: 'none', label: 'Keine' },
  { value: 'str', label: 'Stärke' },
  { value: 'dex', label: 'Geschick' },
  { value: 'con', label: 'Konstitution' },
  { value: 'int', label: 'Intelligenz' },
  { value: 'wis', label: 'Weisheit' },
  { value: 'cha', label: 'Charisma' },
];

function createEmptyClassLevel(
  className: string,
  level: number,
  track: 0 | 1
): ClassLevel {
  return {
    id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    className,
    subclass: '',
    subclassLevel: undefined,
    level,
    hitDie: 'd8',
    features: [],
    spellcastingAbility: 'none',
    isActive: true,
    leftAtLevel: undefined,
    notes: '',
    sourceReference: '',
    track,
    savingThrowProficiencies: [],
  };
}

export function ClassLevelsEditor({
  classLevels,
  onUpdate,
  characterLevel,
  onCharacterLevelChange,
  levelingMode,
  experience,
  onExperienceChange,
  nextLevelExp,
  onNextLevelExpChange,
  expMode,
  onExpModeChange,
  expThresholds,
  onExpThresholdsChange,
  classProgression,
  onClassProgressionChange,
  hpSources,
  onHpSourcesUpdate,
  constitutionValue,
  resources,
  onResourcesUpdate,
  hitDice,
  onHitDiceUpdate,
  hasHitDice,
  onHasHitDiceChange,
  hitDiceMode,
  onHitDiceModeChange,
  characterId,
  characterName,
  onHeal,
  availableForms = [],
  availableCompanions = [],
  attributeNames,
  classDefenses,
  onClassDefensesChange,
}: ClassLevelsEditorProps) {
  const [newClassName, setNewClassName] = useState('');
  const [newClassTrack, setNewClassTrack] = useState<0 | 1>(0);
  const [expAddValue, setExpAddValue] = useState('');

  const [featureEditorState, setFeatureEditorState] = useState<{
    isOpen: boolean;
    classIndex: number;
    feature: ClassFeature | null;
    defaultKind: ClassFeatureKind;
  }>({ isOpen: false, classIndex: -1, feature: null, defaultKind: 'feature' });

  const [defensesModalState, setDefensesModalState] = useState<{
    isOpen: boolean;
    className: string;
  }>({ isOpen: false, className: '' });

  const getConModValue = () => getModifier(constitutionValue);

  const getTrackSum = (track: 0 | 1) =>
    classLevels
      .filter((cl) => cl.track === track)
      .reduce((sum, cl) => sum + (cl.level || 0), 0);

  const track0Sum = getTrackSum(0);
  const track1Sum = getTrackSum(1);

  const addClass = (track: 0 | 1) => {
    if (!newClassName.trim()) return;

    const trackSum = track === 0 ? track0Sum : track1Sum;
    const wouldExceed = trackSum + characterLevel > characterLevel;
    const initialLevel = Math.max(1, characterLevel - trackSum);

    if (wouldExceed || trackSum >= characterLevel) {
      const confirm = window.confirm(
        `Achtung: Die Summe aller Klassen-Level in diesem Track (${trackSum}) erreicht bereits das Charakter-Level (${characterLevel}).\n\nMöchtest du das Charakter-Level auf ${trackSum + initialLevel} erhöhen?`
      );
      if (!confirm) return;
      onCharacterLevelChange(trackSum + initialLevel);
    }

    onUpdate([
      ...classLevels,
      createEmptyClassLevel(newClassName.trim(), initialLevel, track),
    ]);
    setNewClassName('');
  };

  const removeClass = (index: number) => {
    if (
      !confirm(
        'Klasse wirklich entfernen? Alle Features dieser Klasse gehen verloren.'
      )
    )
      return;
    const updated = [...classLevels];
    updated.splice(index, 1);
    onUpdate(updated);
  };

  const updateClass = (index: number, field: keyof ClassLevel, value: any) => {
    const updated = [...classLevels];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(updated);
  };

  const toggleSavingThrow = (index: number, attrName: string) => {
    const cls = classLevels[index];
    const current = cls.savingThrowProficiencies || [];
    const isSelected = current.includes(attrName);
    const updated = isSelected
      ? current.filter((a) => a !== attrName)
      : [...current, attrName];
    updateClass(index, 'savingThrowProficiencies', updated);
  };

  const openFeatureEditor = (
    classIndex: number,
    feature: ClassFeature | null,
    defaultKind: ClassFeatureKind = 'feature'
  ) => {
    setFeatureEditorState({ isOpen: true, classIndex, feature, defaultKind });
  };

  const closeFeatureEditor = () => {
    setFeatureEditorState({
      isOpen: false,
      classIndex: -1,
      feature: null,
      defaultKind: 'feature',
    });
  };

  const saveFeature = (feature: ClassFeature) => {
    const { classIndex } = featureEditorState;
    if (classIndex < 0) return;
    const cls = classLevels[classIndex];
    if (!cls) return;

    const existingIndex = cls.features.findIndex((f) => f.id === feature.id);
    let newFeatures: ClassFeature[];
    if (existingIndex >= 0) {
      newFeatures = [...cls.features];
      newFeatures[existingIndex] = feature;
    } else {
      newFeatures = [...cls.features, feature];
    }
    newFeatures.sort(
      (a, b) => a.level - b.level || a.name.localeCompare(b.name)
    );

    updateClass(classIndex, 'features', newFeatures);
  };

  const deleteFeature = (featureId: string) => {
    const { classIndex } = featureEditorState;
    if (classIndex < 0) return;
    const cls = classLevels[classIndex];
    if (!cls) return;
    updateClass(
      classIndex,
      'features',
      cls.features.filter((f) => f.id !== featureId)
    );
  };

  const getConModTotal = () => getConModValue() * (characterLevel || 1);

  const addHpSource = () => {
    onHpSourcesUpdate([
      ...hpSources,
      { name: 'Neue Quelle', value: 0, sourceType: 'manual', sourceName: '' },
    ]);
  };

  const updateHpSource = (index: number, field: keyof HpSource, value: any) => {
    const updated = [...hpSources];
    updated[index] = { ...updated[index], [field]: value };
    onHpSourcesUpdate(updated);
  };

  const removeHpSource = (index: number) => {
    onHpSourcesUpdate(hpSources.filter((_, i) => i !== index));
  };

  const hasConModSource = hpSources.some((s) => s.sourceType === 'conMod');
  const toggleConModSource = () => {
    if (hasConModSource) {
      onHpSourcesUpdate(hpSources.filter((s) => s.sourceType !== 'conMod'));
    } else {
      onHpSourcesUpdate([
        ...hpSources,
        {
          name: 'Konstitutions-Modifikator',
          value: getConModTotal(),
          sourceType: 'conMod',
          sourceName: `Konsti ${getConModValue() >= 0 ? '+' : ''}${getConModValue()} × Level ${characterLevel || 1}`,
        },
      ]);
    }
  };

  const totalHpBase = hpSources
    .filter((s) => s.sourceType !== 'conMod')
    .reduce((sum, s) => sum + s.value, 0);
  const totalHpWithCon = totalHpBase + (hasConModSource ? getConModTotal() : 0);

  const handleAddExp = () => {
    const addValue = parseInt(expAddValue);
    if (isNaN(addValue) || addValue === 0) return;
    onExperienceChange(experience + addValue);
    setExpAddValue('');
  };

  const currentThreshold =
    expMode === 'per_level'
      ? expThresholds[characterLevel + 1] ?? nextLevelExp
      : nextLevelExp;

  const expProgress =
    currentThreshold > 0
      ? Math.min(100, (experience / currentThreshold) * 100)
      : 0;
  const hasReachedNextLevel =
    experience >= currentThreshold && levelingMode === 'exp';

  const getFeaturesByLevel = (features: ClassFeature[]) => {
    const map: Record<number, ClassFeature[]> = {};
    features.forEach((f) => {
      if (!map[f.level]) map[f.level] = [];
      map[f.level].push(f);
    });
    return Object.entries(map)
      .map(([lvl, feats]) => ({ level: parseInt(lvl), features: feats }))
      .sort((a, b) => a.level - b.level);
  };

  const defenseIcon = (type: string) =>
    type === 'damage_immunity'
      ? '✨'
      : type === 'damage_resistance'
      ? '🛡️'
      : '💪';

  const renderClass = (cls: ClassLevel, realIndex: number) => {
    const featuresByLevel = getFeaturesByLevel(cls.features);
    const allLevels = Array.from({ length: cls.level }, (_, i) => i + 1);
    const clsDefenses = classDefenses[cls.className] || [];

    return (
      <div
        key={cls.id || realIndex}
        className={`rounded-lg border p-4 ${
          cls.isActive
            ? 'bg-gray-800/30 border-purple-500/30'
            : 'bg-gray-900/30 border-gray-700 opacity-75'
        }`}
      >
        <div className="flex flex-wrap gap-3 items-start justify-between mb-3">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-gray-400 mb-1">
              Klassenname
            </label>
            <input
              type="text"
              value={cls.className}
              onChange={(e) =>
                updateClass(realIndex, 'className', e.target.value)
              }
              placeholder="z.B. Barbar"
              className="w-full px-3 py-2 bg-gray-800 rounded-lg font-semibold text-lg"
            />
          </div>

          <div className="w-24">
            <label className="block text-xs text-gray-400 mb-1">Level</label>
            <input
              type="number"
              min={1}
              value={cls.level}
              onChange={(e) =>
                updateClass(
                  realIndex,
                  'level',
                  Math.max(1, parseInt(e.target.value) || 1)
                )
              }
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-center font-bold"
            />
          </div>

          <div className="w-24">
            <label className="block text-xs text-gray-400 mb-1">
              Trefferwürfel
            </label>
            <select
              value={cls.hitDie}
              onChange={(e) => updateClass(realIndex, 'hitDie', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-center"
            >
              {HIT_DIE_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => updateClass(realIndex, 'isActive', !cls.isActive)}
              className={`px-3 py-2 rounded-lg text-sm ${
                cls.isActive ? 'bg-green-600/50' : 'bg-gray-700'
              }`}
            >
              {cls.isActive ? '✓ Aktiv' : '✗ Verlassen'}
            </button>
            <button
              type="button"
              onClick={() => removeClass(realIndex)}
              className="px-3 py-2 bg-red-600/50 hover:bg-red-600 rounded-lg text-sm"
            >
              🗑️
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-400 mb-1">
              Subklasse (falls vorhanden)
            </label>
            <input
              type="text"
              value={cls.subclass || ''}
              onChange={(e) =>
                updateClass(realIndex, 'subclass', e.target.value)
              }
              placeholder="z.B. Pfad des Berserkers"
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Subklasse ab Level
            </label>
            <input
              type="number"
              min={1}
              value={cls.subclassLevel ?? ''}
              onChange={(e) =>
                updateClass(
                  realIndex,
                  'subclassLevel',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Spellcasting-Attribut
            </label>
            <select
              value={cls.spellcastingAbility}
              onChange={(e) =>
                updateClass(
                  realIndex,
                  'spellcastingAbility',
                  e.target.value as SpellcastingAbility
                )
              }
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-sm"
            >
              {SPELLCASTING_ABILITIES.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Quellenangabe
            </label>
            <input
              type="text"
              value={cls.sourceReference}
              onChange={(e) =>
                updateClass(realIndex, 'sourceReference', e.target.value)
              }
              placeholder="z.B. PHB S. 46"
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-sm"
            />
          </div>
        </div>

        <div className="mb-3 p-3 bg-gray-800/50 rounded-lg">
          <label className="block text-xs text-gray-400 mb-2">
            🎲 Rettungswurf-Übungen dieser Klasse
          </label>
          <div className="flex flex-wrap gap-1">
            {attributeNames.map((name) => {
              const isSelected = (
                cls.savingThrowProficiencies || []
              ).includes(name);
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleSavingThrow(realIndex, name)}
                  className={`px-2 py-1 rounded text-xs transition ${
                    isSelected
                      ? 'bg-purple-600 text-white ring-1 ring-purple-400'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {isSelected && '✓ '}
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-3 p-3 bg-gray-800/50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs text-gray-400">
              🛡️ Verteidigungen dieser Klasse
            </label>
            <button
              type="button"
              onClick={() =>
                setDefensesModalState({
                  isOpen: true,
                  className: cls.className,
                })
              }
              className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 rounded"
            >
              Bearbeiten
            </button>
          </div>
          {clsDefenses.length === 0 && (
            <p className="text-xs text-gray-500 italic">
              Keine Verteidigungen eingetragen.
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            {clsDefenses.map((d) => (
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

        {!cls.isActive && (
          <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-lg p-3 mb-3">
            <div className="flex flex-wrap gap-3 items-center">
              <span className="text-sm text-yellow-300 font-semibold">
                ⚠️ Klasse verlassen auf Level
              </span>
              <input
                type="number"
                value={cls.leftAtLevel ?? cls.level}
                onChange={(e) =>
                  updateClass(
                    realIndex,
                    'leftAtLevel',
                    parseInt(e.target.value) || cls.level
                  )
                }
                className="w-20 px-2 py-1 bg-gray-800 rounded text-sm text-center"
              />
            </div>
          </div>
        )}

        <div className="mb-3">
          <label className="block text-xs text-gray-400 mb-1">
            Notizen / Klassenwechsel-Dokumentation
          </label>
          <textarea
            value={cls.notes}
            onChange={(e) => updateClass(realIndex, 'notes', e.target.value)}
            rows={2}
            placeholder="z.B. Eid gebrochen in Session 12..."
            className="w-full px-3 py-2 bg-gray-800 rounded-lg text-sm resize-none"
          />
        </div>

        <div className="border-t border-gray-700 pt-3">
          <h4 className="text-sm font-semibold text-purple-300 mb-3">
            📋 Level-Übersicht
          </h4>

          <div className="space-y-3">
            {allLevels.map((lvl) => {
              const featuresAtLevel =
                featuresByLevel.find((f) => f.level === lvl)?.features || [];
              const isSubclassLevel = cls.subclassLevel === lvl && cls.subclass;
              return (
                <div
                  key={lvl}
                  className="bg-gray-800/40 rounded-lg p-2 border border-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-300">
                        Level {lvl}
                      </span>
                      {isSubclassLevel && (
                        <span className="text-xs text-pink-300">
                          🎭 Subklasse gewählt
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {CLASS_FEATURE_KINDS.slice(0, 4).map((k) => (
                        <button
                          key={k.value}
                          type="button"
                          onClick={() =>
                            openFeatureEditor(realIndex, null, k.value)
                          }
                          className="px-2 py-0.5 text-xs bg-gray-700 hover:bg-gray-600 rounded"
                          title={`+ ${k.label} auf Level ${lvl}`}
                        >
                          + {k.icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {featuresAtLevel.length === 0 && (
                    <div className="text-xs text-gray-500 italic">
                      Keine Einträge auf diesem Level.
                    </div>
                  )}

                  <div className="space-y-1">
                    {featuresAtLevel.map((f) => {
                      const kindData = CLASS_FEATURE_KINDS.find(
                        (k) => k.value === f.kind
                      );
                      const sourceIcon =
                        CLASS_FEATURE_SOURCES.find(
                          (s) => s.value === f.source
                        )?.icon || '•';
                      const typeData = CLASS_FEATURE_TYPES.find(
                        (t) => t.value === f.type
                      );
                      const rechargeData = CLASS_FEATURE_RECHARGE.find(
                        (r) => r.value === f.rechargeType
                      );
                      return (
                        <div
                          key={f.id}
                          onClick={() => openFeatureEditor(realIndex, f)}
                          className="bg-gray-800/60 hover:bg-gray-800 rounded p-2 cursor-pointer flex items-start gap-2"
                        >
                          <span className="text-sm">
                            {kindData?.icon || sourceIcon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-medium text-sm ${
                                  kindData?.color || ''
                                }`}
                              >
                                {f.name}
                              </span>
                              {f.kind !== 'feature' && kindData && (
                                <span className="text-xs text-gray-400">
                                  {kindData.label}
                                </span>
                              )}
                              {f.kind === 'feature' && typeData && (
                                <span className="text-xs text-gray-400">
                                  {typeData.icon} {typeData.label}
                                </span>
                              )}
                              {f.isConcentration && (
                                <span className="text-xs text-yellow-400">
                                  🧠
                                </span>
                              )}
                              {f.savingThrow && (
                                <span className="text-xs text-red-400">
                                  🛡️ {f.savingThrow}
                                </span>
                              )}
                              {f.usesPerRest && rechargeData && (
                                <span className="text-xs text-blue-400">
                                  {f.usesPerRest}× / {rechargeData.label}
                                </span>
                              )}
                            </div>
                            {f.description && (
                              <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                {f.description}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">🎚️ Level & Aufstieg</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Charakter-Level (Gesamt)
            </label>
            <input
              type="number"
              min={1}
              value={characterLevel}
              onChange={(e) =>
                onCharacterLevelChange(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-lg font-bold"
            />
            {classProgression === 'normal' && (
              <p className="text-xs text-gray-500 mt-1">
                Summe Klassen: {track0Sum} / {characterLevel}
                {track0Sum > characterLevel && (
                  <span className="text-red-400 ml-2">⚠️ Überschritten</span>
                )}
              </p>
            )}
            {classProgression === 'dual' && (
              <p className="text-xs text-gray-500 mt-1">
                Track A: {track0Sum} / {characterLevel} • Track B: {track1Sum} /{' '}
                {characterLevel}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Progressionstyp
            </label>
            <div className="flex gap-2">
              {(['normal', 'dual'] as ClassProgression[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onClassProgressionChange(p)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    classProgression === p
                      ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                  title={CLASS_PROGRESSION_LABELS[p].tooltip}
                >
                  {CLASS_PROGRESSION_LABELS[p].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {levelingMode === 'exp' && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
              <h4 className="text-md font-semibold">📊 Erfahrungspunkte</h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onExpModeChange('next_only')}
                  className={`px-3 py-1 text-xs rounded transition ${
                    expMode === 'next_only'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  Nur nächster Level
                </button>
                <button
                  type="button"
                  onClick={() => onExpModeChange('per_level')}
                  className={`px-3 py-1 text-xs rounded transition ${
                    expMode === 'per_level'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  Schwellen pro Level
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Aktuelle EXP
                </label>
                <input
                  type="number"
                  min={0}
                  value={experience}
                  onChange={(e) =>
                    onExperienceChange(parseInt(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  EXP hinzufügen
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={expAddValue}
                    onChange={(e) => setExpAddValue(e.target.value)}
                    placeholder="z.B. 200"
                    className="flex-1 px-3 py-2 bg-gray-800 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddExp}
                    disabled={!expAddValue}
                    className="px-3 py-2 bg-green-600 rounded-lg disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {expMode === 'per_level'
                    ? `Schwelle Level ${characterLevel + 1}`
                    : 'Schwelle nächstes Level'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={
                    expMode === 'per_level'
                      ? expThresholds[characterLevel + 1] ?? 0
                      : nextLevelExp
                  }
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    if (expMode === 'per_level') {
                      onExpThresholdsChange({
                        ...expThresholds,
                        [characterLevel + 1]: val,
                      });
                    } else {
                      onNextLevelExpChange(val);
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">
                  {experience} / {currentThreshold} EXP
                </span>
                {hasReachedNextLevel && (
                  <span className="text-green-400 font-semibold animate-pulse">
                    ✨ Neues Level erreicht!
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    hasReachedNextLevel ? 'bg-green-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${expProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800/30 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">❤️ Trefferpunktquellen</h3>
          <div className="text-right">
            <div className="text-sm text-gray-400">Gesamt</div>
            <div className="text-2xl font-bold text-purple-400">
              {totalHpWithCon}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {hpSources.map((src, idx) => {
            const isConMod = src.sourceType === 'conMod';
            return (
              <div
                key={idx}
                className="flex gap-2 items-center bg-gray-800/50 rounded-lg p-2"
              >
                <select
                  value={src.sourceType}
                  onChange={(e) =>
                    updateHpSource(
                      idx,
                      'sourceType',
                      e.target.value as HpSourceType
                    )
                  }
                  disabled={isConMod}
                  className="px-2 py-1 bg-gray-700 rounded text-sm w-32 disabled:opacity-50"
                >
                  {HP_SOURCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.icon} {t.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={src.name}
                  onChange={(e) => updateHpSource(idx, 'name', e.target.value)}
                  placeholder="Name"
                  disabled={isConMod}
                  className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm disabled:opacity-50"
                />
                <input
                  type="number"
                  value={src.value}
                  onChange={(e) =>
                    updateHpSource(idx, 'value', parseInt(e.target.value) || 0)
                  }
                  disabled={isConMod}
                  className="w-20 px-2 py-1 bg-gray-700 rounded text-sm text-right disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => removeHpSource(idx)}
                  className="text-red-400 hover:text-red-300 px-2"
                >
                  🗑️
                </button>
              </div>
            );
          })}

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={addHpSource}
              className="flex-1 px-3 py-2 bg-purple-600 rounded text-sm"
            >
              + Quelle hinzufügen
            </button>
            <button
              type="button"
              onClick={toggleConModSource}
              className={`px-3 py-2 rounded text-sm ${
                hasConModSource ? 'bg-red-600' : 'bg-blue-600'
              }`}
            >
              {hasConModSource ? '− KonstiMod' : '+ KonstiMod'} (
              {getConModValue() >= 0 ? '+' : ''}
              {getConModValue()} × {characterLevel || 1})
            </button>
          </div>
        </div>
      </div>

      <HitDiceEditor
        hitDice={hitDice}
        onUpdate={onHitDiceUpdate}
        classLevels={classLevels}
        constitutionModifier={getConModValue()}
        characterId={characterId}
        characterName={characterName}
        onHeal={onHeal}
        hasHitDice={hasHitDice}
        onHasHitDiceChange={onHasHitDiceChange}
        hitDiceMode={hitDiceMode}
        onHitDiceModeChange={onHitDiceModeChange}
      />

      <ResourceEditor
        resources={resources}
        onUpdate={onResourcesUpdate}
        classLevels={classLevels.map((cl) => ({
          id: cl.id,
          className: cl.className,
        }))}
      />

      {classProgression === 'normal' ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">📚 Klassen</h3>

          {classLevels.filter((cl) => cl.track === 0).length === 0 && (
            <div className="text-center text-gray-500 italic py-6 bg-gray-800/30 rounded-lg">
              Noch keine Klasse hinzugefügt.
            </div>
          )}

          {classLevels.map((cls, idx) =>
            cls.track === 0 ? renderClass(cls, idx) : null
          )}

          <div className="bg-gray-800/30 rounded-lg p-3 flex gap-2">
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addClass(0)}
              placeholder="Neue Klasse (z.B. Kleriker)"
              className="flex-1 px-3 py-2 bg-gray-800 rounded-lg"
            />
            <button
              type="button"
              onClick={() => addClass(0)}
              disabled={!newClassName.trim()}
              className="px-4 py-2 bg-purple-600 rounded-lg text-sm disabled:opacity-50"
            >
              + Klasse hinzufügen
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            📚 Dualclassing – zwei Container
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3 p-3 bg-gray-900/30 rounded-lg border border-blue-500/30">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-semibold text-blue-300">
                  📦 Container A (Track 1)
                </h4>
                <span className="text-xs text-gray-500">
                  Summe: {track0Sum} / {characterLevel}
                </span>
              </div>
              {classLevels.filter((cl) => cl.track === 0).length === 0 && (
                <div className="text-xs text-gray-500 italic py-4 text-center">
                  Keine Klasse in Container A.
                </div>
              )}
              {classLevels.map((cls, idx) =>
                cls.track === 0 ? renderClass(cls, idx) : null
              )}
            </div>

            <div className="space-y-3 p-3 bg-gray-900/30 rounded-lg border border-orange-500/30">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-semibold text-orange-300">
                  📦 Container B (Track 2)
                </h4>
                <span className="text-xs text-gray-500">
                  Summe: {track1Sum} / {characterLevel}
                </span>
              </div>
              {classLevels.filter((cl) => cl.track === 1).length === 0 && (
                <div className="text-xs text-gray-500 italic py-4 text-center">
                  Keine Klasse in Container B.
                </div>
              )}
              {classLevels.map((cls, idx) =>
                cls.track === 1 ? renderClass(cls, idx) : null
              )}
            </div>
          </div>

          <div className="bg-gray-800/30 rounded-lg p-3 space-y-2">
            <div className="text-xs text-gray-400">
              Neue Klasse hinzufügen zu:
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setNewClassTrack(0)}
                className={`px-3 py-1 text-xs rounded transition ${
                  newClassTrack === 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                📦 Container A
              </button>
              <button
                type="button"
                onClick={() => setNewClassTrack(1)}
                className={`px-3 py-1 text-xs rounded transition ${
                  newClassTrack === 1
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                📦 Container B
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addClass(newClassTrack)}
                placeholder="Neue Klasse (z.B. Magier)"
                className="flex-1 px-3 py-2 bg-gray-800 rounded-lg"
              />
              <button
                type="button"
                onClick={() => addClass(newClassTrack)}
                disabled={!newClassName.trim()}
                className="px-4 py-2 bg-purple-600 rounded-lg text-sm disabled:opacity-50"
              >
                + Klasse hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}

      {featureEditorState.isOpen && featureEditorState.classIndex >= 0 && (
        <ClassFeatureEditor
          isOpen={featureEditorState.isOpen}
          onClose={closeFeatureEditor}
          onSave={saveFeature}
          onDelete={featureEditorState.feature ? deleteFeature : undefined}
          initialFeature={featureEditorState.feature}
          availableLevels={Array.from(
            { length: classLevels[featureEditorState.classIndex]?.level || 1 },
            (_, i) => i + 1
          )}
          className={classLevels[featureEditorState.classIndex]?.className || ''}
          availableForms={availableForms}
          availableCompanions={availableCompanions}
          defaultKind={featureEditorState.defaultKind}
        />
      )}

      <DefensesModal
        isOpen={defensesModalState.isOpen}
        onClose={() =>
          setDefensesModalState({ isOpen: false, className: '' })
        }
        source="class"
        sourceName={defensesModalState.className}
        defenses={classDefenses[defensesModalState.className] || []}
        onSave={(defs) => {
          onClassDefensesChange(defensesModalState.className, defs);
        }}
        characterId={characterId}
      />
    </div>
  );
}