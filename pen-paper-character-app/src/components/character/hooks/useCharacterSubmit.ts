// src/components/character/hooks/useCharacterSubmit.ts
'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CharacterState } from './useCharacterState';
import { CharacterMemos } from './useCharacterMemos';
import { CharacterFormData } from '../forms/characterFormTypes';
import { useToast } from '@/contexts/ToastContext';
import {
  POINT_BUY_COSTS,
  POINT_BUY_TOTAL,
  STANDARD_ARRAY,
  STANDARD_ARRAY_PLUS2,
} from '@/types/character';

interface SubmitOptions {
  characterId: string;
  isNew: boolean;
  isView: boolean;
  onSave?: (data: CharacterFormData) => Promise<void>;
}

function validateAttributeMethod(state: CharacterState): string | null {
  const method = state.attributeMethod;
  if (method === 'free') return null;

  const s = state.attributeMethodState;
  const count = state.attributes.length;
  if (count === 0) return null;

  if (method === 'standard') {
    const assigned = Object.keys(s.standardAssignments || {}).length;
    if (assigned < STANDARD_ARRAY.length) {
      return `Standard Array: Nur ${assigned}/${STANDARD_ARRAY.length} Werte zugewiesen. Bitte alle Attribute verteilen.`;
    }
  }

  if (method === 'standard_plus2') {
    const assigned = Object.keys(s.standardPlus2Assignments || {}).length;
    if (assigned < STANDARD_ARRAY_PLUS2.length) {
      return `Standard Array +2: Nur ${assigned}/${STANDARD_ARRAY_PLUS2.length} Werte zugewiesen. Bitte alle Attribute verteilen.`;
    }
  }

  if (method === 'pointbuy') {
    const values = s.pointBuyValues || {};
    const assigned = Object.keys(values).length;
    if (assigned < count) {
      return `Point Buy: Nur ${assigned}/${count} Attribute haben Werte. Bitte alle Attribute verteilen.`;
    }
    const spent = Object.values(values).reduce(
      (sum: number, v: any) => sum + (POINT_BUY_COSTS[v as number] ?? 0),
      0
    );
    if (spent < POINT_BUY_TOTAL) {
      return `Point Buy: Nur ${spent}/${POINT_BUY_TOTAL} Punkte ausgegeben. Bitte alle Punkte verteilen.`;
    }
  }

  if (method === 'roll') {
    if (!s.rolledValues || s.rolledValues.length === 0) {
      return 'Würfeln: Erst würfeln, dann alle 6 Werte verteilen.';
    }
    const assigned = Object.keys(s.rolledAssignments || {}).length;
    if (assigned < count) {
      return `Würfeln: Nur ${assigned}/${count} Werte zugewiesen. Bitte alle Attribute verteilen.`;
    }
  }

  return null;
}

