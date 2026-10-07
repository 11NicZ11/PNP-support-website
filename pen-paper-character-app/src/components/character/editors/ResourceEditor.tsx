// src/components/character/edit/ResourceEditor.tsx
'use client';

import { useState } from 'react';
import {
  CharacterResource,
  RESOURCE_RECHARGE_TYPES,
  RESOURCE_SOURCES,
  ResourceRechargeType,
  ResourceSource,
} from '@/types/resources';

interface ResourceEditorProps {
  resources: CharacterResource[];
  onUpdate: (resources: CharacterResource[]) => void;
  classLevels?: { id?: string; className: string }[];
}

const ICON_SUGGESTIONS = ['✨', '🔥', '💪', '⚡', '🌀', '🧘', '🎯', '🛡️', '📚', '🗡️', '🐉', '👑'];

export function ResourceEditor({ resources, onUpdate, classLevels = [] }: ResourceEditorProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const emptyResource = (): CharacterResource => ({
    id: `temp-res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: '',
    max: 1,
    current: 1,
    rechargeType: 'long',
    source: 'class',
    sourceName: '',
    icon: '✨',
    description: '',
    classLevelId: null,
    characterId: '',
  });

  const [form, setForm] = useState<CharacterResource>(emptyResource());

  const openNew = () => {
    setForm(emptyResource());
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (resource: CharacterResource) => {
    setForm({ ...resource });
    setEditingId(resource.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const updateForm = <K extends keyof CharacterResource>(
    field: K,
    value: CharacterResource[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      alert('Name ist erforderlich');
      return;
    }

    if (editingId) {
      onUpdate(resources.map((r) => (r.id === editingId ? form : r)));
    } else {
      onUpdate([...resources, form]);
    }
    closeForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Ressource wirklich löschen?')) return;
    onUpdate(resources.filter((r) => r.id !== id));
  };

  const adjustCurrent = (id: string, delta: number) => {
    onUpdate(
      resources.map((r) =>
        r.id === id
          ? { ...r, current: Math.max(0, Math.min(r.max, r.current + delta)) }
          : r
      )
    );
  };

  const resetAll = (rechargeType: ResourceRechargeType) => {
    onUpdate(
      resources.map((r) =>
        r.rechargeType === rechargeType ? { ...r, current: r.max } : r
      )
    );
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">✨ Ressourcen</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => resetAll('short')}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
            title="Alle Short-Rest-Ressourcen auffüllen"
          >
            ☕ Kurze Rast
          </button>
          <button
            type="button"
            onClick={() => resetAll('long')}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
            title="Alle Long-Rest-Ressourcen auffüllen"
          >
            🛌 Lange Rast
          </button>
          <button
            type="button"
            onClick={openNew}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
          >
            + Ressource
          </button>
        </div>
      </div>

      {resources.length === 0 && !showForm && (
        <div className="text-center text-gray-500 italic py-4">
          Keine Ressourcen eingetragen.
        </div>
      )}

      <div className="space-y-2 mb-3">
        {resources.map((r) => {
          const rechargeData = RESOURCE_RECHARGE_TYPES.find(
            (t) => t.value === r.rechargeType
          );
          return (
            <div
              key={r.id}
              className="bg-gray-800/50 rounded-lg p-2 flex items-center gap-2"
            >
              <span className="text-xl w-8 text-center">{r.icon}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{r.name}</span>
                  {r.sourceName && (
                    <span className="text-xs text-gray-400">({r.sourceName})</span>
                  )}
                  {rechargeData && (
                    <span className="text-xs text-gray-500">
                      {rechargeData.icon} {rechargeData.label}
                    </span>
                  )}
                </div>
                {r.description && (
                  <div className="text-xs text-gray-500 line-clamp-1">
                    {r.description}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => adjustCurrent(r.id, -1)}
                  disabled={r.current <= 0}
                  className="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold disabled:opacity-30"
                >
                  −
                </button>
                <span className="text-sm font-mono w-14 text-center">
                  <span
                    className={
                      r.current === 0
                        ? 'text-red-400'
                        : r.current < r.max / 2
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }
                  >
                    {r.current}
                  </span>
                  <span className="text-gray-500"> / {r.max}</span>
                </span>
                <button
                  type="button"
                  onClick={() => adjustCurrent(r.id, 1)}
                  disabled={r.current >= r.max}
                  className="w-7 h-7 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold disabled:opacity-30"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={() => openEdit(r)}
                className="px-2 py-1 text-xs bg-blue-600/50 hover:bg-blue-600 rounded"
              >
                ✏️
              </button>
              <button
                type="button"
                onClick={() => handleDelete(r.id)}
                className="px-2 py-1 text-xs bg-red-600/50 hover:bg-red-600 rounded"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="bg-gray-800 rounded-lg p-3 space-y-3 border border-purple-500/30">
          <h4 className="text-sm font-semibold text-purple-300">
            {editingId ? 'Ressource bearbeiten' : 'Neue Ressource'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                placeholder="z.B. Ki-Punkte, Kampfrausch, Überlegenheitswürfel"
                className="w-full px-3 py-2 bg-gray-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Max</label>
              <input
                type="number"
                min={0}
                value={form.max}
                onChange={(e) => {
                  const newMax = Math.max(0, parseInt(e.target.value) || 0);
                  updateForm('max', newMax);
                  if (form.current > newMax) updateForm('current', newMax);
                }}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Aktuell</label>
              <input
                type="number"
                min={0}
                max={form.max}
                value={form.current}
                onChange={(e) =>
                  updateForm(
                    'current',
                    Math.max(0, Math.min(form.max, parseInt(e.target.value) || 0))
                  )
                }
                className="w-full px-3 py-2 bg-gray-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Aufladung
              </label>
              <select
                value={form.rechargeType}
                onChange={(e) =>
                  updateForm('rechargeType', e.target.value as ResourceRechargeType)
                }
                className="w-full px-3 py-2 bg-gray-700 rounded-lg"
              >
                {RESOURCE_RECHARGE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Quelle</label>
              <select
                value={form.source}
                onChange={(e) =>
                  updateForm('source', e.target.value as ResourceSource)
                }
                className="w-full px-3 py-2 bg-gray-700 rounded-lg"
              >
                {RESOURCE_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">
                Quelle – Details
              </label>
              <input
                type="text"
                value={form.sourceName}
                onChange={(e) => updateForm('sourceName', e.target.value)}
                placeholder="z.B. Mönch, Pfad des Berserkers"
                className="w-full px-3 py-2 bg-gray-700 rounded-lg"
              />
            </div>

            {classLevels.length > 0 && (
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">
                  Verknüpfte Klasse
                </label>
                <select
                  value={form.classLevelId || ''}
                  onChange={(e) =>
                    updateForm('classLevelId', e.target.value || null)
                  }
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg"
                >
                  <option value="">Keine Verknüpfung</option>
                  {classLevels.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                      {cl.className}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICON_SUGGESTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => updateForm('icon', icon)}
                    className={`w-9 h-9 rounded text-lg transition ${
                      form.icon === icon
                        ? 'bg-purple-600 ring-2 ring-purple-400'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => updateForm('icon', e.target.value)}
                  maxLength={2}
                  className="w-16 px-2 py-1 bg-gray-700 rounded text-center text-lg"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-gray-400 mb-1">
                Beschreibung
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                rows={2}
                placeholder="Was macht diese Ressource?"
                className="w-full px-3 py-2 bg-gray-700 rounded-lg resize-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-gray-700">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm"
            >
              {editingId ? 'Speichern' : 'Hinzufügen'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}