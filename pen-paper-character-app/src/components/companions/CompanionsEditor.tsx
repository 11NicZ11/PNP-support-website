// src/components/character/companions/CompanionsEditor.tsx
'use client';

import { useState } from 'react';
import {
  Companion,
  COMPANION_TYPES,
  COMPANION_SOURCES,
  COMPANION_SIZES,
  COMPANION_BEHAVIORS,
  CompanionAttack,
  createEmptyCompanion,
  createEmptyCompanionAttack,
} from '@/types/companions';
import { FormAbility, createEmptyFormAbility } from '@/types/forms';
import { CharacterResource } from '@/types/resources';
import { ClassLevel } from '@/components/character/editors/ClassLevelsEditor';
import { ClassFeature } from '@/types/classFeatures';
import { UnitSystem } from '@/types/character';
import {
  getDistanceUnitLabel,
  displayDistanceValue,
  parseDistanceInput,
  ftToM,
  mToFt,
} from '@/lib/units';
import { CompanionCard } from './CompanionCard';
import { CompanionStatBlock } from './CompanionStatBlock';

interface CompanionsEditorProps {
  companions: Companion[];
  onUpdate: (companions: Companion[]) => void;
  characterId: string;
  characterName?: string;
  unitSystem: UnitSystem;
  resources: CharacterResource[];
  classLevels: ClassLevel[];
  onDamage: (id: string, amount: number) => void;
  onHeal: (id: string, amount: number) => void;
  onDismiss: (id: string) => void;
  onRecall: (id: string) => void;
  readOnly?: boolean;
}

const ICON_SUGGESTIONS = ['🦉', '🐺', '🐈', '🐴', '🦅', '🐉', '🦎', '🐍', '🦇', '🦊', '🐸', '🦂', '🐝', '🐙'];

