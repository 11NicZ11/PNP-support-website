// src/components/character/shared/LongRestModal.tsx
'use client';

import { useState } from 'react';
import { CharacterResource, CharacterHitDice } from '@/types/resources';
import { SpellSlot } from '@/types/spells';

interface LongRestModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterId: string;
  characterName?: string;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  tempMaxHp: number;
  tempMaxHpMax: number;
  exhaustionLevel: number;
  resources: CharacterResource[];
  hitDice: CharacterHitDice[];
  spellSlots: SpellSlot[];
  lastLongRest?: string | null;
  onUpdated: (data: any) => void;
}

export function LongRestModal({
  isOpen,
  onClose,
  characterId,
  characterName,
  currentHp,
  maxHp,
  tempHp,
  tempMaxHp,
  tempMaxHpMax,
  exhaustionLevel,
  resources,
  hitDice,
  spellSlots,
  lastLongRest,
  onUpdated,
}: LongRestModalProps) {
  const [isResting, setIsResting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const hpMissing = Math.max(0, maxHp - currentHp);
  const resourcesToRefill = resources.filter((r) => r.current < r.max);
  const spellSlotsToReset = spellSlots.filter((s) => s.used > 0);
  const hitDiceToRestore = hitDice.reduce(
    (sum, h) => sum + Math.min(h.used, Math.floor(h.total / 2)),
    0
  );
  const exhaustionDecrease = exhaustionLevel > 0 ? 1 : 0;

  // 24h-Check
  const tooSoon = (() => {
    if (!lastLongRest) return false;
    try {
      const last = new Date(lastLongRest);
      const hours = (Date.now() - last.getTime()) / (1000 * 60 * 60);
      return hours < 24;
    } catch {
      return false;
    }
  })();

  const handleRest = async () => {
    setIsResting(true);
    setError(null);

    try {
      const newHitDice = hitDice.map((h) => ({
        ...h,
        used: Math.max(0, h.used - Math.floor(h.total / 2)),
      }));
      const newResources = resources.map((r) => ({ ...r, current: r.max }));
      const newSpellSlots = spellSlots.map((s) => ({ ...s, used: 0 }));

      const res = await fetch(`/api/characters/${characterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentHp: maxHp,
          tempHp: 0,
          tempMaxHp: 0,
          tempMaxHpMax: 0,
          exhaustionLevel: Math.max(0, exhaustionLevel - 1),
          resources: newResources,
          hitDice: newHitDice,
          spellSlots: newSpellSlots,
          lastLongRest: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fehler bei der langen Rast');
      }

      const updated = await res.json();
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsResting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full border border-green-500/30 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">🛌 Lange Rast</h2>
          <button type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-500/20 text-red-300 p-3 rounded-lg">{error}</div>
          )}

          {tooSoon && (
            <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-3 text-yellow-200 text-sm">
              ⚠️ Deine letzte lange Rast ist weniger als 24 Stunden her. Ein
              Charakter kann normalerweise nur einmal pro 24h von einer langen
              Rast profitieren.
            </div>
          )}

          {/* HP */}
          <div className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-400">Aktuelle HP</div>
              <div className="text-2xl font-bold">
                <span className={currentHp === maxHp ? 'text-green-400' : 'text-white'}>
                  {currentHp}
                </span>
                <span className="text-gray-400"> / {maxHp}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Nach der Rast</div>
              <div className="text-2xl font-bold text-green-400">
                {maxHp} / {maxHp}
              </div>
              {hpMissing > 0 && (
                <div className="text-xs text-green-400">+{hpMissing} HP</div>
              )}
            </div>
          </div>

          {/* Was passiert */}
          <div>
            <h3 className="text-md font-semibold mb-2">
              📋 Was bei der langen Rast passiert
            </h3>
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>HP vollständig aufgefüllt</span>
                <span className="ml-auto text-xs text-gray-500">
                  {currentHp} → {maxHp}
                </span>
              </div>

              {(tempHp > 0 || tempMaxHp > 0 || tempMaxHpMax > 0) && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Temporäre HP entfernt</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {tempHp + tempMaxHp + tempMaxHpMax} → 0
                  </span>
                </div>
              )}

              {spellSlotsToReset.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">✓</span>
                  <span>Zauberplätze wiederhergestellt</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {spellSlotsToReset.length} Grades
                  </span>
                </div>
              )}

              {resourcesToRefill.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">✓</span>
                  <span>Ressourcen aufgefüllt</span>
                  <span className="ml-auto text-xs text-gray-500">
                    {resourcesToRefill.length}
                  </span>
                </div>
              )}

              {hitDiceToRestore > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-orange-400">✓</span>
                  <span>Trefferwürfel wiederhergestellt</span>
                  <span className="ml-auto text-xs text-gray-500">
                    +{hitDiceToRestore}
                  </span>
                </div>
              )}

              {exhaustionDecrease > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-red-400">✓</span>
                  <span>Erschöpfung reduziert</span>
                  <span className="ml-auto text-xs text-gray-500">
                    Level {exhaustionLevel} → {exhaustionLevel - 1}
                  </span>
                </div>
              )}

              {currentHp === maxHp &&
                spellSlotsToReset.length === 0 &&
                resourcesToRefill.length === 0 &&
                hitDiceToRestore === 0 &&
                exhaustionDecrease === 0 && (
                  <div className="text-gray-500 italic">
                    Nichts wiederherzustellen — Charakter ist bereits voll ausgeruht.
                  </div>
                )}
            </div>
          </div>

          {/* Detail-Listen */}
          {resourcesToRefill.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-yellow-300 mb-1">
                Ressourcen
              </h3>
              <div className="space-y-1">
                {resourcesToRefill.map((r) => (
                  <div
                    key={r.id}
                    className="bg-gray-800/50 rounded p-2 flex items-center gap-2 text-sm"
                  >
                    <span>{r.icon}</span>
                    <span className="flex-1">{r.name}</span>
                    <span className="text-xs text-gray-400">
                      {r.current} → <span className="text-green-400">{r.max}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {spellSlotsToReset.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-purple-300 mb-1">
                Zauberplätze
              </h3>
              <div className="grid grid-cols-2 gap-1">
                {spellSlotsToReset.map((s) => (
                  <div
                    key={s.rank}
                    className="bg-gray-800/50 rounded p-2 flex items-center justify-between text-sm"
                  >
                    <span>Grad {s.rank}</span>
                    <span className="text-xs text-gray-400">
                      {s.used} verbraucht → <span className="text-green-400">0</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-green-900/20 border border-green-600/40 rounded-lg p-3 text-xs text-green-200">
            💡 Eine lange Rast dauert mindestens 8 Stunden. Am Ende werden alle
            Ressourcen und Trefferwürfel teilweise oder vollständig
            wiederhergestellt.
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-4 flex gap-3">
          <button type="button"
            onClick={handleRest}
            disabled={isResting}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold disabled:opacity-50"
          >
            {isResting ? '🛌 Raste...' : '🛌 Lange Rast abschließen'}
          </button>
          <button type="button"
            onClick={onClose}
            disabled={isResting}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}