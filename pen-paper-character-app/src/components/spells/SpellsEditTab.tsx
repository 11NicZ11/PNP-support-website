// src/components/character/spells/edit/SpellsEditTab.tsx
'use client';

import { useState } from 'react';
import { Spell, SpellSlot, SPELL_LEVEL_LABELS } from '@/types/spells';
import { UnitSystem } from '@/types/character';
import { Attribute } from '@/components/character/editors/AttributesEditor';
import { ClassLevel } from '@/components/character/editors/ClassLevelsEditor';
import { SpellCard } from './SpellCard';
import { SpellSlotsEditor } from './SpellSlotsEditor';
import { SpellcastingHeader } from './SpellcastingHeader';

interface SpellsEditTabProps {
  characterId: string;
  spells: Spell[];
  onSpellsUpdate: (spells: Spell[]) => void;
  spellSlots: SpellSlot[];
  onSpellSlotsUpdate: (slots: SpellSlot[]) => void;
  unitSystem: UnitSystem;
  onAddSpell: () => void;
  onEditSpell: (spell: Spell) => void;
  onCastConcentration?: (spell: Spell) => void;
  characterName?: string;
  classLevels?: ClassLevel[];
  attributes?: Attribute[];
  proficiencyBonus?: number;
}

export function SpellsEditTab({
  characterId,
  spells,
  onSpellsUpdate,
  spellSlots,
  onSpellSlotsUpdate,
  unitSystem,
  onAddSpell,
  onEditSpell,
  onCastConcentration,
  characterName,
  classLevels = [],
  attributes = [],
  proficiencyBonus = 2,
}: SpellsEditTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSlotsEditor, setShowSlotsEditor] = useState(false);

  const isNew = characterId === 'new';

  const handleDelete = async (spellId: string) => {
    if (!confirm('Möchtest du diesen Zauber wirklich löschen?')) return;

    setIsLoading(true);
    setError(null);

    if (isNew) {
      onSpellsUpdate(spells.filter((s) => s.id !== spellId));
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/characters/${characterId}/spells/${spellId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        onSpellsUpdate(spells.filter((s) => s.id !== spellId));
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Löschen');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePrepared = async (spellId: string, prepared: boolean) => {
    if (isNew) {
      onSpellsUpdate(
        spells.map((s) => (s.id === spellId ? { ...s, prepared } : s))
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/characters/${characterId}/spells/${spellId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prepared }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        onSpellsUpdate(spells.map((s) => (s.id === spellId ? updated : s)));
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Aktualisieren');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlotsChange = async (newSlots: SpellSlot[]) => {
    onSpellSlotsUpdate(newSlots);

    if (isNew) return;

    try {
      await fetch(`/api/characters/${characterId}/spell-slots`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slots: newSlots }),
      });
    } catch (err) {
      console.error('Fehler beim Speichern der Slots:', err);
    }
  };

  const getSlot = (rank: number): SpellSlot => {
    return spellSlots.find((s) => s.rank === rank) || { rank, total: 0, used: 0 };
  };

  const cantrips = spells.filter((s) => s.level === 0);

  const ranksToShow = Array.from(
    new Set([
      ...spells.filter((s) => s.level > 0).map((s) => s.level),
      ...spellSlots.filter((s) => s.rank > 0 && s.total > 0).map((s) => s.rank),
    ])
  ).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded-lg">{error}</div>
      )}

      {/* 🔥 Spellcasting-Header */}
      <SpellcastingHeader
        classLevels={classLevels}
        attributes={attributes}
        proficiencyBonus={proficiencyBonus}
        spellSlots={spellSlots}
      />

      {/* ACTIONS */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-lg font-semibold">✨ Zauberliste</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowSlotsEditor(!showSlotsEditor)}
            className={`px-3 py-2 rounded-lg text-sm transition ${
              showSlotsEditor
                ? 'bg-purple-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            🔋 Zauberplätze
          </button>
          <button
            type="button"
            onClick={onAddSpell}
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
          >
            + Zauber hinzufügen
          </button>
        </div>
      </div>

      {showSlotsEditor && (
        <SpellSlotsEditor slots={spellSlots} onChange={handleSlotsChange} />
      )}

      {/* ZAUBERTRICKS */}
      {cantrips.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-purple-400">
              ✨ {SPELL_LEVEL_LABELS[0]}
            </h4>
            <span className="text-xs text-gray-500">unbegrenzt nutzbar</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {cantrips.map((spell) => (
              <SpellCard
                key={spell.id}
                spell={spell}
                unitSystem={unitSystem}
                editable
                onDelete={handleDelete}
                onEdit={onEditSpell}
                onTogglePrepared={handleTogglePrepared}
                onCastConcentration={onCastConcentration}
                isLoading={isLoading}
                characterName={characterName}
              />
            ))}
          </div>
        </div>
      )}

      {/* RÄNGE */}
      {ranksToShow.map((rank) => {
        const slot = getSlot(rank);
        const available = Math.max(0, slot.total - slot.used);
        const rankSpells = spells
          .filter((s) => s.level === rank)
          .sort((a, b) => a.name.localeCompare(b.name));

        return (
          <div key={rank}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-purple-400">
                {SPELL_LEVEL_LABELS[rank] || `Grad ${rank}`}
              </h4>
              {slot.total > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">
                    <span
                      className={
                        available === 0
                          ? 'text-red-400'
                          : available <= slot.total / 2
                          ? 'text-yellow-400'
                          : 'text-green-400'
                      }
                    >
                      {available}
                    </span>
                    <span className="text-gray-500"> / {slot.total}</span>
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: slot.total }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < available ? 'bg-purple-500' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            {rankSpells.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {rankSpells.map((spell) => (
                  <SpellCard
                    key={spell.id}
                    spell={spell}
                    unitSystem={unitSystem}
                    editable
                    onDelete={handleDelete}
                    onEdit={onEditSpell}
                    onTogglePrepared={handleTogglePrepared}
                    onCastConcentration={onCastConcentration}
                    isLoading={isLoading}
                    characterName={characterName}
                  />
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500 italic px-1">
                Keine Zauber auf diesem Grad eingetragen.
              </div>
            )}
          </div>
        );
      })}

      {spells.length === 0 && (
        <div className="text-center text-gray-400 py-8 bg-gray-800/30 rounded-lg">
          <p>Keine Zauber vorhanden.</p>
          <p className="text-sm mt-1">
            Klicke auf &quot;+ Zauber hinzufügen&quot; um zu beginnen.
          </p>
        </div>
      )}
    </div>
  );
}