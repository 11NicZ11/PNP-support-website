// pen-paper-character-app\src\components\character\edit\CombatValuesEditor.tsx

'use client';

import { useState } from 'react';
import { getModifier } from '@/lib/utils';
import type { CombatValueSource } from '@/types/combat';

// Re-export so existing importers don't break.
export type { CombatValueSource };

interface CombatValuesEditorProps {
  sources: CombatValueSource[];
  onUpdate: (sources: CombatValueSource[]) => void;
  attributes: { id: string; name: string; value: number }[];
}

const sourceTypes = [
  { key: 'armorClass', label: 'RK', icon: '🛡️' },
  { key: 'speed', label: 'Bewegung', icon: '👟' },
  { key: 'initiativeBonus', label: 'Initiative', icon: '⚡' },
  { key: 'proficiencyBonus', label: 'Übungsbonus', icon: '📚' },
];

export function CombatValuesEditor({ sources, onUpdate, attributes }: CombatValuesEditorProps) {
  const [activeType, setActiveType] = useState<string>('armorClass');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSource, setNewSource] = useState({ name: '', value: 0 });
  const [selectedAttribute, setSelectedAttribute] = useState('');

  const currentSources = sources.filter(s => s.type === activeType);
  const totalValue = currentSources.reduce((sum, s) => {
    if (s.dependsOn) {
      const attr = attributes.find(a => a.name === s.dependsOn);
      return sum + (attr ? getModifier(attr.value) : 0);
    }
    return sum + s.value;
  }, 0);

  const addSource = () => {
    if (!newSource.name.trim()) return;
    let finalValue = newSource.value;
    let dependsOn: string | undefined = undefined;
    if (selectedAttribute) {
      finalValue = 0;
      dependsOn = selectedAttribute;
    }
    const newId = `temp-${Date.now()}`;
    const sourceToAdd: CombatValueSource = {
      id: newId,
      type: activeType,
      name: newSource.name.trim(),
      value: finalValue,
      dependsOn,
    };
    onUpdate([...sources, sourceToAdd]);
    setNewSource({ name: '', value: 0 });
    setSelectedAttribute('');
    setShowNewForm(false);
  };

  const updateSource = (id: string, field: 'name' | 'value', val: string | number) => {
    const updated = sources.map(s =>
      s.id === id ? { ...s, [field]: field === 'value' ? Number(val) : String(val), dependsOn: undefined } : s
    );
    onUpdate(updated);
  };

  const removeSource = (id: string) => {
    onUpdate(sources.filter(s => s.id !== id));
  };

  const getDisplayValue = (source: CombatValueSource) => {
    if (source.dependsOn) {
      const attr = attributes.find(a => a.name === source.dependsOn);
      return attr ? getModifier(attr.value) : 0;
    }
    return source.value;
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3">⚔️ Kampfwerte</h2>

      <div className="flex border-b border-gray-700 mb-4">
        {sourceTypes.map(type => (
          <button
            key={type.key}
            type="button"
            onClick={() => setActiveType(type.key)}
            className={`px-3 py-1 text-sm ${activeType === type.key ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-400'}`}
          >
            {type.icon} {type.label}
          </button>
        ))}
      </div>

      <div className="mb-4 p-3 bg-purple-600/20 rounded-lg text-center">
        <span className="text-sm text-gray-300">Gesamt:</span>
        <span className="ml-2 text-2xl font-bold text-purple-400">{totalValue}</span>
      </div>

      <div className="space-y-2 mb-4">
        {currentSources.map(src => {
          const displayVal = getDisplayValue(src);
          const isDerived = !!src.dependsOn;
          return (
            <div key={src.id} className="flex gap-2 items-center bg-gray-800/50 rounded-lg p-2">
              <input
                type="text"
                value={src.name}
                onChange={e => updateSource(src.id, 'name', e.target.value)}
                className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm"
                placeholder="Quellenname"
              />
              {isDerived ? (
                <span className="w-24 px-2 py-1 bg-gray-700 rounded text-sm text-right text-purple-400">
                  {displayVal >= 0 ? `+${displayVal}` : `${displayVal}`} (auto)
                </span>
              ) : (
                <input
                  type="number"
                  value={src.value}
                  onChange={e => updateSource(src.id, 'value', parseInt(e.target.value) || 0)}
                  className="w-24 px-2 py-1 bg-gray-700 rounded text-sm text-right"
                />
              )}
              {src.dependsOn && (
                <span className="text-xs text-gray-400">({src.dependsOn})</span>
              )}
              <button
                type="button"
                onClick={() => removeSource(src.id)}
                className="text-red-400 hover:text-red-300"
              >
                🗑️
              </button>
            </div>
          );
        })}
      </div>

      {!showNewForm ? (
        <button
          type="button"
          onClick={() => setShowNewForm(true)}
          className="w-full py-1 px-3 bg-purple-600 rounded text-sm"
        >
          + Bonus hinzufügen
        </button>
      ) : (
        <div className="p-3 bg-gray-800 rounded-lg space-y-2">
          <input
            type="text"
            placeholder="Name (z.B. Basis, Geschick-Mod, Schild)"
            value={newSource.name}
            onChange={e => setNewSource({ ...newSource, name: e.target.value })}
            className="w-full px-2 py-1 bg-gray-700 rounded text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <select
              value={selectedAttribute}
              onChange={e => {
                const attrName = e.target.value;
                setSelectedAttribute(attrName);
                if (attrName) {
                  const attr = attributes.find(a => a.name === attrName);
                  if (attr) {
                    setNewSource({ ...newSource, value: 0, name: `${attrName}-Mod` });
                  }
                } else {
                  setNewSource({ ...newSource, value: 0, name: '' });
                }
              }}
              className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm"
            >
              <option value="">Manueller Wert</option>
              {attributes.map(attr => (
                <option key={attr.name} value={attr.name}>{attr.name}-Modifikator</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Wert"
              value={newSource.value === 0 ? '' : newSource.value}
              onChange={e => setNewSource({ ...newSource, value: parseInt(e.target.value) || 0 })}
              disabled={!!selectedAttribute}
              className={`flex-1 px-2 py-1 bg-gray-700 rounded text-sm ${selectedAttribute ? 'opacity-50' : ''}`}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addSource}
              className="flex-1 py-1 bg-green-600 rounded text-sm"
            >
              Hinzufügen
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewForm(false);
                setSelectedAttribute('');
                setNewSource({ name: '', value: 0 });
              }}
              className="flex-1 py-1 bg-gray-600 rounded text-sm"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}