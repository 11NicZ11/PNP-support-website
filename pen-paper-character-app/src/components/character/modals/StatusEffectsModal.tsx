// src/components/character/modals/StatusEffectsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useLibrary } from '@/hooks/useLibrary';

interface StatusEffect {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  duration: number | null;
  durationUnit: string | null;
  source: string | null;
  sourceName?: string | null;
  isConcentration?: boolean;
  linkedFeatureId?: string | null;
  libraryEntryId?: string | null;
}

interface StatusEffectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  characterId: string;
  currentEffects: StatusEffect[];
  conditionImmunities: string[];
  onUpdate: (effects: StatusEffect[]) => void;
}

export function StatusEffectsModal({
  isOpen,
  onClose,
  characterId,
  currentEffects,
  conditionImmunities,
  onUpdate,
}: StatusEffectsModalProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [custom, setCustom] = useState({
    name: '',
    description: '',
    icon: '✨',
  });

  const { entries: libraryEntries, loading, create } = useLibrary({
    type: 'status_effect',
  });

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isImmune = (name: string) =>
    conditionImmunities.some((i) => i.toLowerCase() === name.toLowerCase());

  const isActive = (name: string) =>
    currentEffects.some((e) => e.name === name);

  const isNew = characterId === 'new';

    const toggleEffect = async (effect: {
    name: string;
    description: string;
    icon: string;
    data?: any;
    libraryEntryId?: string | null;
  }) => {
    if (isImmune(effect.name)) return;

    const existing = currentEffects.find((e) => e.name === effect.name);

    if (existing) {
      if (!isNew) {
        try {
          await fetch(
            `/api/characters/${characterId}/status-effects/${existing.id}`,
            { method: 'DELETE' }
          );
        } catch (err) {
          console.error('Fehler beim Löschen des Status-Effekts:', err);
        }
      }
      onUpdate(currentEffects.filter((e) => e.id !== existing.id));
    } else {
      const payload = {
        name: effect.name,
        description: effect.description,
        icon: effect.icon,
        source: 'library',
        sourceName: null,
        duration: effect.data?.defaultDuration ?? null,
        durationUnit: effect.data?.durationUnit ?? null,
        libraryEntryId: effect.libraryEntryId ?? null,
      };

      if (isNew) {
        const localEffect: StatusEffect = {
          id: `temp-effect-${Date.now()}`,
          ...payload,
        };
        onUpdate([...currentEffects, localEffect]);
      } else {
        try {
          const res = await fetch(
            `/api/characters/${characterId}/status-effects`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }
          );
          if (res.ok) {
            const created = await res.json();
            onUpdate([...currentEffects, created]);
          }
        } catch (err) {
          console.error('Fehler beim Erstellen des Status-Effekts:', err);
        }
      }
    }
  };

    const addCustomAndPersist = async () => {
    const name = custom.name.trim();
    if (!name) return;

    const created = await create({
      type: 'status_effect',
      name,
      description: custom.description,
      icon: custom.icon,
    });

    await toggleEffect({
      name,
      description: custom.description,
      icon: custom.icon,
      libraryEntryId: created?.id ?? null,
    });

    setCustom({ name: '', description: '', icon: '✨' });
    setShowForm(false);
  };

  // Wichtig: .sort() mutiert das Array aus dem Hook-State → erst kopieren.
  const suggestions = [...libraryEntries].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl max-w-5xl w-full mx-4 border border-purple-500/30 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between sticky top-0 bg-gray-900">
          <h2 className="text-xl font-bold">✨ Status-Effekte</h2>
          <div className="flex items-center gap-3">
            <a
              href="/library?type=status_effect"
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

        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/2 border-r p-4 overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-md font-semibold text-purple-300">
                Verfügbare Effekte
              </h3>
              <button type="button"
                onClick={() => setShowForm(!showForm)}
                className="px-3 py-1 bg-purple-600 rounded-lg text-sm"
              >
                {showForm ? 'Abbrechen' : '+ Eigener'}
              </button>
            </div>

            {showForm && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-purple-500/40">
                <div className="text-xs text-gray-400 mb-2">
                  Neuer Effekt — landet in deiner Bibliothek und wird sofort aktiviert.
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
                <input
                  type="text"
                  placeholder="Icon (Emoji)"
                  value={custom.icon}
                  onChange={(e) =>
                    setCustom({ ...custom, icon: e.target.value })
                  }
                  maxLength={4}
                  className="w-full px-3 py-2 bg-gray-700 rounded-lg mb-2"
                />
                <div className="flex gap-2">
                  <button type="button"
                    onClick={addCustomAndPersist}
                    disabled={!custom.name.trim()}
                    className="flex-1 py-2 bg-green-600 rounded-lg disabled:opacity-50"
                  >
                    Anlegen & aktivieren
                  </button>
                  <button type="button"
                    onClick={() => {
                      setShowForm(false);
                      setCustom({ name: '', description: '', icon: '✨' });
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
                Keine Vorschläge — lege mit „+ Eigener" einen an.
              </div>
            )}

            <div className="space-y-2">
              {suggestions.map((e) => (
                <div
                  key={e.id}
                  className="relative"
                  onMouseEnter={() => setHovered(e.name)}
                  onMouseLeave={() => setHovered(null)}
                >
                                    <button type="button"
                    onClick={() =>
                      toggleEffect({
                        name: e.name,
                        description: e.description,
                        icon: e.icon,
                        data: e.data,
                        libraryEntryId: e.id,
                      })
                    }
                    disabled={isImmune(e.name)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 ${
                      isActive(e.name)
                        ? 'bg-purple-600/50 border border-purple-500'
                        : isImmune(e.name)
                        ? 'bg-gray-800/50 opacity-50'
                        : 'bg-gray-800/50 hover:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive(e.name) ? 'bg-green-400' : 'bg-gray-500'
                      }`}
                    />
                    <span className="text-xl">{e.icon}</span>
                    <span className="flex-1">{e.name}</span>
                    {isImmune(e.name) && (
                      <span className="text-xs text-purple-400">
                        🛡️ Immun
                      </span>
                    )}
                    {isActive(e.name) && !isImmune(e.name) && (
                      <span className="text-xs text-green-400">
                        ✓ Aktiv
                      </span>
                    )}
                  </button>
                  {hovered === e.name && e.description && (
                    <div className="absolute left-0 top-full mt-1 z-10 bg-gray-800 border border-purple-500 rounded-lg p-2 text-xs max-w-xs">
                      {e.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="w-1/2 p-4 overflow-y-auto">
            <h3 className="text-md font-semibold mb-4 text-green-300">
              Aktiv ({currentEffects.length})
            </h3>
            {currentEffects.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Keine aktiven Effekte</p>
                <p className="text-sm mt-2">Klicke links auf einen Effekt</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentEffects.map((e) => (
                  <div
                    key={e.id}
                    className="bg-purple-600/30 border border-purple-500 rounded-lg p-3 flex items-center gap-3"
                  >
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xl">{e.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{e.name}</div>
                      {e.duration && (
                        <div className="text-xs text-gray-400">
                          Dauer: {e.duration} {e.durationUnit}
                        </div>
                      )}
                    </div>
                    <button type="button"
                      onClick={() =>
                        toggleEffect({
                          name: e.name,
                          description: e.description || '',
                          icon: e.icon,
                        })
                      }
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

        <div className="p-4 border-t sticky bottom-0 bg-gray-900">
          <button type="button"
            onClick={onClose}
            className="w-full py-2 bg-purple-600 rounded-lg"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}