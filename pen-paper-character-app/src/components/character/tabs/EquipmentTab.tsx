// src/components/character/tabs/EquipmentTab.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { EquipmentView } from '@/components/equipment/EquipmentView';
import { EquipmentEditTab, EquipmentEditTabRef } from '@/components/character/editors/EquipmentEditTab';
import { EquipmentItem } from '@/types/equipment';
import { InventoryContainer } from '@/types/inventory';
import { UnitSystem } from '@/types/character';

interface EquipmentTabProps {
  characterId: string;
  mode: 'create' | 'edit' | 'view';
  readOnly?: boolean;
  unitSystem: UnitSystem; // 🔥 NEU
  onOpenCreateModal?: (
    itemType: 'equipment' | 'spell' | 'action' | 'inventory',
    containerId?: string
  ) => void;
  containers?: InventoryContainer[];
  onContainersUpdate?: (containers: InventoryContainer[]) => void;
}

export function EquipmentTab({
  characterId,
  mode,
  readOnly = false,
  unitSystem,
  onOpenCreateModal,
  containers,
  onContainersUpdate,
}: EquipmentTabProps) {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const editTabRef = useRef<EquipmentEditTabRef | null>(null);

  const loadEquipment = async () => {
    if (characterId === 'new') {
      setEquipment([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/characters/${characterId}/equipment`);
      if (res.ok) {
        const data = await res.json();
        setEquipment(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Ausrüstung:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, [characterId]);

  const refreshAll = () => {
    setRefreshKey((prev) => prev + 1);
    if (editTabRef.current) {
      editTabRef.current.loadContainers();
    }
    loadEquipment();
  };

  const handleAddItem = (containerId?: string) => {
    if (onOpenCreateModal) {
      onOpenCreateModal('inventory', containerId);
    }
  };

  const isView = readOnly || mode === 'view';

  if (isView) {
    return (
      <EquipmentView
        equipment={equipment}
        characterId={characterId}
        onUpdate={setEquipment}
        onAddItem={() => {}}
        refreshKey={refreshKey}
        unitSystem={unitSystem}
      />
    );
  }

  return (
    <div>
      <EquipmentEditTab
        ref={editTabRef}
        characterId={characterId}
        equipment={equipment}
        onEquipmentUpdate={setEquipment}
        onAddItem={handleAddItem}
        onRefresh={refreshAll}
        containers={containers}
        onContainersUpdate={onContainersUpdate}
        unitSystem={unitSystem}
      />
    </div>
  );
}