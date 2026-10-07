// src/app/characters/new/page.tsx
'use client';

import { CharacterForm } from '@/components/character/CharacterForm';

export default function NewCharacterPage() {
  // Kein `onSave`: CharacterForm nutzt den eingebauten Create-Pfad aus
  // useCharacterSubmit (POST /api/characters → Aktionen nachziehen → Redirect).
  return <CharacterForm characterId="new" mode="create" />;
}