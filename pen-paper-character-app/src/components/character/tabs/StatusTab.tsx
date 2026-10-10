// src/components/character/tabs/StatusTab.tsx
'use client';

import { useState } from 'react';
import { getModifier } from '@/lib/utils';
import {
  Attribute,
  AttributesEditor,
} from '@/components/character/editors/AttributesEditor';
import { CombatValueSource } from '@/components/character/editors/CombatValuesEditor';
import { SkillsEditor } from '@/components/character/editors/SkillsEditor';
import { Skill } from '@/types/skills';
import { RaceData } from '@/components/character/editors/RaceEditor';
import { BackgroundData } from '@/components/character/editors/BackgroundEditTab';
import {
  DefensesModal,
  DefenseItem,
} from '@/components/character/modals/DefensesModal';
import {
  AttributeMethod,
  AttributeMethodState,
  UnitSystem,
} from '@/types/character';

interface StatusTabProps {
  characterId: string;
  mode: 'create' | 'edit' | 'view';
  unitSystem: UnitSystem;
  attributes: Attribute[];
  onAttributesUpdate: (attrs: Attribute[]) => void;
  combatValueSources: CombatValueSource[];
  onCombatValueSourcesUpdate: (sources: CombatValueSource[]) => void;
  skills: Skill[];
  onSkillsUpdate: (skills: Skill[]) => void;
  proficiencyBonus: number;
  onRenameAttribute: (oldName: string, newName: string) => void;
  onDeleteAttribute: (attr: Attribute) => void;
  onAddCustomSkill: (name: string, attributeName: string) => void;
  readOnly?: boolean;
  raceData?: RaceData;
  background?: BackgroundData;
  attributeMethod: AttributeMethod;
  onAttributeMethodChange: (method: AttributeMethod) => void;
  attributeMethodState: AttributeMethodState;
  onAttributeMethodStateUpdate: (state: AttributeMethodState) => void;
  classLevels?: { className: string; savingThrowProficiencies: string[] }[];
  damageImmunities?: DefenseItem[];
  damageResistances?: DefenseItem[];
  conditionImmunities?: DefenseItem[];
  onManualDefensesUpdate?: (
    immunities: DefenseItem[],
    resistances: DefenseItem[],
    conditions: DefenseItem[]
  ) => void;
}

const sourceIcons: Record<string, string> = {
  class: '⚔️',
  race: '🧝',
  equipment: '🎒',
  manual: '📝',
};

const sourceLabels: Record<string, string> = {
  class: 'Klassen',
  race: 'Rassen',
  equipment: 'Ausrüstung',
  manual: 'Manuell',
};

