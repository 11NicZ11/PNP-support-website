'use client';

import { useState } from 'react';
import { useDice } from '@/hooks/useDice';
import { AdvantageToggle, AdvantageState } from '@/components/dice/AdvantageToggle';

interface SavingThrowsProps {
  characterId: string;
  characterName: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencyBonus: number;
  savingThrows: {
    strength: boolean;
    dexterity: boolean;
    constitution: boolean;
    intelligence: boolean;
    wisdom: boolean;
    charisma: boolean;
  };
  onUpdate: (updatedData: any) => void;
}

export function SavingThrows({ 
  characterId,
  characterName,
  strength, dexterity, constitution, intelligence, wisdom, charisma,
  proficiencyBonus,
  savingThrows,
  onUpdate 
}: SavingThrowsProps) {
  const [rolling, setRolling] = useState<string | null>(null);
  const [advantageStates, setAdvantageStates] = useState<Record<string, AdvantageState>>({});
  const { abilityCheck } = useDice({ id: characterId, name: characterName });

  const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const getSavingThrowBonus = (score: number, hasProficiency: boolean): number => {
    const modifier = calculateModifier(score);
    return hasProficiency ? modifier + proficiencyBonus : modifier;
  };

  const handleRoll = async (ability: string, bonus: number, advantage: AdvantageState = 'normal') => {
    setRolling(ability);
    await abilityCheck(ability, bonus, { advantage });
    setRolling(null);
  };

  const toggleProficiency = async (ability: string, currentValue: boolean) => {
    const updateField = `savingThrow${ability.charAt(0).toUpperCase() + ability.slice(1)}`;
    const response = await fetch(`/api/characters/${characterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [updateField]: !currentValue }),
    });
    if (response.ok) {
      const updated = await response.json();
      onUpdate(updated);
    }
  };

  const savingThrowsList = [
    { name: 'Stärke', key: 'strength', score: strength, icon: '💪' },
    { name: 'Geschick', key: 'dexterity', score: dexterity, icon: '🤸' },
    { name: 'Konstitution', key: 'constitution', score: constitution, icon: '🛡️' },
    { name: 'Intelligenz', key: 'intelligence', score: intelligence, icon: '📚' },
    { name: 'Weisheit', key: 'wisdom', score: wisdom, icon: '🧠' },
    { name: 'Charisma', key: 'charisma', score: charisma, icon: '✨' },
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">🎲 Rettungswürfe</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {savingThrowsList.map((save) => {
          const bonus = getSavingThrowBonus(save.score, savingThrows[save.key as keyof typeof savingThrows]);
          const isProficient = savingThrows[save.key as keyof typeof savingThrows];
          const isRolling = rolling === save.key;
          const modifierValue = calculateModifier(save.score);
          const currentAdvantage = advantageStates[save.key] || 'normal';
          
          return (
            <div 
              key={save.key} 
              className="bg-gray-800/50 rounded-lg p-2 text-center hover:bg-gray-800 transition"
            >
              {/* Obere Reihe: Icon + Name + Status (Proficiency) */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm">{save.icon}</span>
                  <span className="text-xs text-gray-300">{save.name}</span>
                </div>
                <button
                  onClick={() => toggleProficiency(save.key, isProficient)}
                  className={`w-5 h-5 rounded text-xs font-bold transition ${
                    isProficient 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-500 hover:bg-gray-600'
                  }`}
                  title={isProficient ? 'Übung entfernen' : 'Übung hinzufügen'}
                >
                  {isProficient ? '✓' : '○'}
                </button>
              </div>
              
              {/* Mitte: Statuswert (Score) */}
              <div className="text-xl font-bold text-gray-200 mb-2">
                {save.score}
              </div>
              
              {/* Untere Reihe: Vorteil-Toggle + Modifier Button */}
              <div className="flex items-center gap-1">
                <AdvantageToggle 
                  onAdvantageChange={(state) => setAdvantageStates(prev => ({ ...prev, [save.key]: state }))}
                  size="small"
                />
                <button
                  onClick={() => handleRoll(save.name, bonus, currentAdvantage)}
                  disabled={isRolling}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-sm transition ${
                    bonus >= 0 
                      ? 'bg-green-600/50 hover:bg-green-600 text-green-100' 
                      : 'bg-red-600/50 hover:bg-red-600 text-red-100'
                  } ${isRolling ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isRolling ? (
                    <span className="animate-spin inline-block">🎲</span>
                  ) : (
                    <span>{bonus >= 0 ? `+${bonus}` : `${bonus}`}</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 pt-2 text-xs text-gray-500 text-center">
        💡 Tipp: Klick auf das grüne/rote Dreieck für Vorteil/Nachteil • Klick auf ✓/○ für Übung
      </div>
    </div>
  );
}