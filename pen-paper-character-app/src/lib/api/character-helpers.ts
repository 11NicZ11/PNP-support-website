// src/lib/api/character-helpers.ts
// Charakter-spezifische API-Hilfsfunktionen

import { parseJsonArray, parseJsonObject } from '@/lib/utils';



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

export const parseAction = (action: any) => {
  return {
    ...action,
    concentration: action.concentration || false,
    savingThrowDC: action.savingThrowDC ?? null,
    linkedFeatureId: action.linkedFeatureId ?? null,
    linkedClassLevelId: action.linkedClassLevelId ?? null,
  };
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

export const parseForm = (form: any) => {
  return {
    ...form,
    attacks: parseJsonArray(form.attacks || '[]'),
    abilities: parseJsonArray(form.abilities || '[]'),
  };
};

export const parseCompanion = (companion: any) => {
  return {
    ...companion,
    attacks: parseJsonArray(companion.attacks || '[]'),
    abilities: parseJsonArray(companion.abilities || '[]'),
  };
};

// Shared include block for character responses.
// Single source — a new relation only needs one edit.
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
  spells: { include: { components: { orderBy: { order: 'asc' as const } } } },
  spellSlots: true,
  resources: true,
  hitDice: true,
  alternateForms: true,
  companions: true,
});

// Shape the character response. Same output for the same DB state.
export const buildCharacterResponse = (character: any) => {
  return {
    ...character,
    classProgression: migrateClassProgression(character.classProgression),
    expMode: character.expMode || 'next_only',
    expThresholds: parseJsonObject(character.expThresholds || '{}'),
    hasHitDice: character.hasHitDice !== false,
    hitDiceMode: character.hitDiceMode || 'scaled',
    attributeMethod: character.attributeMethod || 'free',
    attributeMethodState: parseJsonObject(character.attributeMethodState || '{}'),
    notesCategories: parseJsonArray(character.notesCategories || '[]'),
    spells: parseSpells(character.spells),
    spellSlots: character.spellSlots,
    classLevels: parseClassLevels(character.classLevels),
    alternateForms: parseAlternateForms(character.alternateForms),
    companions: parseCompanions(character.companions),
    background: parseBackgroundData(character.background),
    raceData: parseRaceData(character.raceData),
    defenses: parseDefenses(character.defenses),
  };
};