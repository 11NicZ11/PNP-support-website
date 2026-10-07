// src/components/character/tabs/FeaturesTab.tsx
'use client';

import { ProficienciesEditor } from '@/components/character/editors/ProficienciesEditor';
import { ClassLevel } from '@/components/character/editors/ClassLevelsEditor';
import { Action } from '@/types/actions';
import {
  ClassFeature,
  CLASS_FEATURE_SOURCES,
  CLASS_FEATURE_TYPES,
} from '@/types/classFeatures';
import { AlternateForm } from '@/types/forms';
import { Companion } from '@/types/companions';
import { useState } from 'react';

interface FeaturesTabProps {
  characterId: string;
  mode: 'create' | 'edit' | 'view';
  classLevels: ClassLevel[];
  actions: Action[];
  onActionsUpdate: (actions: Action[]) => void;
  proficiencies: any[];
  onProficienciesUpdate: (profs: any[]) => void;
  readOnly?: boolean;
  // 🔥 NEU
  alternateForms?: AlternateForm[];
  companions?: Companion[];
  onActivateForm?: (form: AlternateForm) => void;
  onDeactivateForm?: (form: AlternateForm) => void;
  onActivateCompanion?: (companion: Companion) => void;
}

export function FeaturesTab({
  characterId,
  mode,
  classLevels,
  actions,
  onActionsUpdate,
  proficiencies,
  onProficienciesUpdate,
  readOnly = false,
  alternateForms = [],
  companions = [],
  onActivateForm,
  onDeactivateForm,
  onActivateCompanion,
}: FeaturesTabProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isView = readOnly || mode === 'view';
  const isNew = characterId === 'new';

  const getLinkedAction = (featureId: string): Action | undefined => {
    return actions.find((a) => (a as any).linkedFeatureId === featureId);
  };

  const getLinkedForm = (formId: string | null): AlternateForm | undefined => {
    if (!formId) return undefined;
    return alternateForms.find((f) => f.id === formId);
  };

  const getLinkedCompanion = (companionId: string | null): Companion | undefined => {
    if (!companionId) return undefined;
    return companions.find((c) => c.id === companionId);
  };

  // ==================== ALS AKTION HINZUFÜGEN ====================
  const createActionFromFeature = async (
    feature: ClassFeature,
    classLevel: ClassLevel
  ) => {
    setError(null);
    setLoading(feature.id);

    const actionType = (() => {
      if (feature.type === 'passive') return 'action';
      return feature.type;
    })();

    const actionData = {
      name: feature.name,
      type: actionType,
      description: feature.description,
      sourceType: 'feature',
      sourceId: feature.id,
      isCustom: false,
      attackBonus: feature.attackRoll ? 0 : undefined,
      damageDice: undefined,
      damageType: undefined,
      range: undefined,
      areaOfEffect: undefined,
      usesPerDay: feature.usesPerRest ?? undefined,
      usesRemaining: feature.usesPerRest ?? undefined,
      rechargeType: feature.rechargeType === 'never' ? 'manual' : feature.rechargeType,
      rechargeOnShortRest: feature.rechargeType === 'short',
      rechargeOnLongRest: feature.rechargeType === 'long',
      concentration: feature.isConcentration,
      savingThrow: feature.savingThrow || undefined,
      savingThrowDC: feature.savingThrowDC ?? undefined,
      linkedFeatureId: feature.id,
      linkedClassLevelId: classLevel.id || null,
    };

    try {
      if (isNew) {
        const localAction: Action = {
          ...actionData,
          id: `temp-action-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          isCustom: actionData.isCustom,
          rechargeOnShortRest: actionData.rechargeOnShortRest,
          rechargeOnLongRest: actionData.rechargeOnLongRest,
          concentration: actionData.concentration,
          rechargeType: actionData.rechargeType as any,
          characterId: 'new',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Action;
        onActionsUpdate([...actions, localAction]);
      } else {
        const res = await fetch(`/api/characters/${characterId}/actions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actionData),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Fehler beim Erstellen');
        }
        const created = await res.json();
        onActionsUpdate([...actions, created]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  const removeActionForFeature = async (featureId: string) => {
    const linkedAction = getLinkedAction(featureId);
    if (!linkedAction) return;
    if (!confirm('Verknüpfung zur Aktion entfernen?')) return;

    setError(null);
    setLoading(featureId);

    try {
      if (isNew) {
        onActionsUpdate(actions.filter((a) => a.id !== linkedAction.id));
      } else {
        const res = await fetch(
          `/api/characters/${characterId}/actions/${linkedAction.id}`,
          { method: 'DELETE' }
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Fehler beim Löschen');
        }
        onActionsUpdate(actions.filter((a) => a.id !== linkedAction.id));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(null);
    }
  };

  // 🔥 NEU: Form aktivieren aus Feature
  const handleActivateFormFromFeature = (form: AlternateForm) => {
    if (!onActivateForm) return;
    if (form.isActive) {
      if (onDeactivateForm && confirm(`${form.name} verlassen?`)) {
        onDeactivateForm(form);
      }
    } else {
      onActivateForm(form);
    }
  };

  // 🔥 NEU: Companion beschwören aus Feature
  const handleActivateCompanionFromFeature = (companion: Companion) => {
    if (!onActivateCompanion) return;
    onActivateCompanion(companion);
  };

  // ==================== VIEW-MODE ====================
  if (isView) {
    return (
      <div className="space-y-6">
        {classLevels.length > 0 && (
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">⚡ Klassen-Features</h3>
            <div className="space-y-4">
              {classLevels.map((cls, idx) => {
                const features = (cls.features as any[]) || [];
                if (features.length === 0) return null;
                return (
                  <div key={cls.id || idx}>
                    <h4 className="text-sm font-semibold text-purple-300 mb-2">
                      {cls.className}
                    </h4>
                    <div className="space-y-1">
                      {features.map((f: ClassFeature) => {
                        const sourceData = CLASS_FEATURE_SOURCES.find(
                          (s) => s.value === f.source
                        );
                        const typeData = CLASS_FEATURE_TYPES.find(
                          (t) => t.value === f.type
                        );
                        const linkedForm = getLinkedForm(f.linkedFormId);
                        const linkedComp = getLinkedCompanion(f.linkedCompanionId);
                        return (
                          <div
                            key={f.id}
                            className="bg-gray-800/50 rounded-lg p-2 text-sm"
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>{sourceData?.icon || '•'}</span>
                              <span className="font-medium">{f.name}</span>
                              <span className="text-xs text-gray-400">
                                Level {f.level}
                              </span>
                              {typeData && (
                                <span className="text-xs text-gray-400">
                                  {typeData.icon} {typeData.label}
                                </span>
                              )}
                              {linkedForm && (
                                <span className="text-xs text-orange-300">
                                  🐺 → {linkedForm.name}
                                </span>
                              )}
                              {linkedComp && (
                                <span className="text-xs text-green-300">
                                  🐾 → {linkedComp.name}
                                </span>
                              )}
                            </div>
                            {f.description && (
                              <div className="text-xs text-gray-400 mt-1 whitespace-pre-wrap">
                                {f.description}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">📚 Fähigkeiten & Übungen</h3>
          <div className="flex flex-wrap gap-2">
            {proficiencies.map((p) => (
              <span
                key={p.id}
                className="px-2 py-1 bg-purple-600/30 rounded-lg text-sm"
              >
                {p.icon} {p.name}
                <span className="text-xs text-gray-400 ml-1">({p.category})</span>
              </span>
            ))}
            {proficiencies.length === 0 && (
              <span className="text-gray-500 text-sm">
                Keine Fähigkeiten vorhanden
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==================== EDIT-MODE ====================
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded-lg">{error}</div>
      )}

      <div className="bg-gray-800/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">⚡ Klassen-Features</h3>
        <p className="text-xs text-gray-500 mb-4">
          Aktive Features können als Aktion übernommen werden. Verknüpfte Formen
          und Gefährten können direkt aus dem Feature aktiviert werden.
        </p>

        {classLevels.length === 0 && (
          <div className="text-center text-gray-500 italic py-4">
            Noch keine Klassen im Klassen-Tab angelegt.
          </div>
        )}

        <div className="space-y-6">
          {classLevels.map((cls, classIdx) => {
            const features = ((cls.features as any[]) || []).slice().sort(
              (a: ClassFeature, b: ClassFeature) =>
                a.level - b.level || a.name.localeCompare(b.name)
            );
            if (features.length === 0) return null;

            return (
              <div key={cls.id || classIdx}>
                <h4 className="text-sm font-semibold text-purple-300 mb-2">
                  {cls.className}
                  {!cls.isActive && (
                    <span className="ml-2 text-xs text-yellow-400">(verlassen)</span>
                  )}
                </h4>

                <div className="space-y-2">
                  {features.map((f: ClassFeature) => {
                    const sourceData = CLASS_FEATURE_SOURCES.find(
                      (s) => s.value === f.source
                    );
                    const typeData = CLASS_FEATURE_TYPES.find(
                      (t) => t.value === f.type
                    );
                    const linkedAction = getLinkedAction(f.id);
                    const linkedForm = getLinkedForm(f.linkedFormId);
                    const linkedComp = getLinkedCompanion(f.linkedCompanionId);
                    const canBecomeAction = f.type !== 'passive';
                    const isLoading = loading === f.id;

                    return (
                      <div
                        key={f.id}
                        className={`rounded-lg p-3 border ${
                          linkedAction
                            ? 'bg-purple-900/20 border-purple-500/40'
                            : 'bg-gray-800/50 border-gray-700/50'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>{sourceData?.icon || '•'}</span>
                              <span className="font-medium text-sm">{f.name}</span>
                              <span className="text-xs text-gray-400">
                                Level {f.level}
                              </span>
                              {typeData && (
                                <span className="text-xs text-gray-400">
                                  {typeData.icon} {typeData.label}
                                </span>
                              )}
                              {f.isConcentration && (
                                <span className="text-xs text-yellow-400" title="Konzentration">
                                  🧠
                                </span>
                              )}
                              {f.attackRoll && (
                                <span className="text-xs text-orange-400" title="Angriffswurf">
                                  🎯
                                </span>
                              )}
                              {f.savingThrow && (
                                <span className="text-xs text-red-400">
                                  🛡️ {f.savingThrow}
                                </span>
                              )}
                              {f.usesPerRest && (
                                <span className="text-xs text-blue-400">
                                  {f.usesPerRest}× /{' '}
                                  {f.rechargeType === 'short'
                                    ? 'kurze'
                                    : f.rechargeType === 'long'
                                    ? 'lange'
                                    : 'nie'}{' '}
                                  Rast
                                </span>
                              )}
                            </div>
                            {f.description && (
                              <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                                {f.description}
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-1 items-end">
                            {canBecomeAction && (
                              <>
                                {linkedAction ? (
                                  <button
                                    type="button"
                                    onClick={() => removeActionForFeature(f.id)}
                                    disabled={isLoading}
                                    className="px-3 py-1 text-xs bg-green-600/50 hover:bg-green-600 rounded transition disabled:opacity-50 whitespace-nowrap"
                                    title="Aktion entfernen"
                                  >
                                    {isLoading ? '...' : '✓ Als Aktion'}
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => createActionFromFeature(f, cls)}
                                    disabled={isLoading}
                                    className="px-3 py-1 text-xs bg-purple-600/50 hover:bg-purple-600 rounded transition disabled:opacity-50 whitespace-nowrap"
                                  >
                                    {isLoading ? '...' : '+ Als Aktion'}
                                  </button>
                                )}
                              </>
                            )}
                            {!canBecomeAction && (
                              <span className="text-xs text-gray-500 italic">
                                Passiv
                              </span>
                            )}

                            {/* 🔥 NEU: Form-Aktivierung */}
                            {linkedForm && onActivateForm && (
                              <button
                                type="button"
                                onClick={() => handleActivateFormFromFeature(linkedForm)}
                                className={`px-3 py-1 text-xs rounded transition whitespace-nowrap ${
                                  linkedForm.isActive
                                    ? 'bg-orange-600/70 hover:bg-orange-600'
                                    : 'bg-orange-600/40 hover:bg-orange-600'
                                }`}
                                title={
                                  linkedForm.isActive
                                    ? 'Form verlassen'
                                    : 'Form aktivieren'
                                }
                              >
                                🐺 {linkedForm.name}
                                {linkedForm.isActive && ' (aktiv)'}
                              </button>
                            )}

                            {/* 🔥 NEU: Companion-Aktivierung */}
                            {linkedComp && onActivateCompanion && (
                              <button
                                type="button"
                                onClick={() => handleActivateCompanionFromFeature(linkedComp)}
                                className="px-3 py-1 text-xs bg-green-600/40 hover:bg-green-600 rounded transition whitespace-nowrap"
                                title="Gefährten aktivieren"
                              >
                                🐾 {linkedComp.name}
                              </button>
                            )}
                          </div>
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

      <ProficienciesEditor
        proficiencies={proficiencies}
        onUpdate={onProficienciesUpdate}
        characterId={characterId}
      />
    </div>
  );
}