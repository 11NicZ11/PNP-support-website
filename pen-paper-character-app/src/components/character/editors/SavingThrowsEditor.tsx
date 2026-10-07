// src/components/character/editors/SavingThrowsEditor.tsx
'use client';

import { useState } from 'react';
import { useLibrary } from '@/hooks/useLibrary';

export interface SavingThrow {
  id: string;
  name: string;
  attributeName: string;
  isProficient: boolean;
  expertise: boolean;
  // Library-Reference: FK auf LibraryEntry (nullable, SetNull).
  libraryEntryId?: string | null;
}

interface SavingThrowsEditorProps {
  attributes: { id: string; name: string; value: number }[];
  savingThrows: SavingThrow[];
  onUpdate: (savingThrows: SavingThrow[]) => void;
  onAddAttribute: (name: string) => void;
  proficiencyBonus: number;
}

export function SavingThrowsEditor({
  attributes,
  savingThrows,
  onUpdate,
  onAddAttribute,
  proficiencyBonus,
}: SavingThrowsEditorProps) {
  const [showLibraryForm, setShowLibraryForm] = useState(false);
  const [showNewAttributeForm, setShowNewAttributeForm] = useState(false);
  const [newAttributeName, setNewAttributeName] = useState('');

  const [customName, setCustomName] = useState('');
  const [customAttr, setCustomAttr] = useState(
    attributes[0]?.name || 'Stärke'
  );

  const { entries: libraryEntries, loading, create } = useLibrary({
    type: 'saving_throw',
  });

  const cycleProficiency = (id: string) => {
    const updated = savingThrows.map((st) => {
      if (st.id !== id) return st;
      if (!st.isProficient) {
        return { ...st, isProficient: true, expertise: false };
      } else if (st.isProficient && !st.expertise) {
        return { ...st, expertise: true };
      } else {
        return { ...st, isProficient: false, expertise: false };
      }
    });
    onUpdate(updated);
  };

  const isAdded = (name: string) =>
    savingThrows.some((st) => st.name === name);

  const addFromLibrary = (entry: { name: string; data: any }) => {
    if (isAdded(entry.name)) return;
    const attrName = entry.data?.attributeName || 'Stärke';
    onUpdate([
      ...savingThrows,
      {
        id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: entry.name,
        attributeName: attrName,
        isProficient: false,
        expertise: false,
      },
    ]);
  };

  const addCustomAndPersist = async () => {
    const name = customName.trim();
    if (!name) return;

    await create({
      type: 'saving_throw',
      name,
      icon: '🎲',
      data: { attributeName: customAttr },
    });

    if (!isAdded(name)) {
      onUpdate([
        ...savingThrows,
        {
          id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name,
          attributeName: customAttr,
          isProficient: false,
          expertise: false,
        },
      ]);
    }

    setCustomName('');
    setCustomAttr(attributes[0]?.name || 'Stärke');
    setShowLibraryForm(false);
  };

  const handleAddNewAttribute = () => {
    if (!newAttributeName.trim()) return;
    onAddAttribute(newAttributeName.trim());
    setNewAttributeName('');
    setShowNewAttributeForm(false);
  };

  const removeSavingThrow = (id: string) => {
    onUpdate(savingThrows.filter((st) => st.id !== id));
  };

  // Wichtig: .sort() mutiert das Array aus dem Hook-State → erst kopieren.
  const suggestions = [...libraryEntries].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
        <h2 className="text-lg font-semibold">🎲 Rettungswürfe (Übung)</h2>
        <div className="flex gap-2">
          <a
            href="/library?type=saving_throw"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            title="Bibliothek in neuem Tab öffnen"
          >
            📚 Bibliothek
          </a>
          <button
            type="button"
            onClick={() => setShowLibraryForm((v) => !v)}
            className="px-2 py-1 bg-purple-600 rounded text-sm"
          >
            {showLibraryForm ? 'Abbrechen' : '+ Aus Bibliothek'}
          </button>
          <button
            type="button"
            onClick={() => setShowNewAttributeForm(true)}
            className="px-2 py-1 bg-blue-600 rounded text-sm"
          >
            + Neues Attribut
          </button>
        </div>
      </div>

      {showLibraryForm && (
        <div className="bg-gray-900 rounded-lg p-3 mb-3 border border-purple-500/40 space-y-3">
          <div>
            <div className="text-xs font-semibold text-gray-400 mb-2">
              Aus Bibliothek wählen
            </div>
            {loading && (
              <div className="text-center text-gray-500 text-xs py-2">
                Lade…
              </div>
            )}
            {!loading && suggestions.length === 0 && (
              <div className="text-center text-gray-500 text-xs py-2 italic">
                Noch keine Einträge — lege unten einen neuen an.
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => {
                const added = isAdded(s.name);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => addFromLibrary(s)}
                    disabled={added}
                    className={`px-2 py-1 rounded text-sm transition ${
                      added
                        ? 'bg-purple-600/50 cursor-not-allowed'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {added ? '✓ ' : ''}
                    {s.name}
                    {s.data?.attributeName && (
                      <span className="text-xs text-gray-400 ml-1">
                        ({s.data.attributeName})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-700 pt-3">
            <div className="text-xs font-semibold text-gray-400 mb-2">
              Neuen Rettungswurf anlegen (landet in Bibliothek)
            </div>
            <div className="flex gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Name (z.B. Fangen)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomAndPersist()}
                className="flex-1 min-w-[140px] px-2 py-1 bg-gray-700 rounded text-sm"
              />
              <select
                value={customAttr}
                onChange={(e) => setCustomAttr(e.target.value)}
                className="px-2 py-1 bg-gray-700 rounded text-sm"
              >
                {attributes.map((attr) => (
                  <option key={attr.id} value={attr.name}>
                    {attr.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addCustomAndPersist}
                disabled={!customName.trim()}
                className="px-3 py-1 bg-green-600 rounded text-sm disabled:opacity-50"
              >
                Anlegen & hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {savingThrows.length === 0 && (
          <div className="text-xs text-gray-500 italic text-center py-2">
            Noch keine Rettungswürfe — klicke oben auf „+ Aus Bibliothek".
          </div>
        )}
        {savingThrows.map((st) => {
          const attr = attributes.find((a) => a.name === st.attributeName);
          const attrValue = attr ? attr.value : 10;
          const attrMod = Math.floor((attrValue - 10) / 2);
          const totalBonus = attrMod + (st.isProficient ? proficiencyBonus : 0);

          let circleClass =
            'w-6 h-6 rounded-full border-2 border-gray-400 flex items-center justify-center text-xs';
          let circleContent = '';
          let label = '';
          if (st.isProficient && st.expertise) {
            circleClass += ' bg-purple-600 border-purple-600 text-white';
            circleContent = '★';
            label = 'Expertise';
          } else if (st.isProficient) {
            circleClass += ' bg-purple-400 border-purple-400 text-white';
            circleContent = '◐';
            label = 'Übung';
          } else {
            circleClass += ' bg-transparent border-gray-400';
            circleContent = '○';
          }

          return (
            <div
              key={st.id}
              className="flex items-center justify-between gap-2 bg-gray-800/50 rounded-lg p-2 group"
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm">{st.name}</span>
                <span className="text-xs text-gray-400">
                  ({st.attributeName}: {attrValue})
                </span>
                {label && (
                  <span className="text-xs text-purple-400 ml-1">{label}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono">
                  {totalBonus >= 0 ? `+${totalBonus}` : `${totalBonus}`}
                </span>
                <button
                  type="button"
                  onClick={() => cycleProficiency(st.id)}
                  className={circleClass}
                >
                  {circleContent}
                </button>
                <button
                  type="button"
                  onClick={() => removeSavingThrow(st.id)}
                  className="text-red-400 opacity-0 group-hover:opacity-100 transition"
                  title="Entfernen"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showNewAttributeForm && (
        <div className="mt-3 p-3 bg-gray-800 rounded-lg flex gap-2">
          <input
            type="text"
            placeholder="Name des neuen Attributs (z.B. Magie)"
            value={newAttributeName}
            onChange={(e) => setNewAttributeName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNewAttribute()}
            className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm"
            autoFocus
          />
          <button type="button"
            onClick={handleAddNewAttribute}
            className="px-3 bg-green-600 rounded text-sm"
          >
            Hinzufügen
          </button>
          <button type="button"
            onClick={() => setShowNewAttributeForm(false)}
            className="px-3 bg-gray-600 rounded text-sm"
          >
            Abbrechen
          </button>
        </div>
      )}
    </div>
  );
}