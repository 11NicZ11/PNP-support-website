// src/components/character/hooks/useCharacterMemos.ts
'use client';

import { useMemo } from 'react';
import { CharacterState } from './useCharacterState';
import { DefenseItem } from '../modals/DefensesModal';
import { parseEquipmentDefenseList } from '../forms/characterFormHelpers';

export function useCharacterMemos(state: CharacterState) {
  const {
    hpSources,
    combatValueSources,
    attributes,
    alternateForms,
    equipmentForDefense,
    defenses,
    raceData,
  } = state;

  const totalHp = hpSources.reduce((sum, s) => sum + s.value, 0);

  const proficiencyBonus =
    combatValueSources.find((s) => s.type === 'proficiencyBonus')?.value || 2;

  const constitutionValue =
    attributes.find((a) => a.name === 'Konstitution')?.value ?? 10;

  const activeForm = alternateForms.find((f) => f.isActive) || null;

  const equipmentDefenses = useMemo<DefenseItem[]>(() => {
    const items: DefenseItem[] = [];
    equipmentForDefense
      .filter((e: any) => e.equipped === true)
      .forEach((e: any) => {
        const immunities = parseEquipmentDefenseList(e.damageImmunities);
        const resistances = parseEquipmentDefenseList(e.damageResistances);
        const conditions = parseEquipmentDefenseList(e.conditionImmunities);

        immunities.forEach((name) =>
          items.push({
            id: `eq-imm-${e.id}-${name}`,
            type: 'damage_immunity',
            name,
            description: null,
            source: 'equipment',
            sourceName: e.name,
            isCustom: false,
          })
        );
        resistances.forEach((name) =>
          items.push({
            id: `eq-res-${e.id}-${name}`,
            type: 'damage_resistance',
            name,
            description: null,
            source: 'equipment',
            sourceName: e.name,
            isCustom: false,
          })
        );
        conditions.forEach((name) =>
          items.push({
            id: `eq-con-${e.id}-${name}`,
            type: 'condition_immunity',
            name,
            description: null,
            source: 'equipment',
            sourceName: e.name,
            isCustom: false,
          })
        );
      });
    return items;
  }, [equipmentForDefense]);

  const aggregatedDefenses = useMemo(() => {
    const all = [...defenses, ...equipmentDefenses];
    return {
      immunities: all.filter((d) => d.type === 'damage_immunity'),
      resistances: all.filter((d) => d.type === 'damage_resistance'),
      conditions: all.filter((d) => d.type === 'condition_immunity'),
    };
  }, [defenses, equipmentDefenses]);

  const raceDefenses = useMemo(
    () => defenses.filter((d) => d.source === 'race'),
    [defenses]
  );

  const classDefensesByClass = useMemo(() => {
    const map: Record<string, DefenseItem[]> = {};
    defenses
      .filter((d) => d.source === 'class')
      .forEach((d) => {
        const key = d.sourceName || '';
        if (!map[key]) map[key] = [];
        map[key].push(d);
      });
    return map;
  }, [defenses]);

  const manualDefenses = useMemo(
    () => defenses.filter((d) => d.source === 'manual'),
    [defenses]
  );

  return {
    totalHp,
    proficiencyBonus,
    constitutionValue,
    activeForm,
    equipmentDefenses,
    aggregatedDefenses,
    raceDefenses,
    classDefensesByClass,
    manualDefenses,
  };
}

export type CharacterMemos = ReturnType<typeof useCharacterMemos>;