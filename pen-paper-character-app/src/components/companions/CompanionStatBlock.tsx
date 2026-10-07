// src/components/character/companions/CompanionStatBlock.tsx
'use client';

import { Companion } from '@/types/companions';
import { UnitSystem } from '@/types/character';
import { DiceButton } from '@/components/dice/DiceButton';
import { rollWeaponDamage, WeaponDamageRoll, DiceType } from '@/lib/dice';

interface CompanionStatBlockProps {
  companion: Companion;
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

function getModifier(value: number): number {
  return Math.floor((value - 10) / 2);
}

function getModifierText(value: number): string {
  const mod = getModifier(value);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function parseDamageExpression(expr: string): WeaponDamageRoll[] {
  if (!expr) return [];
  const parts = expr.split(',').map((p) => p.trim());
  const result: WeaponDamageRoll[] = [];
  for (const part of parts) {
    const match = part.match(/(\d+)\s*[dDwW]\s*(\d+)\s*(.*)/i);
    if (!match) continue;
    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const diceType = `d${sides}` as DiceType;
    const extra = match[3]?.trim() || '';
    let modifier: number | undefined;
    let damageType: string | undefined = undefined;
    const modMatch = extra.match(/^([+-]\d+)/);
    if (modMatch) modifier = parseInt(modMatch[1]);
    const textAfterMod = extra.replace(/^[+-]\d+\s*/, '').trim();
    if (textAfterMod) damageType = textAfterMod;
    result.push({ diceType, count, modifier, damageType });
  }
  return result;
}

export function CompanionStatBlock({
  companion,
  unitSystem,
  characterId,
  characterName,
  compact = false,
}: CompanionStatBlockProps) {
  const speeds: { label: string; value: number; icon: string }[] = [
    { label: 'Laufen', value: companion.speedWalk, icon: '🚶' },
    { label: 'Fliegen', value: companion.speedFly, icon: '🦅' },
    { label: 'Schwimmen', value: companion.speedSwim, icon: '🐟' },
    { label: 'Klettern', value: companion.speedClimb, icon: '🧗' },
    { label: 'Graben', value: companion.speedBurrow, icon: '⛏️' },
  ].filter((s) => s.value > 0);

  const attributes = [
    { label: 'STÄ', value: companion.strength },
    { label: 'GES', value: companion.dexterity },
    { label: 'KON', value: companion.constitution },
    { label: 'INT', value: companion.intelligence },
    { label: 'WEI', value: companion.wisdom },
    { label: 'CHA', value: companion.charisma },
  ];

  const handleAttackDamage = (attack: any) => {
    const rolls = parseDamageExpression(attack.damageDice);
    if (rolls.length === 0) return;
    const rollsWithType = rolls.map((r) => ({
      ...r,
      damageType: r.damageType || attack.damageType || undefined,
    }));
    rollWeaponDamage(rollsWithType, {
      reason: `${companion.name} – ${attack.name}`,
      sourceId: companion.id,
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
          <div className="text-xl font-bold text-blue-300">{companion.armorClass}</div>
        </div>
        <div className="bg-gray-800/60 rounded p-2 text-center">
          <div className="text-xs text-gray-400">TP</div>
          <div className="text-xl font-bold text-red-300">
            {companion.hpCurrent} / {companion.hpMax}
          </div>
          {companion.tempHp > 0 && (
            <div className="text-xs text-blue-400">🛡️ +{companion.tempHp}</div>
          )}
        </div>
        <div className="bg-gray-800/60 rounded p-2 text-center">
          <div className="text-xs text-gray-400">CR</div>
          <div className="text-xl font-bold text-purple-300">
            {companion.challengeRating}
          </div>
        </div>
        <div className="bg-gray-800/60 rounded p-2 text-center">
          <div className="text-xs text-gray-400">Größe</div>
          <div className="text-sm font-semibold">
            {SIZE_LABELS[companion.size] || companion.size}
          </div>
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

      {/* Sinne & Sprachen */}
      {(companion.senses || companion.languages) && !compact && (
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          {companion.senses && (
            <div>
              <span className="text-gray-500">Sinne:</span> {companion.senses}
            </div>
          )}
          {companion.languages && (
            <div>
              <span className="text-gray-500">Sprachen:</span> {companion.languages}
            </div>
          )}
        </div>
      )}

      {/* Angriffe */}
      {companion.attacks.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-orange-300 mb-1">⚔️ Angriffe</div>
          <div className="space-y-1">
            {companion.attacks.map((atk) => (
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
                      reason={`${companion.name} – ${atk.name} Angriff`}
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
                        onClick={() => handleAttackDamage(atk)}
                        className="px-2 py-1 text-xs bg-orange-600/50 hover:bg-orange-600 rounded transition"
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
      {companion.abilities.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-purple-300 mb-1">✨ Fähigkeiten</div>
          <div className="space-y-1">
            {companion.abilities.map((ability) => (
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

      {!compact && companion.notes && (
        <div className="bg-gray-800/40 rounded p-2 text-xs text-gray-300 whitespace-pre-wrap">
          📝 {companion.notes}
        </div>
      )}

      {!compact && companion.sourceReference && (
        <div className="text-xs text-gray-500">📖 {companion.sourceReference}</div>
      )}
    </div>
  );
}