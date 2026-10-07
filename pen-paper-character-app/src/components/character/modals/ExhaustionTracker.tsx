// src/components/character/shared/ExhaustionTracker.tsx
'use client';

import { useState } from 'react';
import {
  EXHAUSTION_LEVELS,
  MAX_EXHAUSTION_LEVEL,
  getExhaustionEffects,
} from '@/types/exhaustion';

interface ExhaustionTrackerProps {
  level: number;
  onChange: (newLevel: number) => void;
  readOnly?: boolean;
}

export function ExhaustionTracker({
  level,
  onChange,
  readOnly = false,
}: ExhaustionTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const safeLevel = Math.max(0, Math.min(MAX_EXHAUSTION_LEVEL, level));
  const isDead = safeLevel >= 6;
  const effects = getExhaustionEffects(safeLevel);

  const colorClass = (() => {
    if (safeLevel === 0) return 'text-gray-400';
    if (safeLevel <= 2) return 'text-yellow-400';
    if (safeLevel <= 4) return 'text-orange-400';
    return 'text-red-500';
  })();

  const bgClass = (() => {
    if (safeLevel === 0) return 'bg-gray-800/50';
    if (safeLevel <= 2) return 'bg-yellow-900/20 border-yellow-600/40';
    if (safeLevel <= 4) return 'bg-orange-900/20 border-orange-600/40';
    return 'bg-red-900/30 border-red-600/50';
  })();

  return (
    <div className={`rounded-lg border p-3 ${bgClass}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {safeLevel === 0 ? '💚' : safeLevel < 6 ? '😓' : '💀'}
          </span>
          <div>
            <div className="text-sm font-semibold">
              Erschöpfung{' '}
              <span className={`font-mono ${colorClass}`}>
                {safeLevel} / {MAX_EXHAUSTION_LEVEL}
              </span>
            </div>
            {effects.length > 0 && !isExpanded && (
              <div className="text-xs text-gray-400 line-clamp-1">
                {effects[0]}
                {effects.length > 1 && ` (+${effects.length - 1} weitere)`}
              </div>
            )}
            {safeLevel === 0 && (
              <div className="text-xs text-gray-500">Keine Erschöpfung</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {effects.length > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-400 hover:text-white px-2"
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          )}
          {!readOnly && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onChange(Math.max(0, safeLevel - 1))}
                disabled={safeLevel <= 0}
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded font-bold disabled:opacity-30"
                title="Erschöpfung verringern"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => onChange(Math.min(MAX_EXHAUSTION_LEVEL, safeLevel + 1))}
                disabled={safeLevel >= MAX_EXHAUSTION_LEVEL}
                className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded font-bold disabled:opacity-30"
                title="Erschöpfung erhöhen"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detaillierte Effekte */}
      {isExpanded && effects.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700/50 space-y-1">
          <div className="text-xs font-semibold text-gray-400 mb-1">
            Aktive Auswirkungen:
          </div>
          {effects.map((effect, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
              <span className="text-red-400">•</span>
              <span>{effect}</span>
            </div>
          ))}
          {safeLevel < MAX_EXHAUSTION_LEVEL && (
            <div className="mt-2 pt-2 border-t border-gray-700/50 text-xs text-gray-500">
              Nächste Stufe ({safeLevel + 1}):{' '}
              {EXHAUSTION_LEVELS[safeLevel + 1]?.effects.join(', ')}
            </div>
          )}
        </div>
      )}

      {safeLevel === 6 && (
        <div className="mt-2 text-xs font-bold text-red-400 animate-pulse">
          ☠️ TOD — Erschöpfungsstufe 6 erreicht
        </div>
      )}
    </div>
  );
}