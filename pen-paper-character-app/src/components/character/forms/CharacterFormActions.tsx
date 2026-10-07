// src/components/character/forms/CharacterFormActions.tsx
'use client';

import Link from 'next/link';

interface CharacterFormActionsProps {
  characterId: string;
  isNew: boolean;
  isEditable: boolean;
  saving: boolean;
  onCancel?: () => void;
}

export function CharacterFormActions({
  characterId,
  isNew,
  isEditable,
  saving,
  onCancel,
}: CharacterFormActionsProps) {
  return (
    <div className="flex gap-3 pt-6 mt-6 border-t">
      {isEditable ? (
        <>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg font-semibold disabled:opacity-50"
          >
            {saving
              ? isNew
                ? 'Erstelle...'
                : 'Speichert...'
              : isNew
              ? 'Charakter erstellen'
              : '💾 Speichern'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-gray-700 rounded-lg font-semibold"
            >
              Abbrechen
            </button>
          )}
        </>
      ) : (
        <Link
          href={`/characters/${characterId}/edit`}
          className="flex-1 py-3 bg-blue-600 rounded-lg font-semibold text-center"
        >
          ✏️ Bearbeiten
        </Link>
      )}
    </div>
  );
}