// pen-paper-character-app\src\components\character\view\AbilityScoreIncreaseView.tsx

'use client';

import { AbilityScoreIncrease } from '@/types/abilityScoreIncrease';

interface AbilityScoreIncreaseViewProps {
  value: AbilityScoreIncrease;
  label?: string;
}

export function AbilityScoreIncreaseView({
  value,
  label = 'Attributs-Boni',
}: AbilityScoreIncreaseViewProps) {
  if (!value || Object.keys(value.bonuses || {}).length === 0) {
    return null;
  }

  const typeLabel =
    value.type === 'standard'
      ? '+2/+1'
      : value.type === 'three_plus_one'
      ? '+1 in 3 Statuswerten'
      : 'Flexibel';

  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      <h3 className="text-md font-semibold text-purple-300 mb-2">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {Object.entries(value.bonuses).map(([attr, bonus]) => (
          <span key={attr} className="px-2 py-1 bg-green-600/30 rounded-lg text-sm">
            {attr}: +{bonus}
          </span>
        ))}
      </div>
      <div className="text-xs text-gray-400 mt-1">Typ: {typeLabel}</div>
    </div>
  );
}