// src/components/character/edit/ClassFeatureEditor.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  ClassFeature,
  ClassFeatureKind,
  CLASS_FEATURE_SOURCES,
  CLASS_FEATURE_TYPES,
  CLASS_FEATURE_RECHARGE,
  CLASS_FEATURE_KINDS,
  EMPTY_CLASS_FEATURE,
} from '@/types/classFeatures';
import { AlternateForm } from '@/types/forms';
import { Companion } from '@/types/companions';

interface ClassFeatureEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (feature: ClassFeature) => void;
  onDelete?: (featureId: string) => void;
  initialFeature?: ClassFeature | null;
  availableLevels: number[];
  className: string;
  availableForms?: AlternateForm[];
  availableCompanions?: Companion[];
  defaultKind?: ClassFeatureKind;
}

export function ClassFeatureEditor({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialFeature,
  availableLevels,
  className,
  availableForms = [],
  availableCompanions = [],
  defaultKind = 'feature',
}: ClassFeatureEditorProps) {
  const [feature, setFeature] = useState<ClassFeature>(EMPTY_CLASS_FEATURE);

  useEffect(() => {
    if (isOpen) {
      if (initialFeature) {
        setFeature({
          ...EMPTY_CLASS_FEATURE,
          ...initialFeature,
          linkedFormId: initialFeature.linkedFormId ?? null,
          linkedCompanionId: initialFeature.linkedCompanionId ?? null,
          kind: initialFeature.kind ?? 'feature',
        });
      } else {
        setFeature({
          ...EMPTY_CLASS_FEATURE,
          id: `feat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          level: availableLevels[0] || 1,
          kind: defaultKind,
        });
      }
    }
  }, [isOpen, initialFeature, availableLevels, defaultKind]);

  if (!isOpen) return null;

  const update = <K extends keyof ClassFeature>(field: K, value: ClassFeature[K]) => {
    setFeature((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feature.name.trim()) {
      alert('Name ist erforderlich');
      return;
    }
    onSave(feature);
    onClose();
  };

  const isEditing = !!initialFeature;
  const hasFormOptions = availableForms.length > 0;
  const hasCompanionOptions = availableCompanions.length > 0;
  const showActionFields = feature.type !== 'passive' && feature.kind === 'feature';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full border border-purple-500/30 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}
            <span className="ml-2 text-sm text-gray-400">({className})</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Kategorie */}
          <div>
            <label className="block text-sm font-medium mb-1">Kategorie *</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {CLASS_FEATURE_KINDS.map((k) => (
                <button
                  key={k.value}
                  type="button"
                  onClick={() => update('kind', k.value)}
                  className={`px-3 py-2 rounded-lg text-sm transition flex items-center gap-2 ${
                    feature.kind === k.value
                      ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  }`}
                >
                  <span>{k.icon}</span>
                  <span>{k.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={feature.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder={
                feature.kind === 'asi'
                  ? 'z.B. Attributsverbesserung'
                  : feature.kind === 'extra_attack'
                  ? 'z.B. Zusätzlicher Angriff'
                  : feature.kind === 'spell'
                  ? 'z.B. Feuerball'
                  : feature.kind === 'subclass_choice'
                  ? 'z.B. Pfad des Berserkers'
                  : 'z.B. Kampfrausch'
              }
              className="w-full px-3 py-2 bg-gray-800 rounded-lg"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <select
                value={feature.level}
                onChange={(e) => update('level', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
              >
                {availableLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    Level {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quelle</label>
              <select
                value={feature.source}
                onChange={(e) => update('source', e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
              >
                {CLASS_FEATURE_SOURCES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.icon} {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quelle – Details</label>
            <input
              type="text"
              value={feature.sourceDetail}
              onChange={(e) => update('sourceDetail', e.target.value)}
              placeholder="z.B. Pfad des Berserkers, Kampfmeister"
              className="w-full px-3 py-2 bg-gray-800 rounded-lg"
            />
          </div>

          {/* Typ nur bei Feature-Kategorie */}
          {feature.kind === 'feature' && (
            <div>
              <label className="block text-sm font-medium mb-1">Aktions-Typ</label>
              <select
                value={feature.type}
                onChange={(e) => update('type', e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
              >
                {CLASS_FEATURE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Beschreibung</label>
            <textarea
              value={feature.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              placeholder={
                feature.kind === 'asi'
                  ? 'z.B. +2 auf ein Attribut oder +1 auf zwei Attribute'
                  : feature.kind === 'extra_attack'
                  ? 'z.B. Kann zweimal angreifen, wenn Angriffsaktion ausgeführt wird'
                  : 'Was macht dieser Eintrag?'
              }
              className="w-full px-3 py-2 bg-gray-800 rounded-lg resize-none"
            />
          </div>

          {showActionFields && (
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-3">
              <h4 className="text-sm font-semibold text-purple-300">Aktions-Details</h4>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={feature.isConcentration}
                    onChange={(e) => update('isConcentration', e.target.checked)}
                  />
                  Konzentration
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={feature.attackRoll}
                    onChange={(e) => update('attackRoll', e.target.checked)}
                  />
                  Angriffswurf
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Rettungswurf</label>
                  <input
                    type="text"
                    value={feature.savingThrow}
                    onChange={(e) => update('savingThrow', e.target.value)}
                    placeholder="z.B. Weisheit"
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SG</label>
                  <input
                    type="number"
                    value={feature.savingThrowDC ?? ''}
                    onChange={(e) =>
                      update('savingThrowDC', e.target.value ? parseInt(e.target.value) : null)
                    }
                    placeholder="auto"
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nutzungen (pro Rast)
                  </label>
                  <input
                    type="number"
                    value={feature.usesPerRest ?? ''}
                    onChange={(e) =>
                      update('usesPerRest', e.target.value ? parseInt(e.target.value) : null)
                    }
                    placeholder="z.B. 1"
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Aufladung</label>
                  <select
                    value={feature.rechargeType}
                    onChange={(e) => update('rechargeType', e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  >
                    {CLASS_FEATURE_RECHARGE.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Verknüpfungen nur bei Feature */}
          {feature.kind === 'feature' && (hasFormOptions || hasCompanionOptions) && (
            <div className="bg-purple-900/20 border border-purple-500/40 rounded-lg p-3 space-y-3">
              <h4 className="text-sm font-semibold text-purple-300">🔗 Verknüpfungen</h4>

              {hasFormOptions && (
                <div>
                  <label className="block text-sm font-medium mb-1">🐺 Verknüpfte Form</label>
                  <select
                    value={feature.linkedFormId || ''}
                    onChange={(e) => update('linkedFormId', e.target.value || null)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  >
                    <option value="">Keine Verknüpfung</option>
                    {availableForms.map((form) => (
                      <option key={form.id} value={form.id}>
                        {form.icon} {form.name} (CR {form.challengeRating})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {hasCompanionOptions && (
                <div>
                  <label className="block text-sm font-medium mb-1">🐾 Verknüpfter Gefährte</label>
                  <select
                    value={feature.linkedCompanionId || ''}
                    onChange={(e) => update('linkedCompanionId', e.target.value || null)}
                    className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  >
                    <option value="">Keine Verknüpfung</option>
                    {availableCompanions.map((comp) => (
                      <option key={comp.id} value={comp.id}>
                        {comp.icon} {comp.name} ({comp.type})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Voraussetzungen</label>
              <input
                type="text"
                value={feature.prerequisites}
                onChange={(e) => update('prerequisites', e.target.value)}
                placeholder="z.B. Stärke 13+"
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quellenangabe</label>
              <input
                type="text"
                value={feature.sourceReference}
                onChange={(e) => update('sourceReference', e.target.value)}
                placeholder="z.B. PHB S. 48"
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="submit"
              className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg font-semibold hover:opacity-90 transition"
            >
              {isEditing ? 'Speichern' : 'Hinzufügen'}
            </button>
            {onDelete && isEditing && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Eintrag wirklich löschen?')) {
                    onDelete(feature.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
              >
                🗑️
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}