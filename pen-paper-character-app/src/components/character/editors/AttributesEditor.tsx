// src/components/character/edit/AttributesEditor.tsx
'use client';

import { useState } from 'react';
import { RaceData } from './RaceEditor';
import { BackgroundData } from './BackgroundEditTab';
import { BonusTooltip } from '@/components/ui/BonusTooltip';
import { AttributeMethod, AttributeMethodState } from '@/types/character';
import { AttributeMethodSelector } from './AttributeMethodSelector';

export interface Attribute {
  id: string;
  name: string;
  value: number;
  baseValue?: number;
  isDefault: boolean;
  order: number;
}

interface AttributesEditorProps {
  attributes: Attribute[];
  onUpdate: (attributes: Attribute[]) => void;
  onRename?: (oldName: string, newName: string) => void;
  onDelete?: (attribute: Attribute) => void;
  raceData?: RaceData;
  background?: BackgroundData;
  attributeMethod?: AttributeMethod;
  onAttributeMethodChange?: (method: AttributeMethod) => void;
  attributeMethodState?: AttributeMethodState;
  onAttributeMethodStateUpdate?: (state: AttributeMethodState) => void;
  showMethodSelector?: boolean;
}

export function AttributesEditor({
  attributes,
  onUpdate,
  onRename,
  onDelete,
  raceData,
  background,
  attributeMethod,
  onAttributeMethodChange,
  attributeMethodState,
  onAttributeMethodStateUpdate,
  showMethodSelector = false,
}: AttributesEditorProps) {
  const [showNewForm, setShowNewForm] = useState(false);
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrValue, setNewAttrValue] = useState(10);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');

  // ==================== BONUS-BERECHNUNG ====================
  const getBonusesRecord = (): Record<string, number> => {
    const raceBonuses = raceData?.abilityScoreIncrease?.bonuses || {};
    const bgBonuses = background?.abilityScoreIncrease?.bonuses || {};
    const result: Record<string, number> = {};
    const keys = new Set([...Object.keys(raceBonuses), ...Object.keys(bgBonuses)]);
    keys.forEach((k) => {
      result[k] = (raceBonuses[k] || 0) + (bgBonuses[k] || 0);
    });
    return result;
  };

  const getBonusForAttr = (attrName: string): number => {
    const bonuses = getBonusesRecord();
    return bonuses[attrName] || 0;
  };

  const updateAttributeValue = (id: string, value: number) => {
    const updated = attributes.map((attr) => {
      if (attr.id !== id) return attr;
      // Nutzer gibt den FINALEN Wert ein (inkl. Boni) → baseValue = value - bonus
      const bonus = getBonusForAttr(attr.name);
      return { ...attr, value, baseValue: value - bonus };
    });
    onUpdate(updated);
  };

  const startRename = (attr: Attribute) => {
    setEditingName(attr.id);
    setTempName(attr.name);
  };

  const confirmRename = (id: string, oldName: string, isDefault: boolean) => {
    if (!tempName.trim()) return;
    if (tempName === oldName) {
      setEditingName(null);
      return;
    }
    let proceed = true;
    if (isDefault) {
      proceed = confirm(
        `Das Attribut "${oldName}" ist ein Standardattribut.\nMöchten Sie es wirklich in "${tempName}" umbenennen?\nAlle zugehörigen Fertigkeiten und Rettungswürfe werden ebenfalls umbenannt.`
      );
    }
    if (proceed) {
      const updated = attributes.map((attr) =>
        attr.id === id ? { ...attr, name: tempName.trim() } : attr
      );
      onUpdate(updated);
      if (onRename) onRename(oldName, tempName.trim());
    }
    setEditingName(null);
  };

  const deleteAttribute = (attr: Attribute) => {
    if (attr.isDefault) {
      alert('Standardattribute können nicht gelöscht werden!');
      return;
    }
    const confirmMsg = `Möchtest du das Attribut "${attr.name}" wirklich löschen?\nAlle damit verbundenen Fertigkeiten und Rettungswürfe werden ebenfalls gelöscht!`;
    if (confirm(confirmMsg)) {
      if (onDelete) onDelete(attr);
      onUpdate(attributes.filter((a) => a.id !== attr.id));
    }
  };

  const addCustomAttribute = () => {
    if (!newAttrName.trim()) return;
    if (attributes.some((a) => a.name === newAttrName.trim())) {
      alert('Ein Attribut mit diesem Namen existiert bereits!');
      return;
    }
    const newAttr: Attribute = {
      id: `temp-${Date.now()}`,
      name: newAttrName.trim(),
      value: newAttrValue,
      baseValue: newAttrValue,
      isDefault: false,
      order: attributes.length,
    };
    onUpdate([...attributes, newAttr]);
    setNewAttrName('');
    setNewAttrValue(10);
    setShowNewForm(false);
  };

  const getAttributeBonuses = (attrName: string) => {
    const raceBonus = raceData?.abilityScoreIncrease?.bonuses?.[attrName] || 0;
    const bgBonus = background?.abilityScoreIncrease?.bonuses?.[attrName] || 0;
    return { race: raceBonus, background: bgBonus, total: raceBonus + bgBonus };
  };

  const sortedAttributes = [...attributes].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1;
    if (!a.isDefault && b.isDefault) return 1;
    return a.order - b.order;
  });

  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3">🎲 Attribute</h2>

      {showMethodSelector &&
        attributeMethod &&
        onAttributeMethodChange &&
        attributeMethodState &&
        onAttributeMethodStateUpdate && (
          <AttributeMethodSelector
            attributeMethod={attributeMethod}
            onMethodChange={onAttributeMethodChange}
            attributes={attributes}
            onAttributesUpdate={onUpdate}
            methodState={attributeMethodState}
            onMethodStateUpdate={onAttributeMethodStateUpdate}
            raceBonuses={raceData?.abilityScoreIncrease?.bonuses || {}}
            backgroundBonuses={background?.abilityScoreIncrease?.bonuses || {}}
          />
        )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {sortedAttributes.map((attr) => {
          const mod = Math.floor((attr.value - 10) / 2);
          const bonuses = getAttributeBonuses(attr.name);
          const hasBonuses = bonuses.race > 0 || bonuses.background > 0;

          return (
            <BonusTooltip
              key={attr.id}
              attrName={attr.name}
              raceBonus={bonuses.race}
              backgroundBonus={bonuses.background}
              className="w-full"
            >
              <div className="relative group">
                {editingName === attr.id ? (
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="flex-1 px-1 py-1 text-sm bg-gray-700 rounded w-full"
                    autoFocus
                    onBlur={() => confirmRename(attr.id, attr.name, attr.isDefault)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && confirmRename(attr.id, attr.name, attr.isDefault)
                    }
                  />
                ) : (
                  <div className="flex justify-between items-center">
                    <label
                      className={`text-sm cursor-pointer hover:text-purple-400 ${
                        hasBonuses ? 'font-semibold' : ''
                      }`}
                      onDoubleClick={() => startRename(attr)}
                    >
                      {attr.name}
                      {hasBonuses && <span className="ml-1 text-xs text-purple-400">✨</span>}
                    </label>
                    {!attr.isDefault && (
                      <button
                        type="button"
                        onClick={() => deleteAttribute(attr)}
                        className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    value={attr.value}
                    onChange={(e) => updateAttributeValue(attr.id, parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 bg-gray-800 rounded-lg ${
                      hasBonuses ? 'border border-purple-500/50' : ''
                    }`}
                  />
                  <span className="text-sm text-purple-400 whitespace-nowrap">
                    ({mod >= 0 ? `+${mod}` : `${mod}`})
                  </span>
                </div>
                {editingName !== attr.id && (
                  <div className="absolute left-0 -bottom-5 text-xs text-gray-500">
                    (Doppelklick zum Umbenennen)
                  </div>
                )}
              </div>
            </BonusTooltip>
          );
        })}
      </div>

      {!showNewForm ? (
        <button
          type="button"
          onClick={() => setShowNewForm(true)}
          className="mt-4 px-3 py-1 bg-purple-600 rounded text-sm w-full"
        >
          + Neues Attribut (z.B. Magie)
        </button>
      ) : (
        <div className="mt-4 p-3 bg-gray-800 rounded-lg flex gap-2">
          <input
            type="text"
            placeholder="Attributsname"
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm"
            autoFocus
          />
          <input
            type="number"
            placeholder="Wert"
            value={newAttrValue}
            onChange={(e) => setNewAttrValue(parseInt(e.target.value) || 0)}
            className="w-24 px-2 py-1 bg-gray-700 rounded text-sm"
          />
          <button onClick={addCustomAttribute} className="px-3 bg-green-600 rounded text-sm">
            Hinzufügen
          </button>
          <button
            onClick={() => setShowNewForm(false)}
            className="px-3 bg-gray-600 rounded text-sm"
          >
            Abbrechen
          </button>
        </div>
      )}
    </div>
  );
}