// src/components/character/forms/CharacterTabContent.tsx
'use client';

import { CharacterTabs } from '../CharacterTabs';
import { CHARACTER_FORM_TABS } from './characterFormTabs';
import { StatusTab } from '../tabs/StatusTab';
import { BackgroundTab } from '../tabs/BackgroundTab';
import { RaceTab } from '../tabs/RaceTab';
import { ClassesTab } from '../tabs/ClassesTab';
import { ActionsTab } from '../tabs/ActionsTab';
import { SpellsTab } from '../tabs/SpellsTab';
import { FeaturesTab } from '../tabs/FeaturesTab';
import { EquipmentTab } from '../tabs/EquipmentTab';
import { AlternateFormsEditor } from '../editors/AlternateFormsEditor';
import { CompanionsEditor } from '@/components/companions/CompanionsEditor';

import { Attribute } from '../editors/AttributesEditor';
import { BackgroundData } from '../editors/BackgroundEditTab';
import { RaceData } from '../editors/RaceEditor';
import { ClassLevel } from '../editors/ClassLevelsEditor';
import { CombatValueSource } from '../editors/CombatValuesEditor';
import { DefenseItem } from '../modals/DefensesModal';
import { Skill } from '@/types/skills';
import { Action } from '@/types/actions';
import {
  AttributeMethod,
  AttributeMethodState,
  ClassProgression,
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

interface CharacterTabContentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  characterId: string;
  mode: 'create' | 'edit' | 'view';
  isView: boolean;
  unitSystem: UnitSystem;
  characterName: string;
  equipmentRefresh: number;

  // Status
  attributes: Attribute[];
  onAttributesUpdate: (a: Attribute[]) => void;
  combatValueSources: CombatValueSource[];
  onCombatValueSourcesUpdate: (s: CombatValueSource[]) => void;
  skills: Skill[];
  onSkillsUpdate: (s: Skill[]) => void;
  proficiencyBonus: number;
  onRenameAttribute: (oldName: string, newName: string) => void;
  onDeleteAttribute: (attr: Attribute) => void;
  onAddCustomSkill: (name: string, attributeName: string) => void;
  raceData: RaceData;
  background: BackgroundData;
  attributeMethod: AttributeMethod;
  onAttributeMethodChange: (m: AttributeMethod) => void;
  attributeMethodState: AttributeMethodState;
  onAttributeMethodStateUpdate: (s: AttributeMethodState) => void;
  classLevels: ClassLevel[];
  damageImmunities: DefenseItem[];
  damageResistances: DefenseItem[];
  conditionImmunities: DefenseItem[];
  onManualDefensesUpdate: (
    imm: DefenseItem[],
    res: DefenseItem[],
    cond: DefenseItem[]
  ) => void;

  // Background
  onBackgroundUpdate: (b: BackgroundData) => void;
  alignment: string;
  onAlignmentChange: (a: string) => void;
  proficiencies: any[];
  onProficienciesUpdate: (p: any[]) => void;
  notesCategories: NotesCategory[];
  onNotesCategoriesUpdate: (c: NotesCategory[]) => void;

  // Race
  onRaceDataUpdate: (r: RaceData) => void;
  raceDefenses: DefenseItem[];
  onRaceDefensesChange: (d: DefenseItem[]) => void;

  // Classes
  onClassLevelsUpdate: (cl: ClassLevel[]) => void;
  characterLevel: number;
  onCharacterLevelChange: (l: number) => void;
  levelingMode: LevelingMode;
  experience: number;
  onExperienceChange: (e: number) => void;
  nextLevelExp: number;
  onNextLevelExpChange: (e: number) => void;
  expMode: ExpMode;
  onExpModeChange: (m: ExpMode) => void;
  expThresholds: Record<number, number>;
  onExpThresholdsChange: (t: Record<number, number>) => void;
  classProgression: ClassProgression;
  onClassProgressionChange: (p: ClassProgression) => void;
  hpSources: HpSource[];
  onHpSourcesUpdate: (s: HpSource[]) => void;
  resources: CharacterResource[];
  onResourcesUpdate: (r: CharacterResource[]) => void;
  hitDice: CharacterHitDice[];
  onHitDiceUpdate: (h: CharacterHitDice[]) => void;
  hasHitDice: boolean;
  onHasHitDiceChange: (v: boolean) => void;
  hitDiceMode: HitDiceMode;
  onHitDiceModeChange: (m: HitDiceMode) => void;
  onHealFromHitDie: (amount: number) => void;
  alternateForms: AlternateForm[];
  onAlternateFormsUpdate: (f: AlternateForm[]) => void;
  companions: Companion[];
  onCompanionsUpdate: (c: Companion[]) => void;
  classDefensesByClass: Record<string, DefenseItem[]>;
  onClassDefensesChange: (className: string, defs: DefenseItem[]) => void;

  // Actions
  actions: Action[];
  onActionsUpdate: (a: Action[]) => void;
  onOpenActionModal: () => void;

  // Forms
  onActivateForm: (f: AlternateForm) => void;
  onDeactivateForm: (f: AlternateForm) => void;

  // Companions
  onCompanionDamage: (id: string, amount: number) => void;
  onCompanionHeal: (id: string, amount: number) => void;
  onCompanionDismiss: (id: string) => void;
  onCompanionRecall: (id: string) => void;

  // Spells
  spells: Spell[];
  onSpellsUpdate: (s: Spell[]) => void;
  spellSlots: SpellSlot[];
  onSpellSlotsUpdate: (s: SpellSlot[]) => void;
  onOpenSpellModal: () => void;
  onEditSpell: (spell: Spell) => void;
  onCastConcentration: (spell: Spell) => void;

  // Features
  onCompanionActivateFromFeature: (c: Companion) => void;

  // Equipment
  onOpenItemModal: (
    type: 'equipment' | 'action' | 'inventory',
    containerId?: string
  ) => void;
  containers: InventoryContainer[];
  onContainersUpdate: (c: InventoryContainer[]) => void;
}

