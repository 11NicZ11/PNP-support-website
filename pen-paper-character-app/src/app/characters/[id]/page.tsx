// src/app/characters/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { CharacterForm } from '@/components/character/CharacterForm';

export default function CharacterDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return <CharacterForm characterId={id} mode="view" />;
}