// src/components/character/equipment/views/InventoryContainerView.tsx
'use client';

import { useState, useEffect } from 'react';
import { InventoryContainer, CONTAINER_ICON } from '@/types/inventory';
import { EquipmentItem } from '@/types/equipment';
import { UnitSystem } from '@/types/character';
import { formatWeight } from '@/lib/units';
import { InventoryItemView } from './InventoryItemView';

interface InventoryContainerViewProps {
  container: InventoryContainer;
  characterId: string;
  equipment: EquipmentItem[];
  onEquipmentUpdate: (updated: EquipmentItem[]) => void;
  depth?: number;
  refreshKey?: number;
  unitSystem: UnitSystem; // 🔥 NEU
}

export function InventoryContainerView({
  container,
  characterId,
  equipment,
  onEquipmentUpdate,
  depth = 0,
  refreshKey = 0,
  unitSystem,
}: InventoryContainerViewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [items, setItems] = useState(container.items || []);

  useEffect(() => {
    setItems(container.items || []);
  }, [container.items, refreshKey]);

  const hasWeightLimit =
    container.weightLimit !== null && container.weightLimit !== undefined;
  const children = container.children || [];

  const totalWeight = items.reduce(
    (sum, item) => sum + (item.weight || 0) * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`bg-gray-800/20 rounded-lg border border-gray-700/50 p-4 transition ${
        depth > 0 ? 'ml-4 border-l-2 border-purple-500/30' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 cursor-pointer" onClick={handleToggleExpand}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{CONTAINER_ICON}</span>
            <h3 className="font-semibold text-lg">{container.name}</h3>
            <span className="text-xs text-gray-400">({items.length} Items)</span>
          </div>
          {container.description && (
            <div className="text-xs text-gray-400 mt-1">{container.description}</div>
          )}
          {container.sourceReference && (
            <div className="text-xs text-gray-500 mt-1">📖 {container.sourceReference}</div>
          )}
          <div className="flex gap-3 mt-1 text-xs text-gray-500">
            <span>📦 {totalItems} Items</span>
            {hasWeightLimit && (
              <span>
                ⚖️ {formatWeight(totalWeight, unitSystem)} /{' '}
                {formatWeight(container.weightLimit, unitSystem)}
              </span>
            )}
          </div>
        </div>
        <button type="button"
          onClick={handleToggleExpand}
          className="px-2 py-1 text-xs bg-gray-600/50 hover:bg-gray-600 rounded transition"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && items.length > 0 && (
        <div className="mt-3 space-y-1">
          {items.map((item) => (
            <InventoryItemView
              key={item.id}
              item={item}
              characterId={characterId}
              equipment={equipment}
              onEquipmentUpdate={onEquipmentUpdate}
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

      {isExpanded && children.length > 0 && (
        <div className="mt-3 space-y-3">
          {children.map((child) => (
            <InventoryContainerView
              key={child.id}
              container={child}
              characterId={characterId}
              equipment={equipment}
              onEquipmentUpdate={onEquipmentUpdate}
              depth={depth + 1}
              refreshKey={refreshKey}
              unitSystem={unitSystem}
            />
          ))}
        </div>
      )}
    </div>
  );
}