export function StatusTab({
  characterId,
  mode,
  unitSystem,
  attributes,
  onAttributesUpdate,
  combatValueSources,
  skills,
  onSkillsUpdate,
  proficiencyBonus,
  onRenameAttribute,
  onDeleteAttribute,
  onAddCustomSkill,
  readOnly = false,
  raceData,
  background,
  attributeMethod,
  onAttributeMethodChange,
  attributeMethodState,
  onAttributeMethodStateUpdate,
  classLevels = [],
  damageImmunities = [],
  damageResistances = [],
  conditionImmunities = [],
  onManualDefensesUpdate,
}: StatusTabProps) {
  const [showManualDefensesModal, setShowManualDefensesModal] = useState(false);
  const isCreating = mode === 'create';

  const raceSpeedFt = raceData?.speed ?? 30;
  const raceSpeedDisplay =
    unitSystem === 'imperial'
      ? `${raceSpeedFt} ft`
      : `${Math.round(raceSpeedFt * 0.3048 * 10) / 10} m`;

  // ============ RETTUNGSWÜRFE mit Herkunft + Dedupe ============
  const savingThrowSources: Record<string, string[]> = {};
  classLevels.forEach((cl) => {
    (cl.savingThrowProficiencies || []).forEach((s) => {
      if (!savingThrowSources[s]) savingThrowSources[s] = [];
      if (!savingThrowSources[s].includes(cl.className)) {
        savingThrowSources[s].push(cl.className);
      }
    });
  });

  // ============ PASSIVE STATS ============
  const getSkillTotalBonus = (skillName: string): number => {
    const skill = skills.find((s) => s.name === skillName);
    if (!skill) return 0;
    const attr = attributes.find((a) => a.name === skill.attributeName);
    const attrMod = attr ? getModifier(attr.value) : 0;
    const prof = skill.isProficient ? proficiencyBonus : 0;
    const exp = skill.expertise ? proficiencyBonus : 0;
    return attrMod + prof + exp;
  };

  const passivePerception = 10 + getSkillTotalBonus('Wahrnehmung');
  const passiveInsight = 10 + getSkillTotalBonus('Einsicht');

  const initiativeValue = combatValueSources
    .filter((s) => s.type === 'initiativeBonus')
    .reduce((sum, s) => {
      if (s.dependsOn) {
        const attr = attributes.find((a) => a.name === s.dependsOn);
        return sum + (attr ? getModifier(attr.value) : 0);
      }
      return sum + s.value;
    }, 0);

  const groupBySource = (items: DefenseItem[]) => {
    const map: Record<string, DefenseItem[]> = {};
    items.forEach((item) => {
      const key = item.source || 'manual';
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return map;
  };

  const groupedImmunities = groupBySource(damageImmunities);
  const groupedResistances = groupBySource(damageResistances);
  const groupedConditions = groupBySource(conditionImmunities);

  const manualImmunities = damageImmunities.filter(
    (d) => d.source === 'manual'
  );
  const manualResistances = damageResistances.filter(
    (d) => d.source === 'manual'
  );
  const manualConditions = conditionImmunities.filter(
    (d) => d.source === 'manual'
  );

  const renderDefenseGroup = (
    title: string,
    grouped: Record<string, DefenseItem[]>,
    showEdit: boolean
  ) => (
    <div>
      <div className="flex justify-between items-center mb-1">
        <div className="text-xs text-gray-400">{title}</div>
        {showEdit && !readOnly && onManualDefensesUpdate && (
          <button
            type="button"
            onClick={() => setShowManualDefensesModal(true)}
            className="text-xs text-purple-400 hover:text-purple-300"
          >
            Manuell bearbeiten
          </button>
        )}
      </div>
      <div className="space-y-1">
        {Object.keys(grouped).length === 0 && (
          <span className="text-xs text-gray-500 italic">Keine</span>
        )}
        {Object.entries(grouped).map(([src, items]) => (
          <div key={src} className="flex flex-wrap items-center gap-1">
            <span className="text-xs text-gray-500">
              {sourceIcons[src] || '•'} {sourceLabels[src] || src}:
            </span>
            {items.map((d) => (
              <span
                key={d.id}
                className="px-2 py-0.5 bg-purple-600/30 rounded-full text-xs"
                title={d.sourceName || ''}
              >
                {d.name}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {!readOnly ? (
        <AttributesEditor
          attributes={attributes}
          onUpdate={onAttributesUpdate}
          onRename={onRenameAttribute}
          onDelete={onDeleteAttribute}
          raceData={raceData}
          background={background}
          attributeMethod={attributeMethod}
          onAttributeMethodChange={onAttributeMethodChange}
          attributeMethodState={attributeMethodState}
          onAttributeMethodStateUpdate={onAttributeMethodStateUpdate}
          showMethodSelector={isCreating}
        />
      ) : (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">🎲 Attribute</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {attributes.map((attr) => (
              <div key={attr.id}>
                <div className="text-sm text-gray-400">{attr.name}</div>
                <div className="text-xl font-bold">{attr.value}</div>
                <div className="text-sm text-purple-400">
                  {getModifier(attr.value) >= 0
                    ? `+${getModifier(attr.value)}`
                    : getModifier(attr.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!readOnly ? (
        <div className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm">
            <span>👟</span>
            <span className="text-gray-400">
              Bewegungsrate (aus Rasse):
            </span>
            <span className="font-mono font-bold text-cyan-300">
              {raceSpeedDisplay}
            </span>
          </div>
          <span className="text-xs text-gray-500 italic">
            Bearbeitung im Rassen-Tab
          </span>
        </div>
      ) : (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">⚔️ Kampfwerte</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              const ac = combatValueSources
                .filter((s) => s.type === 'armorClass')
                .reduce((sum, s) => sum + s.value, 0);
              const prof = combatValueSources
                .filter((s) => s.type === 'proficiencyBonus')
                .reduce((sum, s) => sum + s.value, 0);
              return [
                { label: 'RK', value: ac },
                { label: 'Initiative', value: initiativeValue },
                { label: 'Übungsbonus', value: prof },
                { label: 'Bewegung', value: raceSpeedDisplay },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-gray-800/50 rounded-lg p-3 text-center"
                >
                  <div className="text-xs text-gray-400">{item.label}</div>
                  <div className="text-2xl font-bold">{item.value}</div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* 🔥 NEU: Passive Werte */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">👁️ Passive Werte</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Passive Wahrnehmung</div>
            <div className="text-3xl font-bold text-purple-400">
              {passivePerception}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              10 + Wahrnehmungs-Bonus
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Passive Einsicht</div>
            <div className="text-3xl font-bold text-purple-300">
              {passiveInsight}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              10 + Einsichts-Bonus
            </div>
          </div>
        </div>
        {skills.length === 0 && (
          <p className="text-xs text-gray-500 italic mt-2">
            Noch keine Fertigkeiten — Werte basieren auf Basis 10.
          </p>
        )}
      </div>

      {/* 🔥 Rettungswürfe mit Herkunft */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">🎲 Rettungswürfe</h3>
        <p className="text-xs text-gray-500 mb-3">
          Werden pro Klasse im Klassen-Tab konfiguriert.
        </p>
        <div className="space-y-2">
          {Object.keys(savingThrowSources).length === 0 && (
            <div className="text-xs text-gray-500 italic">
              Noch keine Rettungswürfe in Klassen gewählt.
            </div>
          )}
          {Object.entries(savingThrowSources).map(
            ([stName, sources]) => {
              const attr = attributes.find((a) => a.name === stName);
              const attrMod = attr ? getModifier(attr.value) : 0;
              const bonus = attrMod + proficiencyBonus;
              return (
                <div
                  key={stName}
                  className="bg-gray-800/50 rounded px-3 py-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span>{stName}</span>
                      <span className="text-lg text-purple-400">◐</span>
                    </div>
                    <span
                      className={`font-bold ${
                        bonus >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {bonus >= 0 ? `+${bonus}` : `${bonus}`}
                    </span>
                  </div>
                  {sources.length > 0 && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      von: {sources.join(', ')}
                      {sources.length > 1 && (
                        <span className="ml-1 text-gray-600">
                          (doppelt — zählt nur einmal)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      <div className="bg-gray-800/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">🛡️ Verteidigungen</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderDefenseGroup('Immunitäten', groupedImmunities, true)}
          {renderDefenseGroup('Resistenzen', groupedResistances, true)}
          {renderDefenseGroup(
            'Zustandsimmunitäten',
            groupedConditions,
            true
          )}
        </div>
      </div>

      <SkillsEditor
        skills={skills}
        attributes={attributes}
        proficiencyBonus={proficiencyBonus}
        onUpdate={onSkillsUpdate}
        onAddCustomSkill={onAddCustomSkill}
        readOnly={readOnly}
      />

      {showManualDefensesModal && onManualDefensesUpdate && (
        <DefensesModal
          isOpen={showManualDefensesModal}
          onClose={() => setShowManualDefensesModal(false)}
          source="manual"
          sourceName="Manuell"
          defenses={[
            ...manualImmunities,
            ...manualResistances,
            ...manualConditions,
          ]}
          characterId={characterId}
          onSave={(defs) => {
            onManualDefensesUpdate(
              defs.filter((d) => d.type === 'damage_immunity'),
              defs.filter((d) => d.type === 'damage_resistance'),
              defs.filter((d) => d.type === 'condition_immunity')
            );
          }}
        />
      )}
    </div>
  );
}