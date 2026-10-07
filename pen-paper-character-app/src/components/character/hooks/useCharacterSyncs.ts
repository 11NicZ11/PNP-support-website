// src/components/character/hooks/useCharacterSyncs.ts
'use client';

import { useEffect } from 'react';
import { CharacterState } from './useCharacterState';

export function useCharacterSyncs(state: CharacterState) {
  const {
    raceData,
    background,
    loading,
    setSkills,
    setProficiencies,
    setAttributes,
    setCombatValueSources,
    setHpSources,
  } = state;

  // Sync: Rassen-Fertigkeiten → Skills
  useEffect(() => {
    if (!raceData.skillProficiencies) return;
    setSkills((prevSkills) =>
      prevSkills.map((skill) => {
        const raceProf = raceData.skillProficiencies.find(
          (p) => p.skillName === skill.name
        );
        if (raceProf) {
          return {
            ...skill,
            isProficient: true,
            proficiencySource: 'Rasse',
            sourceDetail: raceProf.source || 'Rasse',
          };
        }
        if (skill.proficiencySource === 'Rasse') {
          return {
            ...skill,
            isProficient: false,
            proficiencySource: '',
            sourceDetail: '',
          };
        }
        return skill;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceData.skillProficiencies]);

  // Sync: Hintergrund-Fertigkeiten → Skills
  useEffect(() => {
    if (!background.bonusSkills) return;
    setSkills((prevSkills) =>
      prevSkills.map((skill) => {
        const isFromBackground = background.bonusSkills.includes(skill.name);
        if (isFromBackground) {
          return {
            ...skill,
            isProficient: true,
            proficiencySource: 'Hintergrund',
            sourceDetail: background.name || 'Hintergrund',
          };
        }
        if (skill.proficiencySource === 'Hintergrund') {
          return {
            ...skill,
            isProficient: false,
            proficiencySource: '',
            sourceDetail: '',
          };
        }
        return skill;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [background.bonusSkills.join('|'), background.name]);

  // Sync: Rassen-Sprachen → Proficiencies
  useEffect(() => {
    if (!raceData.languages || raceData.languages.length === 0) return;
    setProficiencies((prev: any[]) => {
      const existing = prev.filter((p) => p.category !== 'language');
      const raceLanguages = raceData.languages.map((lang) => ({
        id: `race-lang-${lang}`,
        name: lang,
        category: 'language' as const,
        icon: '🗣️',
        isProficient: true,
        proficiencySource: 'Rasse',
        sourceDetail: 'Rasse',
      }));
      return [...existing, ...raceLanguages];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceData.languages]);

  // Sync: Attributs-Boni (Rasse + Background)
  useEffect(() => {
    if (loading) return;
    const raceBonuses = raceData.abilityScoreIncrease?.bonuses || {};
    const bgBonuses = background.abilityScoreIncrease?.bonuses || {};
    const allBonuses: Record<string, number> = {};
    const allKeys = new Set([
      ...Object.keys(raceBonuses),
      ...Object.keys(bgBonuses),
    ]);
    allKeys.forEach((key) => {
      allBonuses[key] = (raceBonuses[key] || 0) + (bgBonuses[key] || 0);
    });

    setAttributes((prev) =>
      prev.map((attr) => {
        if (attr.baseValue === undefined) {
          const totalBonus = allBonuses[attr.name] || 0;
          return { ...attr, baseValue: attr.value - totalBonus };
        }
        const bonus = allBonuses[attr.name] || 0;
        return { ...attr, value: attr.baseValue + bonus };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    raceData.abilityScoreIncrease,
    background.abilityScoreIncrease,
    loading,
  ]);

  // Sync: Rassen-Boni → RK/HP-Sources
  useEffect(() => {
    if (loading) return;

    const raceName = raceData.name || 'Rasse';
    const bonusAC = raceData.bonusArmorClass ?? 0;
    const bonusHp = raceData.bonusHp ?? 0;

    setCombatValueSources((prev) => {
      const withoutRace = prev.filter(
        (s) => !(s.type === 'armorClass' && s.name.startsWith('🧝'))
      );
      if (bonusAC === 0) return withoutRace;
      return [
        ...withoutRace,
        {
          id: `race-ac-${raceData.name || 'default'}`,
          type: 'armorClass' as const,
          name: `🧝 ${raceName}`,
          value: bonusAC,
        },
      ];
    });

    setHpSources((prev) => {
      const withoutRace = prev.filter(
        (s) =>
          !(s.sourceType === 'race' && (s.sourceName || '').startsWith('🧝'))
      );
      if (bonusHp === 0) return withoutRace;
      return [
        ...withoutRace,
        {
          id: `race-hp-${raceData.name || 'default'}`,
          name: `🧝 ${raceName}`,
          value: bonusHp,
          sourceType: 'race' as const,
          sourceName: `🧝 ${raceName}`,
        },
      ];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raceData.bonusArmorClass, raceData.bonusHp, raceData.name, loading]);
}