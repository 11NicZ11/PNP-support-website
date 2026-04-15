'use client';

import { useState } from 'react';
import { useDice } from '@/hooks/useDice';
import { AdvantageIcons } from '@/components/dice/AdvantageIcons';

interface BaseStatsAndSavesProps {
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

export function BaseStatsAndSaves({ 
  characterId,
  characterName,
  strength, dexterity, constitution, intelligence, wisdom, charisma,
  proficiencyBonus,
  savingThrows,
  onUpdate 
}: BaseStatsAndSavesProps) {
  const [rolling, setRolling] = useState<string | null>(null);
  const { abilityCheck, savingThrow: rollSavingThrow } = useDice({ id: characterId, name: characterName });

  const calculateModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  const getSavingThrowBonus = (score: number, hasProficiency: boolean): number => {
    const modifier = calculateModifier(score);
    return hasProficiency ? modifier + proficiencyBonus : modifier;
  };

  const handleAbilityRoll = async (abilityName: string, modifier: number, type: 'normal' | 'advantage' | 'disadvantage') => {
    const rollType = type === 'normal' ? 'normal' : type;
    const rollId = `${abilityName}-${type}`;
    setRolling(rollId);
    await abilityCheck(abilityName, modifier, { advantage: rollType });
    setRolling(null);
  };

  const handleSavingThrowRoll = async (abilityName: string, bonus: number, type: 'normal' | 'advantage' | 'disadvantage') => {
    const rollType = type === 'normal' ? 'normal' : type;
    const rollId = `${abilityName}-save-${type}`;
    setRolling(rollId);
    await rollSavingThrow(abilityName, bonus, { advantage: rollType });
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

  const baseStats = [
    { name: 'Stärke', key: 'strength', value: strength, icon: '💪' },
    { name: 'Geschick', key: 'dexterity', value: dexterity, icon: '🤸' },
    { name: 'Konstitution', key: 'constitution', value: constitution, icon: '🛡️' },
    { name: 'Intelligenz', key: 'intelligence', value: intelligence, icon: '📚' },
    { name: 'Weisheit', key: 'wisdom', value: wisdom, icon: '🧠' },
    { name: 'Charisma', key: 'charisma', value: charisma, icon: '✨' },
  ];

  const savingThrowsList = [
    { name: 'Stärke', key: 'strength', value: strength, icon: '💪' },
    { name: 'Geschick', key: 'dexterity', value: dexterity, icon: '🤸' },
    { name: 'Konstitution', key: 'constitution', value: constitution, icon: '🛡️' },
    { name: 'Intelligenz', key: 'intelligence', value: intelligence, icon: '📚' },
    { name: 'Weisheit', key: 'wisdom', value: wisdom, icon: '🧠' },
    { name: 'Charisma', key: 'charisma', value: charisma, icon: '✨' },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">🎲 Basiswerte & Rettungswürfe</h2>
      
      {/* Basiswerte Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {baseStats.map((stat) => {
          const modifier = calculateModifier(stat.value);
          const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
          const isRollingNormal = rolling === `${stat.key}-normal`;
          const isRollingAdvantage = rolling === `${stat.key}-advantage`;
          const isRollingDisadvantage = rolling === `${stat.key}-disadvantage`;
          
          return (
            <div key={stat.key} className="bg-gray-800/50 rounded-lg p-3 text-center">
              {/* Icon + Name */}
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-lg">{stat.icon}</span>
                <span className="text-xs text-gray-300">{stat.name}</span>
              </div>
              
              {/* Wert als Button (normaler Wurf) */}
              <button
                onClick={() => handleAbilityRoll(stat.name, modifier, 'normal')}
                disabled={isRollingNormal}
                className="w-full text-3xl font-bold text-gray-200 hover:text-purple-400 transition text-center mb-3 disabled:opacity-50"
              >
                {isRollingNormal ? '🎲' : stat.value}
              </button>
              
              {/* Drei Buttons: Roter Stern | Modifier | Grüner Stern */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => handleAbilityRoll(stat.name, modifier, 'disadvantage')}
                  disabled={isRollingDisadvantage}
                  className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 text-white font-bold disabled:opacity-50"
                  title="Mit Nachteil würfeln"
                >
                  {isRollingDisadvantage ? '🎲' : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <polygon points="12 22 9 15 2 15 8 10 5 2 12 7 19 2 16 10 22 15 15 15 12 22" />
                    </svg>
                  )}
                </button>
                
                <div className="text-xl font-bold text-purple-400">
                  {modifierText}
                </div>
                
                <button
                  onClick={() => handleAbilityRoll(stat.name, modifier, 'advantage')}
                  disabled={isRollingAdvantage}
                  className="w-8 h-8 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 text-white font-bold disabled:opacity-50"
                  title="Mit Vorteil würfeln"
                >
                  {isRollingAdvantage ? '🎲' : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <polygon points="12 2 15 9 22 9 16 14 19 22 12 17 5 22 8 14 2 9 9 9 12 2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trennlinie mit "Rettungswürfe" */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-purple-500/30"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-gray-900 px-4 text-sm text-purple-400">Rettungswürfe</span>
        </div>
      </div>

      {/* Rettungswürfe Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {savingThrowsList.map((save) => {
          const bonus = getSavingThrowBonus(save.value, savingThrows[save.key as keyof typeof savingThrows]);
          const bonusText = bonus >= 0 ? `+${bonus}` : `${bonus}`;
          const isProficient = savingThrows[save.key as keyof typeof savingThrows];
          const isRollingNormal = rolling === `${save.key}-save-normal`;
          const isRollingAdvantage = rolling === `${save.key}-save-advantage`;
          const isRollingDisadvantage = rolling === `${save.key}-save-disadvantage`;
          
          return (
            <div key={save.key} className="bg-gray-800/50 rounded-lg p-3 text-center">
              {/* Obere Reihe: Icon + Name + Übung */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  <span className="text-lg">{save.icon}</span>
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
              
              {/* Drei Buttons: Roter Stern | Rettungswurf-Wert | Grüner Stern */}
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => handleSavingThrowRoll(save.name, bonus, 'disadvantage')}
                  disabled={isRollingDisadvantage}
                  className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 text-white font-bold disabled:opacity-50"
                  title="Mit Nachteil würfeln"
                >
                  {isRollingDisadvantage ? '🎲' : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <polygon points="12 22 9 15 2 15 8 10 5 2 12 7 19 2 16 10 22 15 15 15 12 22" />
                    </svg>
                  )}
                </button>
                
                <button
                  onClick={() => handleSavingThrowRoll(save.name, bonus, 'normal')}
                  disabled={isRollingNormal}
                  className="flex-1 text-xl font-bold text-gray-200 hover:text-purple-400 transition disabled:opacity-50"
                >
                  {isRollingNormal ? '🎲' : bonusText}
                </button>
                
                <button
                  onClick={() => handleSavingThrowRoll(save.name, bonus, 'advantage')}
                  disabled={isRollingAdvantage}
                  className="w-8 h-8 bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 text-white font-bold disabled:opacity-50"
                  title="Mit Vorteil würfeln"
                >
                  {isRollingAdvantage ? '🎲' : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <polygon points="12 2 15 9 22 9 16 14 19 22 12 17 5 22 8 14 2 9 9 9 12 2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 pt-2 text-xs text-gray-500 text-center">
        💡 Klick auf den Wert für normalen Wurf • Rote/Grüne Sterne für Vor-/Nachteil • ✓/○ für Übung
      </div>
    </div>
  );
}