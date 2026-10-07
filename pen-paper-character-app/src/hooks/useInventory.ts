// src/hooks/useInventory.ts
// Inventar-Hook

import { useState, useCallback, useEffect } from 'react';

interface UseInventoryOptions {
  characterId: string;
  autoLoad?: boolean;
}

export function useInventory({ characterId, autoLoad = true }: UseInventoryOptions) {
  const [containers, setContainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isNew = characterId === 'new';
  const storageKey = `containers_${characterId}`;

  const loadContainers = useCallback(async () => {
    if (isNew) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try { setContainers(JSON.parse(saved)); } catch {}
      } else {
        setContainers([]);
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/characters/${characterId}/inventory`);
      if (res.ok) {
        const data = await res.json();
        setContainers(data);
      } else {
        const err = await res.json();
        setError(err.error || 'Fehler beim Laden');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [characterId, isNew, storageKey]);

  const saveContainers = useCallback((newContainers: any[]) => {
    setContainers(newContainers);
    if (isNew) {
      localStorage.setItem(storageKey, JSON.stringify(newContainers));
    }
  }, [isNew, storageKey]);

  const addContainer = useCallback(async (data: any) => {
    if (isNew) {
      const newContainer = {
        id: `temp-${Date.now()}`,
        ...data,
        characterId,
        children: [],
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const newContainers = [...containers, newContainer];
      saveContainers(newContainers);
      return newContainer;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/characters/${characterId}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setContainers([...containers, created]);
        return created;
      }
      const err = await res.json();
      throw new Error(err.error || 'Fehler beim Erstellen');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [characterId, containers, isNew, saveContainers]);

  const updateContainer = useCallback(async (containerId: string, data: any) => {
    if (isNew) {
      const newContainers = containers.map(c => 
        c.id === containerId ? { ...c, ...data } : c
      );
      saveContainers(newContainers);
      return;
    }

    try {
      const res = await fetch(`/api/characters/${characterId}/inventory/${containerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setContainers(containers.map(c => c.id === containerId ? updated : c));
        return updated;
      }
      const err = await res.json();
      throw new Error(err.error || 'Fehler beim Aktualisieren');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [characterId, containers, isNew, saveContainers]);

  const deleteContainer = useCallback(async (containerId: string) => {
    if (isNew) {
      saveContainers(containers.filter(c => c.id !== containerId));
      return;
    }

    try {
      const res = await fetch(`/api/characters/${characterId}/inventory/${containerId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setContainers(containers.filter(c => c.id !== containerId));
        return;
      }
      const err = await res.json();
      throw new Error(err.error || 'Fehler beim Löschen');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [characterId, containers, isNew, saveContainers]);

  useEffect(() => {
    if (autoLoad) {
      loadContainers();
    }
  }, [autoLoad, loadContainers]);

  return {
    containers,
    loading,
    error,
    loadContainers,
    saveContainers,
    addContainer,
    updateContainer,
    deleteContainer,
    setContainers,
  };
}