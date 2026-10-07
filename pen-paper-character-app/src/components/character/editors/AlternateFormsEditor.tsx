// src/components/character/editors/AlternateFormsEditor.tsx
'use client';

import { useState } from 'react';
import {
  AlternateForm,
  FORM_SOURCES,
  FORM_SIZES,
  FORM_ACTIVATION_TYPES,
  FORM_DURATION_TYPES,
  FormAttack,
  FormAbility,
  createEmptyAlternateForm,
  createEmptyFormAttack,
  createEmptyFormAbility,
} from '@/types/forms';
import { CharacterResource, RESOURCE_RECHARGE_TYPES } from '@/types/resources';
import { ClassLevel } from '@/components/character/editors/ClassLevelsEditor';
import { ClassFeature } from '@/types/classFeatures';
import { UnitSystem } from '@/types/character';
import { FormStatBlock } from '@/components/forms/FormStatBlock';

interface AlternateFormsEditorProps {
  forms: AlternateForm[];
  onUpdate: (forms: AlternateForm[]) => void;
  characterId: string;
  characterName?: string;
  unitSystem: UnitSystem;
  resources: CharacterResource[];
  classLevels: ClassLevel[];
  onActivate?: (form: AlternateForm) => void;
  onDeactivate?: (form: AlternateForm) => void;
  readOnly?: boolean;
}

const ICON_SUGGESTIONS = ['🐺', '🐻', '🦅', '🐍', '🐉', '🦁', '🐈', '🦇', '🦈', '🐘', '🦂', '🐜'];

