// src/components/character/edit/InventoryContainer.tsx
'use client';

import { useState } from 'react';
import { InventoryContainer, CONTAINER_ICON, WeightUnit } from '@/types/inventory';
import { EquipmentItem } from '@/types/equipment';
import { UnitSystem } from '@/types/character';
import { formatWeight } from '@/lib/units';
import { InventoryItemComponent } from './InventoryItem';

// Container weight limit is stored raw in the container's own unit
// (weightUnit), not the character unitSystem. Show it as-is, no conversion.
const displayWeightLimit = (limit: number, unit: WeightUnit): string =>
  `${limit} ${unit}`;

interface InventoryContainerProps {
  container: InventoryContainer;
  characterId: string;
  equipment: EquipmentItem[];
  onEquipmentUpdate: (updated: EquipmentItem[]) => void;
  onUpdate: (updated: InventoryContainer) => void;
  onDelete: (id: string) => void;
  depth?: number;
  onAddItem: (containerId: string) => void;
  onEdit?: (container: InventoryContainer) => void;
  unitSystem: UnitSystem; // 🔥 NEU: durchgereicht
}

export function InventoryContainerComponent({
  container,
  characterId,
  equipment,
  onEquipmentUpdate,
  onUpdate,
  onDelete,
  depth = 0,
  onAddItem,
  onEdit,
  unitSystem,
}: InventoryContainerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasWeightLimit = container.weightLimit !== null && container.weightLimit !== undefined;
  const items = container.items || [];
  const children = container.children || [];

  const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(container.id);
  };

  const handleAddItemClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddItem(container.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) {
      onEdit(container);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Möchtest du dieses Item wirklich löschen?')) return;

    if (characterId === 'new') {
      // Bei neuen Charakteren: nur lokal entfernen
      const updatedContainer = {
        ...container,
        items: items.filter((i) => i.id !== itemId),
      };
      onUpdate(updatedContainer);
      return;
    }

    try {
      const res = await fetch(
        `/api/characters/${characterId}/inventory/${container.id}/items/${itemId}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        const updatedContainer = {
          ...container,
          items: items.filter((i) => i.id !== itemId),
        };
        onUpdate(updatedContainer);
      } else {
        console.error('Fehler beim Löschen des Items');
      }
    } catch (error) {
      console.error('Fehler:', error);
    }
  };

  const handleMoveItem = async (itemId: string, targetContainerId: string) => {
    if (targetContainerId === container.id) return;

    if (characterId === 'new') {
      console.warn('Item-Verschieben wird für neue Charaktere noch nicht unterstützt.');
      return;
    }

    try {
      const res = await fetch(
        `/api/characters/${characterId}/inventory/${container.id}/items/${itemId}/move`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetContainerId }),
        }
      );

      if (res.ok) {
        const updatedContainer = {
          ...container,
          items: items.filter((i) => i.id !== itemId),
        };
        onUpdate(updatedContainer);
        window.location.reload();
      } else {
        console.error('Fehler beim Verschieben des Items');
      }
    } catch (error) {
      console.error('Fehler:', error);
    }
  };

  const hasWeightFree = hasWeightLimit ? totalWeight < container.weightLimit! : true;
  const canAddItems = hasWeightFree;

  return (
    <div
      className={`bg-gray-800/30 rounded-lg border border-gray-700/50 p-4 transition ${
        depth > 0 ? 'ml-4 border-l-2 border-purple-500/30' : ''
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 cursor-pointer" onClick={handleToggleExpand}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{CONTAINER_ICON}</span>
            <h3 className="font-semibold text-lg">{container.name}</h3>
          </div>
          {container.description && (
            <div className="text-xs text-gray-400 mt-1">{container.description}</div>
          )}
          {container.sourceReference && (
            <div className="text-xs text-gray-500 mt-1">📖 {container.sourceReference}</div>
          )}
          <div className="flex gap-3 mt-1 text-xs text-gray-500">
            <span>📦 {totalItems} Items</span>
            {hasWeightLimit ? (
              <span>
                ⚖️ {formatWeight(totalWeight, unitSystem)} / {displayWeightLimit(container.weightLimit!, container.weightUnit)}
              </span>
            ) : (
              <span>♾️ Unendlich Platz</span>
            )}
            <span>📋 {items.length} Items</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={handleAddItemClick}
            disabled={!canAddItems}
            className={`px-2 py-1 text-xs rounded transition ${
              canAddItems
                ? 'bg-green-600/50 hover:bg-green-600'
                : 'bg-gray-600/50 cursor-not-allowed'
            }`}
            title={canAddItems ? 'Item hinzufügen' : 'Gewichtslimit erreicht!'}
          >
            + Item
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={handleEditClick}
              className="px-2 py-1 text-xs bg-blue-600/50 hover:bg-blue-600 rounded transition"
            >
              ✏️
            </button>
          )}
          <button
            type="button"
            onClick={handleDeleteClick}
            className="px-2 py-1 text-xs bg-red-600/50 hover:bg-red-600 rounded transition"
          >
            🗑️
          </button>
        </div>
      </div>

      {isExpanded && items.length > 0 && (
        <div className="mt-3 space-y-1">
          {items.map((item) => (
            <InventoryItemComponent
              key={item.id}
              item={item}
              containerId={container.id}
              characterId={characterId}
              equipment={equipment}
              onEquipmentUpdate={onEquipmentUpdate}
              onDelete={handleDeleteItem}
              onMove={handleMoveItem}
              unitSystem={unitSystem}
            />
          ))}
        </div>
      )}

      {isExpanded && items.length === 0 && (
        <div className="mt-3 text-xs text-gray-500 text-center py-2">
          Keine Items in diesem Container
        </div>
      )}

      {isExpanded && !hasWeightFree && hasWeightLimit && (
        <div className="mt-2 text-xs text-red-400 text-center">⚠️ Gewichtslimit erreicht!</div>
      )}

      {isExpanded && children.length > 0 && (
        <div className="mt-3 space-y-3">
          {children.map((child) => (
            <InventoryContainerComponent
              key={child.id}
              container={child}
              characterId={characterId}
              equipment={equipment}
              onEquipmentUpdate={onEquipmentUpdate}
              onUpdate={onUpdate}
              onDelete={onDelete}
              depth={depth + 1}
              onAddItem={onAddItem}
              onEdit={onEdit}
              unitSystem={unitSystem}
            />
          ))}
        </div>
      )}
    </div>
  );
}