// src/components/character/edit/InventoryItem.tsx
'use client';

import { useState } from 'react';
import { InventoryItem } from '@/types/inventory';
import { EquipmentItem } from '@/types/equipment';
import { EQUIPMENT_TYPES } from '@/lib/enums/equipmentTypes';
import { diceInfo, DiceType, rollWeaponDamage, WeaponDamageRoll } from '@/lib/dice';
import { UnitSystem } from '@/types/character';
import { formatWeight, getWeightUnitLabel } from '@/lib/units';

interface InventoryItemComponentProps {
  item: InventoryItem;
  containerId: string;
  characterId: string;
  equipment: EquipmentItem[];
  onEquipmentUpdate: (updated: EquipmentItem[]) => void;
  onDelete: (id: string) => void;
  onMove: (itemId: string, targetContainerId: string) => void;
  weightUnit?: string;
  unitSystem: UnitSystem;
}

const VALID_DICE_TYPES = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

export function InventoryItemComponent({
  item,
  containerId,
  characterId,
  equipment,
  onEquipmentUpdate,
  onDelete,
  onMove,
  weightUnit = 'kg',
  unitSystem,
}: InventoryItemComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQuantity, setEditQuantity] = useState(item.quantity);
  const [editWeight, setEditWeight] = useState(item.weight?.toString() || '');

  const linkedEquipment = item.equipmentId
    ? equipment.find((e) => e.id === item.equipmentId)
    : null;

  const getEquipmentIcon = () => {
    if (!linkedEquipment) return null;
    return EQUIPMENT_TYPES[linkedEquipment.type]?.icon || '📦';
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
        console.warn('Keine gültigen Würfel-Typen gefunden');
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

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleEquip = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

  const handleToggleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditMode(!editMode);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(item.id);
  };

  const handleSaveEdit = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);

    // 🔥 FIX: Bei neuen Characters keine API-Aufrufe
    if (characterId === 'new') {
      setEditMode(false);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/characters/${characterId}/inventory/${containerId}/items/${item.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editName,
            quantity: editQuantity,
            weight: editWeight ? parseFloat(editWeight) : null,
          }),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setEditMode(false);
        window.location.reload();
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditMode(false);
    setEditName(item.name);
    setEditQuantity(item.quantity);
    setEditWeight(item.weight?.toString() || '');
  };

  const damageInfo =
    item.type === 'weapon' && item.damageDice ? `${item.damageDice}` : null;

  const acInfo =
    (item.type === 'armor' || item.type === 'shield') && item.armorClassBonus
      ? `AC ${item.armorClassBonus}`
      : null;

  const isWeaponWithDamage = item.type === 'weapon' && item.damageDice;
  const magicBonus = item.magicBonus && item.magicBonus > 0;

  // 🔥 FIX: formatWeight aus @/lib/units verwenden
  const weightDisplay =
    item.weight !== undefined && item.weight !== null
      ? formatWeight(item.weight, unitSystem)
      : null;

  return (
    <div
      className="bg-gray-800/50 rounded p-2 hover:bg-gray-700/50 transition group"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 cursor-pointer" onClick={handleToggleExpand}>
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
            {linkedEquipment?.equipped && (
              <span className="text-xs text-green-400">✓ Ausgerüstet</span>
            )}
            {damageInfo && (
              <span className="text-xs text-orange-400 ml-1">⚔️ {damageInfo}</span>
            )}
            {acInfo && (
              <span className="text-xs text-blue-400 ml-1">🛡️ {acInfo}</span>
            )}
          </div>
          {isExpanded && item.description && (
            <div className="mt-1 text-xs text-gray-400">{item.description}</div>
          )}
          {isExpanded && item.notes && (
            <div className="mt-1 text-xs text-gray-500">📝 {item.notes}</div>
          )}
          {isExpanded && linkedEquipment && (
            <span
              className="text-xs text-purple-400 cursor-pointer hover:underline block mt-1"
              onClick={handleEquip}
            >
              {linkedEquipment.equipped ? 'Ablegen' : 'Ausrüsten'}
            </span>
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

          <button
            type="button"
            onClick={handleToggleEdit}
            className="px-2 py-0.5 text-xs bg-blue-600/50 hover:bg-blue-600 rounded transition opacity-0 group-hover:opacity-100"
          >
            ✏️
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="px-2 py-0.5 text-xs bg-red-600/50 hover:bg-red-600 rounded transition opacity-0 group-hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>

      {editMode && (
        <div
          className="mt-2 p-2 bg-gray-800 rounded-lg flex flex-wrap gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 min-w-[80px] px-2 py-1 bg-gray-700 rounded text-sm border border-gray-600"
          />
          <input
            type="number"
            value={editQuantity}
            onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
            min="1"
            className="w-16 px-2 py-1 bg-gray-700 rounded text-sm border border-gray-600 text-center"
          />
          <input
            type="number"
            step="0.1"
            value={editWeight}
            onChange={(e) => setEditWeight(e.target.value)}
            placeholder={`Gewicht (${getWeightUnitLabel(unitSystem)})`}
            className="w-24 px-2 py-1 bg-gray-700 rounded text-sm border border-gray-600"
          />
          <button
            type="button"
            onClick={handleSaveEdit}
            disabled={isLoading}
            className="px-3 py-1 bg-green-600 rounded text-sm disabled:opacity-50"
          >
            {isLoading ? '...' : 'Speichern'}
          </button>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="px-3 py-1 bg-gray-600 rounded text-sm"
          >
            Abbrechen
          </button>
        </div>
      )}
    </div>
  );
}