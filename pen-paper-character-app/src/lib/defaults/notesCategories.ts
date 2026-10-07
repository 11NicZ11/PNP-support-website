// src/lib/defaults/notesCategories.ts
import { NotesCategory } from '@/types/character';

/**
 * Standard-Notiz-Kategorien, die beim ersten Öffnen des Notes-Editors angelegt werden.
 */
export const DEFAULT_NOTES_CATEGORIES: NotesCategory[] = [
  {
    id: 'backstory',
    name: 'Backstory',
    content: '',
    isCustom: false,
  },
  {
    id: 'npcs',
    name: 'NPCs',
    content: '',
    isCustom: false,
  },
  {
    id: 'quests',
    name: 'Aufträge',
    content: '',
    isCustom: false,
  },
  {
    id: 'loot',
    name: 'Loot',
    content: '',
    isCustom: false,
  },
  {
    id: 'other',
    name: 'Sonstiges',
    content: '',
    isCustom: false,
  },
];

/**
 * Initialisiert die Notiz-Kategorien.
 * - Wenn noch keine Kategorien vorhanden sind, werden die Standard-Kategorien erstellt.
 * - Der alte `notes`-String (falls vorhanden) wird in die erste Kategorie übernommen.
 */
export const initializeNotesCategories = (
  existing: NotesCategory[] | undefined | null,
  legacyNotes: string | undefined | null
): NotesCategory[] => {
  // Wenn schon Kategorien vorhanden sind, direkt zurückgeben
  if (existing && Array.isArray(existing) && existing.length > 0) {
    return existing;
  }

  // Sonst Standard-Kategorien mit Legacy-Notes in "Sonstiges" (oder "Backstory")
  const base = DEFAULT_NOTES_CATEGORIES.map((c) => ({ ...c }));

  if (legacyNotes && legacyNotes.trim().length > 0) {
    // Pack den alten Notiz-Text in "Sonstiges"
    const other = base.find((c) => c.id === 'other');
    if (other) {
      other.content = legacyNotes;
    }
  }

  return base;
};