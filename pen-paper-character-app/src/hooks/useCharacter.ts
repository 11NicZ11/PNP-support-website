// src/hooks/useCharacter.ts
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CharacterFormData } from '@/components/character/CharacterForm';

export interface UseCharacterOptions {
  characterId: string;
  onLoad?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useCharacter({ characterId, onLoad, onError }: UseCharacterOptions) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [character, setCharacter] = useState<CharacterFormData | null>(null);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const loadCharacter = useCallback(async () => {
    if (!characterId || characterId === 'new') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/characters/${characterId}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Fehler beim Laden');
      }
      const data = await res.json();
      setCharacter(data);
      if (onLoad) onLoad(data);
    } catch (err: any) {
      setError(err.message);
      if (onError) onError(err.message);
    } finally {
      setLoading(false);
    }
  }, [characterId, onLoad, onError]);

  const saveCharacter = useCallback(
    async (data: CharacterFormData) => {
      if (characterId === 'new') {
        return createCharacter(data);
      }

      setSaving(true);
      setError(null);
      try {
        const res = await fetch(`/api/characters/${characterId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Fehler beim Speichern');
        }
        const updated = await res.json();
        setCharacter(updated);
        return updated;
      } catch (err: any) {
        setError(err.message);
        if (onError) onError(err.message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [characterId, onError]
  );

  const createCharacter = useCallback(
    async (data: CharacterFormData) => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch('/api/characters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Fehler beim Erstellen');
        }
        const created = await res.json();
        router.push(`/characters/${created.id}`);
        return created;
      } catch (err: any) {
        setError(err.message);
        if (onError) onError(err.message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [router, onError]
  );

  const deleteCharacter = useCallback(async () => {
    if (characterId === 'new') return;
    setSaving(true);
    try {
      const res = await fetch(`/api/characters/${characterId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Fehler beim Löschen');
      }
      router.push('/characters');
    } catch (err: any) {
      setError(err.message);
      if (onError) onError(err.message);
    } finally {
      setSaving(false);
    }
  }, [characterId, router, onError]);

  useEffect(() => {
    loadCharacter();
  }, [loadCharacter]);

  return {
    character,
    loading,
    error,
    saving,
    loadCharacter,
    saveCharacter,
    createCharacter,
    deleteCharacter,
    setCharacter,
  };
}