export function AlternateFormsEditor({
  forms,
  onUpdate,
  characterId,
  characterName,
  unitSystem,
  resources,
  classLevels,
  onActivate,
  onDeactivate,
  readOnly = false,
}: AlternateFormsEditorProps) {
  const [editingForm, setEditingForm] = useState<AlternateForm | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  // Alle verfügbaren Features aus Klassen sammeln (für Verknüpfung)
  const allFeatures: { feature: ClassFeature; className: string }[] = [];
  classLevels.forEach((cl) => {
    (cl.features || []).forEach((f) => {
      allFeatures.push({ feature: f, className: cl.className });
    });
  });

  const openNew = () => {
    const newForm = createEmptyAlternateForm(characterId);
    setEditingForm(newForm);
    setShowEditor(true);
  };

  const openEdit = (form: AlternateForm) => {
    setEditingForm({ ...form });
    setShowEditor(true);
  };

  const handleSave = () => {
    if (!editingForm) return;
    if (!editingForm.name.trim()) {
      alert('Name ist erforderlich');
      return;
    }

    const existingIdx = forms.findIndex((f) => f.id === editingForm.id);
    let updated: AlternateForm[];
    if (existingIdx >= 0) {
      updated = forms.map((f) => (f.id === editingForm.id ? editingForm : f));
    } else {
      updated = [...forms, editingForm];
    }
    onUpdate(updated);
    setShowEditor(false);
    setEditingForm(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Form wirklich löschen?')) return;
    onUpdate(forms.filter((f) => f.id !== id));
  };

  const updateForm = <K extends keyof AlternateForm>(
    field: K,
    value: AlternateForm[K]
  ) => {
    if (!editingForm) return;
    setEditingForm({ ...editingForm, [field]: value });
  };

  const addAttack = () => {
    if (!editingForm) return;
    updateForm('attacks', [...editingForm.attacks, createEmptyFormAttack()]);
  };

  const removeAttack = (id: string) => {
    if (!editingForm) return;
    updateForm('attacks', editingForm.attacks.filter((a) => a.id !== id));
  };

  const updateAttack = <K extends keyof FormAttack>(
    id: string,
    field: K,
    value: FormAttack[K]
  ) => {
    if (!editingForm) return;
    updateForm(
      'attacks',
      editingForm.attacks.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const addAbility = () => {
    if (!editingForm) return;
    updateForm('abilities', [...editingForm.abilities, createEmptyFormAbility()]);
  };

  const removeAbility = (id: string) => {
    if (!editingForm) return;
    updateForm('abilities', editingForm.abilities.filter((a) => a.id !== id));
  };

  const updateAbility = <K extends keyof FormAbility>(
    id: string,
    field: K,
    value: FormAbility[K]
  ) => {
    if (!editingForm) return;
    updateForm(
      'abilities',
      editingForm.abilities.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">🐺 Gestaltwandeln-Formen</h3>
        {!readOnly && (
          <button
            type="button"
            onClick={openNew}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded text-sm"
          >
            + Form hinzufügen
          </button>
        )}
      </div>

      {forms.length === 0 && (
        <div className="text-center text-gray-500 italic py-6 bg-gray-800/30 rounded-lg">
          Noch keine Formen eingetragen.
        </div>
      )}

      <div className="space-y-2">
        {forms.map((form) => {
          const isActive = form.isActive;
          return (
            <div
              key={form.id}
              className={`rounded-lg border p-3 transition ${
                isActive
                  ? 'bg-orange-900/20 border-orange-500/60'
                  : 'bg-gray-800/30 border-gray-700/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{form.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{form.name}</span>
                    {isActive && (
                      <span className="text-xs px-1.5 py-0.5 bg-orange-600/40 text-orange-200 rounded">
                        AKTIV
                      </span>
                    )}
                    {form.concentration && (
                      <span className="text-xs text-yellow-400" title="Konzentration">
                        🧠
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      CR {form.challengeRating}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    RK {form.armorClass} • TP {form.hpCurrent}/{form.hpMax} •{' '}
                    {FORM_SOURCES.find((s) => s.value === form.source)?.label ||
                      form.source}
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {!readOnly && (
                    <>
                      {isActive ? (
                        <button
                          type="button"
                          onClick={() => onDeactivate?.(form)}
                          className="px-2 py-1 text-xs bg-red-600/60 hover:bg-red-600 rounded"
                        >
                          ↩️ Verlassen
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onActivate?.(form)}
                          className="px-2 py-1 text-xs bg-orange-600/60 hover:bg-orange-600 rounded"
                        >
                          🐾 Aktivieren
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(form)}
                        className="px-2 py-1 text-xs bg-blue-600/60 hover:bg-blue-600 rounded"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(form.id)}
                        className="px-2 py-1 text-xs bg-red-600/50 hover:bg-red-600 rounded"
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Editor-Modal */}
      {showEditor && editingForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-900 rounded-xl max-w-3xl w-full border border-purple-500/30 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold">
                {forms.find((f) => f.id === editingForm.id)
                  ? 'Form bearbeiten'
                  : 'Neue Form'}
              </h2>
              <button type="button"
                onClick={() => {
                  setShowEditor(false);
                  setEditingForm(null);
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
                    value={editingForm.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder="z.B. Braunbär, Wolf, Riesenfledermaus"
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Quelle</label>
                  <select
                    value={editingForm.source}
                    onChange={(e) => updateForm('source', e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  >
                    {FORM_SOURCES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.icon} {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_SUGGESTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => updateForm('icon', icon)}
                      className={`w-9 h-9 rounded text-lg transition ${
                        editingForm.icon === icon
                          ? 'bg-purple-600 ring-2 ring-purple-400'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                  <input
                    type="text"
                    value={editingForm.icon}
                    onChange={(e) => updateForm('icon', e.target.value)}
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
                    value={editingForm.challengeRating}
                    onChange={(e) => updateForm('challengeRating', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Größe</label>
                  <select
                    value={editingForm.size}
                    onChange={(e) => updateForm('size', e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  >
                    {FORM_SIZES.map((s) => (
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
                    value={editingForm.creatureType}
                    onChange={(e) => updateForm('creatureType', e.target.value)}
                    placeholder="z.B. Tier, Monstrosität"
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">RK</label>
                  <input
                    type="number"
                    value={editingForm.armorClass}
                    onChange={(e) =>
                      updateForm('armorClass', parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Max TP</label>
                  <input
                    type="number"
                    value={editingForm.hpMax}
                    onChange={(e) =>
                      updateForm('hpMax', parseInt(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    TP-Formel
                  </label>
                  <input
                    type="text"
                    value={editingForm.hpFormula}
                    onChange={(e) => updateForm('hpFormula', e.target.value)}
                    placeholder="z.B. 4d8+12"
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
                      value={(editingForm as any)[key]}
                      onChange={(e) =>
                        updateForm(key, parseInt(e.target.value) || 0)
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
                    <label className="block text-xs text-gray-400 mb-1">{label}</label>
                    <input
                      type="number"
                      value={(editingForm as any)[key]}
                      onChange={(e) =>
                        updateForm(key, parseInt(e.target.value) || 0)
                      }
                      className="w-full px-2 py-1 bg-gray-800 rounded text-center"
                    />
                  </div>
                ))}
              </div>

              {/* Angriffe */}
              <div className="border-t border-gray-700 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-semibold text-orange-300">
                    ⚔️ Angriffe
                  </h4>
                  <button
                    type="button"
                    onClick={addAttack}
                    className="px-2 py-1 text-xs bg-purple-600 rounded hover:bg-purple-700"
                  >
                    + Angriff
                  </button>
                </div>
                {editingForm.attacks.length === 0 && (
                  <div className="text-xs text-gray-500 italic">Keine Angriffe</div>
                )}
                <div className="space-y-2">
                  {editingForm.attacks.map((atk) => (
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
                          placeholder="1d8+3"
                          className="px-2 py-1 bg-gray-700 rounded text-sm"
                        />
                        <input
                          type="text"
                          value={atk.damageType}
                          onChange={(e) => updateAttack(atk.id, 'damageType', e.target.value)}
                          placeholder="Hieb"
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
                  <h4 className="text-sm font-semibold text-purple-300">
                    ✨ Fähigkeiten
                  </h4>
                  <button
                    type="button"
                    onClick={addAbility}
                    className="px-2 py-1 text-xs bg-purple-600 rounded hover:bg-purple-700"
                  >
                    + Fähigkeit
                  </button>
                </div>
                {editingForm.abilities.length === 0 && (
                  <div className="text-xs text-gray-500 italic">Keine Fähigkeiten</div>
                )}
                <div className="space-y-2">
                  {editingForm.abilities.map((ability) => (
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

              {/* Aktivierung */}
              <div className="border-t border-gray-700 pt-3 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Aktivierung
                  </label>
                  <select
                    value={editingForm.activationType}
                    onChange={(e) =>
                      updateForm('activationType', e.target.value as any)
                    }
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  >
                    {FORM_ACTIVATION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Dauer-Typ</label>
                  <select
                    value={editingForm.durationType}
                    onChange={(e) =>
                      updateForm('durationType', e.target.value as any)
                    }
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  >
                    {FORM_DURATION_TYPES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
                {editingForm.durationType !== 'unlimited' &&
                  editingForm.durationType !== 'until_dismissed' &&
                  editingForm.durationType !== 'until_hp_zero' && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Dauer-Wert
                      </label>
                      <input
                        type="number"
                        value={editingForm.durationValue}
                        onChange={(e) =>
                          updateForm('durationValue', parseInt(e.target.value) || 1)
                        }
                        className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                      />
                    </div>
                  )}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Nutzungen pro Rast
                  </label>
                  <input
                    type="number"
                    value={editingForm.usesPerRest ?? ''}
                    onChange={(e) =>
                      updateForm(
                        'usesPerRest',
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    placeholder="(leer = unbegrenzt)"
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Aufladung
                  </label>
                  <select
                    value={editingForm.rechargeType}
                    onChange={(e) =>
                      updateForm('rechargeType', e.target.value as any)
                    }
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  >
                    {RESOURCE_RECHARGE_TYPES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.icon} {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editingForm.concentration}
                      onChange={(e) =>
                        updateForm('concentration', e.target.checked)
                      }
                    />
                    Konzentration
                  </label>
                </div>
              </div>

              {/* Verknüpfung */}
              <div className="border-t border-gray-700 pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">
                    Verknüpfte Ressource (Wild Shape etc.)
                  </label>
                  <select
                    value={editingForm.linkedResourceId || ''}
                    onChange={(e) =>
                      updateForm('linkedResourceId', e.target.value || null)
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
                    value={editingForm.linkedFeatureId || ''}
                    onChange={(e) =>
                      updateForm('linkedFeatureId', e.target.value || null)
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

              {/* Beschreibung + Quellenangabe */}
              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Beschreibung
                </label>
                <textarea
                  value={editingForm.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  Quellenangabe
                </label>
                <input
                  type="text"
                  value={editingForm.sourceReference}
                  onChange={(e) => updateForm('sourceReference', e.target.value)}
                  placeholder="z.B. PHB S. 66"
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                />
              </div>

              {/* Vorschau */}
              {editingForm.name && (
                <div className="border-t border-gray-700 pt-3">
                  <div className="text-xs text-gray-400 mb-2">Vorschau:</div>
                  <FormStatBlock
                    form={editingForm}
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
                  setEditingForm(null);
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