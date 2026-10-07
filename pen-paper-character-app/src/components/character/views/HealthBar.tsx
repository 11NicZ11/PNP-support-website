// src/components/character/view/HealthBar.tsx
'use client';

import { useState } from 'react';
import { DamageModal } from '../modals/DamageModal';
import { roll as rollDice } from '@/lib/dice';

interface HealthBarProps {
  characterId: string;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  tempMaxHp: number;
  tempMaxHpMax: number;
  damageImmunities: string[];
  damageResistances: string[];
  onUpdate: (data: any) => void;
  onRevive?: () => void;
  hitDice?: string;
}

export function HealthBar({
  characterId,
  currentHp,
  maxHp,
  tempHp,
  tempMaxHp,
  tempMaxHpMax,
  damageImmunities,
  damageResistances,
  onUpdate,
  onRevive,
  hitDice,
}: HealthBarProps) {
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [deathSaveSuccesses, setDeathSaveSuccesses] = useState(0);
  const [deathSaveFails, setDeathSaveFails] = useState(0);
  const [rollingDeathSave, setRollingDeathSave] = useState(false);
  const [lastDeathSaveRoll, setLastDeathSaveRoll] = useState<number | null>(null);
  const [advantageMode, setAdvantageMode] = useState<'normal' | 'advantage' | 'disadvantage'>('normal');

  // --- HEILUNG / BUFFS ---
  const [healValue, setHealValue] = useState(0);
  const [tempHealValue, setTempHealValue] = useState(0);
  const [maxTempHealValue, setMaxTempHealValue] = useState(0);
  const [isPercent, setIsPercent] = useState(false);
  const [healingSaving, setHealingSaving] = useState(false);

  const safeCurrent = currentHp || 0;
  const safeMax = maxHp || 1;
  const safeTempHp = tempHp || 0;
  const safeTempMaxHp = tempMaxHp || 0;
  const safeTempMaxHpMax = tempMaxHpMax || 0;

  const effectiveCurrent = safeCurrent + safeTempHp + safeTempMaxHp;
  const effectiveMax = safeMax + safeTempMaxHpMax;

  // --- Death Save Logik ---
  const handleDeathSave = () => {
    if (safeCurrent > 0) return;
    setRollingDeathSave(true);

    const rollOptions = {
      reason: 'Todesrettungswurf',
      sourceType: 'savingThrow' as const,
      characterId,
      characterName: 'Todesrettung',
    };

    let rollResult: number;
    if (advantageMode === 'advantage') {
      const r1 = rollDice('d20', rollOptions).roll;
      const r2 = rollDice('d20', rollOptions).roll;
      rollResult = Math.max(r1, r2);
    } else if (advantageMode === 'disadvantage') {
      const r1 = rollDice('d20', rollOptions).roll;
      const r2 = rollDice('d20', rollOptions).roll;
      rollResult = Math.min(r1, r2);
    } else {
      rollResult = rollDice('d20', rollOptions).roll;
    }

    setLastDeathSaveRoll(rollResult);

    let successesGain = 0;
    let failsGain = 0;
    if (rollResult === 20) successesGain = 2;
    else if (rollResult === 1) failsGain = 2;
    else if (rollResult >= 10) successesGain = 1;
    else failsGain = 1;

    let newSuccesses = Math.min(deathSaveSuccesses + successesGain, 3);
    let newFails = Math.min(deathSaveFails + failsGain, 3);

    setDeathSaveSuccesses(newSuccesses);
    setDeathSaveFails(newFails);

    if (newSuccesses >= 3 && onRevive) {
      onRevive();
      setDeathSaveSuccesses(0);
      setDeathSaveFails(0);
      setLastDeathSaveRoll(null);
    }

    setRollingDeathSave(false);
  };

  // --- Heilung anwenden ---
  // ðŸ”¥ FIX: tempHp wird ERSETZT (nicht addiert), wenn neue tempHp > 0
  const handleApplyHealing = async () => {
    if (!healValue && !tempHealValue && !maxTempHealValue) return;
    setHealingSaving(true);

    const effectiveMax = safeMax + safeTempMaxHpMax;
    let finalHeal = healValue,
        finalTemp = tempHealValue,
        finalMax = maxTempHealValue;

    if (isPercent) {
      if (healValue) finalHeal = Math.round((healValue / 100) * effectiveMax);
      if (tempHealValue) finalTemp = Math.round((tempHealValue / 100) * effectiveMax);
      if (maxTempHealValue) finalMax = Math.round((maxTempHealValue / 100) * effectiveMax);
    }

    const newTempMaxHpMax = safeTempMaxHpMax + finalMax;
    let newTempMaxHp = safeTempMaxHp + finalMax;
    if (newTempMaxHp > newTempMaxHpMax) newTempMaxHp = newTempMaxHpMax;

    // ðŸ”¥ FIX: tempHp wird ERSETZT, wenn finalTemp > 0, sonst bleibt es erhalten
    const newTempHp = finalTemp > 0 ? finalTemp : safeTempHp;

    // Heilung auf aktuelle HP anwenden
    let remaining = finalHeal;
    let newCurrent = safeCurrent;

    // Zuerst fehlende temporÃ¤re Max-HP auffÃ¼llen
    if (remaining > 0 && newTempMaxHp < newTempMaxHpMax) {
      const missing = newTempMaxHpMax - newTempMaxHp;
      const healPool = Math.min(missing, remaining);
      newTempMaxHp += healPool;
      remaining -= healPool;
    }

    // Dann normale HP heilen
    if (remaining > 0) {
      const maxPossible = safeMax + newTempMaxHpMax;
      const currentTotal = newCurrent + newTempMaxHp;
      newCurrent += Math.min(maxPossible - currentTotal, remaining);
    }

    const res = await fetch(`/api/characters/${characterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentHp: newCurrent,
        tempHp: newTempHp,
        tempMaxHp: newTempMaxHp,
        tempMaxHpMax: newTempMaxHpMax,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      onUpdate(updated);
      setHealValue(0);
      setTempHealValue(0);
      setMaxTempHealValue(0);
    }

    setHealingSaving(false);
  };

  return (
    <div className="space-y-3">
      {/* Hauptleiste: HP-Anzeige + Schaden-Button */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative group">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-gray-400">â¤ï¸ Trefferpunkte</div>
                  <div className="text-3xl font-bold">
                    <span className={safeTempMaxHpMax > 0 && effectiveCurrent > safeMax ? 'text-green-400' : 'text-white'}>
                      {effectiveCurrent}
                    </span>
                    <span className="text-gray-400"> / {effectiveMax}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDamageModal(true)}
                  className="px-4 py-2 bg-red-600 rounded-lg"
                >
                  âš”ï¸ Schaden nehmen
                </button>
              </div>
            </div>
            {/* Tooltip fÃ¼r HP-Quellen */}
            <div className="absolute left-0 top-full mt-2 z-10 bg-gray-800 border border-purple-500 rounded-lg p-3 text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible w-64">
              <div className="font-semibold mb-2">Lebenspunkte Quellen:</div>
              <div>â¤ï¸ HP: {safeCurrent}</div>
              <div>ðŸŽ² Basis: {safeMax}</div>
              <div>ðŸ›¡ï¸ Temp HP: {safeTempHp}</div>
              <div>âœ¨ Max Temp HP: {safeTempMaxHp} / {safeTempMaxHpMax}</div>
              {hitDice && <div>ðŸŽ² TrefferwÃ¼rfel: {hitDice}</div>}
            </div>
          </div>
          {/* HP-Balken */}
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden relative">
            <div
              className={`absolute top-0 left-0 h-full ${safeTempMaxHp > 0 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(100, (safeCurrent / safeMax) * 100)}%` }}
            />
            <div
              className="absolute top-0 left-0 h-full bg-blue-500"
              style={{ width: `${Math.min(100, (safeTempHp / safeMax) * 100)}%` }}
            />
          </div>
        </div>

        {/* Death Save Panel (rechts) */}
        <div className="w-48">
          {safeCurrent > 0 ? (
            <div className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-center h-full">
              <span className="text-green-400 font-bold text-lg">ALIVE!</span>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={`success-${i}`} className={`w-5 h-5 rounded-full ${i < deathSaveSuccesses ? 'bg-green-500' : 'bg-gray-600'}`} />
                  ))}
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div key={`fail-${i}`} className={`w-5 h-5 rounded-full ${i < deathSaveFails ? 'bg-red-500' : 'bg-gray-600'}`} />
                  ))}
                </div>
              </div>
              {lastDeathSaveRoll !== null && (
                <div className="text-center text-sm">
                  <span className="text-gray-400">Letzter Wurf:</span>
                  <span className={`ml-2 font-bold text-lg ${lastDeathSaveRoll >= 10 ? 'text-green-400' : 'text-red-400'}`}>
                    {lastDeathSaveRoll}
                  </span>
                </div>
              )}
              <div className="flex gap-1 justify-center">
                <button onClick={() => setAdvantageMode('advantage')} className={`px-2 py-1 text-xs rounded ${advantageMode === 'advantage' ? 'bg-green-600' : 'bg-gray-700'}`}>ðŸŸ¢</button>
                <button onClick={() => setAdvantageMode('normal')} className={`px-2 py-1 text-xs rounded ${advantageMode === 'normal' ? 'bg-purple-600' : 'bg-gray-700'}`}>âšª</button>
                <button onClick={() => setAdvantageMode('disadvantage')} className={`px-2 py-1 text-xs rounded ${advantageMode === 'disadvantage' ? 'bg-red-600' : 'bg-gray-700'}`}>ðŸ”´</button>
              </div>
              <button onClick={handleDeathSave} disabled={rollingDeathSave} className="w-full py-2 bg-purple-600 rounded-lg text-sm disabled:opacity-50">
                {rollingDeathSave ? 'ðŸŽ² wÃ¼rfelt...' : 'Todesrettungswurf'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- HEILUNGSBEREICH --- */}
      <div className="bg-gray-800/50 rounded-lg p-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-green-300">ðŸ’š Heilung / Buffs</span>
          <button
            onClick={() => setIsPercent(!isPercent)}
            className={`text-xs px-2 py-0.5 rounded ${isPercent ? 'bg-purple-600' : 'bg-gray-600'}`}
          >
            {isPercent ? '%' : 'abs'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            type="number"
            value={healValue || ''}
            onChange={(e) => setHealValue(parseInt(e.target.value) || 0)}
            placeholder={isPercent ? '+ TP (%)' : '+ TP'}
            className="w-24 px-2 py-1 bg-gray-700 rounded text-sm"
          />
          <input
            type="number"
            value={tempHealValue || ''}
            onChange={(e) => setTempHealValue(parseInt(e.target.value) || 0)}
            placeholder={isPercent ? '+ Temp HP (%)' : '+ Temp HP'}
            className="w-24 px-2 py-1 bg-gray-700 rounded text-sm"
          />
          <input
            type="number"
            value={maxTempHealValue || ''}
            onChange={(e) => setMaxTempHealValue(parseInt(e.target.value) || 0)}
            placeholder={isPercent ? '+ Max Temp (%)' : '+ Max Temp'}
            className="w-24 px-2 py-1 bg-gray-700 rounded text-sm"
          />
          <button
            onClick={handleApplyHealing}
            disabled={healingSaving || (!healValue && !tempHealValue && !maxTempHealValue)}
            className="px-4 py-1 bg-green-600 rounded text-sm disabled:opacity-50"
          >
            Anwenden
          </button>
        </div>
      </div>

      {/* Schaden-Modal */}
      <DamageModal
        isOpen={showDamageModal}
        onClose={() => setShowDamageModal(false)}
        characterId={characterId}
        currentHp={safeCurrent}
        maxHp={safeMax}
        tempHp={safeTempHp}
        tempMaxHp={safeTempMaxHp}
        tempMaxHpMax={safeTempMaxHpMax}
        damageImmunities={damageImmunities}
        damageResistances={damageResistances}
        onUpdate={onUpdate}
      />
    </div>
  );
}