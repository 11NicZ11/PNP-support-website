'use client';

import { useState } from 'react';

interface SavingThrowsProps {
  characterId: string;
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
  strength, dexterity, constitution, intelligence, wisdom, charisma,
  proficiencyBonus,
  savingThrows,
  onUpdate 
}: SavingThrowsProps) {
  const [rolling, setRolling] = useState<string | null>(null);

  const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const getSavingThrowBonus = (score: number, hasProficiency: boolean): number => {
    const modifier = calculateModifier(score);
    return hasProficiency ? modifier + proficiencyBonus : modifier;
  };

  const rollSavingThrow = async (ability: string, bonus: number) => {
    setRolling(ability);
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + bonus;
    
    // Würfelanimation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    alert(`${ability.toUpperCase()} Rettungswurf: ${roll} + ${bonus} = ${total}${roll === 20 ? ' 💥 KRITISCH!' : roll === 1 ? ' 😱 PATZER!' : ''}`);
    setRolling(null);
  };

  const toggleProficiency = async (ability: string) => {
    const updateField = `savingThrow${ability.charAt(0).toUpperCase() + ability.slice(1)}`;
    const response = await fetch(`/api/characters/${characterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [updateField]: !savingThrows[ability as keyof typeof savingThrows] }),
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
    <div className="bg-gray-800/50 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">🎲 Rettungswürfe</h3>
      <div className="space-y-2">
        {savingThrowsList.map((save) => {
          const bonus = getSavingThrowBonus(save.score, savingThrows[save.key as keyof typeof savingThrows]);
          const isProficient = savingThrows[save.key as keyof typeof savingThrows];
          const isRolling = rolling === save.key;
          
          return (
            <div key={save.key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-32">
                <span className="text-lg">{save.icon}</span>
                <span className="text-sm font-medium">{save.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleProficiency(save.key)}
                  className={`px-2 py-0.5 text-xs rounded transition ${
                    isProficient 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                  title={isProficient ? 'Übung entfernen' : 'Übung hinzufügen'}
                >
                  {isProficient ? '✓ Übung' : '○ Übung'}
                </button>
                
                <div className="w-12 text-right">
                  <span className={`font-mono font-bold ${bonus >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {bonus >= 0 ? `+${bonus}` : `${bonus}`}
                  </span>
                </div>
                
                <button
                  onClick={() => rollSavingThrow(save.key, bonus)}
                  disabled={isRolling}
                  className="w-16 px-2 py-1 bg-gradient-to-r from-purple-600 to-purple-700 rounded text-xs font-semibold hover:from-purple-500 hover:to-purple-600 transition disabled:opacity-50"
                >
                  {isRolling ? '🎲' : 'Würfeln'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-700 text-xs text-gray-500">
        💡 Tipp: Klicke auf "Übung" um zu markieren, ob der Charakter in diesem Rettungswurf geübt ist.
      </div>
    </div>
  );
}