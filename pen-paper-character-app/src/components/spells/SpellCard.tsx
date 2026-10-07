// src/components/character/spells/views/SpellCard.tsx
'use client';

import { useState } from 'react';
import {
  Spell,
  SPELL_SCHOOLS,
  AOE_SHAPES,
  CASTING_TIME_OPTIONS,
} from '@/types/spells';
import { UnitSystem } from '@/types/character';
import { formatDistance } from '@/lib/units';
import { rollWeaponDamage, WeaponDamageRoll, DiceType } from '@/lib/dice';

interface SpellCardProps {
  spell: Spell;
  unitSystem: UnitSystem;
  onDelete?: (id: string) => void;
  onEdit?: (spell: Spell) => void;
  onTogglePrepared?: (id: string, prepared: boolean) => void;
  onCastConcentration?: (spell: Spell) => void;   // 🔥 NEU
  isLoading?: boolean;
  editable?: boolean;
  characterName?: string;
}

const VALID_DICE_TYPES: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

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
    if (!VALID_DICE_TYPES.includes(diceType)) continue;
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

export function SpellCard({
  spell,
  unitSystem,
  onDelete,
  onEdit,
  onTogglePrepared,
  onCastConcentration,
  isLoading = false,
  editable = false,
  characterName,
}: SpellCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const schoolData = SPELL_SCHOOLS.find((s) => s.value === spell.school);
  const aoeShapeData = AOE_SHAPES.find((s) => s.value === spell.aoeShape);

  const componentLabels: Record<string, string> = { V: '💬', S: '🤚', M: '🔮' };

  const castingShort = (() => {
    if (!spell.castingTime) return null;
    const opt = CASTING_TIME_OPTIONS.find((o) => o.value === spell.castingTime);
    return opt ? opt.short : spell.castingTime;
  })();

  const castingTooltip = (() => {
    if (!spell.castingTime) return '';
    const opt = CASTING_TIME_OPTIONS.find((o) => o.value === spell.castingTime);
    return opt ? opt.tooltip : spell.castingTime;
  })();

  const rangeDisplay = (() => {
    if (!spell.range) return null;
    if (spell.range === 'Selbst') return '👤 Selbst';
    if (spell.range === 'Touch') return '🖐️ Berührung';
    if (spell.range === 'Distanz') {
      if (spell.rangeValue != null) return `📏 ${formatDistance(spell.rangeValue, unitSystem)}`;
      return '📏 Distanz';
    }
    return spell.range;
  })();

  const aoeDisplay = (() => {
    if (!spell.aoeShape || spell.aoeShape === 'Single') return null;
    if (spell.aoeSize != null) {
      return `${aoeShapeData?.icon || ''} ${aoeShapeData?.label || ''} ${formatDistance(
        spell.aoeSize,
        unitSystem
      )}`;
    }
    return `${aoeShapeData?.icon || ''} ${aoeShapeData?.label || ''}`;
  })();

  const hasDamage = !!spell.damageDice && spell.damageDice.length > 0;

  const handleDamageRoll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!spell.damageDice) return;
    const rolls = parseDamageExpression(spell.damageDice);
    if (rolls.length === 0) return;
    const rollsWithType = rolls.map((r) => ({
      ...r,
      damageType: r.damageType || spell.damageType || undefined,
    }));
    setIsRolling(true);
    try {
      rollWeaponDamage(rollsWithType, {
        reason: `${spell.name}`,
        sourceId: spell.id,
        sourceName: spell.name,
        characterId: spell.characterId,
        characterName,
        sourceType: 'spell',
      });
    } catch (err) {
      console.error('Fehler beim Würfeln:', err);
    } finally {
      setIsRolling(false);
    }
  };

  const handleCastConcentration = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCastConcentration) onCastConcentration(spell);
  };

  const damageButtonLabel = (() => {
    if (!spell.damageDice) return '';
    const rolls = parseDamageExpression(spell.damageDice);
    if (rolls.length === 0) return spell.damageDice;
    if (rolls.length === 1) {
      const r = rolls[0];
      return `${r.count}${r.diceType}${r.modifier ? (r.modifier > 0 ? `+${r.modifier}` : r.modifier) : ''}`;
    }
    return `${rolls.length} Würfel`;
  })();

  return (
    <div
      className={`bg-gray-800/30 rounded-lg p-3 border transition ${
        spell.prepared || spell.alwaysPrepared
          ? 'border-purple-500/50 bg-purple-900/20'
          : 'border-gray-700/50'
      }`}
    >
      <div className="flex justify-between items-start">
        <div
          className="flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-semibold text-sm">{spell.name}</div>
            {spell.alwaysPrepared && (
              <span className="text-xs text-blue-400">(immer vorbereitet)</span>
            )}
            {spell.prepared && !spell.alwaysPrepared && (
              <span className="text-xs text-green-400">✓ vorbereitet</span>
            )}
            {spell.concentration && (
              <span className="text-xs text-yellow-400" title="Konzentration">
                🧠
              </span>
            )}
            {spell.ritual && (
              <span className="text-xs text-indigo-400" title="Ritual">
                🔮
              </span>
            )}
          </div>

          <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
            <span className={schoolData?.color || 'text-gray-400'}>
              {schoolData?.label || 'Unbekannte Schule'}
            </span>
            {castingShort && (
              <span className="relative group cursor-help">
                <span className="px-1.5 py-0.5 bg-gray-700 rounded text-purple-300 font-mono font-bold">
                  {castingShort}
                </span>
                <div className="absolute z-20 left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-800 border border-purple-500 rounded-lg p-2 text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition pointer-events-none">
                  {castingTooltip}
                </div>
              </span>
            )}
            {rangeDisplay && <span>• {rangeDisplay}</span>}
            {spell.duration && <span>• {spell.duration}</span>}
          </div>

          {spell.components && spell.components.length > 0 && (
            <div className="text-xs text-gray-400 mt-0.5">
              {spell.components.map((c) => componentLabels[c] || c).join(' ')}
              {spell.materialComponent && ` (${spell.materialComponent})`}
            </div>
          )}

          {aoeDisplay && (
            <div className="text-xs text-cyan-400 mt-1">📍 {aoeDisplay}</div>
          )}

          {isExpanded && spell.description && (
            <div className="text-xs text-gray-300 mt-2 whitespace-pre-wrap">
              {spell.description}
            </div>
          )}

          {isExpanded && spell.attackType === 'saving_throw' && spell.savingThrow && (
            <div className="text-xs text-red-400 mt-1">
              🎲 Rettungswurf: {spell.savingThrow}
            </div>
          )}

          {isExpanded && spell.upcastEnabled && (
            <div className="text-xs text-purple-400 mt-1">
              ⬆️ Upcast:{' '}
              {spell.upcastType === 'dice' && `+${spell.upcastValue} pro Grad`}
              {spell.upcastType === 'targets' && `+${spell.upcastValue} Ziel(e) pro Grad`}
              {spell.upcastType === 'other' && spell.upcastValue}
            </div>
          )}

          {isExpanded && spell.higherLevels && (
            <div className="text-xs text-gray-400 mt-1">⬆️ {spell.higherLevels}</div>
          )}
        </div>

        <div className="flex flex-col gap-1 ml-2">
          {/* Schaden würfeln */}
          {hasDamage && (
            <button type="button"
              onClick={handleDamageRoll}
              disabled={isLoading || isRolling}
              className="px-2 py-1 text-xs bg-orange-600/50 hover:bg-orange-600 rounded transition disabled:opacity-50 flex items-center justify-center gap-1 whitespace-nowrap"
              title={`${spell.damageDice} würfeln`}
            >
              {isRolling ? '🎲...' : `🎲 ${damageButtonLabel}`}
            </button>
          )}

          {/* 🔥 NEU: Konzentration wirken */}
          {spell.concentration && onCastConcentration && (
            <button type="button"
              onClick={handleCastConcentration}
              disabled={isLoading}
              className="px-2 py-1 text-xs bg-yellow-600/50 hover:bg-yellow-600 rounded transition disabled:opacity-50 flex items-center justify-center gap-1 whitespace-nowrap"
              title="Konzentration wirken"
            >
              🧘 Wirken
            </button>
          )}

          {onTogglePrepared && !spell.alwaysPrepared && (
            <button type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePrepared(spell.id, !spell.prepared);
              }}
              disabled={isLoading}
              className={`px-2 py-1 text-xs rounded transition ${
                spell.prepared
                  ? 'bg-green-600/50 hover:bg-green-600'
                  : 'bg-gray-600/50 hover:bg-gray-600'
              }`}
              title={spell.prepared ? 'Nicht mehr vorbereiten' : 'Vorbereiten'}
            >
              {spell.prepared ? '✓' : '○'}
            </button>
          )}

          {editable && onEdit && (
            <button type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(spell);
              }}
              disabled={isLoading}
              className="px-2 py-1 text-xs bg-blue-600/50 hover:bg-blue-600 rounded transition"
              title="Bearbeiten"
            >
              ✏️
            </button>
          )}

          {editable && onDelete && (
            <button type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(spell.id);
              }}
              disabled={isLoading}
              className="px-2 py-1 text-xs bg-red-600/50 hover:bg-red-600 rounded transition"
              title="Löschen"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}