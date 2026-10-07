// src/hooks/useActions.ts
// Aktionen-Hook

import { useState, useCallback, useEffect } from 'react';

interface UseActionsOptions {
  characterId: string;
  autoLoad?: boolean;
}

export function useActions({ characterId, autoLoad = true }: UseActionsOptions) {
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActions = useCallback(async () => {
    if (characterId === 'new') {
      setActions([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/characters/${characterId}/actions`);
      if (res.ok) {
        const data = await res.json();
        setActions(data);
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

  const addAction = useCallback(async (data: any) => {
    if (characterId === 'new') {
      const newAction = { id: `temp-${Date.now()}`, ...data };
      setActions([...actions, newAction]);
      return newAction;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/characters/${characterId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setActions([...actions, created]);
        return created;
      }
      throw new Error('Fehler beim Erstellen');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [characterId, actions]);

  const deleteAction = useCallback(async (actionId: string) => {
    if (characterId === 'new') {
      setActions(actions.filter(a => a.id !== actionId));
      return;
    }

    try {
      const res = await fetch(`/api/characters/${characterId}/actions/${actionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setActions(actions.filter(a => a.id !== actionId));
      }
      throw new Error('Fehler beim Löschen');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [characterId, actions]);

  const updateAction = useCallback(async (actionId: string, data: any) => {
    if (characterId === 'new') {
      setActions(actions.map(a => a.id === actionId ? { ...a, ...data } : a));
      return;
    }

    try {
      const res = await fetch(`/api/characters/${characterId}/actions/${actionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setActions(actions.map(a => a.id === actionId ? updated : a));
        return updated;
      }
      throw new Error('Fehler beim Aktualisieren');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [characterId, actions]);

  useEffect(() => {
    if (autoLoad) {
      loadActions();
    }
  }, [autoLoad, loadActions]);

  return {
    actions,
    loading,
    error,
    loadActions,
    addAction,
    updateAction,
    deleteAction,
    setActions,
  };
}