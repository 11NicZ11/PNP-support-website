'use client';

import { useState } from 'react';

interface HealthBarProps {
  characterId: string;
  currentHp: number;
  maxHp: number;
  tempHp: number;
  tempMaxHp: number;
  onUpdate: (updatedData: any) => void;
}

export function HealthBar({ characterId, currentHp, maxHp, tempHp, tempMaxHp, onUpdate }: HealthBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currentHp.toString());
  const [isEditingTemp, setIsEditingTemp] = useState(false);
  const [editTempValue, setEditTempValue] = useState(tempHp.toString());
  const [isEditingTempMax, setIsEditingTempMax] = useState(false);
  const [editTempMaxValue, setEditTempMaxValue] = useState(tempMaxHp.toString());

  const effectiveMaxHp = maxHp + tempMaxHp;
  const hpPercentage = (currentHp / effectiveMaxHp) * 100;
  const isTempMaxActive = tempMaxHp > 0;

  const updateHp = async (newHp: number) => {
    const response = await fetch(`/api/characters/${characterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentHp: Math.max(0, Math.min(newHp, effectiveMaxHp)) }),
    });
    if (response.ok) {
      const updated = await response.json();
      onUpdate(updated);
    }
  };

  const updateTempHp = async (newTempHp: number) => {
    const response = await fetch(`/api/characters/${characterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempHp: Math.max(0, newTempHp) }),
    });
    if (response.ok) {
      const updated = await response.json();
      onUpdate(updated);
    }
  };

  const updateTempMaxHp = async (newTempMaxHp: number) => {
    const response = await fetch(`/api/characters/${characterId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempMaxHp: Math.max(0, newTempMaxHp) }),
    });
    if (response.ok) {
      const updated = await response.json();
      onUpdate(updated);
    }
  };

  const handleHpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newHp = parseInt(editValue);
    if (!isNaN(newHp)) {
      updateHp(newHp);
    }
    setIsEditing(false);
  };

  const handleTempSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTemp = parseInt(editTempValue);
    if (!isNaN(newTemp)) {
      updateTempHp(newTemp);
    }
    setIsEditingTemp(false);
  };

  const handleTempMaxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTempMax = parseInt(editTempMaxValue);
    if (!isNaN(newTempMax)) {
      updateTempMaxHp(newTempMax);
    }
    setIsEditingTempMax(false);
  };

  const quickChange = (amount: number) => {
    updateHp(currentHp + amount);
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">❤️ Trefferpunkte</h3>
        <div className="flex gap-2">
          <button
            onClick={() => quickChange(-5)}
            className="px-2 py-1 bg-red-600/50 hover:bg-red-600 rounded text-sm transition"
            title="5 Schaden"
          >
            -5
          </button>
          <button
            onClick={() => quickChange(-1)}
            className="px-2 py-1 bg-red-600/50 hover:bg-red-600 rounded text-sm transition"
            title="1 Schaden"
          >
            -1
          </button>
          <button
            onClick={() => quickChange(1)}
            className="px-2 py-1 bg-green-600/50 hover:bg-green-600 rounded text-sm transition"
            title="1 Heilung"
          >
            +1
          </button>
          <button
            onClick={() => quickChange(5)}
            className="px-2 py-1 bg-green-600/50 hover:bg-green-600 rounded text-sm transition"
            title="5 Heilung"
          >
            +5
          </button>
        </div>
      </div>

      {/* HP Anzeige mit Editier-Funktion */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2 mb-1">
          {isEditing ? (
            <form onSubmit={handleHpSubmit} className="flex gap-2">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-24 px-2 py-1 bg-gray-700 rounded text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <button type="submit" className="px-3 py-1 bg-purple-600 rounded text-sm">OK</button>
              <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1 bg-gray-600 rounded text-sm">X</button>
            </form>
          ) : (
            <>
              <span 
                className="text-4xl font-bold cursor-pointer hover:text-purple-400 transition"
                onClick={() => setIsEditing(true)}
              >
                {currentHp}
              </span>
              <span className="text-2xl text-gray-400">/</span>
              <span className={`text-2xl ${isTempMaxActive ? 'text-green-400' : 'text-gray-400'}`}>
                {effectiveMaxHp}
              </span>
              {isTempMaxActive && (
                <span className="text-sm text-green-400 ml-2">(inkl. +{tempMaxHp} temporär)</span>
              )}
            </>
          )}
        </div>

        {/* HP Bar */}
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-green-500 to-green-400 h-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, hpPercentage))}%` }}
          />
        </div>
      </div>

      {/* Temporäre Max-HP (grüner Bereich) */}
      <div className="mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-gray-400">✨ Temporäre Max-HP:</span>
          {isEditingTempMax ? (
            <form onSubmit={handleTempMaxSubmit} className="flex gap-2">
              <input
                type="number"
                value={editTempMaxValue}
                onChange={(e) => setEditTempMaxValue(e.target.value)}
                className="w-20 px-2 py-1 bg-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <button type="submit" className="px-2 py-1 bg-purple-600 rounded text-xs">OK</button>
              <button type="button" onClick={() => setIsEditingTempMax(false)} className="px-2 py-1 bg-gray-600 rounded text-xs">X</button>
            </form>
          ) : (
            <span 
              className="text-green-400 font-semibold cursor-pointer hover:text-green-300 transition"
              onClick={() => setIsEditingTempMax(true)}
            >
              +{tempMaxHp}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500">Erhöht die maximalen TP (z.B. durch Zauber wie "Aid")</p>
      </div>

      {/* Temporäre HP (Schild/Barriere) */}
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-sm text-gray-400">🛡️ Temporäre HP:</span>
          {isEditingTemp ? (
            <form onSubmit={handleTempSubmit} className="flex gap-2">
              <input
                type="number"
                value={editTempValue}
                onChange={(e) => setEditTempValue(e.target.value)}
                className="w-20 px-2 py-1 bg-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <button type="submit" className="px-2 py-1 bg-purple-600 rounded text-xs">OK</button>
              <button type="button" onClick={() => setIsEditingTemp(false)} className="px-2 py-1 bg-gray-600 rounded text-xs">X</button>
            </form>
          ) : (
            <span 
              className="text-blue-400 font-semibold cursor-pointer hover:text-blue-300 transition"
              onClick={() => setIsEditingTemp(true)}
            >
              {tempHp}
            </span>
          )}
        </div>
        {tempHp > 0 && (
          <div className="w-full bg-gray-700 rounded-full h-2 mt-1 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (tempHp / effectiveMaxHp) * 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}