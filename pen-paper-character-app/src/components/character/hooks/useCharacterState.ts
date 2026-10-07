// src/components/character/hooks/useCharacterState.ts
'use client';

import { useState } from 'react';
import { Attribute } from '../editors/AttributesEditor';
import { BackgroundData } from '../editors/BackgroundEditTab';
import { RaceData } from '../editors/RaceEditor';
import { ClassLevel } from '../editors/ClassLevelsEditor';
import { CombatValueSource } from '../editors/CombatValuesEditor';
import { SavingThrow } from '../editors/SavingThrowsEditor';
import { DefenseItem } from '../modals/DefensesModal';
import { Skill } from '@/types/skills';
import { Action } from '@/types/actions';
import {
  AttributeMethod,
  AttributeMethodState,
  ClassProgression,
  EMPTY_ATTRIBUTE_METHOD_STATE,
  ExpMode,
  HitDiceMode,
  HpSource,
  LevelingMode,
  NotesCategory,
  UnitSystem,
} from '@/types/character';
import { CharacterResource, CharacterHitDice } from '@/types/resources';
import { AlternateForm } from '@/types/forms';
import { Companion } from '@/types/companions';
import { Spell, SpellSlot } from '@/types/spells';
import { InventoryContainer } from '@/types/inventory';
import { CharacterFormData } from '../forms/characterFormTypes';
import {
  DEFAULT_HP_SOURCES,
  DEFAULT_COMBAT_VALUE_SOURCES,
  DEFAULT_RACE_DATA,
  DEFAULT_BACKGROUND,
} from '../forms/characterFormDefaults';
import {
  migrateClassProgression,
  migrateClassLevels,
  migrateRaceData,
} from '../forms/characterFormHelpers';
import { initializeNotesCategories } from '@/lib/defaults/notesCategories';

