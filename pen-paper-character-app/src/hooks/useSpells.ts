// src/hooks/useSpells.ts
// Zauber-Hook

import { useState, useCallback, useEffect } from 'react';

interface UseSpellsOptions {
  characterId: string;
  autoLoad?: boolean;
}

export function useSpells({ characterId, autoLoad = true }: UseSpellsOptions) {
  const [spells, setSpells] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSpells = useCallback(async () => {
    if (characterId === 'new') {
      setSpells([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/characters/${characterId}/spells`);
      if (res.ok) {
        const data = await res.json();
        setSpells(data);
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

  const addSpell = useCallback(async (data: any) => {
    if (characterId === 'new') {
      const newSpell = { id: `temp-${Date.now()}`, ...data };
      setSpells([...spells, newSpell]);
      return newSpell;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/characters/${characterId}/spells`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created = await res.json();
        setSpells([...spells, created]);
        return created;
      }
      throw new Error('Fehler beim Erstellen');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [characterId, spells]);

  const updateSpell = useCallback(async (spellId: string, data: any) => {
    if (characterId === 'new') {
      setSpells(spells.map(s => s.id === spellId ? { ...s, ...data } : s));
      return;
    }

    try {
      const res = await fetch(`/api/characters/${characterId}/spells/${spellId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setSpells(spells.map(s => s.id === spellId ? updated : s));
        return updated;
      }
      throw new Error('Fehler beim Aktualisieren');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [characterId, spells]);

  const deleteSpell = useCallback(async (spellId: string) => {
    if (characterId === 'new') {
      setSpells(spells.filter(s => s.id !== spellId));
      return;
    }

    try {
      const res = await fetch(`/api/characters/${characterId}/spells/${spellId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSpells(spells.filter(s => s.id !== spellId));
      }
      throw new Error('Fehler beim Löschen');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [characterId, spells]);

  const togglePrepare = useCallback(async (spellId: string, prepared: boolean) => {
    if (characterId === 'new') {
      setSpells(spells.map(s => s.id === spellId ? { ...s, prepared } : s));
      return;
    }

    try {
      const res = await fetch(`/api/characters/${characterId}/spells/${spellId}/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prepared }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSpells(spells.map(s => s.id === spellId ? updated : s));
        return updated;
      }
      throw new Error('Fehler beim Vorbereiten');
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [characterId, spells]);

  useEffect(() => {
    if (autoLoad) {
      loadSpells();
    }
  }, [autoLoad, loadSpells]);

  return {
    spells,
    loading,
    error,
    loadSpells,
    addSpell,
    updateSpell,
    deleteSpell,
    togglePrepare,
    setSpells,
  };
}