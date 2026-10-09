// src/components/character/shared/ShortRestModal.tsx
'use client';

import { useState } from 'react';
import { CharacterResource, CharacterHitDice } from '@/types/resources';
import { DiceType, rollHitDieForHealing } from '@/lib/dice';


interface ShortRestModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterId: string;
  characterName?: string;
  currentHp: number;
  maxHp: number;
  constitutionValue: number;
  resources: CharacterResource[];
  hitDice: CharacterHitDice[];
  onUpdated: (data: any) => void;
}

export function ShortRestModal({
  isOpen,
  onClose,
  characterId,
  characterName,
  currentHp,
  maxHp,
  constitutionValue,
  resources,
  hitDice,
  onUpdated,
}: ShortRestModalProps) {
  const [spentDice, setSpentDice] = useState<Record<string, number>>({});
  const [isResting, setIsResting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const conMod = Math.floor((constitutionValue - 10) / 2);

  const adjustDie = (dieType: string, delta: number) => {
    setSpentDice((prev) => {
      const current = prev[dieType] || 0;
      const die = hitDice.find((h) => h.dieType === dieType);
      const maxAvail = die ? die.total - die.used : 0;
      const next = Math.max(0, Math.min(maxAvail, current + delta));
      return { ...prev, [dieType]: next };
    });
  };

  const getAverageHealing = (dieType: string, count: number) => {
    const sides = parseInt(dieType.replace('d', ''));
    const avg = sides / 2 + 0.5;
    const perDie = Math.max(1, avg + conMod);
    return Math.floor(perDie * count);
  };

  const totalSpent = Object.values(spentDice).reduce((a, b) => a + b, 0);
  const estimatedHealing = Object.entries(spentDice)
    .filter(([_, c]) => c > 0)
    .reduce((sum, [die, count]) => sum + getAverageHealing(die, count), 0);

  const resourcesToRefill = resources.filter(
    (r) => r.rechargeType === 'short' && r.current < r.max
  );

  const canRest = totalSpent > 0 || resourcesToRefill.length > 0;

  const handleRest = async () => {
    setIsResting(true);
    setError(null);

    try {
      let totalHealing = 0;
      const newHitDice = hitDice.map((h) => {
        const spend = spentDice[h.dieType] || 0;
        if (spend === 0) return h;

        const result = rollHitDieForHealing(h.dieType as DiceType, {
          conModifier: conMod,
          count: spend,
          reason: `Kurze Rast: ${spend}× ${h.dieType.toUpperCase()}`,
          characterId,
          characterName,
        });
        totalHealing += result.totalHealing;

        return { ...h, used: h.used + spend };
      });

      const newCurrentHp = Math.min(maxHp, currentHp + totalHealing);
      const newResources = resources.map((r) =>
        r.rechargeType === 'short' ? { ...r, current: r.max } : r
      );

      const res = await fetch(`/api/characters/${characterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentHp: newCurrentHp,
          resources: newResources,
          hitDice: newHitDice,
          lastShortRest: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Fehler bei der kurzen Rast');
      }

      const updated = await res.json();
      onUpdated(updated);
      setSpentDice({});
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
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full border border-blue-500/30 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold">☕ Kurze Rast</h2>
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

          {/* HP-Status */}
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
              <div className="text-sm text-gray-400">Geschätzte Heilung</div>
              <div className="text-2xl font-bold text-green-400">
                +{estimatedHealing}
              </div>
            </div>
          </div>

          {/* Trefferwürfel-Auswahl */}
          <div>
            <h3 className="text-md font-semibold mb-2">🎲 Trefferwürfel ausgeben</h3>
            <p className="text-xs text-gray-500 mb-3">
              Wähle, wie viele Trefferwürfel du ausgeben willst. Jeder Würfel
              heilt seinen Wurf + Konstitutions-Modifikator (min. 1).
              Konsti-Mod: {conMod >= 0 ? '+' : ''}
              {conMod}
            </p>

            {hitDice.length === 0 && (
              <div className="text-center text-gray-500 italic py-4 bg-gray-800/30 rounded-lg">
                Keine Trefferwürfel vorhanden.
              </div>
            )}

            <div className="space-y-2">
              {hitDice.map((h) => {
                const available = h.total - h.used;
                const spent = spentDice[h.dieType] || 0;
                const maxSides = parseInt(h.dieType.replace('d', ''));
                const maxPerDie = maxSides + conMod;
                const minPerDie = Math.max(1, 1 + conMod);
                return (
                  <div
                    key={h.id}
                    className="bg-gray-800/50 rounded-lg p-3 flex items-center gap-3"
                  >
                    <div className="text-2xl w-12 text-center font-bold text-purple-400">
                      {h.dieType.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">
                        Verfügbar:{' '}
                        <span className="font-mono text-green-400">
                          {available - spent}
                        </span>
                        <span className="text-gray-500"> / {h.total}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Heilung pro Würfel: {minPerDie}–{maxPerDie}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adjustDie(h.dieType, -1)}
                        disabled={spent <= 0}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded font-bold disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-mono text-lg">
                        {spent}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustDie(h.dieType, 1)}
                        disabled={spent >= available}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded font-bold disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalSpent > 0 && (
              <button
                type="button"
                onClick={() => setSpentDice({})}
                className="mt-2 text-xs text-gray-400 hover:text-white"
              >
                ↻ Auswahl zurücksetzen
              </button>
            )}
          </div>

          {/* Ressourcen */}
          {resourcesToRefill.length > 0 && (
            <div>
              <h3 className="text-md font-semibold mb-2">
                ✨ Aufgefüllte Ressourcen
              </h3>
              <div className="space-y-1">
                {resourcesToRefill.map((r) => (
                  <div
                    key={r.id}
                    className="bg-gray-800/50 rounded-lg p-2 flex items-center gap-2"
                  >
                    <span className="text-lg">{r.icon}</span>
                    <span className="flex-1 text-sm">{r.name}</span>
                    <span className="text-xs text-gray-400">
                      {r.current} → <span className="text-green-400">{r.max}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-900/20 border border-blue-600/40 rounded-lg p-3 text-xs text-blue-200">
            💡 Eine kurze Rast dauert mindestens 1 Stunde. Du kannst beliebig
            viele Trefferwürfel ausgeben.
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-4 flex gap-3">
          <button type="button"
            onClick={handleRest}
            disabled={isResting || !canRest}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50"
          >
            {isResting ? '☕ Raste...' : '☕ Kurze Rast abschließen'}
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