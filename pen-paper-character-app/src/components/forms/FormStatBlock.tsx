// src/components/character/forms/FormStatBlock.tsx
'use client';

import { AlternateForm } from '@/types/forms';
import { UnitSystem } from '@/types/character';
import { DiceButton } from '@/components/dice/DiceButton';
import { rollWeaponDamage, parseDamageExpression } from '@/lib/dice';
import { getModifierText } from '@/lib/utils';

interface FormStatBlockProps {
  form: AlternateForm;
  unitSystem: UnitSystem;
  characterId?: string;
  characterName?: string;
  compact?: boolean;
}

const SIZE_LABELS: Record<string, string> = {
  tiny: 'Winzig',
  small: 'Klein',
  medium: 'Mittel',
  large: 'Groß',
  huge: 'Riesig',
  gargantuan: 'Gigantisch',
};

export function FormStatBlock({
  form,
  unitSystem,
  characterId,
  characterName,
  compact = false,
}: FormStatBlockProps) {
  const speeds: { label: string; value: number; icon: string }[] = [
    { label: 'Laufen', value: form.speedWalk, icon: '🚶' },
    { label: 'Fliegen', value: form.speedFly, icon: '🦅' },
    { label: 'Schwimmen', value: form.speedSwim, icon: '🐟' },
    { label: 'Klettern', value: form.speedClimb, icon: '🧗' },
    { label: 'Graben', value: form.speedBurrow, icon: '⛏️' },
  ].filter((s) => s.value > 0);

  const attributes = [
    { label: 'STÄ', value: form.strength },
    { label: 'GES', value: form.dexterity },
    { label: 'KON', value: form.constitution },
    { label: 'INT', value: form.intelligence },
    { label: 'WEI', value: form.wisdom },
    { label: 'CHA', value: form.charisma },
  ];

  const handleAttackRoll = (attack: any) => {
    const rolls = parseDamageExpression(attack.damageDice);
    if (rolls.length === 0) return;
    const rollsWithType = rolls.map((r) => ({
      ...r,
      damageType: r.damageType || attack.damageType || undefined,
    }));
    rollWeaponDamage(rollsWithType, {
      reason: `${form.name} – ${attack.name}`,
      sourceId: form.id,
      sourceName: attack.name,
      characterId,
      characterName,
      sourceType: 'feature',
    });
  };

  return (
    <div className="space-y-3">
      {/* Kern-Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-gray-800/60 rounded p-2 text-center">
          <div className="text-xs text-gray-400">RK</div>
          <div className="text-xl font-bold text-blue-300">{form.armorClass}</div>
        </div>
        <div className="bg-gray-800/60 rounded p-2 text-center">
          <div className="text-xs text-gray-400">TP</div>
          <div className="text-xl font-bold text-red-300">
            {form.hpCurrent} / {form.hpMax}
          </div>
        </div>
        <div className="bg-gray-800/60 rounded p-2 text-center">
          <div className="text-xs text-gray-400">CR</div>
          <div className="text-xl font-bold text-purple-300">{form.challengeRating}</div>
        </div>
        <div className="bg-gray-800/60 rounded p-2 text-center">
          <div className="text-xs text-gray-400">Größe</div>
          <div className="text-sm font-semibold">{SIZE_LABELS[form.size] || form.size}</div>
        </div>
      </div>

      {/* Attribute */}
      <div className="grid grid-cols-6 gap-1">
        {attributes.map((attr) => (
          <div key={attr.label} className="bg-gray-800/60 rounded p-1.5 text-center">
            <div className="text-xs text-gray-400">{attr.label}</div>
            <div className="text-sm font-bold">{attr.value}</div>
            <div className="text-xs text-purple-300">{getModifierText(attr.value)}</div>
          </div>
        ))}
      </div>

      {/* Bewegungsraten */}
      {speeds.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {speeds.map((s) => (
            <span
              key={s.label}
              className="bg-gray-800/60 rounded px-2 py-1 flex items-center gap-1"
            >
              <span>{s.icon}</span>
              <span className="text-gray-400">{s.label}:</span>
              <span className="font-mono text-cyan-300">
                {unitSystem === 'imperial'
                  ? `${Math.round(s.value * 3.28084)} ft`
                  : `${Math.round(s.value * 0.3048 * 10) / 10} m`}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Angriffe */}
      {form.attacks.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-orange-300 mb-1">
            ⚔️ Angriffe
          </div>
          <div className="space-y-1">
            {form.attacks.map((atk) => (
              <div
                key={atk.id}
                className="bg-gray-800/50 rounded p-2 flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{atk.name}</div>
                  <div className="text-xs text-gray-400 flex flex-wrap gap-2">
                    <span className="text-green-400">
                      {atk.attackBonus >= 0 ? `+${atk.attackBonus}` : atk.attackBonus} Angriff
                    </span>
                    {atk.damageDice && (
                      <span className="text-orange-400">
                        {atk.damageDice}
                        {atk.damageType ? ` ${atk.damageType}` : ''}
                      </span>
                    )}
                    {atk.range && <span>📏 {atk.range}</span>}
                  </div>
                </div>
                {(atk.damageDice || atk.attackBonus !== 0) && (
                  <div className="flex gap-1">
                    <DiceButton
                      diceType="d20"
                      modifier={atk.attackBonus}
                      reason={`${form.name} – ${atk.name} Angriff`}
                      characterId={characterId}
                      characterName={characterName}
                      sourceType="feature"
                      sourceName={atk.name}
                      className="px-2 py-1 text-xs bg-green-600/50 hover:bg-green-600"
                    >
                      🎯
                    </DiceButton>
                    {atk.damageDice && (
                      <button
                        type="button"
                        onClick={() => handleAttackRoll(atk)}
                        className="px-2 py-1 text-xs bg-orange-600/50 hover:bg-orange-600 rounded transition"
                        title={`${atk.damageDice} würfeln`}
                      >
                        🎲
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fähigkeiten */}
      {form.abilities.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-purple-300 mb-1">
            ✨ Fähigkeiten
          </div>
          <div className="space-y-1">
            {form.abilities.map((ability) => (
              <div key={ability.id} className="bg-gray-800/50 rounded p-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{ability.name}</span>
                  {ability.type !== 'passive' && (
                    <span className="text-xs text-gray-400">
                      {ability.type === 'action'
                        ? '⚡ Aktion'
                        : ability.type === 'bonus_action'
                        ? '✨ Bonusaktion'
                        : '🔄 Reaktion'}
                    </span>
                  )}
                </div>
                {ability.description && (
                  <div className="text-xs text-gray-400 mt-1 whitespace-pre-wrap">
                    {ability.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!compact && form.description && (
        <div className="bg-gray-800/40 rounded p-2 text-xs text-gray-300 whitespace-pre-wrap">
          {form.description}
        </div>
      )}

      {!compact && form.sourceReference && (
        <div className="text-xs text-gray-500">📖 {form.sourceReference}</div>
      )}
    </div>
  );
}