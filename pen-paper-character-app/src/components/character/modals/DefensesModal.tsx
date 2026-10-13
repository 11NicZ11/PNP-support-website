// src/components/character/modals/DefensesModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useLibrary } from '@/hooks/useLibrary';
import type { DefenseType, DefenseSource, DefenseItem } from '@/types/defense';

// Re-export so existing importers don't break.
export type { DefenseType, DefenseSource, DefenseItem };

interface DefensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: DefenseSource;
  sourceName?: string;
  defenses: DefenseItem[];
  onSave: (defenses: DefenseItem[]) => void;
  characterId?: string;
}

const TAB_TO_CATEGORY: Record<
  'immunities' | 'resistances' | 'conditions',
  DefenseType
> = {
  immunities: 'damage_immunity',
  resistances: 'damage_resistance',
  conditions: 'condition_immunity',
};

function newId(): string {
  return `def-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function DefensesModal({
  isOpen,
  onClose,
  source,
  sourceName,
  defenses,
  onSave,
}: DefensesModalProps) {
  const [activeTab, setActiveTab] = useState<
    'immunities' | 'resistances' | 'conditions'
  >('immunities');
  const [hovered, setHovered] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [custom, setCustom] = useState({ name: '', description: '' });
  const [local, setLocal] = useState<DefenseItem[]>([]);

  const { entries: libraryEntries, loading, create } = useLibrary({
    type: 'defense',
  });

  useEffect(() => {
    if (isOpen) {
      setLocal(defenses.map((d) => ({ ...d })));
    }
  }, [isOpen, defenses]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentType = TAB_TO_CATEGORY[activeTab];
  const currentItems = local.filter((d) => d.type === currentType);

  const isActive = (name: string) =>
    currentItems.some((i) => i.name === name);

  const suggestions = libraryEntries
    .filter((e) => e.category === currentType)
    .sort((a, b) => a.name.localeCompare(b.name));

    const addItem = (item: {
    name: string;
    description: string;
    libraryEntryId?: string | null;
  }) => {
    if (isActive(item.name)) return;
    const newItem: DefenseItem = {
      id: newId(),
      type: currentType,
      name: item.name,
      description: item.description || null,
      source,
      sourceName: sourceName || null,
      isCustom: true,
      libraryEntryId: item.libraryEntryId ?? null,
    };
    setLocal([...local, newItem]);
  };

  const removeItem = (id: string) => {
    setLocal(local.filter((d) => d.id !== id));
  };

  const handleSave = () => {
    onSave(local);
    onClose();
  };

    const addCustomAndPersist = async () => {
    if (!custom.name.trim()) return;
    const name = custom.name.trim();

    const created = await create({
      type: 'defense',
      category: currentType,
      name,
      description: custom.description,
      icon:
        currentType === 'damage_immunity'
          ? '✨'
          : currentType === 'damage_resistance'
          ? '🛡️'
          : '💪',
    });

    addItem({
      name,
      description: custom.description,
      libraryEntryId: created?.id ?? null,
    });

    setCustom({ name: '', description: '' });
    setShowForm(false);
  };

  const libraryUrl = `/library?type=defense&category=${currentType}`;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
      <div className="bg-gray-900 rounded-xl max-w-5xl w-full mx-4 border border-purple-500/30 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between sticky top-0 bg-gray-900">
          <div>
            <h2 className="text-xl font-bold">🛡️ Verteidigungen</h2>
            {sourceName && (
              <p className="text-xs text-gray-400">
                Quelle: {sourceName} ({source})
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <a
              href={libraryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs"
              title="Bibliothek in neuem Tab öffnen"
            >
              📚 Bibliothek
            </a>
            <button type="button" onClick={onClose} className="text-2xl">
              ×
            </button>
          </div>
        </div>

        <div className="flex border-b px-4">
          <button type="button"
            onClick={() => setActiveTab('immunities')}
            className={`px-4 py-2 text-sm ${
              activeTab === 'immunities'
                ? 'border-b-2 border-purple-500 text-purple-400'
                : 'text-gray-400'
            }`}
          >
            ✨ Immunitäten (
            {local.filter((d) => d.type === 'damage_immunity').length})
          </button>
          <button type="button"
            onClick={() => setActiveTab('resistances')}
            className={`px-4 py-2 text-sm ${
              activeTab === 'resistances'
                ? 'border-b-2 border-purple-500 text-purple-400'
                : 'text-gray-400'
            }`}
          >
            🛡️ Resistenzen (
            {local.filter((d) => d.type === 'damage_resistance').length})
          </button>
          <button type="button"
            onClick={() => setActiveTab('conditions')}
            className={`px-4 py-2 text-sm ${
              activeTab === 'conditions'
                ? 'border-b-2 border-purple-500 text-purple-400'
                : 'text-gray-400'
            }`}
          >
            💪 Zustandsimmunitäten (
            {local.filter((d) => d.type === 'condition_immunity').length})
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/2 border-r p-4 overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-md font-semibold text-purple-300">
                Aus Bibliothek
              </h3>
              <button type="button"
                onClick={() => setShowForm(!showForm)}
                className="px-3 py-1 bg-purple-600 rounded-lg text-sm"
              >
                + Eigene
              </button>
            </div>

            {showForm && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-purple-500/40">
                <div className="text-xs text-gray-400 mb-2">
                  Neuer Eintrag — landet in deiner Bibliothek und wird sofort hinzugefügt.
                </div>
                <input
                  type="text"
                  placeholder="Name"
                  value={custom.name}
                  onChange={(e) =>
                    setCustom({ ...custom, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg mb-2"
                  autoFocus
                />
                <textarea
                  placeholder="Beschreibung"
                  rows={2}
                  value={custom.description}
                  onChange={(e) =>
                    setCustom({ ...custom, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg mb-2 resize-none"
                />
                <div className="flex gap-2">
                  <button type="button"
                    onClick={addCustomAndPersist}
                    disabled={!custom.name.trim()}
                    className="flex-1 py-2 bg-green-600 rounded-lg disabled:opacity-50"
                  >
                    Anlegen & hinzufügen
                  </button>
                  <button type="button"
                    onClick={() => {
                      setShowForm(false);
                      setCustom({ name: '', description: '' });
                    }}
                    className="flex-1 py-2 bg-gray-600 rounded-lg"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}

            {loading && (
              <div className="text-center text-gray-500 text-sm py-4">
                Lade Bibliothek…
              </div>
            )}

            {!loading && suggestions.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4 italic">
                Keine Vorschläge — lege mit „+ Eigene" einen an.
              </div>
            )}

            <div className="space-y-2">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className="relative"
                  onMouseEnter={() => setHovered(s.name)}
                  onMouseLeave={() => setHovered(null)}
                >
                                    <button type="button"
                    onClick={() =>
                      !isActive(s.name) &&
                      addItem({
                        name: s.name,
                        description: s.description,
                        libraryEntryId: s.id,
                      })
                    }
                    disabled={isActive(s.name)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                      isActive(s.name)
                        ? 'bg-purple-600/50 border border-purple-500'
                        : 'bg-gray-800/50 hover:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive(s.name) ? 'bg-green-400' : 'bg-gray-500'
                      }`}
                    />
                    <span>{s.name}</span>
                    {isActive(s.name) && (
                      <span className="text-xs text-green-400 ml-auto">
                        ✓ Aktiv
                      </span>
                    )}
                  </button>
                  {hovered === s.name && s.description && (
                    <div className="absolute left-0 top-full mt-1 z-10 bg-gray-800 border border-purple-500 rounded-lg p-2 text-xs max-w-xs">
                      {s.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="w-1/2 p-4 overflow-y-auto">
            <h3 className="text-md font-semibold mb-4 text-green-300">
              Aktiv ({currentItems.length})
            </h3>
            {currentItems.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Keine aktiven Einträge</p>
                <p className="text-sm mt-2">Klicke links auf einen Vorschlag</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-purple-600/30 border border-purple-500 rounded-lg p-3 flex items-center gap-3"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-400">
                          {item.description}
                        </div>
                      )}
                    </div>
                    <button type="button"
                      onClick={() => removeItem(item.id)}
                      className="px-2 py-1 bg-red-600/50 rounded text-xs"
                    >
                      Entfernen
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t flex gap-3 sticky bottom-0 bg-gray-900">
          <button type="button"
            onClick={handleSave}
            className="flex-1 py-2 bg-green-600 rounded-lg"
          >
            Übernehmen
          </button>
          <button type="button"
            onClick={onClose}
            className="flex-1 py-2 bg-gray-700 rounded-lg"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}