// src/components/character/edit/HitDiceEditor.tsx
'use client';

import { useState, useMemo } from 'react';
import { CharacterHitDice, HIT_DIE_TYPES } from '@/types/resources';
import { ClassLevel } from './ClassLevelsEditor';
import { DiceType,rollHitDieForHealing } from '@/lib/dice';
import { HitDiceMode } from '@/types/character';

interface HitDiceEditorProps {
  hitDice: CharacterHitDice[];
  onUpdate: (hitDice: CharacterHitDice[]) => void;
  classLevels: ClassLevel[];
  constitutionModifier: number;
  characterId?: string;
  characterName?: string;
  onHeal?: (amount: number) => void;
  // 🔥 NEU: Checkbox + Modus
  hasHitDice: boolean;
  onHasHitDiceChange: (value: boolean) => void;
  hitDiceMode: HitDiceMode;
  onHitDiceModeChange: (mode: HitDiceMode) => void;
}

export function HitDiceEditor({
  hitDice,
  onUpdate,
  classLevels,
  constitutionModifier,
  characterId,
  characterName,
  onHeal,
  hasHitDice,
  onHasHitDiceChange,
  hitDiceMode,
  onHitDiceModeChange,
}: HitDiceEditorProps) {
  const [rolling, setRolling] = useState<string | null>(null);

  const autoDiceByType = useMemo(() => {
    const map: Record<string, number> = {};
    classLevels.forEach((cl) => {
      const die = cl.hitDie || 'd8';
      map[die] = (map[die] || 0) + (cl.level || 0);
    });
    return map;
  }, [classLevels]);

  const syncFromClasses = () => {
    const newHitDice: CharacterHitDice[] = Object.entries(autoDiceByType).map(
      ([dieType, total]) => {
        const existing = hitDice.find((h) => h.dieType === dieType);
        return {
          id: existing?.id || `temp-hd-${dieType}-${Date.now()}`,
          dieType,
          total,
          used: Math.min(existing?.used || 0, total),
          classLevelId: null,
          characterId: characterId || '',
        };
      }
    );
    onUpdate(newHitDice);
  };

  const addHitDie = () => {
    onUpdate([
      ...hitDice,
      {
        id: `temp-hd-${Date.now()}`,
        dieType: 'd8',
        total: 1,
        used: 0,
        classLevelId: null,
        characterId: characterId || '',
      },
    ]);
  };

  const updateHitDie = (
    id: string,
    field: 'dieType' | 'total' | 'used',
    value: any
  ) => {
    onUpdate(
      hitDice.map((h) => {
        if (h.id !== id) return h;
        const updated = { ...h, [field]: value };
        if (field === 'total') {
          updated.used = Math.min(updated.used, value);
        }
        if (field === 'used') {
          updated.used = Math.max(0, Math.min(updated.used, updated.total));
        }
        return updated;
      })
    );
  };

  const removeHitDie = (id: string) => {
    onUpdate(hitDice.filter((h) => h.id !== id));
  };

  const consumeHitDie = async (hitDie: CharacterHitDice) => {
    if (hitDie.used >= hitDie.total) {
      alert('Keine Trefferwürfel dieser Art mehr verfügbar!');
      return;
    }

    setRolling(hitDie.id);

    try {
      const result = rollHitDieForHealing(hitDie.dieType as DiceType, {
        conModifier: constitutionModifier,
        count: 1,
        reason: `Trefferwürfel (${hitDie.dieType.toUpperCase()})`,
        characterId,
        characterName,
      });

      onUpdate(hitDice.map((h) => (h.id === hitDie.id ? { ...h, used: h.used + 1 } : h)));

      if (onHeal) onHeal(result.totalHealing);
    } catch (err) {
      console.error('Fehler beim Trefferwürfel-Ausgeben:', err);
    } finally {
      setTimeout(() => setRolling(null), 400);
    }
  };

  const restoreAll = () => {
    onUpdate(hitDice.map((h) => ({ ...h, used: 0 })));
  };

  const restoreHalf = () => {
    onUpdate(
      hitDice.map((h) => {
        const toRestore = Math.max(1, Math.floor(h.total / 2));
        return { ...h, used: Math.max(0, h.used - toRestore) };
      })
    );
  };

  const totalAvailable = hitDice.reduce((sum, h) => sum + (h.total - h.used), 0);
  const totalDice = hitDice.reduce((sum, h) => sum + h.total, 0);

  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      {/* Kopf + Checkbox */}
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-semibold">🎲 Trefferwürfel</h3>
          {hasHitDice && (
            <p className="text-xs text-gray-500">
              Verfügbar: {totalAvailable} / {totalDice}
            </p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={hasHitDice}
            onChange={(e) => onHasHitDiceChange(e.target.checked)}
            className="w-4 h-4"
          />
          <span>Charakter hat Trefferwürfel</span>
        </label>
      </div>

      {hasHitDice && (
        <>
          {/* Modus-Auswahl */}
          <div className="mb-3 p-2 bg-gray-800/50 rounded-lg flex flex-wrap gap-2 items-center">
            <span className="text-xs text-gray-400">Modus:</span>
            <button
              type="button"
              onClick={() => onHitDiceModeChange('scaled')}
              className={`px-3 py-1 text-xs rounded transition ${
                hitDiceMode === 'scaled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              🔄 Mit Level skalieren
            </button>
            <button
              type="button"
              onClick={() => onHitDiceModeChange('manual')}
              className={`px-3 py-1 text-xs rounded transition ${
                hitDiceMode === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              ✏️ Manuell
            </button>
          </div>

          {/* Aktionen */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <button
              type="button"
              onClick={restoreHalf}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
              title="Hälfte wiederherstellen (Lange Rast)"
            >
              🌙 Halb
            </button>
            <button
              type="button"
              onClick={restoreAll}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded"
              title="Alle wiederherstellen"
            >
              ♻️ Alle
            </button>
            {hitDiceMode === 'scaled' && classLevels.length > 0 && (
              <button
                type="button"
                onClick={syncFromClasses}
                className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded"
                title="Aus Klassenleveln berechnen"
              >
                🔄 Sync aus Klassen
              </button>
            )}
            <button
              type="button"
              onClick={addHitDie}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
            >
              + Trefferwürfel
            </button>
          </div>

          {hitDiceMode === 'scaled' && classLevels.length > 0 && (
            <div className="mb-3 p-2 bg-gray-800/50 rounded text-xs text-gray-400">
              💡 Aus Klassen berechnet:{' '}
              {Object.entries(autoDiceByType).length === 0
                ? 'keine'
                : Object.entries(autoDiceByType)
                    .map(([die, count]) => `${count}× ${die.toUpperCase()}`)
                    .join(', ')}
            </div>
          )}

          {hitDice.length === 0 && (
            <div className="text-center text-gray-500 italic py-4">
              Keine Trefferwürfel eingetragen.
            </div>
          )}

          <div className="space-y-2">
            {hitDice.map((h) => {
              const available = h.total - h.used;
              const isEmpty = available === 0;
              const isRolling = rolling === h.id;
              const isManual = hitDiceMode === 'manual';

              return (
                <div
                  key={h.id}
                  className={`rounded-lg p-2 flex items-center gap-2 ${
                    isEmpty
                      ? 'bg-red-900/20 border border-red-500/30'
                      : 'bg-gray-800/50'
                  }`}
                >
                  <select
                    value={h.dieType}
                    onChange={(e) => updateHitDie(h.id, 'dieType', e.target.value)}
                    disabled={!isManual}
                    className="px-2 py-1 bg-gray-700 rounded text-sm disabled:opacity-60"
                  >
                    {HIT_DIE_TYPES.map((d) => (
                      <option key={d} value={d}>
                        {d.toUpperCase()}
                      </option>
                    ))}
                  </select>

                  <div className="flex-1">
                    <div className="text-xs text-gray-400">
                      Verfügbar:{' '}
                      <span
                        className={
                          isEmpty
                            ? 'text-red-400'
                            : available <= h.total / 2
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }
                      >
                        {available}
                      </span>
                      <span className="text-gray-500"> / {h.total}</span>
                      {constitutionModifier !== 0 && (
                        <span className="ml-2 text-gray-500">
                          (Konsti {constitutionModifier >= 0 ? '+' : ''}
                          {constitutionModifier}/Würfel)
                        </span>
                      )}
                    </div>

                    <div className="flex gap-0.5 mt-1 flex-wrap">
                      {Array.from({ length: Math.min(h.total, 30) }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            i < available ? 'bg-purple-500' : 'bg-gray-600'
                          }`}
                        />
                      ))}
                      {h.total > 30 && (
                        <span className="text-xs text-gray-500 ml-1">
                          +{h.total - 30} weitere
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min={0}
                      value={h.total}
                      onChange={(e) =>
                        updateHitDie(h.id, 'total', Math.max(0, parseInt(e.target.value) || 0))
                      }
                      disabled={!isManual}
                      className="w-14 px-2 py-1 bg-gray-700 rounded text-sm text-center disabled:opacity-60"
                    />
                    <input
                      type="number"
                      min={0}
                      max={h.total}
                      value={h.used}
                      onChange={(e) =>
                        updateHitDie(h.id, 'used', Math.max(0, parseInt(e.target.value) || 0))
                      }
                      className="w-14 px-2 py-1 bg-gray-700 rounded text-sm text-center"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => consumeHitDie(h)}
                    disabled={isEmpty || isRolling}
                    className="px-3 py-1 text-xs bg-orange-600/50 hover:bg-orange-600 rounded transition disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isRolling ? '🎲...' : '🎲 Ausgeben'}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeHitDie(h.id)}
                    className="px-2 py-1 text-xs bg-red-600/50 hover:bg-red-600 rounded"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}