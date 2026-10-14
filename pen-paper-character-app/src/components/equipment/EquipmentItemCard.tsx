// src/components/character/equipment/views/EquipmentItemCard.tsx
'use client';

import { useState } from 'react';
import { EquipmentItem } from '@/types/equipment';
import { diceInfo, DiceType, rollWeaponDamage, WeaponDamageRoll, parseDamageDice, isValidDiceType } from '@/lib/dice';
import { UnitSystem } from '@/types/character';
import { formatDistance, formatWeight, getDistanceUnitLabel, ftToM } from '@/lib/units';

interface EquipmentItemCardProps {
  item: EquipmentItem;
  onEquip: (id: string, equipped: boolean) => void;
  onDelete: (id: string) => void;
  onRollDamage?: (item: EquipmentItem, damageDice: string) => void;
  isLoading: boolean;
  icon: string;
  typeLabel: string;
  unitSystem: UnitSystem; // 🔥 NEU
}

export function EquipmentItemCard({
  item,
  onEquip,
  onDelete,
  onRollDamage,
  isLoading,
  icon,
  typeLabel,
  unitSystem,
}: EquipmentItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const handleWeaponDamage = () => {
    if (!item.damageDice) return;
    setIsRolling(true);
    try {
      const parsedDamages = parseDamageDice(item.damageDice);
      const damageRolls: WeaponDamageRoll[] = parsedDamages.map((d) => ({
        diceType: d.dice as DiceType,
        count: d.count,
        damageType: d.type || undefined,
        modifier: item.attackBonus || 0,
      }));
      const validRolls = damageRolls.filter(
        (d) => isValidDiceType(d.diceType) && diceInfo[d.diceType as keyof typeof diceInfo]
      );
      if (validRolls.length === 0) {
        setIsRolling(false);
        return;
      }
      rollWeaponDamage(validRolls, {
        reason: `${item.name} Angriff`,
        sourceId: item.id,
        sourceName: item.name,
        characterId: item.characterId,
      });
      if (onRollDamage) onRollDamage(item, item.damageDice);
    } catch (error) {
      console.error('Fehler beim Würfeln:', error);
    } finally {
      setIsRolling(false);
    }
  };

  const damageInfo =
    item.type === 'weapon' && item.damageDice ? `${item.damageDice}` : null;
  const acInfo =
    (item.type === 'armor' || item.type === 'shield') && item.armorClassBonus
      ? `AC ${item.armorClassBonus}`
      : null;
  const isWeaponWithDamage = item.type === 'weapon' && item.damageDice;
  // Strukturierte Reichweite: melee = Basis (implizit 5 ft wenn null),
  // ranged = normal/long (nur wenn normal gesetzt). Leer wenn nichts gesetzt.
  const rangeDisplay = (() => {
    if (item.rangeType === 'melee') {
      const base = item.rangeValue ?? ftToM(5);
      return `⚔️ ${formatDistance(base, unitSystem)}`;
    }
    if (item.rangeType === 'ranged') {
      if (item.rangeValue == null) return null;
      const unitLabel = getDistanceUnitLabel(unitSystem);
      const base = formatDistance(item.rangeValue, unitSystem).replace(` ${unitLabel}`, '');
      const max = item.rangeMaxValue != null
        ? `/${formatDistance(item.rangeMaxValue, unitSystem).replace(` ${unitLabel}`, '')}`
        : '';
      return `🏹 ${base}${max} ${unitLabel}`;
    }
    return null;
  })();

  return (
    <div
      className={`bg-gray-800/30 rounded-lg p-3 border transition ${
        item.equipped ? 'border-purple-500/50 bg-purple-900/20' : 'border-gray-700/50'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-2 flex-wrap">
            <span>{icon}</span>
            <div className="font-semibold text-sm">{item.name}</div>
            {item.magicBonus && item.magicBonus > 0 && (
              <span className="text-xs text-yellow-400 font-semibold">
                +{item.magicBonus}✨
              </span>
            )}
            {item.quantity > 1 && (
              <span className="text-xs text-gray-400">×{item.quantity}</span>
            )}
            {item.equipped && <span className="text-xs text-green-400">(Ausgerüstet)</span>}
            {item.weight != null && (
              <span className="text-xs text-gray-500">
                ({formatWeight(item.weight, unitSystem)})
              </span>
            )}
            {item.costAmount != null && item.costAmount > 0 && (
              <span className="text-xs text-yellow-400">
                💰 {item.costAmount} {item.costUnit || 'gp'}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400">{typeLabel}</div>
          {damageInfo && (
            <div className="text-xs text-orange-400 mt-0.5">⚔️ {damageInfo}</div>
          )}
          {acInfo && <div className="text-xs text-blue-400 mt-0.5">🛡️ {acInfo}</div>}
          {rangeDisplay && (
            <div className="text-xs text-gray-400 mt-0.5">📏 Reichweite: {rangeDisplay}</div>
          )}
          {item.weaponPropertyRows && item.weaponPropertyRows.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {item.weaponPropertyRows.map((p) => (
                <span
                  key={p.id}
                  className="text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-300"
                >
                  {p.name}
                  {p.valueNumber != null && ` +${formatDistance(p.valueNumber, unitSystem)}`}
                </span>
              ))}
            </div>
          )}
          {isExpanded && item.description && (
            <div className="text-xs text-gray-300 mt-1">{item.description}</div>
          )}
          {isExpanded && item.notes && (
            <div className="text-xs text-gray-500 mt-0.5">📝 {item.notes}</div>
          )}
          {isExpanded && item.sourceReference && (
            <div className="text-xs text-gray-500 mt-0.5">📖 {item.sourceReference}</div>
          )}
        </div>
        <div className="flex flex-col gap-1 ml-2">
          {isWeaponWithDamage && item.equipped && (
            <button type="button"
              onClick={handleWeaponDamage}
              disabled={isLoading || isRolling}
              className="px-2 py-1 text-xs bg-orange-600/50 hover:bg-orange-600 rounded transition disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {isRolling ? '🎲...' : '🎲 Schaden'}
            </button>
          )}
          <button type="button"
            onClick={() => onEquip(item.id, !item.equipped)}
            disabled={isLoading}
            className={`px-2 py-1 text-xs rounded transition ${
              item.equipped
                ? 'bg-red-600/50 hover:bg-red-600'
                : 'bg-gray-600/50 hover:bg-gray-600'
            }`}
          >
            {item.equipped ? 'Ablegen' : 'Ausrüsten'}
          </button>
          <button type="button"
            onClick={() => onDelete(item.id)}
            disabled={isLoading}
            className="px-2 py-1 text-xs bg-red-600/50 hover:bg-red-600 rounded transition flex items-center justify-center"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}