// src/components/character/spells/edit/SpellSlotsEditor.tsx
'use client';

import { SpellSlot } from '@/types/spells';

interface SpellSlotsEditorProps {
  slots: SpellSlot[];
  onChange: (slots: SpellSlot[]) => void;
  readOnly?: boolean;
}

const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export function SpellSlotsEditor({
  slots,
  onChange,
  readOnly = false,
}: SpellSlotsEditorProps) {
  const getSlot = (rank: number): SpellSlot => {
    return slots.find((s) => s.rank === rank) || { rank, total: 0, used: 0 };
  };

  const updateSlot = (rank: number, field: 'total' | 'used', value: number) => {
    const existing = slots.find((s) => s.rank === rank);
    let updated: SpellSlot[];

    if (existing) {
      updated = slots.map((s) =>
        s.rank === rank ? { ...s, [field]: Math.max(0, value) } : s
      );
    } else {
      updated = [
        ...slots,
        { rank, total: 0, used: 0, [field]: Math.max(0, value) },
      ];
    }

    updated = updated.map((s) =>
      s.used > s.total ? { ...s, used: s.total } : s
    );

    onChange(updated);
  };

  const resetAll = () => {
    onChange(slots.map((s) => ({ ...s, used: 0 })));
  };

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-purple-500/20">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">🔋 Zauberplätze verwalten</h3>
        {!readOnly && (
          <button
            type="button"
            onClick={resetAll}
            className="px-3 py-1 text-xs bg-blue-600 rounded hover:bg-blue-700 transition"
          >
            🔄 Alle zurücksetzen
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {RANKS.map((rank) => {
          const slot = getSlot(rank);
          const available = Math.max(0, slot.total - slot.used);
          return (
            <div
              key={rank}
              className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-2"
            >
              <span className="text-sm font-semibold w-16">Grad {rank}</span>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 block">Max</label>
                  <input
                    type="number"
                    min={0}
                    value={slot.total}
                    onChange={(e) =>
                      updateSlot(rank, 'total', parseInt(e.target.value) || 0)
                    }
                    disabled={readOnly}
                    className="w-full px-2 py-1 bg-gray-700 rounded text-sm text-center disabled:opacity-50"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 block">Verbraucht</label>
                  <input
                    type="number"
                    min={0}
                    max={slot.total}
                    value={slot.used}
                    onChange={(e) =>
                      updateSlot(rank, 'used', parseInt(e.target.value) || 0)
                    }
                    disabled={readOnly}
                    className="w-full px-2 py-1 bg-gray-700 rounded text-sm text-center disabled:opacity-50"
                  />
                </div>
                <div className="text-xs text-purple-400 whitespace-nowrap pt-4">
                  {available} / {slot.total}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        💡 Zaubertricks (Grad 0) benötigen keine Slots und sind unbegrenzt einsetzbar.
      </p>
    </div>
  );
}