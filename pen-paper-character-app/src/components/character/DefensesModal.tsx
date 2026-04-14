'use client';

import { useState } from 'react';

interface DefensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterId: string;
  damageImmunities: string[];
  damageResistances: string[];
  conditionImmunities: string[];
  onUpdate: (updatedData: any) => void;
}

export function DefensesModal({ 
  isOpen, 
  onClose, 
  characterId,
  damageImmunities,
  damageResistances,
  conditionImmunities,
  onUpdate 
}: DefensesModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempImmunities, setTempImmunities] = useState(damageImmunities.join(', '));
  const [tempResistances, setTempResistances] = useState(damageResistances.join(', '));
  const [tempConditionImmunities, setTempConditionImmunities] = useState(conditionImmunities.join(', '));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const immunitiesArray = tempImmunities.split(',').map(s => s.trim()).filter(s => s);
      const resistancesArray = tempResistances.split(',').map(s => s.trim()).filter(s => s);
      const conditionsArray = tempConditionImmunities.split(',').map(s => s.trim()).filter(s => s);

      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          damageImmunities: JSON.stringify(immunitiesArray),
          damageResistances: JSON.stringify(resistancesArray),
          conditionImmunities: JSON.stringify(conditionsArray),
        }),
      });

      if (response.ok) {
        const updated = await response.json();
        onUpdate(updated);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Fehler:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full mx-4 border border-purple-500/30 max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-purple-500/20 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">🛡️ Defenses & Immunities</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-6 space-y-6">
          {!isEditing ? (
            // Anzeige-Modus
            <>
              {/* Schadensimmunitäten */}
              <div>
                <h3 className="text-lg font-semibold mb-2">✨ Schadensimmunitäten</h3>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  {damageImmunities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {damageImmunities.map((immunity, i) => (
                        <span key={i} className="px-2 py-1 bg-green-600/30 text-green-300 rounded text-sm">
                          {immunity}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Keine Schadensimmunitäten</p>
                  )}
                </div>
              </div>

              {/* Schadensresistenzen */}
              <div>
                <h3 className="text-lg font-semibold mb-2">🛡️ Schadensresistenzen</h3>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  {damageResistances.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {damageResistances.map((resistance, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-600/30 text-blue-300 rounded text-sm">
                          {resistance}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Keine Schadensresistenzen</p>
                  )}
                </div>
              </div>

              {/* Zustandsimmunitäten */}
              <div>
                <h3 className="text-lg font-semibold mb-2">💪 Zustandsimmunitäten</h3>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  {conditionImmunities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {conditionImmunities.map((condition, i) => (
                        <span key={i} className="px-2 py-1 bg-purple-600/30 text-purple-300 rounded text-sm">
                          {condition}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">Keine Zustandsimmunitäten</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
              >
                ✏️ Bearbeiten
              </button>
            </>
          ) : (
            // Bearbeitungs-Modus
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Schadensimmunitäten (durch Komma getrennt)</label>
                <input
                  type="text"
                  value={tempImmunities}
                  onChange={(e) => setTempImmunities(e.target.value)}
                  placeholder="Feuer, Kälte, Blitz"
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">z.B.: Feuer, Kälte, Gift</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Schadensresistenzen (durch Komma getrennt)</label>
                <input
                  type="text"
                  value={tempResistances}
                  onChange={(e) => setTempResistances(e.target.value)}
                  placeholder="Blitz, Donner, Stich"
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">z.B.: Blitz, Donner, Wucht</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Zustandsimmunitäten (durch Komma getrennt)</label>
                <input
                  type="text"
                  value={tempConditionImmunities}
                  onChange={(e) => setTempConditionImmunities(e.target.value)}
                  placeholder="Vergiftet, Paralyziert, Verängstigt"
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">z.B.: Vergiftet, Paralyziert, Betäubt</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition disabled:opacity-50"
                >
                  {saving ? 'Speichert...' : 'Speichern'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}