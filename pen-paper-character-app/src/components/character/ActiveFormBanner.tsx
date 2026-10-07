// src/components/character/shared/ActiveFormBanner.tsx
'use client';

import { useState } from 'react';
import { AlternateForm } from '@/types/forms';
import { UnitSystem } from '@/types/character';
import { FormStatBlock } from '../forms/FormStatBlock';

interface ActiveFormBannerProps {
  form: AlternateForm;
  unitSystem: UnitSystem;
  characterId?: string;
  characterName?: string;
  onDeactivate: () => void;
  onDamage: (amount: number) => void;
  onHeal: (amount: number) => void;
  readOnly?: boolean;
}

export function ActiveFormBanner({
  form,
  unitSystem,
  characterId,
  characterName,
  onDeactivate,
  onDamage,
  onHeal,
  readOnly = false,
}: ActiveFormBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [damageInput, setDamageInput] = useState('');
  const [healInput, setHealInput] = useState('');

  const hpPercent = form.hpMax > 0 ? (form.hpCurrent / form.hpMax) * 100 : 0;
  const hpLow = hpPercent < 30;

  const handleDamage = () => {
    const amount = parseInt(damageInput);
    if (isNaN(amount) || amount <= 0) return;
    onDamage(amount);
    setDamageInput('');
  };

  const handleHeal = () => {
    const amount = parseInt(healInput);
    if (isNaN(amount) || amount <= 0) return;
    onHeal(amount);
    setHealInput('');
  };

  return (
    <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 rounded-lg border-2 border-orange-500/60 p-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-3xl">{form.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-orange-200">
                Verwandelt: {form.name}
              </span>
              {form.concentration && (
                <span
                  className="text-xs px-1.5 py-0.5 bg-yellow-600/40 text-yellow-200 rounded"
                  title="Konzentration"
                >
                  🧠 Konzentration
                </span>
              )}
            </div>
            <div className="text-xs text-orange-300/80 flex items-center gap-2 flex-wrap">
              <span>CR {form.challengeRating}</span>
              <span>•</span>
              <span>RK {form.armorClass}</span>
              <span>•</span>
              <span className={hpLow ? 'text-red-300 font-semibold' : ''}>
                TP {form.hpCurrent} / {form.hpMax}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 text-xs bg-gray-800/60 hover:bg-gray-800 rounded"
          >
            {isExpanded ? '▲ Details' : '▼ Details'}
          </button>
          {!readOnly && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`${form.name} wirklich verlassen?`)) {
                  onDeactivate();
                }
              }}
              className="px-3 py-1.5 text-xs bg-red-700 hover:bg-red-600 rounded font-medium"
            >
              ↩️ Form verlassen
            </button>
          )}
        </div>
      </div>

      {/* HP-Balken */}
      <div className="mt-3 w-full bg-gray-900 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all ${
            hpLow ? 'bg-red-500' : 'bg-green-500'
          }`}
          style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}
        />
      </div>

      {/* Schnell-Schaden/Heilung */}
      {!readOnly && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={damageInput}
              onChange={(e) => setDamageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleDamage()}
              placeholder="Schaden"
              className="w-20 px-2 py-1 bg-gray-800 rounded text-sm"
            />
            <button
              type="button"
              onClick={handleDamage}
              disabled={!damageInput}
              className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
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
              className="w-20 px-2 py-1 bg-gray-800 rounded text-sm"
            />
            <button
              type="button"
              onClick={handleHeal}
              disabled={!healInput}
              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
            >
              💚
            </button>
          </div>
          {form.hpCurrent === 0 && (
            <span className="text-xs text-red-300 font-semibold animate-pulse">
              ☠️ Form bei 0 TP – Form wird automatisch verlassen (Regel beachten)
            </span>
          )}
        </div>
      )}

      {/* Details */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-orange-600/40">
          <FormStatBlock
            form={form}
            unitSystem={unitSystem}
            characterId={characterId}
            characterName={characterName}
          />
        </div>
      )}
    </div>
  );
}