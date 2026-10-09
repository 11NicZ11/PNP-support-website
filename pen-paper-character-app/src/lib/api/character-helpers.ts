// src/lib/api/character-helpers.ts
// Charakter-spezifische API-Hilfsfunktionen

import { parseJsonArray, parseJsonObject } from '@/lib/utils';

export const getCharacterInclude = () => ({
  attributes: true,
  skills: true,
  savingThrows: true,
  proficiencies: true,
  statusEffects: true,
  defenses: true,
  hpSources: true,
  classLevels: true,
  combatValueSources: true,
  background: true,
  raceData: true,
  spells: { include: { components: { orderBy: { order: 'asc' } } } },
  spellSlots: true,
  resources: true,
  hitDice: true,
  alternateForms: true,
  companions: true,
});

// Legacy-Werte 'single'/'multi' werden als 'normal' behandelt
// (identisch zur bisherigen Inline-Fassung in beiden Routen).
export const migrateClassProgression = (
  value: string | null | undefined
): string => {
  if (!value) return 'normal';
  if (value === 'single' || value === 'multi') return 'normal';
  return value;
};

export const parseClassLevels = (classLevels: any[]) => {
  return classLevels.map((cl) => {
    const features = parseJsonArray(cl.features || '[]');
    const savingThrowProficiencies = parseJsonArray(
      cl.savingThrowProficiencies || '[]'
    );
    return {
      ...cl,
      features: Array.isArray(features) ? features : [],
      savingThrowProficiencies: Array.isArray(savingThrowProficiencies)
        ? savingThrowProficiencies
        : [],
      track: cl.track === 1 ? 1 : 0,
    };
  });
};

export const parseSpells = (spells: any[]) => {
  return spells.map((spell) => ({
    ...spell,
    components: Array.isArray(spell.components)
      ? spell.components.map((c: any) => c.component)
      : [],
  }));
};

export const parseAlternateForms = (forms: any[]) => {
  return forms.map((f) => ({
    ...f,
    attacks: parseJsonArray(f.attacks || '[]'),
    abilities: parseJsonArray(f.abilities || '[]'),
  }));
};

export const parseCompanions = (companions: any[]) => {
  return companions.map((c) => ({
    ...c,
    attacks: parseJsonArray(c.attacks || '[]'),
    abilities: parseJsonArray(c.abilities || '[]'),
  }));
};

export const parseRaceData = (raceData: any) => {
  if (!raceData) return null;
  return {
    ...raceData,
    languages: parseJsonArray(raceData.languages || '[]'),
    traits: parseJsonArray(raceData.traits || '[]'),
    abilityScoreIncrease: parseJsonObject(raceData.abilityScoreIncrease || '{}'),
    subraces: parseJsonArray(raceData.subraces || '[]'),
    skillProficiencies: parseJsonArray(raceData.skillProficiencies || '[]'),
    hasSubrace: raceData.hasSubrace === true,
    bonusArmorClass: raceData.bonusArmorClass ?? 0,
    bonusHp: raceData.bonusHp ?? 0,
  };
};

export const parseBackgroundData = (background: any) => {
  if (!background) return null;
  return {
    ...background,
    bonusSkills: parseJsonArray(background.bonusSkills || '[]'),
    bonusLanguages: parseJsonArray(background.bonusLanguages || '[]'),
    abilityScoreIncrease: parseJsonObject(background.abilityScoreIncrease || '{}'),
    toolProficiencies: parseJsonArray(background.toolProficiencies || '[]'),
  };
};

export const parseDefenses = (defenses: any[]) => {
  return defenses.map((d) => ({
    id: d.id,
    type: d.type,
    name: d.name,
    description: d.description,
    source: d.source || 'manual',
    sourceName: d.sourceName || '',
    isCustom: d.isCustom === true,
    libraryEntryId: d.libraryEntryId ?? null,
  }));
};

export const parseCharacterResponse = (character: any) => {
  const result = { ...character };

  result.background = character.background
    ? {
        ...character.background,
        bonusSkills: parseJsonArray(character.background.bonusSkills),
        bonusLanguages: parseJsonArray(character.background.bonusLanguages),
        abilityScoreIncrease: parseJsonObject(character.background.abilityScoreIncrease),
        toolProficiencies: parseJsonArray(character.background.toolProficiencies || '[]'),
      }
    : null;

  result.raceData = character.raceData
    ? {
        ...character.raceData,
        languages: parseJsonArray(character.raceData.languages),
        traits: parseJsonArray(character.raceData.traits),
        abilityScoreIncrease: parseJsonObject(character.raceData.abilityScoreIncrease),
        subraces: parseJsonArray(character.raceData.subraces),
        skillProficiencies: parseJsonArray(character.raceData.skillProficiencies || '[]'),
      }
    : null;

  result.attributeMethodState = parseJsonObject(character.attributeMethodState || '{}');
  result.notesCategories = parseJsonArray(character.notesCategories || '[]');
  result.classLevels = parseClassLevels(character.classLevels || []);
  result.spells = parseSpells(character.spells || []);
  result.alternateForms = parseAlternateForms(character.alternateForms || []);
  result.companions = parseCompanions(character.companions || []);

  result.damageImmunities =
    character.defenses?.filter((d: any) => d.type === 'damage_immunity') || [];
  result.damageResistances =
    character.defenses?.filter((d: any) => d.type === 'damage_resistance') || [];
  result.conditionImmunities =
    character.defenses?.filter((d: any) => d.type === 'condition_immunity') || [];

  result.resources = character.resources || [];
  result.hitDice = character.hitDice || [];

  return result;
};

export const cleanCharacterData = (data: any) => {
  const {
    skills,
    savingThrows,
    statusEffects,
    proficiencies,
    hpSources,
    attributes,
    classLevels,
    combatValueSources,
    damageImmunities,
    damageResistances,
    conditionImmunities,
    background,
    raceData,
    spells,
    spellSlots,
    resources,
    hitDice,
    alternateForms,
    companions,
    ...characterData
  } = data;
  return {
    characterData,
    skills,
    savingThrows,
    statusEffects,
    proficiencies,
    hpSources,
    attributes,
    classLevels,
    combatValueSources,
    damageImmunities,
    damageResistances,
    conditionImmunities,
    background,
    raceData,
    spells,
    spellSlots,
    resources,
    hitDice,
    alternateForms,
    companions,
  };
};