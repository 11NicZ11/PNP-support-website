// src/components/library/LibraryEntryCard.tsx
'use client';

import { useState } from 'react';
import { LibraryEntryFull } from '@/hooks/useLibraryAdmin';
import {
  LIBRARY_TYPE_LABELS,
  LIBRARY_CATEGORY_LABELS,
} from './libraryLabels';

interface LibraryEntryCardProps {
  entry: LibraryEntryFull;
  onUpdate: (id: string, patch: Partial<LibraryEntryFull>) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

export function LibraryEntryCard({
  entry,
  onUpdate,
  onDelete,
}: LibraryEntryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(entry.name);
  const [editDescription, setEditDescription] = useState(entry.description);
  const [editIcon, setEditIcon] = useState(entry.icon);
  const [isSaving, setIsSaving] = useState(false);

  const typeInfo = LIBRARY_TYPE_LABELS[entry.type] || {
    label: entry.type,
    icon: '📚',
  };
  const categoryLabel = entry.category
    ? LIBRARY_CATEGORY_LABELS[entry.category] || entry.category
    : '';

  // Effektive Kategorie: System (unantastbar), Vorlage (editierbar, nicht
  // löschbar) oder User-Eintrag (voller Zugriff). Übergangs-Guard: isSeed
  // ohne seedKind (vor Backfill) wird wie System behandelt.
  const isSystem =
    entry.seedKind === 'system' ||
    (entry.isSeed && entry.seedKind === null);
  const isTemplate = entry.seedKind === 'template';
  const canEdit = !isSystem;
  const canDelete = !entry.isSeed;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(entry.id, {
        name: editName.trim() || entry.name,
        description: editDescription,
        icon: editIcon,
      });
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(entry.name);
    setEditDescription(entry.description);
    setEditIcon(entry.icon);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (entry.isSeed) {
      alert('System-Einträge können nicht gelöscht werden.');
      return;
    }
    if (!confirm(`"${entry.name}" wirklich löschen?`)) return;
    try {
      await onDelete(entry.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div
      className={`rounded-lg p-3 border transition ${
        isSystem
          ? 'bg-gray-800/30 border-gray-700/50'
          : isTemplate
          ? 'bg-gray-800/40 border-purple-500/20'
          : 'bg-gray-800/50 border-purple-500/30'
      }`}
    >
      <div className="flex items-center gap-3">
        {isEditing ? (
          <input
            type="text"
            value={editIcon}
            onChange={(e) => setEditIcon(e.target.value)}
            maxLength={4}
            className="w-12 px-2 py-1 bg-gray-700 rounded text-center text-lg"
          />
        ) : (
          <span className="text-2xl w-8 text-center">{entry.icon}</span>
        )}

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-2 py-1 bg-gray-700 rounded text-sm font-semibold mb-1"
              />
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Beschreibung"
                className="w-full px-2 py-1 bg-gray-700 rounded text-xs"
              />
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{entry.name}</span>
                <span className="text-xs text-gray-500">
                  {typeInfo.icon} {typeInfo.label}
                  {categoryLabel && ` · ${categoryLabel}`}
                </span>
                {isSystem && (
                  <span className="text-xs px-1.5 py-0.5 bg-blue-600/30 text-blue-300 rounded">
                    System
                  </span>
                )}
                {isTemplate && (
                  <span className="text-xs px-1.5 py-0.5 bg-purple-600/30 text-purple-300 rounded">
                    Vorlage
                  </span>
                )}
                {entry.data?.attributeName && (
                  <span className="text-xs text-gray-400">
                    ({entry.data.attributeName})
                  </span>
                )}
              </div>
              {entry.description && (
                <div className="text-xs text-gray-400 mt-0.5 truncate">
                  {entry.description}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-1">
          {isEditing ? (
            <>
              <button type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs disabled:opacity-50"
              >
                ✓ Speichern
              </button>
              <button type="button"
                onClick={handleCancel}
                className="px-2 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs"
              >
                Abbrechen
              </button>
            </>
          ) : (
            <>
              {canEdit && (
                <button type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-2 py-1 text-xs bg-blue-600/50 hover:bg-blue-600 rounded"
                  title="Bearbeiten"
                >
                  ✏️
                </button>
              )}
              {canDelete && (
                <button type="button"
                  onClick={handleDelete}
                  className="px-2 py-1 text-xs bg-red-600/50 hover:bg-red-600 rounded"
                  title="Löschen"
                >
                  🗑️
                </button>
              )}
              {!canEdit && !canDelete && (
                <span className="text-xs text-gray-500 italic px-2">
                  geschützt
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}