export function useCharacterState(
  characterId: string,
  initialData: Partial<CharacterFormData> | undefined,
  isNew: boolean
) {
  const [loading, setLoading] = useState(!isNew && !initialData);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('status');
  const [equipmentRefresh, setEquipmentRefresh] = useState(0);

  const [name, setName] = useState(initialData?.name || '');
  const [levelingMode, setLevelingMode] = useState<LevelingMode>(
    initialData?.levelingMode || 'milestone'
  );
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(
    initialData?.unitSystem || 'metric'
  );
  const [alignment, setAlignment] = useState(initialData?.alignment || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [characterLevel, setCharacterLevel] = useState<number>(
    initialData?.level || 1
  );
  const [experience, setExperience] = useState<number>(
    initialData?.experience || 0
  );
  const [nextLevelExp, setNextLevelExp] = useState<number>(
    initialData?.nextLevelExp || 300
  );
  const [classProgression, setClassProgression] = useState<ClassProgression>(
    migrateClassProgression(initialData?.classProgression)
  );
  const [expMode, setExpMode] = useState<ExpMode>(
    initialData?.expMode || 'next_only'
  );
  const [expThresholds, setExpThresholds] = useState<Record<number, number>>(
    initialData?.expThresholds || {}
  );
  const [hasHitDice, setHasHitDice] = useState<boolean>(
    initialData?.hasHitDice ?? true
  );
  const [hitDiceMode, setHitDiceMode] = useState<HitDiceMode>(
    initialData?.hitDiceMode || 'scaled'
  );

  const [attributeMethod, setAttributeMethod] = useState<AttributeMethod>(
    initialData?.attributeMethod || (isNew ? 'standard' : 'free')
  );
  const [attributeMethodState, setAttributeMethodState] =
    useState<AttributeMethodState>(
      initialData?.attributeMethodState || EMPTY_ATTRIBUTE_METHOD_STATE
    );
  const [notesCategories, setNotesCategories] = useState<NotesCategory[]>(
    initializeNotesCategories(initialData?.notesCategories, initialData?.notes)
  );

  const [raceData, setRaceData] = useState<RaceData>(
    initialData?.raceData
      ? migrateRaceData(initialData.raceData)
      : DEFAULT_RACE_DATA
  );
  const [background, setBackground] = useState<BackgroundData>(
    initialData?.background || DEFAULT_BACKGROUND
  );

  const [defenses, setDefenses] = useState<DefenseItem[]>(
    initialData?.defenses || []
  );

  // Attribute starten leer — werden bei "new" aus Library geladen
  const [attributes, setAttributes] = useState<Attribute[]>(
    initialData?.attributes || []
  );
  const [combatValueSources, setCombatValueSources] = useState<
    CombatValueSource[]
  >(initialData?.combatValueSources || DEFAULT_COMBAT_VALUE_SOURCES);
  const [hpSources, setHpSources] = useState<HpSource[]>(
    initialData?.hpSources || DEFAULT_HP_SOURCES
  );

  // Skills starten leer — werden bei "new" aus Library geladen
  const [skills, setSkills] = useState<Skill[]>(initialData?.skills || []);
  const [savingThrows, setSavingThrows] = useState<SavingThrow[]>(
    initialData?.savingThrows || []
  );
  const [proficiencies, setProficiencies] = useState<any[]>(
    initialData?.proficiencies || []
  );

  const [classLevels, setClassLevels] = useState<ClassLevel[]>(
    migrateClassLevels(initialData?.classLevels as any[])
  );
  const [containers, setContainers] = useState<InventoryContainer[]>(
    initialData?.containers || []
  );

  const [spells, setSpells] = useState<Spell[]>(initialData?.spells || []);
  const [spellSlots, setSpellSlots] = useState<SpellSlot[]>(
    initialData?.spellSlots || []
  );

  const [resources, setResources] = useState<CharacterResource[]>(
    initialData?.resources || []
  );
  const [hitDice, setHitDice] = useState<CharacterHitDice[]>(
    initialData?.hitDice || []
  );

  const [alternateForms, setAlternateForms] = useState<AlternateForm[]>(
    initialData?.alternateForms || []
  );
  const [companions, setCompanions] = useState<Companion[]>(
    initialData?.companions || []
  );

  const [exhaustionLevel, setExhaustionLevel] = useState<number>(0);
  const [lastLongRest, setLastLongRest] = useState<string | null>(null);
  const [currentHp, setCurrentHp] = useState<number>(0);
  const [tempHp, setTempHp] = useState<number>(0);
  const [tempMaxHp, setTempMaxHp] = useState<number>(0);
  const [tempMaxHpMax, setTempMaxHpMax] = useState<number>(0);

  const [statusEffects, setStatusEffects] = useState<any[]>([]);
  const [actions, setActions] = useState<Action[]>([]);
  const [equipmentForDefense, setEquipmentForDefense] = useState<any[]>([]);

  const [itemModalState, setItemModalState] = useState<{
    isOpen: boolean;
    itemType: 'equipment' | 'action' | 'inventory';
    containerId?: string;
  }>({ isOpen: false, itemType: 'equipment' });
  const [spellModalOpen, setSpellModalOpen] = useState(false);
  const [editingSpell, setEditingSpell] = useState<Spell | null>(null);

  return {
    loading, setLoading,
    saving, setSaving,
    error, setError,
    loadFailed, setLoadFailed,
    activeTab, setActiveTab,
    equipmentRefresh, setEquipmentRefresh,
    name, setName,
    levelingMode, setLevelingMode,
    unitSystem, setUnitSystem,
    alignment, setAlignment,
    notes, setNotes,
    characterLevel, setCharacterLevel,
    experience, setExperience,
    nextLevelExp, setNextLevelExp,
    classProgression, setClassProgression,
    expMode, setExpMode,
    expThresholds, setExpThresholds,
    hasHitDice, setHasHitDice,
    hitDiceMode, setHitDiceMode,
    attributeMethod, setAttributeMethod,
    attributeMethodState, setAttributeMethodState,
    notesCategories, setNotesCategories,
    raceData, setRaceData,
    background, setBackground,
    defenses, setDefenses,
    attributes, setAttributes,
    combatValueSources, setCombatValueSources,
    hpSources, setHpSources,
    skills, setSkills,
    savingThrows, setSavingThrows,
    proficiencies, setProficiencies,
    classLevels, setClassLevels,
    containers, setContainers,
    spells, setSpells,
    spellSlots, setSpellSlots,
    resources, setResources,
    hitDice, setHitDice,
    alternateForms, setAlternateForms,
    companions, setCompanions,
    exhaustionLevel, setExhaustionLevel,
    lastLongRest, setLastLongRest,
    currentHp, setCurrentHp,
    tempHp, setTempHp,
    tempMaxHp, setTempMaxHp,
    tempMaxHpMax, setTempMaxHpMax,
    statusEffects, setStatusEffects,
    actions, setActions,
    equipmentForDefense, setEquipmentForDefense,
    itemModalState, setItemModalState,
    spellModalOpen, setSpellModalOpen,
    editingSpell, setEditingSpell,
    characterId,
  };
}

export type CharacterState = ReturnType<typeof useCharacterState>;