// src/components/character/equipment/views/InventoryItemView.tsx
'use client';

import { useState } from 'react';
import { InventoryItem } from '@/types/inventory';
import { EquipmentItem } from '@/types/equipment';
import { EQUIPMENT_TYPES } from '@/lib/enums/equipmentTypes';
import { diceInfo, DiceType, rollWeaponDamage, WeaponDamageRoll } from '@/lib/dice';
import { UnitSystem } from '@/types/character';
import { formatDistanceString, formatWeight } from '@/lib/units';

interface InventoryItemViewProps {
  item: InventoryItem;
  characterId: string;
  equipment: EquipmentItem[];
  onEquipmentUpdate: (updated: EquipmentItem[]) => void;
  unitSystem: UnitSystem; // 🔥 NEU
}

const VALID_DICE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

export function InventoryItemView({
  item,
  characterId,
  equipment,
  onEquipmentUpdate,
  unitSystem,
}: InventoryItemViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const linkedEquipment = item.equipmentId
    ? equipment.find((e) => e.id === item.equipmentId)
    : null;

  const getEquipmentIcon = () => {
    if (!linkedEquipment) return null;
    return EQUIPMENT_TYPES[linkedEquipment.type]?.icon || '📦';
  };

  const getTypeLabel = () => {
    if (!linkedEquipment) return item.type || 'Item';
    return EQUIPMENT_TYPES[linkedEquipment.type]?.label || item.type || 'Item';
  };

  const parseDamageDice = (
    damageDice: string
  ): { count: number; dice: string; type: string }[] => {
    if (!damageDice) return [];
    const parts = damageDice.split(',').map((p) => p.trim());
    const result: { count: number; dice: string; type: string }[] = [];
    for (const part of parts) {
      const match = part.match(/(\d+)d(\d+)\s*(.*)/);
      if (match) {
        const count = parseInt(match[1]);
        const dice = `d${match[2]}`;
        const type = match[3] || '';
        result.push({ count, dice, type });
      }
    }
    return result;
  };

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
        (d) =>
          VALID_DICE_TYPES.includes(d.diceType) &&
          diceInfo[d.diceType as keyof typeof diceInfo]
      );
      if (validRolls.length === 0) {
        setIsRolling(false);
        return;
      }
      rollWeaponDamage(validRolls, {
        reason: `${item.name} Angriff`,
        sourceId: item.id,
        sourceName: item.name,
        characterId: characterId,
      });
    } catch (error) {
      console.error('Fehler beim Würfeln:', error);
    } finally {
      setIsRolling(false);
    }
  };

  const handleEquip = async () => {
    if (!linkedEquipment) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/characters/${characterId}/equipment/${linkedEquipment.id}/equip`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ equipped: !linkedEquipment.equipped }),
        }
      );
      if (res.ok) {
        const updated = await res.json();
        const newList = equipment.map((e) =>
          e.id === linkedEquipment.id ? updated : e
        );
        onEquipmentUpdate(newList);
      }
    } catch (error) {
      console.error('Fehler beim Ausrüsten:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const damageInfo =
    item.type === 'weapon' && item.damageDice ? `${item.damageDice}` : null;
  const acInfo =
    (item.type === 'armor' || item.type === 'shield') && item.armorClassBonus
      ? `AC ${item.armorClassBonus}`
      : null;
  const isWeaponWithDamage = item.type === 'weapon' && item.damageDice;
  const magicBonus = item.magicBonus && item.magicBonus > 0;

  const weightDisplay =
    item.weight !== undefined && item.weight !== null
      ? formatWeight(item.weight, unitSystem)
      : null;

  // Reichweite aus der DB (Roh-String) — Konvertierung nur bei der Anzeige (Regel 03)
  const rangeDisplay =
    item.range && item.range.trim()
      ? formatDistanceString(item.range, unitSystem)
      : null;

  return (
    <div className="bg-gray-800/30 rounded p-2 hover:bg-gray-700/30 transition group">
      <div className="flex justify-between items-start">
        <div className="flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-2 flex-wrap">
            {linkedEquipment && <span className="text-sm">{getEquipmentIcon()}</span>}
            <span className="font-medium text-sm">{item.name}</span>
            {magicBonus && (
              <span className="text-xs text-yellow-400">+{item.magicBonus}✨</span>
            )}
            {item.quantity > 1 && (
              <span className="text-xs text-gray-400">×{item.quantity}</span>
            )}
            {weightDisplay && (
              <span className="text-xs text-gray-500">({weightDisplay})</span>
            )}
            {item.value != null && item.value > 0 && (
              <span className="text-xs text-yellow-400">💰 {item.value} gp</span>
            )}
            {linkedEquipment?.equipped && (
              <span className="text-xs text-green-400">✓ Ausgerüstet</span>
            )}
            {damageInfo && (
              <span className="text-xs text-orange-400 ml-1">⚔️ {damageInfo}</span>
            )}
            {acInfo && (
              <span className="text-xs text-blue-400 ml-1">🛡️ {acInfo}</span>
            )}
            {rangeDisplay && (
              <span className="text-xs text-gray-400 ml-1">📏 {rangeDisplay}</span>
            )}
          </div>
          <div className="text-xs text-gray-400">{getTypeLabel()}</div>
          {isExpanded && item.description && (
            <div className="mt-1 text-xs text-gray-300">{item.description}</div>
          )}
          {isExpanded && item.notes && (
            <div className="mt-1 text-xs text-gray-500">📝 {item.notes}</div>
          )}
          {isExpanded && item.sourceReference && (
            <div className="mt-1 text-xs text-gray-500">📖 {item.sourceReference}</div>
          )}
        </div>
        <div className="flex flex-col gap-1 ml-2">
          {isWeaponWithDamage && (
            <button
              type="button"
              onClick={handleWeaponDamage}
              disabled={isLoading || isRolling}
              className="px-2 py-1 text-xs bg-orange-600/50 hover:bg-orange-600 rounded transition disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {isRolling ? '🎲...' : '🎲 Schaden'}
            </button>
          )}
          {linkedEquipment && (
            <button
              type="button"
              onClick={handleEquip}
              disabled={isLoading}
              className={`px-2 py-1 text-xs rounded transition ${
                linkedEquipment.equipped
                  ? 'bg-red-600/50 hover:bg-red-600'
                  : 'bg-blue-600/50 hover:bg-blue-600'
              }`}
            >
              {linkedEquipment.equipped ? 'Ablegen' : 'Ausrüsten'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}