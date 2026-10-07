// // src/app/characters/[id]/edit/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { CharacterForm, CharacterFormData } from '@/components/character/CharacterForm';

export default function EditCharacterPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const handleSave = async (data: CharacterFormData) => {
    const res = await fetch(`/api/characters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Fehler beim Speichern');
    }
    router.push(`/characters/${id}`);
    router.refresh();
  };

  return (
    <CharacterForm
      characterId={id}
      mode="edit"
      onSave={handleSave}
      onCancel={() => router.push(`/characters/${id}`)}
    />
  );
}