export function CompanionsEditor({
  companions,
  onUpdate,
  characterId,
  characterName,
  unitSystem,
  resources,
  classLevels,
  onDamage,
  onHeal,
  onDismiss,
  onRecall,
  readOnly = false,
}: CompanionsEditorProps) {
  const [editingCompanion, setEditingCompanion] = useState<Companion | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Alle verfügbaren Features aus Klassen sammeln
  const allFeatures: { feature: ClassFeature; className: string }[] = [];
  classLevels.forEach((cl) => {
    (cl.features || []).forEach((f) => {
      allFeatures.push({ feature: f, className: cl.className });
    });
  });

  const openNew = () => {
    const newCompanion = createEmptyCompanion(characterId);
    setEditingCompanion(newCompanion);
    setShowEditor(true);
  };

  const openEdit = (companion: Companion) => {
    setEditingCompanion({ ...companion });
    setShowEditor(true);
  };

  const handleSave = () => {
    if (!editingCompanion) return;
    if (!editingCompanion.name.trim()) {
      alert('Name ist erforderlich');
      return;
    }

    const existingIdx = companions.findIndex((c) => c.id === editingCompanion.id);
    let updated: Companion[];
    if (existingIdx >= 0) {
      updated = companions.map((c) => (c.id === editingCompanion.id ? editingCompanion : c));
    } else {
      updated = [...companions, editingCompanion];
    }
    onUpdate(updated);
    setShowEditor(false);
    setEditingCompanion(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Gefährten wirklich löschen?')) return;
    onUpdate(companions.filter((c) => c.id !== id));
  };

  const updateCompanion = <K extends keyof Companion>(
    field: K,
    value: Companion[K]
  ) => {
    if (!editingCompanion) return;
    setEditingCompanion({ ...editingCompanion, [field]: value });
  };

  const addAttack = () => {
    if (!editingCompanion) return;
    updateCompanion('attacks', [
      ...editingCompanion.attacks,
      createEmptyCompanionAttack(),
    ]);
  };

  const removeAttack = (id: string) => {
    if (!editingCompanion) return;
    updateCompanion('attacks', editingCompanion.attacks.filter((a) => a.id !== id));
  };

  const updateAttack = <K extends keyof CompanionAttack>(
    id: string,
    field: K,
    value: CompanionAttack[K]
  ) => {
    if (!editingCompanion) return;
    updateCompanion(
      'attacks',
      editingCompanion.attacks.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const addAbility = () => {
    if (!editingCompanion) return;
    updateCompanion('abilities', [
      ...editingCompanion.abilities,
      createEmptyFormAbility(),
    ]);
  };

  const removeAbility = (id: string) => {
    if (!editingCompanion) return;
    updateCompanion('abilities', editingCompanion.abilities.filter((a) => a.id !== id));
  };

  const updateAbility = <K extends keyof FormAbility>(
    id: string,
    field: K,
    value: FormAbility[K]
  ) => {
    if (!editingCompanion) return;
    updateCompanion(
      'abilities',
      editingCompanion.abilities.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const activeCompanions = companions.filter((c) => !c.isDismissed);
  const dismissedCompanions = companions.filter((c) => c.isDismissed);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold">🐾 Gefährten</h3>
          <p className="text-xs text-gray-500">
            Vertraute, Tiergefährten, Reittiere, Beschwörungen
          </p>
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={openNew}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm"
          >
            + Gefährte hinzufügen
          </button>
        )}
      </div>

      {companions.length === 0 && (
        <div className="text-center text-gray-500 italic py-6 bg-gray-800/30 rounded-lg">
          Noch keine Gefährten eingetragen.
        </div>
      )}

      {/* Aktive Gefährten */}
      {activeCompanions.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-green-300">
            ✓ Aktiv ({activeCompanions.length})
          </div>
          {activeCompanions.map((companion) => (
            <CompanionCard
              key={companion.id}
              companion={companion}
              unitSystem={unitSystem}
              characterId={characterId}
              characterName={characterName}
              onEdit={openEdit}
              onDelete={handleDelete}
              onDamage={onDamage}
              onHeal={onHeal}
              onDismiss={onDismiss}
              onRecall={onRecall}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}

      {/* Abberufene Gefährten */}
      {dismissedCompanions.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-400">
            💤 Abberufen ({dismissedCompanions.length})
          </div>
          {dismissedCompanions.map((companion) => (
            <CompanionCard
              key={companion.id}
              companion={companion}
              unitSystem={unitSystem}
              characterId={characterId}
              characterName={characterName}
              onEdit={openEdit}
              onDelete={handleDelete}
              onDamage={onDamage}
              onHeal={onHeal}
              onDismiss={onDismiss}
              onRecall={onRecall}
              readOnly={readOnly}
            />
          ))}
        </div>
      )}

      {/* Editor-Modal */}
      {showEditor && editingCompanion && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-900 rounded-xl max-w-3xl w-full border border-purple-500/30 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold">
                {companions.find((c) => c.id === editingCompanion.id)
                  ? 'Gefährte bearbeiten'
                  : 'Neuer Gefährte'}
              </h2>
              <button type="button"
                onClick={() => {
                  setShowEditor(false);
                  setEditingCompanion(null);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Basisdaten */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Name *</label>
                  <input
                    type="text"
                    value={editingCompanion.name}
                    onChange={(e) => updateCompanion('name', e.target.value)}
                    placeholder="z.B. Eule, Wolf, Findus"
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Typ</label>
                  <select
                    value={editingCompanion.type}
                    onChange={(e) => updateCompanion('type', e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  >
                    {COMPANION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Quelle</label>
                  <select
                    value={editingCompanion.source}
                    onChange={(e) => updateCompanion('source', e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  >
                    {COMPANION_SOURCES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Verhalten</label>
                  <select
                    value={editingCompanion.behavior}
                    onChange={(e) => updateCompanion('behavior', e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  >
                    {COMPANION_BEHAVIORS.map((b) => (
                      <option key={b.value} value={b.value}>
                        {b.icon} {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {editingCompanion.behavior === 'custom' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Verhalten – Details
                  </label>
                  <input
                    type="text"
                    value={editingCompanion.behaviorNote}
                    onChange={(e) => updateCompanion('behaviorNote', e.target.value)}
                    placeholder="z.B. Bewacht den Rucksack"
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-400 mb-1">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_SUGGESTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => updateCompanion('icon', icon)}
                      className={`w-9 h-9 rounded text-lg transition ${
                        editingCompanion.icon === icon
                          ? 'bg-purple-600 ring-2 ring-purple-400'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                  <input
                    type="text"
                    value={editingCompanion.icon}
                    onChange={(e) => updateCompanion('icon', e.target.value)}
                    maxLength={2}
                    className="w-16 px-2 py-1 bg-gray-800 rounded text-center text-lg"
                  />
                </div>
              </div>

              {/* CR, Größe, Typ */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">CR</label>
                  <input
                    type="text"
                    value={editingCompanion.challengeRating}
                    onChange={(e) => updateCompanion('challengeRating', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Größe</label>
                  <select
                    value={editingCompanion.size}
                    onChange={(e) => updateCompanion('size', e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  >
                    {COMPANION_SIZES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.icon} {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-400 mb-1">
                    Kreaturentyp
                  </label>
                  <input
                    type="text"
                    value={editingCompanion.creatureType}
                    onChange={(e) => updateCompanion('creatureType', e.target.value)}
                    placeholder="z.B. Tier, Feenwesen"
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">RK</label>
                  <input
                    type="number"
                    value={editingCompanion.armorClass}
                    onChange={(e) =>
                      updateCompanion('armorClass', parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Max TP</label>
                  <input
                    type="number"
                    value={editingCompanion.hpMax}
                    onChange={(e) =>
                      updateCompanion('hpMax', parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Aktuelle TP</label>
                  <input
                    type="number"
                    value={editingCompanion.hpCurrent}
                    onChange={(e) =>
                      updateCompanion('hpCurrent', parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Temp TP</label>
                  <input
                    type="number"
                    value={editingCompanion.tempHp}
                    onChange={(e) =>
                      updateCompanion('tempHp', parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Attribute */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {(
                  [
                    ['strength', 'STÄ'],
                    ['dexterity', 'GES'],
                    ['constitution', 'KON'],
                    ['intelligence', 'INT'],
                    ['wisdom', 'WEI'],
                    ['charisma', 'CHA'],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-400 mb-1">{label}</label>
                    <input
                      type="number"
                      value={(editingCompanion as any)[key]}
                      onChange={(e) =>
                        updateCompanion(key, parseInt(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1 bg-gray-800 rounded text-center"
                    />
                  </div>
                ))}
              </div>

              {/* Bewegungsraten */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {(
                  [
                    ['speedWalk', '🚶 Laufen'],
                    ['speedFly', '🦅 Fliegen'],
                    ['speedSwim', '🐟 Schwimmen'],
                    ['speedClimb', '🧗 Klettern'],
                    ['speedBurrow', '⛏️ Graben'],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs text-gray-400 mb-1">
                      {label} ({getDistanceUnitLabel(unitSystem)})
                    </label>
                    <input
                      type="number"
                      step={unitSystem === 'imperial' ? 5 : 0.5}
                      value={displayDistanceValue(
                        ftToM((editingCompanion as any)[key]),
                        unitSystem
                      )}
                      onChange={(e) => {
                        const meters = parseDistanceInput(e.target.value, unitSystem);
                        const feet = meters != null ? mToFt(meters) : 0;
                        updateCompanion(key, Math.round(feet));
                      }}
                      className="w-full px-2 py-1 bg-gray-800 rounded text-center"
                    />
                  </div>
                ))}
              </div>

              {/* Sinne & Sprachen */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Sinne</label>
                  <input
                    type="text"
                    value={editingCompanion.senses}
                    onChange={(e) => updateCompanion('senses', e.target.value)}
                    placeholder="z.B. Dunkelsicht 36m"
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Sprachen</label>
                  <input
                    type="text"
                    value={editingCompanion.languages}
                    onChange={(e) => updateCompanion('languages', e.target.value)}
                    placeholder="z.B. versteht Gemeinsprache"
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Angriffe */}
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold text-orange-300">⚔️ Angriffe</h4>
                  <button
                    type="button"
                    onClick={addAttack}
                    className="px-2 py-1 text-xs bg-purple-600 rounded hover:bg-purple-700"
                  >
                    + Angriff
                  </button>
                </div>
                {editingCompanion.attacks.length === 0 && (
                  <div className="text-xs text-gray-500 italic">Keine Angriffe</div>
                )}
                <div className="space-y-2">
                  {editingCompanion.attacks.map((atk) => (
                    <div key={atk.id} className="bg-gray-800/50 rounded p-2 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={atk.name}
                          onChange={(e) => updateAttack(atk.id, 'name', e.target.value)}
                          placeholder="Name (z.B. Biss)"
                          className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeAttack(atk.id)}
                          className="px-2 py-1 text-xs bg-red-600/50 hover:bg-red-600 rounded"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <input
                          type="number"
                          value={atk.attackBonus}
                          onChange={(e) =>
                            updateAttack(atk.id, 'attackBonus', parseInt(e.target.value) || 0)
                          }
                          placeholder="Angriffsbonus"
                          className="px-2 py-1 bg-gray-700 rounded text-sm"
                        />
                        <input
                          type="text"
                          value={atk.damageDice}
                          onChange={(e) => updateAttack(atk.id, 'damageDice', e.target.value)}
                          placeholder="1d4+3"
                          className="px-2 py-1 bg-gray-700 rounded text-sm"
                        />
                        <input
                          type="text"
                          value={atk.damageType}
                          onChange={(e) => updateAttack(atk.id, 'damageType', e.target.value)}
                          placeholder="Stich"
                          className="px-2 py-1 bg-gray-700 rounded text-sm"
                        />
                        <input
                          type="text"
                          value={atk.range}
                          onChange={(e) => updateAttack(atk.id, 'range', e.target.value)}
                          placeholder="Reichweite"
                          className="px-2 py-1 bg-gray-700 rounded text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fähigkeiten */}
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold text-purple-300">✨ Fähigkeiten</h4>
                  <button
                    type="button"
                    onClick={addAbility}
                    className="px-2 py-1 text-xs bg-purple-600 rounded hover:bg-purple-700"
                  >
                    + Fähigkeit
                  </button>
                </div>
                {editingCompanion.abilities.length === 0 && (
                  <div className="text-xs text-gray-500 italic">Keine Fähigkeiten</div>
                )}
                <div className="space-y-2">
                  {editingCompanion.abilities.map((ability) => (
                    <div key={ability.id} className="bg-gray-800/50 rounded p-2 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={ability.name}
                          onChange={(e) => updateAbility(ability.id, 'name', e.target.value)}
                          placeholder="Name"
                          className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm"
                        />
                        <select
                          value={ability.type}
                          onChange={(e) =>
                            updateAbility(ability.id, 'type', e.target.value as any)
                          }
                          className="px-2 py-1 bg-gray-700 rounded text-sm"
                        >
                          <option value="passive">Passiv</option>
                          <option value="action">Aktion</option>
                          <option value="bonus_action">Bonusaktion</option>
                          <option value="reaction">Reaktion</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeAbility(ability.id)}
                          className="px-2 py-1 text-xs bg-red-600/50 hover:bg-red-600 rounded"
                        >
                          ✕
                        </button>
                      </div>
                      <textarea
                        value={ability.description}
                        onChange={(e) =>
                          updateAbility(ability.id, 'description', e.target.value)
                        }
                        rows={2}
                        placeholder="Beschreibung"
                        className="w-full px-2 py-1 bg-gray-700 rounded text-sm resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Verknüpfung */}
              <div className="border-t border-gray-700 pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Verknüpfte Ressource
                  </label>
                  <select
                    value={editingCompanion.linkedResourceId || ''}
                    onChange={(e) =>
                      updateCompanion('linkedResourceId', e.target.value || null)
                    }
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  >
                    <option value="">Keine Verknüpfung</option>
                    {resources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.icon} {r.name} ({r.current}/{r.max})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Verknüpftes Klassen-Feature
                  </label>
                  <select
                    value={editingCompanion.linkedFeatureId || ''}
                    onChange={(e) =>
                      updateCompanion('linkedFeatureId', e.target.value || null)
                    }
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  >
                    <option value="">Keine Verknüpfung</option>
                    {allFeatures.map(({ feature, className }) => (
                      <option key={feature.id} value={feature.id}>
                        {className} – {feature.name} (Lv {feature.level})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notizen + Quelle */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">Notizen</label>
                <textarea
                  value={editingCompanion.notes}
                  onChange={(e) => updateCompanion('notes', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Quellenangabe</label>
                <input
                  type="text"
                  value={editingCompanion.sourceReference}
                  onChange={(e) => updateCompanion('sourceReference', e.target.value)}
                  placeholder="z.B. PHB S. 240"
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                />
              </div>

              {/* Vorschau */}
              {editingCompanion.name && (
                <div className="border-t border-gray-700 pt-3">
                  <div className="text-xs text-gray-400 mb-2">Vorschau:</div>
                  <CompanionStatBlock
                    companion={editingCompanion}
                    unitSystem={unitSystem}
                    characterId={characterId}
                    characterName={characterName}
                    compact
                  />
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-4 flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg font-semibold"
              >
                Speichern
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditor(false);
                  setEditingCompanion(null);
                }}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}