export function CharacterTabContent(props: CharacterTabContentProps) {
  const {
    activeTab,
    onTabChange,
    characterId,
    mode,
    isView,
    unitSystem,
    characterName,
    equipmentRefresh,
    // ...
  } = props;

  return (
    <CharacterTabs tabs={CHARACTER_FORM_TABS} activeTab={activeTab} onTabChange={onTabChange}>
      {activeTab === 'status' && (
        <StatusTab
          characterId={characterId}
          mode={mode}
          unitSystem={unitSystem}
          attributes={props.attributes}
          onAttributesUpdate={props.onAttributesUpdate}
          combatValueSources={props.combatValueSources}
          onCombatValueSourcesUpdate={props.onCombatValueSourcesUpdate}
          skills={props.skills}
          onSkillsUpdate={props.onSkillsUpdate}
          proficiencyBonus={props.proficiencyBonus}
          onRenameAttribute={props.onRenameAttribute}
          onDeleteAttribute={props.onDeleteAttribute}
          onAddCustomSkill={props.onAddCustomSkill}
          readOnly={isView}
          raceData={props.raceData}
          background={props.background}
          attributeMethod={props.attributeMethod}
          onAttributeMethodChange={props.onAttributeMethodChange}
          attributeMethodState={props.attributeMethodState}
          onAttributeMethodStateUpdate={props.onAttributeMethodStateUpdate}
          classLevels={props.classLevels.map((cl) => ({
            className: cl.className,
            savingThrowProficiencies: cl.savingThrowProficiencies || [],
          }))}
          damageImmunities={props.damageImmunities}
          damageResistances={props.damageResistances}
          conditionImmunities={props.conditionImmunities}
          onManualDefensesUpdate={props.onManualDefensesUpdate}
        />
      )}

      {activeTab === 'background' && (
        <BackgroundTab
          characterId={characterId}
          mode={mode}
          background={props.background}
          onBackgroundUpdate={props.onBackgroundUpdate}
          alignment={props.alignment}
          onAlignmentChange={props.onAlignmentChange}
          attributes={props.attributes}
          skills={props.skills}
          proficiencies={props.proficiencies}
          onProficienciesUpdate={props.onProficienciesUpdate}
          onSkillsUpdate={props.onSkillsUpdate}
          readOnly={isView}
          notesCategories={props.notesCategories}
          onNotesCategoriesUpdate={props.onNotesCategoriesUpdate}
        />
      )}

      {activeTab === 'race' && (
        <RaceTab
          characterId={characterId}
          mode={mode}
          raceData={props.raceData}
          onRaceDataUpdate={props.onRaceDataUpdate}
          attributes={props.attributes}
          skills={props.skills}
          readOnly={isView}
          unitSystem={unitSystem}
          alignment={props.alignment}
          onAlignmentChange={props.onAlignmentChange}
          defenses={props.raceDefenses}
          onDefensesChange={props.onRaceDefensesChange}
        />
      )}

      {activeTab === 'classes' && (
        <ClassesTab
          characterId={characterId}
          mode={mode}
          classLevels={props.classLevels}
          onClassLevelsUpdate={props.onClassLevelsUpdate}
          characterLevel={props.characterLevel}
          onCharacterLevelChange={props.onCharacterLevelChange}
          levelingMode={props.levelingMode}
          experience={props.experience}
          onExperienceChange={props.onExperienceChange}
          nextLevelExp={props.nextLevelExp}
          onNextLevelExpChange={props.onNextLevelExpChange}
          expMode={props.expMode}
          onExpModeChange={props.onExpModeChange}
          expThresholds={props.expThresholds}
          onExpThresholdsChange={props.onExpThresholdsChange}
          classProgression={props.classProgression}
          onClassProgressionChange={props.onClassProgressionChange}
          hpSources={props.hpSources}
          onHpSourcesUpdate={props.onHpSourcesUpdate}
          attributes={props.attributes}
          resources={props.resources}
          onResourcesUpdate={props.onResourcesUpdate}
          hitDice={props.hitDice}
          onHitDiceUpdate={props.onHitDiceUpdate}
          hasHitDice={props.hasHitDice}
          onHasHitDiceChange={props.onHasHitDiceChange}
          hitDiceMode={props.hitDiceMode}
          onHitDiceModeChange={props.onHitDiceModeChange}
          characterName={characterName}
          onHeal={props.onHealFromHitDie}
          readOnly={isView}
          alternateForms={props.alternateForms}
          companions={props.companions}
          classDefenses={props.classDefensesByClass}
          onClassDefensesChange={props.onClassDefensesChange}
        />
      )}

      {activeTab === 'actions' && (
        <ActionsTab
          characterId={characterId}
          actions={props.actions}
          onActionsUpdate={props.onActionsUpdate}
          onAddAction={props.onOpenActionModal}
          characterName={characterName}
        />
      )}

      {activeTab === 'forms' && (
        <AlternateFormsEditor
          forms={props.alternateForms}
          onUpdate={props.onAlternateFormsUpdate}
          characterId={characterId}
          characterName={characterName}
          unitSystem={unitSystem}
          resources={props.resources}
          classLevels={props.classLevels}
          onActivate={props.onActivateForm}
          onDeactivate={props.onDeactivateForm}
          readOnly={isView}
        />
      )}

      {activeTab === 'companions' && (
        <CompanionsEditor
          companions={props.companions}
          onUpdate={props.onCompanionsUpdate}
          characterId={characterId}
          characterName={characterName}
          unitSystem={unitSystem}
          resources={props.resources}
          classLevels={props.classLevels}
          onDamage={props.onCompanionDamage}
          onHeal={props.onCompanionHeal}
          onDismiss={props.onCompanionDismiss}
          onRecall={props.onCompanionRecall}
          readOnly={isView}
        />
      )}

      {activeTab === 'spells' && (
        <SpellsTab
          characterId={characterId}
          mode={mode}
          readOnly={isView}
          unitSystem={unitSystem}
          spells={props.spells}
          onSpellsUpdate={props.onSpellsUpdate}
          spellSlots={props.spellSlots}
          onSpellSlotsUpdate={props.onSpellSlotsUpdate}
          onAddSpell={props.onOpenSpellModal}
          onEditSpell={props.onEditSpell}
          onCastConcentration={props.onCastConcentration}
          characterName={characterName}
          classLevels={props.classLevels}
          attributes={props.attributes}
          proficiencyBonus={props.proficiencyBonus}
        />
      )}

      {activeTab === 'features' && (
        <FeaturesTab
          characterId={characterId}
          mode={mode}
          classLevels={props.classLevels}
          actions={props.actions}
          onActionsUpdate={props.onActionsUpdate}
          proficiencies={props.proficiencies}
          onProficienciesUpdate={props.onProficienciesUpdate}
          readOnly={isView}
          alternateForms={props.alternateForms}
          companions={props.companions}
          onActivateForm={props.onActivateForm}
          onDeactivateForm={props.onDeactivateForm}
          onActivateCompanion={props.onCompanionActivateFromFeature}
        />
      )}

      {activeTab === 'equipment' && (
        <EquipmentTab
          key={equipmentRefresh}
          characterId={characterId}
          mode={mode}
          readOnly={isView}
          unitSystem={unitSystem}
          onOpenCreateModal={(itemType, containerId) =>
            props.onOpenItemModal(itemType as any, containerId)
          }
          containers={props.containers}
          onContainersUpdate={props.onContainersUpdate}
        />
      )}
    </CharacterTabs>
  );
}