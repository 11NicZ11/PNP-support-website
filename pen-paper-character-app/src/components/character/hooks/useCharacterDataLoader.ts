// src/components/character/hooks/useCharacterDataLoader.ts
'use client';

import { useEffect } from 'react';
import { CharacterState } from './useCharacterState';
import {
  DEFAULT_COMBAT_VALUE_SOURCES,
  DEFAULT_HP_SOURCES,
} from '../forms/characterFormDefaults';
import {
  migrateClassLevels,
  migrateClassProgression,
  migrateRaceData,
} from '../forms/characterFormHelpers';
import { EMPTY_ATTRIBUTE_METHOD_STATE } from '@/types/character';
import { initializeNotesCategories } from '@/lib/defaults/notesCategories';

interface LoaderOptions {
  characterId: string;
  isNew: boolean;
  hasInitialData: boolean;
}

export function useCharacterDataLoader(
  state: CharacterState,
  { characterId, isNew, hasInitialData }: LoaderOptions
) {
  // ============================================================
  // NEUER CHARAKTER: Templates aus Library laden
  // ============================================================
  useEffect(() => {
    if (!isNew) return;
    let cancelled = false;
    state.setLoading(true);

    (async () => {
      try {
        const [attrsRes, skillsRes, savesRes, profsRes] = await Promise.all([
          fetch('/api/library?type=attribute').then((r) => r.json()),
          fetch('/api/library?type=skill').then((r) => r.json()),
          fetch('/api/library?type=saving_throw').then((r) => r.json()),
          fetch('/api/library?type=proficiency').then((r) => r.json()),
        ]);

        if (cancelled) return;

        const attrList = Array.isArray(attrsRes) ? attrsRes : [];
        const skillList = Array.isArray(skillsRes) ? skillsRes : [];
        const saveList = Array.isArray(savesRes) ? savesRes : [];
        const profList = Array.isArray(profsRes) ? profsRes : [];

        // ---- Attribute ----
        state.setAttributes((prev) => {
          if (prev.length > 0) return prev;
          return attrList
            .map((a: any, i: number) => ({
              id: a.id,
              name: a.name,
              value: 10,
              baseValue: 10,
              isDefault: true,
              order: a.data?.order ?? i,
            }))
            .sort((a: any, b: any) => a.order - b.order);
        });

        // ---- Skills ----
        state.setSkills((prev) => {
          if (prev.length > 0) return prev;
          return skillList.map((s: any) => ({
            id: s.id,
            name: s.name,
            attributeName: s.data?.attributeName || 'Stärke',
            isProficient: false,
            expertise: false,
            isCustom: false,
            proficiencySource: '',
            sourceDetail: '',
            libraryEntryId: s.id,
          }));
        });

        // ---- Saving Throws ----
        state.setSavingThrows((prev) => {
          if (prev.length > 0) return prev;
          return saveList.map((s: any) => ({
            id: s.id,
            name: s.name,
            attributeName: s.data?.attributeName || 'Stärke',
            isProficient: false,
            expertise: false,
            libraryEntryId: s.id,
          }));
        });

        // ---- Proficiencies ----
                state.setProficiencies((prev) => {
          if (prev.length > 0) return prev;
          return profList.map((p: any) => ({
            id: `prof-${p.id}`,
            name: p.name,
            category: p.category,
            description: p.description || '',
            icon: p.icon || '📚',
            isProficient: true,
            proficiencySource: '',
            sourceDetail: '',
            libraryEntryId: p.id,
          }));
        });
      } catch (err) {
        console.error('Fehler beim Laden der Library-Templates:', err);
      } finally {
        if (!cancelled) state.setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew]);

  // ============================================================
  // BESTEHENDER CHARAKTER: kompletter Datensatz vom Server
  // ============================================================
  useEffect(() => {
    if (isNew || hasInitialData || !characterId) return;
    fetch(`/api/characters/${characterId}`)
      .then((res) => res.json())
      .then((data) => {
        state.setName(data.name || '');
        state.setLevelingMode(data.levelingMode || 'milestone');
        state.setUnitSystem(data.unitSystem || 'metric');
        state.setClassProgression(migrateClassProgression(data.classProgression));
        state.setAttributeMethod(data.attributeMethod || 'free');
        state.setAttributeMethodState(
          data.attributeMethodState || EMPTY_ATTRIBUTE_METHOD_STATE
        );
        state.setAlignment(data.alignment || '');
        state.setNotes(data.notes || '');
        state.setNotesCategories(
          initializeNotesCategories(data.notesCategories, data.notes)
        );
        state.setCharacterLevel(data.level || 1);
        state.setExperience(data.experience || 0);
        state.setNextLevelExp(data.nextLevelExp || 300);

        if (data.expMode) state.setExpMode(data.expMode);
        if (data.expThresholds) state.setExpThresholds(data.expThresholds);
        if (data.hasHitDice !== undefined) state.setHasHitDice(data.hasHitDice);
        if (data.hitDiceMode) state.setHitDiceMode(data.hitDiceMode);

        state.setAttributes(data.attributes || []);
        state.setCombatValueSources(
          data.combatValueSources || DEFAULT_COMBAT_VALUE_SOURCES
        );
        state.setHpSources(data.hpSources || DEFAULT_HP_SOURCES);
        state.setSkills(data.skills || []);
        state.setSavingThrows(data.savingThrows || []);
        state.setProficiencies(data.proficiencies || []);
        state.setClassLevels(migrateClassLevels(data.classLevels));
        state.setDefenses(Array.isArray(data.defenses) ? data.defenses : []);
        if (data.background) state.setBackground(data.background);
        if (data.raceData) state.setRaceData(migrateRaceData(data.raceData));
        if (data.spells) state.setSpells(data.spells);
        if (data.spellSlots) state.setSpellSlots(data.spellSlots);
        if (data.resources) state.setResources(data.resources);
        if (data.hitDice) state.setHitDice(data.hitDice);
        if (data.alternateForms) state.setAlternateForms(data.alternateForms);
        if (data.companions) state.setCompanions(data.companions);
        if (data.exhaustionLevel !== undefined)
          state.setExhaustionLevel(data.exhaustionLevel);
        if (data.statusEffects) state.setStatusEffects(data.statusEffects);
        if (data.currentHp !== undefined) state.setCurrentHp(data.currentHp);
        if (data.tempHp !== undefined) state.setTempHp(data.tempHp);
        if (data.tempMaxHp !== undefined) state.setTempMaxHp(data.tempMaxHp);
        if (data.tempMaxHpMax !== undefined)
          state.setTempMaxHpMax(data.tempMaxHpMax);
        if (data.lastLongRest !== undefined)
          state.setLastLongRest(data.lastLongRest);
        state.setLoading(false);
      })
      .catch((err) => {
        state.setError(err.message);
        state.setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId, isNew, hasInitialData]);

  // ============================================================
  // Aktions-Liste laden
  // ============================================================
  useEffect(() => {
    if (isNew || !characterId || hasInitialData) return;
    fetch(`/api/characters/${characterId}/actions`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) state.setActions(data);
      })
      .catch((err) => console.error('Fehler beim Laden der Aktionen:', err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId, isNew, hasInitialData]);

  // ============================================================
  // Ausrüstung laden (für Verteidigungen)
  // ============================================================
  useEffect(() => {
    if (isNew || !characterId) return;
    fetch(`/api/characters/${characterId}/equipment`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) state.setEquipmentForDefense(data);
      })
      .catch((err) =>
        console.error('Fehler beim Laden der Ausrüstung (Defenses):', err)
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterId, isNew, state.equipmentRefresh]);
}