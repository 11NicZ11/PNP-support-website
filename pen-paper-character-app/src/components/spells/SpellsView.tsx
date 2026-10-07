// src/components/character/spells/views/SpellsView.tsx
'use client';

import { Spell, SpellSlot, SPELL_LEVEL_LABELS } from '@/types/spells';
import { UnitSystem } from '@/types/character';
import { Attribute } from '@/components/character/editors/AttributesEditor';
import { ClassLevel } from '@/components/character/editors/ClassLevelsEditor';
import { SpellCard } from './SpellCard';
import { SpellcastingHeader } from './SpellcastingHeader';

interface SpellsViewProps {
  spells: Spell[];
  spellSlots: SpellSlot[];
  unitSystem: UnitSystem;
  characterName?: string;
  classLevels?: ClassLevel[];
  attributes?: Attribute[];
  proficiencyBonus?: number;
  onCastConcentration?: (spell: Spell) => void;
}

export function SpellsView({
  spells,
  spellSlots,
  unitSystem,
  characterName,
  classLevels = [],
  attributes = [],
  proficiencyBonus = 2,
  onCastConcentration,
}: SpellsViewProps) {
  const cantrips = spells.filter((s) => s.level === 0);

  const getSlot = (rank: number): SpellSlot => {
    return spellSlots.find((s) => s.rank === rank) || { rank, total: 0, used: 0 };
  };

  const ranksToShow = Array.from(
    new Set([
      ...spells.filter((s) => s.level > 0).map((s) => s.level),
      ...spellSlots.filter((s) => s.rank > 0 && s.total > 0).map((s) => s.rank),
    ])
  ).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* 🔥 Spellcasting-Header */}
      <SpellcastingHeader
        classLevels={classLevels}
        attributes={attributes}
        proficiencyBonus={proficiencyBonus}
        spellSlots={spellSlots}
      />

      {spells.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <p>Keine Zauber vorhanden.</p>
        </div>
      )}

      {/* ZAUBERTRICKS */}
      {cantrips.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-purple-400">
              ✨ {SPELL_LEVEL_LABELS[0]}
            </h3>
            <span className="text-xs text-gray-500">unbegrenzt nutzbar</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {cantrips.map((spell) => (
              <SpellCard
                key={spell.id}
                spell={spell}
                unitSystem={unitSystem}
                characterName={characterName}
                onCastConcentration={onCastConcentration}
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
              <h3 className="text-sm font-semibold text-purple-400">
                {SPELL_LEVEL_LABELS[rank] || `Grad ${rank}`}
              </h3>
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
                    characterName={characterName}
                    onCastConcentration={onCastConcentration}
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

      {ranksToShow.length === 0 && cantrips.length === 0 && spells.length > 0 && (
        <div className="text-center text-gray-500 text-sm">
          Keine Zauber mit Grad eingetragen.
        </div>
      )}
    </div>
  );
}