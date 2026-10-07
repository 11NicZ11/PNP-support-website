// src/hooks/useLibrary.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export type PostMode = 'reuse' | 'update' | 'force-new';

/**
 * Ergebnis von `createWithModeResult` — im Gegensatz zu `createWithMode`
 * geht die Fehlermeldung der API nicht verloren (kein Silent-Fail).
 */
export type CreateModeResult =
  | { ok: true; entry: LibraryEntry & { status: string } }
  | { ok: false; error: string };

export interface LibraryEntry {
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
  status?: 'created' | 'reused' | 'updated';
}

export interface CreateLibraryEntryInput {
  type: string;
  category?: string;
  name: string;
  description?: string;
  icon?: string;
  data?: Record<string, any>;
  isPublic?: boolean;
  // Reference-Pattern: steuert das Verhalten bei Duplikaten.
  mode?: PostMode;
  targetEntryId?: string;
}

interface UseLibraryOptions {
  type: string;
  category?: string;
  autoLoad?: boolean;
}

export function useLibrary({
  type,
  category,
  autoLoad = true,
}: UseLibraryOptions) {
  const [entries, setEntries] = useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ type });
      if (category !== undefined) params.set('category', category);

      const res = await fetch(`/api/library?${params.toString()}`);
      if (!res.ok) throw new Error('Fehler beim Laden der Bibliothek');
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [type, category]);

  const createWithModeResult = useCallback(
    async (input: CreateLibraryEntryInput): Promise<CreateModeResult> => {
      try {
        const res = await fetch('/api/library', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: input.type,
            category: input.category || '',
            name: input.name,
            description: input.description || '',
            icon: input.icon || '📚',
            data: input.data || {},
            isPublic: input.isPublic !== false,
            mode: input.mode || 'reuse',
            targetEntryId: input.targetEntryId,
          }),
        });

        // Die Antwort ist polymorph: Fehler → { error: string },
        // Erfolg → voller LibraryEntry-Body (+ status). `any` hier bewusst.
        const body: any = await res.json().catch(() => null);

        if (!res.ok && res.status !== 200 && res.status !== 201) {
          const serverError =
            typeof body?.error === 'string' ? body.error : null;
          return { ok: false, error: serverError || 'Fehler beim Erstellen' };
        }

        if (!body || typeof body.id !== 'string') {
          return { ok: false, error: 'Ungültige Antwort der Bibliothek' };
        }

        const result = body as LibraryEntry & { status: string };
        setEntries((prev) => {
          if (result.status === 'reused') {
            // Eintrag existiert bereits — nichts hinzufügen.
            return prev;
          }
          if (result.status === 'updated') {
            return prev.map((e) =>
              e.id === result.id ? { ...e, ...result } : e
            );
          }
          // 'created' (oder unbekannter Status) → anhängen, falls neu.
          if (prev.some((e) => e.id === result.id)) return prev;
          return [...prev, result];
        });
        return { ok: true, entry: result };
      } catch (err) {
        console.error('Library POST Fehler:', err);
        return {
          ok: false,
          error: err instanceof Error ? err.message : 'Unbekannter Fehler',
        };
      }
    },
    []
  );

  // Wrapper (Backward-Compat, kein Big-Bang): Meldet Erfolg/Fehler nur
  // als `entry` bzw. `null` — wer den Grund braucht, nimmt createWithModeResult.
  const createWithMode = useCallback(
    async (input: CreateLibraryEntryInput) => {
      const result = await createWithModeResult(input);
      return result.ok ? result.entry : null;
    },
    [createWithModeResult]
  );

  const create = useCallback(
    async (input: CreateLibraryEntryInput) => {
      return createWithMode({ ...input, mode: 'reuse' });
    },
    [createWithMode]
  );

  useEffect(() => {
    if (autoLoad) load();
  }, [autoLoad, load]);

  return { entries, loading, error, load, create, createWithMode, createWithModeResult };
}