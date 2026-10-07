// src/components/character/CharacterForm.tsx
'use client';

import { useCharacterState } from './hooks/useCharacterState';
import { useCharacterMemos } from './hooks/useCharacterMemos';
import { useCharacterDataLoader } from './hooks/useCharacterDataLoader';
import { useCharacterSyncs } from './hooks/useCharacterSyncs';
import { useCharacterHandlers } from './hooks/useCharacterHandlers';
import { useCharacterSubmit } from './hooks/useCharacterSubmit';

import { CharacterHeader } from './forms/CharacterHeader';
import { CharacterBasicFields } from './forms/CharacterBasicFields';
import { CharacterTabContent } from './forms/CharacterTabContent';
import { CharacterFormActions } from './forms/CharacterFormActions';

import { CreateItemModal } from './modals/CreateItemModal';
import { CreateSpellModal } from './modals/CreateSpellModal';

import { CharacterFormProps, CharacterFormData } from './forms/characterFormTypes';

export type { CharacterFormData, CharacterFormProps };

export function CharacterForm({
  characterId,
  initialData,
  mode,
  onSave,
  onCancel,
  readOnly = false,
}: CharacterFormProps) {
  const isNew = mode === 'create';
  const isView = mode === 'view';
  const hasInitialData = !!initialData;

  const state = useCharacterState(characterId, initialData, isNew);
  const memos = useCharacterMemos(state);

  useCharacterDataLoader(state, {
    characterId,
    isNew,
    hasInitialData,
  });
  useCharacterSyncs(state);

  const handlers = useCharacterHandlers(state, memos, { characterId, isNew });
  const { handleSubmit } = useCharacterSubmit(state, memos, {
    characterId,
    isNew,
    isView,
    onSave,
  });

  if (state.loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const isEditable = mode === 'create' || mode === 'edit';

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <CharacterHeader
        characterId={characterId}
        name={state.name}
        isNew={isNew}
        isView={isView}
        activeForm={memos.activeForm}
        unitSystem={state.unitSystem}
        currentHp={state.currentHp}
        totalHp={memos.totalHp}
        tempHp={state.tempHp}
        tempMaxHp={state.tempMaxHp}
        tempMaxHpMax={state.tempMaxHpMax}
        exhaustionLevel={state.exhaustionLevel}
        constitutionValue={memos.constitutionValue}
        resources={state.resources}
        hitDice={state.hitDice}
        spellSlots={state.spellSlots}
        lastLongRest={state.lastLongRest}
        onRestUpdated={handlers.handleRestUpdate}
        onExhaustionChange={handlers.handleExhaustionChange}
        onDeactivateForm={handlers.handleDeactivateForm}
        onFormDamage={handlers.handleFormDamage}
        onFormHeal={handlers.handleFormHeal}
      />

      <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-purple-500/20">
        <form onSubmit={handleSubmit}>
          <CharacterBasicFields
            name={state.name}
            onNameChange={state.setName}
            levelingMode={state.levelingMode}
            onLevelingModeChange={state.setLevelingMode}
            unitSystem={state.unitSystem}
            onUnitSystemChange={state.setUnitSystem}
            disabled={isView}
          />

          <CharacterTabContent
            activeTab={state.activeTab}
            onTabChange={state.setActiveTab}
            characterId={characterId}
            mode={mode}
            isView={isView}
            unitSystem={state.unitSystem}
            characterName={state.name}
            equipmentRefresh={state.equipmentRefresh}

            // Status
            attributes={state.attributes}
            onAttributesUpdate={state.setAttributes}
            combatValueSources={state.combatValueSources}
            onCombatValueSourcesUpdate={state.setCombatValueSources}
            skills={state.skills}
            onSkillsUpdate={state.setSkills}
            proficiencyBonus={memos.proficiencyBonus}
            onRenameAttribute={handlers.handleRenameAttribute}
            onDeleteAttribute={handlers.handleDeleteAttribute}
            onAddCustomSkill={handlers.addCustomSkill}
            raceData={state.raceData}
            background={state.background}
            attributeMethod={state.attributeMethod}
            onAttributeMethodChange={state.setAttributeMethod}
            attributeMethodState={state.attributeMethodState}
            onAttributeMethodStateUpdate={state.setAttributeMethodState}
            classLevels={state.classLevels}
            damageImmunities={memos.aggregatedDefenses.immunities}
            damageResistances={memos.aggregatedDefenses.resistances}
            conditionImmunities={memos.aggregatedDefenses.conditions}
            onManualDefensesUpdate={handlers.handleManualDefensesUpdate}

            // Background
            onBackgroundUpdate={state.setBackground}
            alignment={state.alignment}
            onAlignmentChange={state.setAlignment}
            proficiencies={state.proficiencies}
            onProficienciesUpdate={state.setProficiencies}
            notesCategories={state.notesCategories}
            onNotesCategoriesUpdate={state.setNotesCategories}

            // Race
            onRaceDataUpdate={state.setRaceData}
            raceDefenses={memos.raceDefenses}
            onRaceDefensesChange={handlers.handleRaceDefensesChange}

            // Classes
            onClassLevelsUpdate={state.setClassLevels}
            characterLevel={state.characterLevel}
            onCharacterLevelChange={state.setCharacterLevel}
            levelingMode={state.levelingMode}
            experience={state.experience}
            onExperienceChange={state.setExperience}
            nextLevelExp={state.nextLevelExp}
            onNextLevelExpChange={state.setNextLevelExp}
            expMode={state.expMode}
            onExpModeChange={state.setExpMode}
            expThresholds={state.expThresholds}
            onExpThresholdsChange={state.setExpThresholds}
            classProgression={state.classProgression}
            onClassProgressionChange={state.setClassProgression}
            hpSources={state.hpSources}
            onHpSourcesUpdate={state.setHpSources}
            resources={state.resources}
            onResourcesUpdate={state.setResources}
            hitDice={state.hitDice}
            onHitDiceUpdate={state.setHitDice}
            hasHitDice={state.hasHitDice}
            onHasHitDiceChange={state.setHasHitDice}
            hitDiceMode={state.hitDiceMode}
            onHitDiceModeChange={state.setHitDiceMode}
            onHealFromHitDie={handlers.handleHealFromHitDie}
            alternateForms={state.alternateForms}
            onAlternateFormsUpdate={state.setAlternateForms}
            companions={state.companions}
            onCompanionsUpdate={state.setCompanions}
            classDefensesByClass={memos.classDefensesByClass}
            onClassDefensesChange={handlers.handleClassDefensesChange}

            // Actions
            actions={state.actions}
            onActionsUpdate={state.setActions}
            onOpenActionModal={() => handlers.openItemModal('action')}

            // Forms
            onActivateForm={handlers.handleActivateForm}
            onDeactivateForm={handlers.handleDeactivateForm}

            // Companions
            onCompanionDamage={handlers.handleCompanionDamage}
            onCompanionHeal={handlers.handleCompanionHeal}
            onCompanionDismiss={handlers.handleCompanionDismiss}
            onCompanionRecall={handlers.handleCompanionRecall}

            // Spells
            spells={state.spells}
            onSpellsUpdate={state.setSpells}
            spellSlots={state.spellSlots}
            onSpellSlotsUpdate={state.setSpellSlots}
            onOpenSpellModal={() => state.setSpellModalOpen(true)}
            onEditSpell={(spell) => state.setEditingSpell(spell)}
            onCastConcentration={handlers.handleCastConcentrationSpell}

            // Features
            onCompanionActivateFromFeature={
              handlers.handleCompanionActivateFromFeature
            }

            // Equipment
            onOpenItemModal={handlers.openItemModal}
            containers={state.containers}
            onContainersUpdate={state.setContainers}
          />

          {state.error && (
            <div className="bg-red-500/20 p-3 rounded text-red-300 mt-6">
              {state.error}
            </div>
          )}

          <CharacterFormActions
            characterId={characterId}
            isNew={isNew}
            isEditable={isEditable}
            saving={state.saving}
            onCancel={onCancel}
          />
        </form>
      </div>

      {state.itemModalState.isOpen && (
        <CreateItemModal
          isOpen={state.itemModalState.isOpen}
          onClose={handlers.closeItemModal}
          characterId={characterId}
          onCreated={handlers.handleItemCreated}
          onItemCreated={handlers.handleItemCreated}
          itemType={state.itemModalState.itemType}
          containerId={state.itemModalState.containerId}
          unitSystem={state.unitSystem}
        />
      )}

      <CreateSpellModal
        isOpen={state.spellModalOpen}
        onClose={() => state.setSpellModalOpen(false)}
        characterId={characterId}
        onCreated={handlers.handleSpellCreated}
        unitSystem={state.unitSystem}
      />

      {state.editingSpell && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-purple-500/30">
            <h3 className="text-lg font-bold mb-3">Zauber bearbeiten</h3>
            <p className="text-sm text-gray-400">
              Die Bearbeitung einzelner Zauber wird in einer späteren Version
              ergänzt.
            </p>
            <button type="button"
              onClick={() => state.setEditingSpell(null)}
              className="mt-4 w-full py-2 bg-gray-700 rounded-lg"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}