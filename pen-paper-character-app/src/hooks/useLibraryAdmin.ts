// src/hooks/useLibraryAdmin.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface LibraryEntryFull {
  id: string;
  type: string;
  category: string;
  name: string;
  description: string;
  icon: string;
  isSeed: boolean;
  seedKind: 'system' | 'template' | null;
  isPublic: boolean;
  data: Record<string, any>;
}

export function useLibraryAdmin() {
  const [entries, setEntries] = useState<LibraryEntryFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/library');
      if (!res.ok) throw new Error('Fehler beim Laden der Bibliothek');
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (id: string, patch: Partial<LibraryEntryFull>) => {
      const res = await fetch(`/api/library/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Fehler beim Aktualisieren');
      }
      const updated = await res.json();
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...patch, ...updated } : e))
      );
      return updated;
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    const res = await fetch(`/api/library/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Fehler beim Löschen');
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { entries, loading, error, reload: load, update, remove };
}