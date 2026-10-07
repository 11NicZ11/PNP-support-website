// src/components/character/forms/CharacterBasicFields.tsx
'use client';

import { LevelingMode, UnitSystem } from '@/types/character';

interface CharacterBasicFieldsProps {
  name: string;
  onNameChange: (v: string) => void;
  levelingMode: LevelingMode;
  onLevelingModeChange: (v: LevelingMode) => void;
  unitSystem: UnitSystem;
  onUnitSystemChange: (v: UnitSystem) => void;
  disabled?: boolean;
}

export function CharacterBasicFields({
  name,
  onNameChange,
  levelingMode,
  onLevelingModeChange,
  unitSystem,
  onUnitSystemChange,
  disabled = false,
}: CharacterBasicFieldsProps) {
  return (
    <div className="bg-gray-800/30 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Name des Charakters"
            required
            disabled={disabled}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Leveling-Modus
          </label>
          <div className="flex gap-2">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                checked={levelingMode === 'milestone'}
                onChange={() => onLevelingModeChange('milestone')}
                disabled={disabled}
              />
              Meilenstein
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                checked={levelingMode === 'exp'}
                onChange={() => onLevelingModeChange('exp')}
                disabled={disabled}
              />
              EXP
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Einheitensystem
          </label>
          <div className="flex gap-2">
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                checked={unitSystem === 'metric'}
                onChange={() => onUnitSystemChange('metric')}
                disabled={disabled}
              />
              Metrisch
            </label>
            <label className="flex items-center gap-1 text-sm">
              <input
                type="radio"
                checked={unitSystem === 'imperial'}
                onChange={() => onUnitSystemChange('imperial')}
                disabled={disabled}
              />
              Imperial
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}