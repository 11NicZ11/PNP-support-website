// src/components/character/companions/CompanionCard.tsx
'use client';

import { useState } from 'react';
import { Companion, COMPANION_BEHAVIORS } from '@/types/companions';
import { UnitSystem } from '@/types/character';
import { CompanionStatBlock } from './CompanionStatBlock';

interface CompanionCardProps {
  companion: Companion;
  unitSystem: UnitSystem;
  characterId?: string;
  characterName?: string;
  onEdit: (companion: Companion) => void;
  onDelete: (id: string) => void;
  onDamage: (id: string, amount: number) => void;
  onHeal: (id: string, amount: number) => void;
  onDismiss: (id: string) => void;
  onRecall: (id: string) => void;
  readOnly?: boolean;
}

export function CompanionCard({
  companion,
  unitSystem,
  characterId,
  characterName,
  onEdit,
  onDelete,
  onDamage,
  onHeal,
  onDismiss,
  onRecall,
  readOnly = false,
}: CompanionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [damageInput, setDamageInput] = useState('');
  const [healInput, setHealInput] = useState('');

  const hpPercent =
    companion.hpMax > 0 ? (companion.hpCurrent / companion.hpMax) * 100 : 0;
  const hpLow = hpPercent < 30;
  const isDown = companion.hpCurrent === 0;

  const behaviorData = COMPANION_BEHAVIORS.find((b) => b.value === companion.behavior);

  const handleDamage = () => {
    const amount = parseInt(damageInput);
    if (isNaN(amount) || amount <= 0) return;
    onDamage(companion.id, amount);
    setDamageInput('');
  };

  const handleHeal = () => {
    const amount = parseInt(healInput);
    if (isNaN(amount) || amount <= 0) return;
    onHeal(companion.id, amount);
    setHealInput('');
  };

  return (
    <div
      className={`rounded-lg border p-3 transition ${
        companion.isDismissed
          ? 'bg-gray-900/40 border-gray-700/50 opacity-60'
          : isDown
          ? 'bg-red-900/20 border-red-500/60'
          : 'bg-gray-800/30 border-gray-700/50'
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="text-2xl">{companion.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{companion.name}</span>
            {companion.isDismissed && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded">
                ABBERTRAUT
              </span>
            )}
            {isDown && !companion.isDismissed && (
              <span className="text-xs px-1.5 py-0.5 bg-red-600/40 text-red-200 rounded font-semibold">
                ☠️ BESIEGT
              </span>
            )}
            {behaviorData && !companion.isDismissed && !isDown && (
              <span className="text-xs text-gray-400" title={companion.behaviorNote || behaviorData.label}>
                {behaviorData.icon} {behaviorData.label}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-0.5 flex flex-wrap gap-2">
            <span>CR {companion.challengeRating}</span>
            <span>•</span>
            <span>RK {companion.armorClass}</span>
            <span>•</span>
            <span className={hpLow && !companion.isDismissed ? 'text-red-300 font-semibold' : ''}>
              TP {companion.hpCurrent}/{companion.hpMax}
              {companion.tempHp > 0 && (
                <span className="text-blue-400 ml-1">🛡️+{companion.tempHp}</span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-2 py-1 text-xs bg-gray-700/60 hover:bg-gray-700 rounded"
          >
            {isExpanded ? '▲' : '▼'}
          </button>
          {!readOnly && (
            <>
              {companion.isDismissed ? (
                <button
                  type="button"
                  onClick={() => onRecall(companion.id)}
                  className="px-2 py-1 text-xs bg-green-600/60 hover:bg-green-600 rounded"
                  title="Zurückrufen"
                >
                  📣 Rufen
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onDismiss(companion.id)}
                  className="px-2 py-1 text-xs bg-blue-600/60 hover:bg-blue-600 rounded"
                  title="Wegschicken (z.B. Vertrauter in Taschendimension)"
                >
                  💨 Wegschicken
                </button>
              )}
              <button
                type="button"
                onClick={() => onEdit(companion)}
                className="px-2 py-1 text-xs bg-blue-600/60 hover:bg-blue-600 rounded"
              >
                ✏️
              </button>
              <button
                type="button"
                onClick={() => onDelete(companion.id)}
                className="px-2 py-1 text-xs bg-red-600/50 hover:bg-red-600 rounded"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>

      {/* HP-Balken */}
      {!companion.isDismissed && (
        <div className="mt-3 w-full bg-gray-900 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${
              hpLow ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}
          />
        </div>
      )}

      {/* Schnell-Aktionen */}
      {!readOnly && !companion.isDismissed && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={damageInput}
              onChange={(e) => setDamageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDamage()}
              placeholder="Schaden"
              className="w-20 px-2 py-1 bg-gray-800 rounded text-xs"
            />
            <button
              type="button"
              onClick={handleDamage}
              disabled={!damageInput}
              className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
            >
              ⚔️
            </button>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={healInput}
              onChange={(e) => setHealInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleHeal()}
              placeholder="Heilung"
              className="w-20 px-2 py-1 bg-gray-800 rounded text-xs"
            />
            <button
              type="button"
              onClick={handleHeal}
              disabled={!healInput}
              className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
            >
              💚
            </button>
          </div>
        </div>
      )}

      {/* Erweiterte Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <CompanionStatBlock
            companion={companion}
            unitSystem={unitSystem}
            characterId={characterId}
            characterName={characterName}
          />
        </div>
      )}
    </div>
  );
}