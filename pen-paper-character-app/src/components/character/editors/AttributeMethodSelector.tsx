// src/components/character/editors/AttributeMethodSelector.tsx
'use client';

import { useMemo } from 'react';
import {
  AttributeMethod,
  AttributeMethodState,
  ATTRIBUTE_METHODS,
  POINT_BUY_COSTS,
  POINT_BUY_TOTAL,
  STANDARD_ARRAY,
  STANDARD_ARRAY_PLUS2,
  EMPTY_ATTRIBUTE_METHOD_STATE,
} from '@/types/character';
import { Attribute } from './AttributesEditor';
import { rollDice } from '@/lib/dice';

interface AttributeMethodSelectorProps {
  attributeMethod: AttributeMethod;
  onMethodChange: (method: AttributeMethod) => void;
  attributes: Attribute[];
  onAttributesUpdate: (attrs: Attribute[]) => void;
  methodState: AttributeMethodState;
  onMethodStateUpdate: (state: AttributeMethodState) => void;
  raceBonuses?: Record<string, number>;
  backgroundBonuses?: Record<string, number>;
}

const roll4d6DropLowest = (): number => {
  const rolls = [rollDice(6), rollDice(6), rollDice(6), rollDice(6)];
  rolls.sort((a, b) => a - b);
  return rolls[1] + rolls[2] + rolls[3];
};

const DEFAULT_ATTRIBUTE_VALUE = 10;
const DEFAULT_POINTBUY_VALUE = 8;