export function useCharacterSubmit(
  state: CharacterState,
  memos: CharacterMemos,
  { characterId, isNew, isView, onSave }: SubmitOptions
) {
  const router = useRouter();
  const { addToast } = useToast();
  const { totalHp } = memos;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isView) return;
      if (state.loadFailed) {
        state.setError(
          'Daten konnten nicht geladen werden — Speichern ist deaktiviert.'
        );
        return;
      }

      // ===== VALIDIERUNG: Attributs-Methode =====
      if (isNew) {
        const methodError = validateAttributeMethod(state);
        if (methodError) {
          state.setError(methodError);
          return;
        }
      }

      state.setSaving(true);
      state.setError(null);

      const cleanSkills = state.skills.map((s) => ({
        name: s.name,
        attributeName: s.attributeName || '',
        description: s.description ?? '',
        isProficient: s.isProficient,
        expertise: s.expertise ?? false,
        proficiencySource: s.proficiencySource || '',
        sourceDetail: s.sourceDetail || '',
        modifier: s.modifier ?? 0,
        libraryEntryId: s.libraryEntryId ?? null,
      }));

      const cleanSavingThrows = state.savingThrows.map((st) => ({
        name: st.name,
        attributeName: st.attributeName,
        isProficient: st.isProficient,
        expertise: st.expertise ?? false,
        proficiencySource: st.proficiencySource ?? '',
        sourceDetail: st.sourceDetail ?? '',
        modifier: st.modifier ?? 0,
        libraryEntryId: st.libraryEntryId ?? null,
      }));

      const cleanProficiencies = state.proficiencies.map(
        ({ id, ...rest }: any) => rest
      );
      const cleanAttributes = state.attributes.map(
        ({ id, baseValue, ...rest }: any) => rest
      );

      const cleanHpSources = state.hpSources.map((h) => ({
        name: h.name,
        value: h.value,
        sourceType: h.sourceType || 'manual',
        sourceName: h.sourceName || '',
      }));

      const defensesForDb = state.defenses.filter(
        (d) => d.source !== 'equipment'
      );

      const payload: CharacterFormData = {
        name: state.name,
        levelingMode: state.levelingMode,
        unitSystem: state.unitSystem,
        classProgression: state.classProgression,
        attributeMethod: state.attributeMethod,
        attributeMethodState: state.attributeMethodState,
        notesCategories: state.notesCategories,
        level: state.characterLevel,
        race: state.raceData.name || '',
        class: '',
        alignment: state.alignment,
        notes: state.notes,
        experience: state.experience,
        nextLevelExp: state.nextLevelExp,
        expMode: state.expMode,
        expThresholds: state.expThresholds,
        hasHitDice: state.hasHitDice,
        hitDiceMode: state.hitDiceMode,
        ...(isNew
          ? {
              currentHp: state.currentHp || totalHp,
              tempHp: state.tempHp,
              tempMaxHp: state.tempMaxHp,
              tempMaxHpMax: state.tempMaxHpMax,
              exhaustionLevel: state.exhaustionLevel,
            }
          : {}),
        attributes: cleanAttributes as any,
        hpSources: cleanHpSources,
        skills: cleanSkills as any,
        savingThrows: cleanSavingThrows as any,
        proficiencies: cleanProficiencies,
        classLevels: state.classLevels,
        combatValueSources: state.combatValueSources,
        background: state.background,
        raceData: state.raceData,
        defenses: defensesForDb,
        // Container werden ueber /api/characters/[id]/inventory verwaltet, NICHT ueber
        // die Character-PUT: Der PUT-Endpunkt hat kein containers-Handling und haette
        // den Wert sonst stillschweigend verworfen (Datenverlust-Sinkhole). Nur beim
        // POST (erstellen) mitschicken — dort legt der Server die Container an.
        ...(isNew ? { containers: state.containers } : {}),
        spells: state.spells,
        spellSlots: state.spellSlots,
        resources: state.resources,
        hitDice: state.hitDice,
        alternateForms: state.alternateForms,
        companions: state.companions,
      };

      try {
        if (onSave) {
          await onSave(payload);
        } else {
          const url = isNew
            ? '/api/characters'
            : `/api/characters/${characterId}`;
          const method = isNew ? 'POST' : 'PUT';
          const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Fehler beim Speichern');
          }
          const result = await res.json();

          if (isNew && state.actions.length > 0) {
            const newCharacterId = result.id;
            const failedActions: string[] = [];
            // Parallel statt sequenziell: vorher kostete jede Aktion eine eigene
            // volle Round-Trip-Zeit (N Aktionen = N × Latenz).
            await Promise.all(
              state.actions.map(async (action) => {
                try {
                  const actionPayload: any = {
                    name: action.name,
                    type: action.type,
                    description: action.description,
                    sourceType: action.sourceType,
                    sourceId: action.sourceId || null,
                    isCustom: action.isCustom,
                    attackBonus: action.attackBonus ?? null,
                    damageDice: action.damageDice || null,
                    damageType: action.damageType || null,
                    range: action.range || null,
                    areaOfEffect: action.areaOfEffect || null,
                    usesPerDay: action.usesPerDay ?? null,
                    usesRemaining: action.usesRemaining ?? null,
                    rechargeType: (action as any).rechargeType || 'long',
                    rechargeOnShortRest: action.rechargeOnShortRest,
                    rechargeOnLongRest: action.rechargeOnLongRest,
                    concentration: (action as any).concentration || false,
                    savingThrow: (action as any).savingThrow || null,
                    savingThrowDC: (action as any).savingThrowDC ?? null,
                    linkedFeatureId: (action as any).linkedFeatureId || null,
                    linkedClassLevelId: (action as any).linkedClassLevelId || null,
                    libraryEntryId: (action as any).libraryEntryId ?? null,
                  };
                  const res = await fetch(
                    `/api/characters/${newCharacterId}/actions`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(actionPayload),
                    }
                  );
                  if (!res.ok) failedActions.push(action.name);
                } catch (err) {
                  console.error('Fehler beim Erstellen der Aktion:', err);
                  failedActions.push(action.name);
                }
              })
            );
            if (failedActions.length > 0) {
              addToast(
                `Aktionen konnten nicht gespeichert werden: ${failedActions.join(', ')}`
              );
            }
          }

          if (isNew) {
            router.push(`/characters/${result.id}`);
            router.refresh();
          }
        }
      } catch (err: any) {
        state.setError(err.message);
      } finally {
        state.setSaving(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, memos, characterId, isNew, isView, onSave, router, totalHp]
  );

  return { handleSubmit };
}