// src/components/character/actions/views/ActionCard.tsx
'use client';

import { useState } from 'react';
import { Action } from '@/types/actions';
import { DiceButton } from '@/components/dice/DiceButton';

interface ActionCardProps {
  action: Action;
  onDelete: (id: string) => void;
  onRecharge: (id: string) => void;
  onUpdateUses: (id: string, usesRemaining: number) => void;
  isLoading: boolean;
  characterId?: string;
  characterName?: string;
}

const RECHARGE_LABELS: Record<string, string> = {
  short: 'Kurze Rast',
  long: 'Lange Rast',
  never: 'Nie',
  manual: 'Manuell',
};

export function ActionCard({
  action,
  onDelete,
  onRecharge,
  onUpdateUses,
  isLoading,
  characterId,
  characterName,
}: ActionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sourceIcons = {
    equipment: '⚔️',
    spell: '✨',
    feature: '⚡',
    custom: '📝',
  };

  const sourceLabels = {
    equipment: 'Waffe',
    spell: 'Zauber',
    feature: 'Feature',
    custom: 'Eigene',
  };

  const usesRemaining = action.usesRemaining ?? action.usesPerDay;
  const hasUses = action.usesPerDay && action.usesPerDay > 0;

  const getDiceType = (damageDice: string): string | null => {
    const match = damageDice.match(/d(\d+)/);
    if (match) return `d${match[1]}`;
    return null;
  };

  const hasDamage = action.damageDice && action.damageDice.length > 0;
  const isAttack =
    (action.attackBonus !== undefined && action.attackBonus !== null) || hasDamage;

  const hasConcentration = (action as any).concentration === true;
  const savingThrow = (action as any).savingThrow as string | undefined;
  const savingThrowDC = (action as any).savingThrowDC as number | undefined;
  const rechargeType = (action as any).rechargeType as string | undefined;
  const isFeatureLinked = !!(action as any).linkedFeatureId;

  return (
    <div
      className={`rounded-lg p-3 border transition ${
        isFeatureLinked
          ? 'bg-purple-900/20 border-purple-500/40'
          : 'bg-gray-800/30 border-gray-700/50'
      }`}
    >
      <div className="flex justify-between items-start">
        <div
          className="flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">{action.name}</span>
            {action.sourceType && (
              <span className="text-xs text-gray-400" title={sourceLabels[action.sourceType]}>
                {sourceIcons[action.sourceType as keyof typeof sourceIcons] || '📋'}
              </span>
            )}
            {action.sourceType === 'feature' && (
              <span className="text-xs text-purple-300">(Feature)</span>
            )}
            {hasConcentration && (
              <span className="text-xs text-yellow-400" title="Konzentration">
                🧠
              </span>
            )}
            {savingThrow && (
              <span
                className="text-xs text-red-400"
                title={`Rettungswurf: ${savingThrow}${savingThrowDC ? ` SG ${savingThrowDC}` : ''}`}
              >
                🛡️ {savingThrow}
                {savingThrowDC ? ` SG ${savingThrowDC}` : ''}
              </span>
            )}
          </div>

          {hasUses && (
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <div className="text-xs text-gray-400">
                {usesRemaining ?? action.usesPerDay} / {action.usesPerDay} Nutzungen
              </div>
              {rechargeType && (
                <span className="text-xs text-gray-500">
                  ({RECHARGE_LABELS[rechargeType] || rechargeType})
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRecharge(action.id);
                }}
                disabled={isLoading}
                className="text-xs text-blue-400 hover:text-blue-300 transition"
              >
                🔄 Aufladen
              </button>
            </div>
          )}

          {isExpanded && action.description && (
            <div className="text-xs text-gray-300 mt-1 whitespace-pre-wrap">
              {action.description}
            </div>
          )}
          {isExpanded && action.damageDice && (
            <div className="text-xs text-orange-400 mt-0.5">
              ⚔️ Schaden: {action.damageDice} {action.damageType || ''}
            </div>
          )}
          {isExpanded && action.range && (
            <div className="text-xs text-gray-400 mt-0.5">📏 Reichweite: {action.range}</div>
          )}
          {isExpanded && action.areaOfEffect && (
            <div className="text-xs text-gray-400 mt-0.5">
              📍 Fläche: {action.areaOfEffect}
            </div>
          )}
          {isExpanded && action.attackBonus !== undefined && action.attackBonus !== null && (
            <div className="text-xs text-green-400 mt-0.5">
              🎯 Angriffsbonus: +{action.attackBonus}
            </div>
          )}
          {isExpanded && savingThrow && (
            <div className="text-xs text-red-400 mt-0.5">
              🛡️ Rettungswurf: {savingThrow}
              {savingThrowDC ? ` (SG ${savingThrowDC})` : ''}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1 ml-2">
          {isAttack && (
            <DiceButton
              diceType={getDiceType(action.damageDice || 'd4') as any}
              modifier={action.attackBonus || 0}
              reason={`${action.name}`}
              characterId={characterId}
              characterName={characterName}
              className="px-2 py-1 text-xs bg-orange-600/50 hover:bg-orange-600"
            >
              🎲 Würfeln
            </DiceButton>
          )}

          <button
            type="button"
            onClick={() => onDelete(action.id)}
            disabled={isLoading}
            className="px-2 py-1 text-xs bg-red-600/50 hover:bg-red-600 rounded transition flex items-center justify-center"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}