export function AttributeMethodSelector({
  attributeMethod,
  onMethodChange,
  attributes,
  onAttributesUpdate,
  methodState,
  onMethodStateUpdate,
  raceBonuses = {},
  backgroundBonuses = {},
}: AttributeMethodSelectorProps) {
  const safeState = methodState || EMPTY_ATTRIBUTE_METHOD_STATE;
  const attributeCount = attributes.length;

  const getBonus = (attrName: string): number => {
    const raceBonus = raceBonuses[attrName] || 0;
    const bgBonus = backgroundBonuses[attrName] || 0;
    return raceBonus + bgBonus;
  };

  const applyToAttributes = (
    values: Record<string, number>,
    fallbackBaseValue: number = DEFAULT_ATTRIBUTE_VALUE
  ) => {
    const updated = attributes.map((attr) => {
      const baseValue = values[attr.name] ?? attr.baseValue ?? fallbackBaseValue;
      const bonus = getBonus(attr.name);
      return {
        ...attr,
        baseValue,
        value: baseValue + bonus,
      };
    });
    onAttributesUpdate(updated);
  };

  // ==================== STANDARD ARRAY ====================
  const usedStandardValues = useMemo(
    () => Object.values(safeState.standardAssignments),
    [safeState.standardAssignments]
  );

  const getAvailableStandardValues = (currentAttr: string) => {
    return STANDARD_ARRAY.filter(
      (v) => !usedStandardValues.includes(v) || safeState.standardAssignments[currentAttr] === v
    );
  };

  const assignStandardValue = (attrName: string, value: number) => {
    const newState: AttributeMethodState = {
      ...safeState,
      standardAssignments: { ...safeState.standardAssignments, [attrName]: value },
    };
    onMethodStateUpdate(newState);
    applyToAttributes(newState.standardAssignments);
  };

  const clearStandardAssignment = (attrName: string) => {
    const newAssignments = { ...safeState.standardAssignments };
    delete newAssignments[attrName];
    const newState: AttributeMethodState = { ...safeState, standardAssignments: newAssignments };
    onMethodStateUpdate(newState);

    const updated = attributes.map((attr) => {
      if (attr.name === attrName) {
        const bonus = getBonus(attr.name);
        return {
          ...attr,
          baseValue: DEFAULT_ATTRIBUTE_VALUE,
          value: DEFAULT_ATTRIBUTE_VALUE + bonus,
        };
      }
      return attr;
    });
    onAttributesUpdate(updated);
  };

  const resetStandard = () => {
    const newState: AttributeMethodState = { ...safeState, standardAssignments: {} };
    onMethodStateUpdate(newState);
    const updated = attributes.map((attr) => {
      const bonus = getBonus(attr.name);
      return {
        ...attr,
        baseValue: DEFAULT_ATTRIBUTE_VALUE,
        value: DEFAULT_ATTRIBUTE_VALUE + bonus,
      };
    });
    onAttributesUpdate(updated);
  };

  // ==================== STANDARD ARRAY +2 ====================
  const usedStandardPlus2Values = useMemo(
    () => Object.values(safeState.standardPlus2Assignments),
    [safeState.standardPlus2Assignments]
  );

  const getAvailableStandardPlus2Values = (currentAttr: string) => {
    return STANDARD_ARRAY_PLUS2.filter(
      (v) =>
        !usedStandardPlus2Values.includes(v) ||
        safeState.standardPlus2Assignments[currentAttr] === v
    );
  };

  const assignStandardPlus2Value = (attrName: string, value: number) => {
    const newState: AttributeMethodState = {
      ...safeState,
      standardPlus2Assignments: { ...safeState.standardPlus2Assignments, [attrName]: value },
    };
    onMethodStateUpdate(newState);
    applyToAttributes(newState.standardPlus2Assignments);
  };

  const clearStandardPlus2Assignment = (attrName: string) => {
    const newAssignments = { ...safeState.standardPlus2Assignments };
    delete newAssignments[attrName];
    const newState: AttributeMethodState = {
      ...safeState,
      standardPlus2Assignments: newAssignments,
    };
    onMethodStateUpdate(newState);
    const updated = attributes.map((attr) => {
      if (attr.name === attrName) {
        const bonus = getBonus(attr.name);
        return {
          ...attr,
          baseValue: DEFAULT_ATTRIBUTE_VALUE,
          value: DEFAULT_ATTRIBUTE_VALUE + bonus,
        };
      }
      return attr;
    });
    onAttributesUpdate(updated);
  };

  const resetStandardPlus2 = () => {
    const newState: AttributeMethodState = { ...safeState, standardPlus2Assignments: {} };
    onMethodStateUpdate(newState);
    const updated = attributes.map((attr) => {
      const bonus = getBonus(attr.name);
      return {
        ...attr,
        baseValue: DEFAULT_ATTRIBUTE_VALUE,
        value: DEFAULT_ATTRIBUTE_VALUE + bonus,
      };
    });
    onAttributesUpdate(updated);
  };

  // ==================== POINT BUY ====================
  const pointBuyValues = useMemo(() => {
    const values: Record<string, number> = {};
    attributes.forEach((a) => {
      values[a.name] = safeState.pointBuyValues[a.name] ?? DEFAULT_POINTBUY_VALUE;
    });
    return values;
  }, [safeState.pointBuyValues, attributes]);

  const getPointBuyTotalSpent = (): number => {
    return Object.values(pointBuyValues).reduce((sum, val) => {
      return sum + (POINT_BUY_COSTS[val] ?? 0);
    }, 0);
  };

  const pointBuySpent = getPointBuyTotalSpent();
  const pointBuyRemaining = POINT_BUY_TOTAL - pointBuySpent;

  const updatePointBuyValue = (attrName: string, newValue: number) => {
    if (newValue < 8 || newValue > 15) return;
    const oldValue = pointBuyValues[attrName] ?? DEFAULT_POINTBUY_VALUE;
    const oldCost = POINT_BUY_COSTS[oldValue] ?? 0;
    const newCost = POINT_BUY_COSTS[newValue] ?? 0;
    const diff = newCost - oldCost;

    if (diff > 0 && diff > pointBuyRemaining) {
      alert('Nicht genügend Punkte übrig!');
      return;
    }

    const newState: AttributeMethodState = {
      ...safeState,
      pointBuyValues: { ...safeState.pointBuyValues, [attrName]: newValue },
    };
    onMethodStateUpdate(newState);
    applyToAttributes(newState.pointBuyValues, DEFAULT_POINTBUY_VALUE);
  };

  const resetPointBuy = () => {
    const reset: Record<string, number> = {};
    attributes.forEach((a) => (reset[a.name] = DEFAULT_POINTBUY_VALUE));
    const newState: AttributeMethodState = { ...safeState, pointBuyValues: reset };
    onMethodStateUpdate(newState);
    const updated = attributes.map((attr) => {
      const bonus = getBonus(attr.name);
      return {
        ...attr,
        baseValue: DEFAULT_POINTBUY_VALUE,
        value: DEFAULT_POINTBUY_VALUE + bonus,
      };
    });
    onAttributesUpdate(updated);
  };

  // ==================== WÜRFELN ====================
  const rollAllSix = () => {
    const rolls = Array.from({ length: 6 }, () => roll4d6DropLowest());
    const newState: AttributeMethodState = {
      ...safeState,
      rolledValues: rolls,
      rolledAssignments: {},
    };
    onMethodStateUpdate(newState);
  };

  const assignRolledValue = (attrName: string, value: number) => {
    const newState: AttributeMethodState = {
      ...safeState,
      rolledAssignments: { ...safeState.rolledAssignments, [attrName]: value },
    };
    onMethodStateUpdate(newState);
    applyToAttributes(newState.rolledAssignments);
  };

  const clearRolledAssignment = (attrName: string) => {
    const newAssignments = { ...safeState.rolledAssignments };
    delete newAssignments[attrName];
    const newState: AttributeMethodState = { ...safeState, rolledAssignments: newAssignments };
    onMethodStateUpdate(newState);
    const updated = attributes.map((attr) => {
      if (attr.name === attrName) {
        const bonus = getBonus(attr.name);
        return {
          ...attr,
          baseValue: DEFAULT_ATTRIBUTE_VALUE,
          value: DEFAULT_ATTRIBUTE_VALUE + bonus,
        };
      }
      return attr;
    });
    onAttributesUpdate(updated);
  };

  const usedRolledValues = useMemo(
    () => Object.values(safeState.rolledAssignments),
    [safeState.rolledAssignments]
  );

  const getAvailableRolledValues = (): number[] => {
    const available = [...safeState.rolledValues];
    for (const used of usedRolledValues) {
      const idx = available.indexOf(used);
      if (idx !== -1) available.splice(idx, 1);
    }
    return available;
  };

  // ==================== VALIDIERUNGS-HELPER ====================
  const renderValidationHint = () => {
    if (attributeMethod === 'free') return null;

    let assignedCount = 0;
    let total = attributeCount;
    let isComplete = false;
    let hintText = '';

    if (attributeMethod === 'standard') {
      assignedCount = Object.keys(safeState.standardAssignments).length;
      isComplete = assignedCount === total;
      hintText =
        'Zum Speichern müssen alle Attributen einen Wert haben.';
    } else if (attributeMethod === 'standard_plus2') {
      assignedCount = Object.keys(safeState.standardPlus2Assignments).length;
      isComplete = assignedCount === total;
      hintText =
        'Zum Speichern müssen alle Attributen einen Wert haben.';
    } else if (attributeMethod === 'pointbuy') {
      const values = Object.values(safeState.pointBuyValues || {});
      assignedCount = values.length;
      isComplete = assignedCount === total && pointBuyRemaining === 0;
      hintText =
        pointBuyRemaining === 0
          ? 'Alle Punkte verteilt.'
          : `${pointBuyRemaining} Punkte noch zu verteilen.`;
    } else if (attributeMethod === 'roll') {
      assignedCount = Object.keys(safeState.rolledAssignments).length;
      isComplete = assignedCount === total && safeState.rolledValues.length > 0;
      hintText = 'Würfle zuerst, dann verteile alle 6 Werte.';
    } else {
      return null;
    }

    if (attributeMethod === 'pointbuy') {
      return (
        <div
          className={`mt-2 text-xs px-2 py-1.5 rounded ${
            isComplete
              ? 'bg-green-900/20 text-green-300'
              : 'bg-yellow-900/20 text-yellow-300'
          }`}
        >
          {isComplete ? '✓ ' : '⚠️ '}
          {hintText}
        </div>
      );
    }

    return (
      <div
        className={`mt-2 text-xs px-2 py-1.5 rounded ${
          isComplete
            ? 'bg-green-900/20 text-green-300'
            : 'bg-yellow-900/20 text-yellow-300'
        }`}
      >
        {isComplete ? '✓ Alle ' : `⚠️ Nur ${assignedCount}/${total} `}
        {isComplete
          ? 'Werte verteilt — bereit zum Speichern.'
          : 'Attributen zugewiesen.'}
        {!isComplete && (
          <span className="block mt-0.5 text-gray-400 italic">{hintText}</span>
        )}
      </div>
    );
  };

  // ==================== RENDER ====================
  return (
    <div className="bg-gray-800/30 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">📐 Attributs-Methode</h3>
        <span className="text-xs text-gray-500">Nur beim Erstellen wählbar</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {ATTRIBUTE_METHODS.map((m) => (
          <div key={m.value} className="relative group">
            <button
              type="button"
              onClick={() => onMethodChange(m.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                attributeMethod === m.value
                  ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              {m.label}
            </button>
            <div className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-800 border border-purple-500 rounded-lg p-2 text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition pointer-events-none">
              {m.tooltip}
            </div>
          </div>
        ))}
      </div>

      {/* STANDARD ARRAY */}
      {attributeMethod === 'standard' && (
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-400">
              Verteile: <strong>{STANDARD_ARRAY.join(', ')}</strong>
            </p>
            <button
              type="button"
              onClick={resetStandard}
              className="text-xs px-2 py-1 bg-gray-600 rounded hover:bg-gray-500"
            >
              🔄 Zurücksetzen
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {attributes.map((attr) => (
              <div key={attr.id} className="flex items-center gap-2">
                <span className="text-sm w-24 truncate">{attr.name}</span>
                <select
                  value={safeState.standardAssignments[attr.name] ?? ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (isNaN(val)) clearStandardAssignment(attr.name);
                    else assignStandardValue(attr.name, val);
                  }}
                  className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm"
                >
                  <option value="">–</option>
                  {getAvailableStandardValues(attr.name).map((v, i) => (
                    <option key={`${v}-${i}`} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {Object.keys(safeState.standardAssignments).length} / {STANDARD_ARRAY.length} Werte zugewiesen
          </p>
          {renderValidationHint()}
        </div>
      )}

      {/* STANDARD ARRAY +2 */}
      {attributeMethod === 'standard_plus2' && (
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-400">
              Verteile: <strong>{STANDARD_ARRAY_PLUS2.join(', ')}</strong>
            </p>
            <button
              type="button"
              onClick={resetStandardPlus2}
              className="text-xs px-2 py-1 bg-gray-600 rounded hover:bg-gray-500"
            >
              🔄 Zurücksetzen
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {attributes.map((attr) => (
              <div key={attr.id} className="flex items-center gap-2">
                <span className="text-sm w-24 truncate">{attr.name}</span>
                <select
                  value={safeState.standardPlus2Assignments[attr.name] ?? ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (isNaN(val)) clearStandardPlus2Assignment(attr.name);
                    else assignStandardPlus2Value(attr.name, val);
                  }}
                  className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm"
                >
                  <option value="">–</option>
                  {getAvailableStandardPlus2Values(attr.name).map((v, i) => (
                    <option key={`${v}-${i}`} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {Object.keys(safeState.standardPlus2Assignments).length} / {STANDARD_ARRAY_PLUS2.length} Werte zugewiesen
          </p>
          {renderValidationHint()}
        </div>
      )}

      {/* POINT BUY */}
      {attributeMethod === 'pointbuy' && (
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm">
              <span className="text-gray-400">Punkte übrig:</span>{' '}
              <strong
                className={
                  pointBuyRemaining === 0
                    ? 'text-green-400'
                    : pointBuyRemaining < 0
                    ? 'text-red-400'
                    : 'text-purple-400'
                }
              >
                {pointBuyRemaining} / {POINT_BUY_TOTAL}
              </strong>
            </p>
            <button
              type="button"
              onClick={resetPointBuy}
              className="text-xs px-2 py-1 bg-gray-600 rounded hover:bg-gray-500"
            >
              🔄 Zurücksetzen
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {attributes.map((attr) => {
              const value = pointBuyValues[attr.name] ?? DEFAULT_POINTBUY_VALUE;
              const cost = POINT_BUY_COSTS[value] ?? 0;
              const nextCost = POINT_BUY_COSTS[value + 1] ?? 0;
              const canIncrease =
                value < 15 && pointBuyRemaining >= nextCost - cost;
              return (
                <div key={attr.id} className="bg-gray-800 rounded-lg p-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm truncate">{attr.name}</span>
                    <span className="text-xs text-gray-400">Kosten: {cost}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updatePointBuyValue(attr.name, value - 1)}
                      disabled={value <= 8}
                      className="w-7 h-7 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 text-sm font-bold"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={8}
                      max={15}
                      value={value}
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        if (!isNaN(v)) updatePointBuyValue(attr.name, v);
                      }}
                      className="flex-1 px-2 py-1 bg-gray-700 rounded text-center text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => updatePointBuyValue(attr.name, value + 1)}
                      disabled={!canIncrease}
                      className="w-7 h-7 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-30 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Kosten: 8→13 = 1 Punkt pro +1, 13→15 = 2 Punkte pro +1. Max. 15.
          </p>
          {renderValidationHint()}
        </div>
      )}

      {/* WÜRFELN */}
      {attributeMethod === 'roll' && (
        <div className="bg-gray-800/50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-gray-400">
              Wirf 6x 4W6 (niedrigster wird gestrichen). Verteile dann die Werte.
            </p>
            <button
              type="button"
              onClick={rollAllSix}
              className="text-xs px-3 py-1 bg-orange-600 rounded hover:bg-orange-500 font-medium"
            >
              🎲 Würfeln
            </button>
          </div>

          {safeState.rolledValues.length > 0 && (
            <div className="mb-3 p-2 bg-gray-800 rounded text-sm">
              <span className="text-gray-400">Gewürfelt:</span>{' '}
              {safeState.rolledValues.map((v, i) => (
                <span
                  key={i}
                  className={`ml-2 px-2 py-0.5 rounded ${
                    usedRolledValues.includes(v)
                      ? 'bg-gray-700 text-gray-500'
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  {v}
                </span>
              ))}
            </div>
          )}

          {safeState.rolledValues.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {attributes.map((attr) => (
                <div key={attr.id} className="flex items-center gap-2">
                  <span className="text-sm w-24 truncate">{attr.name}</span>
                  <select
                    value={safeState.rolledAssignments[attr.name] ?? ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (isNaN(val)) clearRolledAssignment(attr.name);
                      else assignRolledValue(attr.name, val);
                    }}
                    className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm"
                  >
                    <option value="">–</option>
                    {getAvailableRolledValues().map((v, i) => (
                      <option key={`${v}-${i}`} value={v}>
                        {v}
                      </option>
                    ))}
                    {safeState.rolledAssignments[attr.name] !== undefined && (
                      <option value={safeState.rolledAssignments[attr.name]}>
                        {safeState.rolledAssignments[attr.name]}
                      </option>
                    )}
                  </select>
                </div>
              ))}
            </div>
          )}

          {renderValidationHint()}
        </div>
      )}

      {/* FREI */}
      {attributeMethod === 'free' && (
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-sm text-gray-400">
            ✏️ Freie Eingabe – trage die Attributswerte unten direkt ein.
          </p>
        </div>
      )}
    </div>
  );
}