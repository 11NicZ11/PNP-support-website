// src/hooks/useEquipment.ts
// Ausrüstungs-Hook

import { useState, useCallback, useEffect } from 'react';

interface UseEquipmentOptions {
  characterId: string;
  autoLoad?: boolean;
}

export function useEquipment({ characterId, autoLoad = true }: UseEquipmentOptions) {
  const [equipment, setEquipment] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEquipment = useCallback(async () => {
    if (characterId === 'new') {
      setEquipment([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/characters/${characterId}/equipment`);
      if (res.ok) {
        const data = await res.json();
        setEquipment(data);
      } else {
        const err = await res.json();
        setError(err.error || 'Fehler beim Laden');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [characterId]);

  const addEquipment = useCallback(async (data: any) => {
    if (characterId === 'new') {
      const newItem = { id: `temp-${Date.now()}`, ...data };
      setEquipment([...equipment, newItem]);
      return newItem;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/characters/${characterId}/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setEquipment([...equipment, created]);
        return created;
      }
      throw new Error('Fehler beim Erstellen');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [characterId, equipment]);

  const updateEquipment = useCallback(async (itemId: string, data: any) => {
    if (characterId === 'new') {
      setEquipment(equipment.map(e => e.id === itemId ? { ...e, ...data } : e));
      return;
    }

    try {
      const res = await fetch(`/api/characters/${characterId}/equipment/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setEquipment(equipment.map(e => e.id === itemId ? updated : e));
        return updated;
      }
      throw new Error('Fehler beim Aktualisieren');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [characterId, equipment]);

  const deleteEquipment = useCallback(async (itemId: string) => {
    if (characterId === 'new') {
      setEquipment(equipment.filter(e => e.id !== itemId));
      return;
    }

    try {
      const res = await fetch(`/api/characters/${characterId}/equipment/${itemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEquipment(equipment.filter(e => e.id !== itemId));
      }
      throw new Error('Fehler beim Löschen');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [characterId, equipment]);

  const toggleEquip = useCallback(async (itemId: string, equipped: boolean) => {
    if (characterId === 'new') {
      setEquipment(equipment.map(e => 
        e.id === itemId ? { ...e, equipped } : 
        (equipped && (e.type === 'armor' || e.type === 'shield') && e.type === equipment.find(i => i.id === itemId)?.type)
          ? { ...e, equipped: false }
          : e
      ));
      return;
    }

    try {
      const res = await fetch(`/api/characters/${characterId}/equipment/${itemId}/equip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipped }),
      });
      if (res.ok) {
        const updated = await res.json();
        setEquipment(equipment.map(e => 
          e.id === itemId ? updated :
          (equipped && (updated.type === 'armor' || updated.type === 'shield') && e.type === updated.type)
            ? { ...e, equipped: false }
            : e
        ));
        return updated;
      }
      throw new Error('Fehler beim Ausrüsten');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [characterId, equipment]);

  useEffect(() => {
    if (autoLoad) {
      loadEquipment();
    }
  }, [autoLoad, loadEquipment]);

  return {
    equipment,
    loading,
    error,
    loadEquipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    toggleEquip,
    setEquipment,
  };
}