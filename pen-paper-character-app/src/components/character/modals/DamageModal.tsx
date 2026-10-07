// src/components/character/shared/DamageModal.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface DamageField { id: string; amount: number; damageType: string; description: string; }

interface DamageModalProps {
  isOpen: boolean; onClose: () => void; characterId: string;
  currentHp: number; maxHp: number; tempHp: number; tempMaxHp: number; tempMaxHpMax: number;
  damageImmunities: string[]; damageResistances: string[];
  onUpdate: (data: any) => void;
}

export function DamageModal({ isOpen, onClose, characterId, currentHp, maxHp, tempHp, tempMaxHp, tempMaxHpMax, damageImmunities, damageResistances, onUpdate }: DamageModalProps) {
  const [fields, setFields] = useState<DamageField[]>([{ id: Date.now().toString(), amount: 0, damageType: '', description: '' }]);
  const [customType, setCustomType] = useState('');
  const [customAmount, setCustomAmount] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveMax = maxHp + tempMaxHpMax;
  const effectiveCurrent = currentHp + tempHp + tempMaxHp;
  const allTypes = [...new Set(['Feuer','Kälte','Blitz','Säure','Donner','Gift','Strahlend','Nekrotisch','Psychisch','Stich','Hieb','Wucht', ...damageImmunities, ...damageResistances, ...customTypes])].sort();

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(`customDamageTypes_${characterId}`);
      if (stored) try { setCustomTypes(JSON.parse(stored)); } catch(e) {}
      document.body.style.overflow = 'hidden';
    } else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, characterId]);

  const getInfo = (type: string) => ({ 
    isImmune: damageImmunities.some(i => i.toLowerCase() === type.toLowerCase()), 
    isResistant: damageResistances.some(r => r.toLowerCase() === type.toLowerCase()) 
  });

  // 🔥 KORRIGIERT: Alle HP-Felder werden aktualisiert
  const applyDamage = async () => {
    let total = 0;
    for (const field of fields) {
      const amount = field.amount || 0;
      const type = field.damageType;
      if (amount > 0 && type) {
        const info = getInfo(type);
        if (info.isImmune) continue;
        if (info.isResistant) total += Math.floor(amount / 2);
        else total += amount;
      }
    }
    
    const safeTotal = isNaN(total) ? 0 : total;
    let remaining = safeTotal;
    let newTempHp = tempHp || 0;
    let newTempMaxHp = tempMaxHp || 0;
    let newTempMaxHpMax = tempMaxHpMax || 0;
    let newCurrentHp = currentHp || 0;
    
    // 1. Temp HP reduzieren
    if (remaining > 0 && newTempHp > 0) { 
      const d = Math.min(newTempHp, remaining); 
      newTempHp -= d; 
      remaining -= d; 
    }
    
    // 2. Max Temp HP reduzieren (aktuelle Werte)
    if (remaining > 0 && newTempMaxHp > 0) { 
      const d = Math.min(newTempMaxHp, remaining); 
      newTempMaxHp -= d; 
      remaining -= d; 
    }
    
    // 3. Wenn noch Schaden übrig ist, auf aktuelle HP anwenden
    if (remaining > 0) {
      newCurrentHp = Math.max(0, newCurrentHp - remaining);
    }
    
    // 🔥 FIX: Alle HP-Felder in einem PUT senden
    const res = await fetch(`/api/characters/${characterId}`, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        currentHp: newCurrentHp, 
        tempHp: newTempHp, 
        tempMaxHp: newTempMaxHp,
        tempMaxHpMax: newTempMaxHpMax 
      }) 
    });
    
    if (res.ok) { 
      onUpdate(await res.json()); 
      setFields([{ id: Date.now().toString(), amount: 0, damageType: '', description: '' }]); 
      onClose(); 
    }
  };

  const addField = () => setFields([...fields, { id: Date.now().toString(), amount: 0, damageType: '', description: '' }]);
  const removeField = (id: string) => fields.length > 1 && setFields(fields.filter(f => f.id !== id));
  const updateField = (id: string, key: keyof DamageField, val: any) => setFields(fields.map(f => f.id === id ? { ...f, [key]: val } : f));

  const addCustomType = async () => {
    if (!customType.trim() || isCreating) return;
    const newType = customType.trim();
    const exists = allTypes.some(t => t.toLowerCase() === newType.toLowerCase());
    if (exists) {
      const emptyIdx = fields.findIndex(f => !f.damageType.trim());
      if (emptyIdx !== -1) updateField(fields[emptyIdx].id, 'damageType', newType);
      else setFields([...fields, { id: Date.now().toString(), amount: customAmount, damageType: newType, description: '' }]);
      setCustomType(''); setCustomAmount(0);
      return;
    }
    setIsCreating(true);
    const updated = [...customTypes, newType].sort();
    localStorage.setItem(`customDamageTypes_${characterId}`, JSON.stringify(updated));
    setCustomTypes(updated);
    const emptyIdx = fields.findIndex(f => !f.damageType.trim());
    if (emptyIdx !== -1) updateField(fields[emptyIdx].id, 'damageType', newType);
    else setFields([...fields, { id: Date.now().toString(), amount: customAmount, damageType: newType, description: '' }]);
    setCustomType(''); setCustomAmount(0);
    setIsCreating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full mx-4 border border-purple-500/30 max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b p-4 flex justify-between">
          <h2 className="text-xl font-bold">⚔️ Schaden nehmen</h2>
          <button type="button" onClick={onClose} className="text-2xl">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-sm text-gray-400">Aktuelle HP</div>
            <div className="text-2xl font-bold">{effectiveCurrent} / {effectiveMax}</div>
            {tempHp > 0 && <div className="text-sm text-blue-400">🛡️ Schild: {tempHp}</div>}
            {tempMaxHp > 0 && <div className="text-sm text-green-400">✨ Temp Max: {tempMaxHp} / {tempMaxHpMax}</div>}
          </div>
          <div className="space-y-3">
            {fields.map((f,idx) => (
              <div key={f.id} className="bg-gray-800/30 rounded-lg p-3">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input 
                      type="number" 
                      value={f.amount || ''} 
                      onChange={e => updateField(f.id, 'amount', parseInt(e.target.value) || 0)} 
                      placeholder="Menge" 
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg" 
                    />
                  </div>
                  <div className="flex-[2] relative">
                    <input 
                      ref={idx === fields.length-1 ? inputRef : null} 
                      type="text" 
                      value={f.damageType} 
                      onChange={e => { 
                        updateField(f.id, 'damageType', e.target.value); 
                        setSuggestions(e.target.value ? allTypes.filter(t => t.toLowerCase().includes(e.target.value.toLowerCase())) : []); 
                      }} 
                      placeholder="Schadenstyp" 
                      className="w-full px-3 py-2 bg-gray-700 rounded-lg" 
                    />
                    {suggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-gray-800 border rounded-lg max-h-40 overflow-y-auto">
                        {suggestions.map(s => (
                          <button type="button" 
                            key={s} 
                            onClick={() => { updateField(f.id, 'damageType', s); setSuggestions([]); }} 
                            className="w-full text-left px-3 py-2 hover:bg-gray-700"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={() => removeField(f.id)} className="px-3 py-2 bg-red-600/50 rounded-lg">✕</button>
                </div>
                <input 
                  type="text" 
                  value={f.description} 
                  onChange={e => updateField(f.id, 'description', e.target.value)} 
                  placeholder="Beschreibung (optional)" 
                  className="w-full mt-2 px-3 py-1 bg-gray-700 rounded-lg text-sm" 
                />
              </div>
            ))}
          </div>
          <button type="button" onClick={addField} className="w-full py-2 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-purple-500 hover:text-purple-400">
            + Weiterer Schaden
          </button>
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <input 
                  type="number" 
                  value={customAmount || ''} 
                  onChange={e => setCustomAmount(parseInt(e.target.value) || 0)} 
                  placeholder="Menge" 
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg" 
                />
              </div>
              <div className="flex-[2]">
                <input 
                  type="text" 
                  value={customType} 
                  onChange={e => setCustomType(e.target.value)} 
                  placeholder="Neuer Schadenstyp" 
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg" 
                />
              </div>
              <button type="button" onClick={addCustomType} disabled={!customType.trim()} className="px-4 py-2 bg-purple-600 rounded-lg">
                + Erstellen
              </button>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-sm font-semibold mb-2">Vorschau:</div>
            {fields.map(f => f.amount > 0 && f.damageType && (
              <div key={f.id} className="text-sm">
                {f.amount} {f.damageType} Schaden
                {getInfo(f.damageType).isImmune && <span className="text-green-400 ml-2">→ 0 (Immun)</span>}
                {getInfo(f.damageType).isResistant && !getInfo(f.damageType).isImmune && <span className="text-blue-400 ml-2">→ {Math.floor(f.amount/2)} (halbiert)</span>}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t flex gap-3 sticky bottom-0 bg-gray-900">
          <button type="button" onClick={applyDamage} className="flex-1 py-2 bg-red-600 rounded-lg">Schaden anwenden</button>
          <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-700 rounded-lg">Abbrechen</button>
        </div>
      </div>
    </div>
  );
}