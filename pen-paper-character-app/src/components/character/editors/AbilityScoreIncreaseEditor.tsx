// pen-paper-character-app\src\components\character\edit\AbilityScoreIncreaseEditor.tsx

'use client';

interface AbilityScoreIncrease {
  type: 'standard' | 'three_plus_one';
  bonuses: Record<string, number>;
}

interface AbilityScoreIncreaseEditorProps {
  value: AbilityScoreIncrease;
  onChange: (value: AbilityScoreIncrease) => void;
  availableAttributes: string[];
  label?: string;
}

export function AbilityScoreIncreaseEditor({
  value,
  onChange,
  availableAttributes,
  label = 'Attributs-Boni',
}: AbilityScoreIncreaseEditorProps) {
  const addStandardBonus = (attr: string, bonus: number) => {
    const newBonuses = { ...value.bonuses };
    const currentBonus = newBonuses[attr] || 0;
    
    if (bonus === 2) {
      Object.keys(newBonuses).forEach(key => {
        if (key !== attr) {
          if (newBonuses[key] === 2) {
            delete newBonuses[key];
          } else if (newBonuses[key] === 3) {
            newBonuses[key] = 1;
          }
        }
      });
      
      const hasPlus1 = currentBonus === 1 || currentBonus === 3;
      
      if (currentBonus === 2) {
        if (hasPlus1) {
          newBonuses[attr] = 1;
        } else {
          delete newBonuses[attr];
        }
      } else if (currentBonus === 3) {
        newBonuses[attr] = 1;
      } else {
        newBonuses[attr] = hasPlus1 ? 3 : 2;
      }
      
    } else if (bonus === 1) {
      Object.keys(newBonuses).forEach(key => {
        if (key !== attr) {
          if (newBonuses[key] === 1) {
            delete newBonuses[key];
          } else if (newBonuses[key] === 3) {
            newBonuses[key] = 2;
          }
        }
      });
      
      const hasPlus2 = currentBonus === 2 || currentBonus === 3;
      
      if (currentBonus === 1) {
        if (hasPlus2) {
          newBonuses[attr] = 2;
        } else {
          delete newBonuses[attr];
        }
      } else if (currentBonus === 3) {
        newBonuses[attr] = 2;
      } else {
        newBonuses[attr] = hasPlus2 ? 3 : 1;
      }
    }
    
    onChange({ ...value, bonuses: newBonuses });
  };

  const addThreePlusOneBonus = (attr: string) => {
    const newBonuses = { ...value.bonuses };
    
    if (newBonuses[attr]) {
      delete newBonuses[attr];
      onChange({ ...value, bonuses: newBonuses });
      return;
    }

    if (Object.keys(newBonuses).length >= 3) {
      alert('Du kannst maximal 3 Attribute auswählen!');
      return;
    }

    newBonuses[attr] = 1;
    onChange({ ...value, bonuses: newBonuses });
  };

  const setAbilityScoreType = (type: 'standard' | 'three_plus_one') => {
    onChange({
      ...value,
      type,
      bonuses: {},
    });
  };

  const getBonusDisplay = (attr: string): { plus2: boolean; plus1: boolean } => {
    const val = value.bonuses[attr] || 0;
    return {
      plus2: val === 2 || val === 3,
      plus1: val === 1 || val === 3,
    };
  };

  const renderStandardSelection = (bonus: number) => {
    return (
      <div className="flex flex-wrap gap-2">
        {availableAttributes.map(attr => {
          const display = getBonusDisplay(attr);
          const isSelected = bonus === 2 ? display.plus2 : display.plus1;
          
          return (
            <button
              key={attr}
              type="button"
              onClick={() => addStandardBonus(attr, bonus)}
              className={`px-3 py-1 rounded text-sm transition ${
                isSelected
                  ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {attr}
            </button>
          );
        })}
      </div>
    );
  };

  const renderThreePlusOneSelection = () => {
    return (
      <div className="flex flex-wrap gap-2">
        {availableAttributes.map(attr => {
          const display = getBonusDisplay(attr);
          const isSelected = display.plus1;
          
          return (
            <button
              key={attr}
              type="button"
              onClick={() => addThreePlusOneBonus(attr)}
              className={`px-3 py-1 rounded text-sm transition ${
                isSelected
                  ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {attr}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <label className="text-sm block mb-1">{label}</label>
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setAbilityScoreType('standard')}
          className={`px-2 py-1 rounded text-sm ${value.type === 'standard' ? 'bg-purple-600' : 'bg-gray-700'}`}
        >
          +2/+1
        </button>
        <button
          type="button"
          onClick={() => setAbilityScoreType('three_plus_one')}
          className={`px-2 py-1 rounded text-sm ${value.type === 'three_plus_one' ? 'bg-purple-600' : 'bg-gray-700'}`}
        >
          +1 in 3 Statuswerten
        </button>
      </div>

      {value.type === 'standard' && (
        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-400 block mb-1">+2 Attribut (wähle eines):</span>
            {renderStandardSelection(2)}
          </div>
          <div>
            <span className="text-sm text-gray-400 block mb-1">+1 Attribut (wähle eines):</span>
            {renderStandardSelection(1)}
          </div>
          <div className="text-xs text-gray-500">
            💡 Wähle ein Attribut für +2 und ein Attribut für +1 (kann auch das gleiche sein)
          </div>
        </div>
      )}

      {value.type === 'three_plus_one' && (
        <div>
          <span className="text-sm text-gray-400 block mb-1">+1 in 3 Attributen (wähle 3):</span>
          {renderThreePlusOneSelection()}
          <div className="text-xs text-gray-400 mt-1">
            Ausgewählt: {Object.keys(value.bonuses).length}/3
          </div>
          <div className="text-xs text-gray-500 mt-1">
            💡 Wähle drei verschiedene Attribute für je +1
          </div>
        </div>
      )}
    </div>
  );
}