// src/components/character/edit/EquipmentEditTab.tsx
'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { EquipmentItem } from '@/types/equipment';
import { InventoryContainer, WeightUnit } from '@/types/inventory';
import { UnitSystem } from '@/types/character';
import { InventoryContainerComponent } from './InventoryContainer';
import { ContainerSelector } from './ContainerSelector';

interface EquipmentEditTabProps {
  characterId: string;
  equipment: EquipmentItem[];
  onEquipmentUpdate: (updated: EquipmentItem[]) => void;
  onAddItem: (containerId: string) => void;
  onRefresh?: () => void;
  containers?: InventoryContainer[];
  onContainersUpdate?: (containers: InventoryContainer[]) => void;
  unitSystem: UnitSystem; // 🔥 NEU
}

export interface EquipmentEditTabRef {
  loadContainers: () => Promise<void>;
  getContainers: () => InventoryContainer[];
}

export const EquipmentEditTab = forwardRef<EquipmentEditTabRef, EquipmentEditTabProps>(
  function EquipmentEditTab(
    {
      characterId,
      equipment,
      onEquipmentUpdate,
      onAddItem,
      onRefresh,
      containers: externalContainers,
      onContainersUpdate,
      unitSystem,
    }: EquipmentEditTabProps,
    ref
  ) {
    const [internalContainers, setInternalContainers] = useState<InventoryContainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showContainerSelector, setShowContainerSelector] = useState(false);
    const [editingContainer, setEditingContainer] = useState<InventoryContainer | null>(null);

    const isNewCharacter = characterId === 'new';
    const storageKey = `containers_${characterId}`;

    const containers = isNewCharacter
      ? externalContainers || internalContainers
      : internalContainers;
    const setContainers = isNewCharacter
      ? onContainersUpdate || setInternalContainers
      : setInternalContainers;

    // ==================== LOAD CONTAINERS ====================
    const loadContainers = async (): Promise<void> => {
      if (isNewCharacter) {
        if (!externalContainers) {
          setInternalContainers([]);
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/characters/${characterId}/inventory`);
        if (res.ok) {
          const data = await res.json();
          setInternalContainers(data);
        } else {
          setError('Fehler beim Laden der Container');
        }
      } catch (error) {
        console.error('Fehler:', error);
        setError('Fehler beim Laden der Container');
      } finally {
        setLoading(false);
      }
    };

    const getContainers = (): InventoryContainer[] => {
      return containers;
    };

    useImperativeHandle(ref, () => ({
      loadContainers,
      getContainers,
    }));

    // ==================== INITIAL LOAD ====================
    useEffect(() => {
      loadContainers();
    }, [characterId]);

    // ==================== CONTAINER ACTIONS ====================
    const updateContainers = (newContainers: InventoryContainer[]) => {
      if (isNewCharacter) {
        if (onContainersUpdate) {
          onContainersUpdate(newContainers);
        } else {
          setInternalContainers(newContainers);
        }
      } else {
        setInternalContainers(newContainers);
      }
      if (onRefresh) onRefresh();
    };

    const handleAddContainer = async (
      name: string,
      weightLimit?: number | null,
      weightUnit: WeightUnit = 'kg',
      sourceReference: string = ''
    ) => {
      setError(null);

      if (editingContainer) {
        const updatedContainer = {
          ...editingContainer,
          name: name,
          weightLimit: weightLimit || null,
          weightUnit: weightUnit,
          sourceReference: sourceReference,
          updatedAt: new Date().toISOString(),
        };

        const newContainers = containers.map((c) =>
          c.id === editingContainer.id ? updatedContainer : c
        );
        updateContainers(newContainers);

        setEditingContainer(null);
        setShowContainerSelector(false);
        return;
      }

      const newContainer: InventoryContainer = {
        id: `temp-${Date.now()}`,
        name: name,
        type: 'container',
        description: '',
        capacity: null,
        weightLimit: weightLimit || null,
        weightUnit: weightUnit,
        sourceReference: sourceReference,
        parentId: undefined,
        characterId: characterId,
        children: [],
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isNewCharacter) {
        const newContainers = [...containers, newContainer];
        updateContainers(newContainers);
        setShowContainerSelector(false);
        return;
      }

      try {
        const res = await fetch(`/api/characters/${characterId}/inventory`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name,
            type: 'container',
            description: '',
            capacity: null,
            weightLimit: weightLimit || null,
            weightUnit: weightUnit,
            sourceReference: sourceReference,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setInternalContainers([...containers, data]);
          setShowContainerSelector(false);
        } else {
          const data = await res.json();
          setError(data.error || 'Fehler beim Erstellen des Containers');
        }
      } catch (error) {
        console.error('Fehler:', error);
        setError('Fehler beim Erstellen des Containers');
      }
    };

    const handleDeleteContainer = async (containerId: string) => {
      if (!confirm('Möchtest du diesen Container wirklich löschen?')) return;

      if (isNewCharacter) {
        const newContainers = containers.filter((c) => c.id !== containerId);
        updateContainers(newContainers);
        return;
      }

      try {
        const res = await fetch(
          `/api/characters/${characterId}/inventory/${containerId}`,
          { method: 'DELETE' }
        );
        if (res.ok) {
          setInternalContainers(containers.filter((c) => c.id !== containerId));
        } else {
          const data = await res.json();
          setError(data.error || 'Fehler beim Löschen des Containers');
        }
      } catch (error) {
        console.error('Fehler:', error);
        setError('Fehler beim Löschen des Containers');
      }
    };

    const handleUpdateContainer = (updatedContainer: InventoryContainer) => {
      const newContainers = containers.map((c) =>
        c.id === updatedContainer.id ? updatedContainer : c
      );
      updateContainers(newContainers);
    };

    const handleAddContainerClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setEditingContainer(null);
      setShowContainerSelector(true);
    };

    const handleEditContainer = (container: InventoryContainer) => {
      setEditingContainer(container);
      setShowContainerSelector(true);
    };

    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
        {error && (
          <div className="bg-red-500/20 text-red-300 p-3 rounded-lg">{error}</div>
        )}

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">🎒 Inventar</h2>
            <button
              type="button"
              onClick={handleAddContainerClick}
              className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            >
              + Container hinzufügen
            </button>
          </div>

          {containers.length === 0 ? (
            <div className="text-center text-gray-400 py-8 bg-gray-800/30 rounded-lg">
              <p>Keine Container vorhanden.</p>
              <p className="text-sm mt-1">Füge einen Container hinzu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {containers.map((container) => (
                <InventoryContainerComponent
                  key={container.id}
                  container={container}
                  characterId={characterId}
                  equipment={equipment}
                  onEquipmentUpdate={onEquipmentUpdate}
                  onUpdate={handleUpdateContainer}
                  onDelete={handleDeleteContainer}
                  onAddItem={onAddItem}
                  onEdit={handleEditContainer}
                  unitSystem={unitSystem}
                />
              ))}
            </div>
          )}
        </div>

        <ContainerSelector
          isOpen={showContainerSelector}
          onClose={() => {
            setShowContainerSelector(false);
            setEditingContainer(null);
          }}
          onSelect={handleAddContainer}
          initialName={editingContainer?.name || ''}
          initialWeightLimit={editingContainer?.weightLimit || null}
          initialWeightUnit={editingContainer?.weightUnit || 'kg'}
          initialSourceReference={editingContainer?.sourceReference || ''}
          mode={editingContainer ? 'edit' : 'create'}
        />
      </div>
    );
  }
);