// src/components/character/equipment/views/EquipmentView.tsx
'use client';

import { useState, useEffect } from 'react';
import { EquipmentItem } from '@/types/equipment';
import { InventoryContainer } from '@/types/inventory';
import { EQUIPMENT_TYPES } from '@/lib/enums/equipmentTypes';
import { UnitSystem } from '@/types/character';
import { EquipmentItemCard } from './EquipmentItemCard';
import { InventoryContainerView } from './InventoryContainerView';

interface EquipmentViewProps {
  equipment: EquipmentItem[];
  characterId: string;
  onUpdate: (updated: EquipmentItem[]) => void;
  onAddItem: () => void;
  onCharacterUpdate?: () => void;
  refreshKey?: number;
  unitSystem: UnitSystem; // 🔥 NEU
}

export function EquipmentView({
  equipment,
  characterId,
  onUpdate,
  onAddItem,
  onCharacterUpdate,
  refreshKey = 0,
  unitSystem,
}: EquipmentViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [containers, setContainers] = useState<InventoryContainer[]>([]);

  const loadContainers = async () => {
    try {
      const res = await fetch(`/api/characters/${characterId}/inventory`);
      if (res.ok) {
        const data = await res.json();
        setContainers(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Container:', error);
    }
  };

  useEffect(() => {
    loadContainers();
  }, [characterId, refreshKey]);

  const getDexModifier = async (): Promise<number> => {
    try {
      const res = await fetch(`/api/characters/${characterId}`);
      if (res.ok) {
        const data = await res.json();
        const dexAttr = data.attributes?.find((a: any) => a.name === 'Geschick');
        if (dexAttr) {
          return Math.floor((dexAttr.value - 10) / 2);
        }
      }
      return 0;
    } catch (error) {
      console.error('Fehler beim Laden des Dex-Mods:', error);
      return 0;
    }
  };

  const calculateAC = (
    armor: EquipmentItem | undefined,
    shield: EquipmentItem | undefined,
    dexMod: number
  ): { totalAC: number; sources: { name: string; value: number }[] } => {
    const sources: { name: string; value: number }[] = [];
    let baseAC = 10;

    if (armor) {
      const armorAC = armor.armorClassBonus || 0;
      const magicBonus = armor.magicBonus || 0;
      const totalArmorAC = armorAC + magicBonus;
      const armorType = armor.armorType;

      if (armorType === 'heavy') {
        baseAC = totalArmorAC;
        sources.push({ name: armor.name || 'Schwere Rüstung', value: totalArmorAC });
      } else if (armorType === 'medium') {
        const dexBonus = Math.min(dexMod, 2);
        baseAC = totalArmorAC + dexBonus;
        sources.push({ name: armor.name || 'Mittlere Rüstung', value: totalArmorAC });
        if (dexBonus > 0) sources.push({ name: 'Dex-Bonus (max +2)', value: dexBonus });
      } else if (armorType === 'light') {
        baseAC = totalArmorAC + dexMod;
        sources.push({ name: armor.name || 'Leichte Rüstung', value: totalArmorAC });
        if (dexMod > 0) sources.push({ name: 'Dex-Bonus', value: dexMod });
      } else {
        baseAC = 10 + dexMod + totalArmorAC;
        sources.push({ name: 'Basis', value: 10 });
        if (dexMod > 0) sources.push({ name: 'Dex-Bonus', value: dexMod });
        if (totalArmorAC > 0) sources.push({ name: armor.name || 'Bonus', value: totalArmorAC });
      }
    } else {
      baseAC = 10 + dexMod;
      sources.push({ name: 'Basis', value: 10 });
      if (dexMod > 0) sources.push({ name: 'Dex-Bonus', value: dexMod });
    }

    if (shield) {
      const shieldBonus = shield.shieldBonus || 2;
      const magicBonus = shield.magicBonus || 0;
      const totalShieldBonus = shieldBonus + magicBonus;
      baseAC += totalShieldBonus;
      sources.push({ name: shield.name || 'Schild', value: totalShieldBonus });
    }

    return { totalAC: baseAC, sources };
  };

  const updateCharacterAC = async (currentEquipment: EquipmentItem[]) => {
    try {
      const equippedArmor = currentEquipment.find((item) => item.equipped && item.type === 'armor');
      const equippedShield = currentEquipment.find((item) => item.equipped && item.type === 'shield');
      const dexMod = await getDexModifier();
      const { sources } = calculateAC(equippedArmor, equippedShield, dexMod);

      const charRes = await fetch(`/api/characters/${characterId}`);
      if (!charRes.ok) return;
      const charData = await charRes.json();
      const existingSources = charData.combatValueSources || [];
      const otherSources = existingSources.filter((s: any) => s.type !== 'armorClass');

      const newSources = [
        ...otherSources,
        ...sources.map((s) => ({
          type: 'armorClass',
          name: s.name,
          value: s.value,
          dependsOn: null,
        })),
      ];

      await fetch(`/api/characters/${characterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ combatValueSources: newSources }),
      });

      if (onCharacterUpdate) onCharacterUpdate();
    } catch (error) {
      console.error('Fehler beim Aktualisieren der AC:', error);
    }
  };

  const handleEquip = async (itemId: string, equipped: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/characters/${characterId}/equipment/${itemId}/equip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipped }),
      });

      if (res.ok) {
        const updated = await res.json();
        const newList = equipment.map((item) =>
          item.id === itemId
            ? updated
            : equipped &&
              (updated.type === 'armor' || updated.type === 'shield') &&
              item.type === updated.type
            ? { ...item, equipped: false }
            : item
        );
        onUpdate(newList);
        await updateCharacterAC(newList);
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Ausrüsten');
      }
    } catch (error) {
      console.error('Fehler beim Ausrüsten:', error);
      setError('Fehler beim Ausrüsten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Möchtest du diesen Gegenstand wirklich löschen?')) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/characters/${characterId}/equipment/${itemId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const newList = equipment.filter((item) => item.id !== itemId);
        onUpdate(newList);
        await updateCharacterAC(newList);
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Löschen');
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      setError('Fehler beim Löschen');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => EQUIPMENT_TYPES[type]?.icon || '📦';
  const getTypeLabel = (type: string) => EQUIPMENT_TYPES[type]?.label || type;

  const equippedItems = equipment.filter((item) => item.equipped);
  const inventoryItems = equipment.filter((item) => !item.equipped);
  const containersWithItems = containers.filter((c) => c.items && c.items.length > 0);
  const emptyContainers = containers.filter((c) => !c.items || c.items.length === 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">🎒 Ausrüstung</h2>
        <button
          onClick={onAddItem}
          className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
        >
          + Gegenstand hinzufügen
        </button>
      </div>

      {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg">{error}</div>}

      {equippedItems.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-purple-400 mb-2">✅ Ausgerüstet</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {equippedItems.map((item) => (
              <EquipmentItemCard
                key={item.id}
                item={item}
                onEquip={handleEquip}
                onDelete={handleDelete}
                isLoading={isLoading}
                icon={getTypeIcon(item.type)}
                typeLabel={getTypeLabel(item.type)}
                unitSystem={unitSystem}
              />
            ))}
          </div>
        </div>
      )}

      {containersWithItems.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-blue-400 mb-2">📦 Container</h3>
          <div className="space-y-3">
            {containersWithItems.map((container) => (
              <InventoryContainerView
                key={container.id}
                container={container}
                characterId={characterId}
                equipment={equipment}
                onEquipmentUpdate={onUpdate}
                refreshKey={refreshKey}
                unitSystem={unitSystem}
              />
            ))}
          </div>
        </div>
      )}

      {inventoryItems.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-2">🎒 Rucksack</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {inventoryItems.map((item) => (
              <EquipmentItemCard
                key={item.id}
                item={item}
                onEquip={handleEquip}
                onDelete={handleDelete}
                isLoading={isLoading}
                icon={getTypeIcon(item.type)}
                typeLabel={getTypeLabel(item.type)}
                unitSystem={unitSystem}
              />
            ))}
          </div>
        </div>
      )}

      {emptyContainers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-2">📦 Leere Container</h3>
          <div className="space-y-3">
            {emptyContainers.map((container) => (
              <InventoryContainerView
                key={container.id}
                container={container}
                characterId={characterId}
                equipment={equipment}
                onEquipmentUpdate={onUpdate}
                refreshKey={refreshKey}
                unitSystem={unitSystem}
              />
            ))}
          </div>
        </div>
      )}

      {equipment.length === 0 && containers.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <p>Keine Ausrüstung oder Container vorhanden.</p>
          <p className="text-sm mt-1">Klicke auf &quot;+ Gegenstand hinzufügen&quot; um zu beginnen.</p>
        </div>
      )}
    </div>
  );
}