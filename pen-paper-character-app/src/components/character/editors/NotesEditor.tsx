// src/components/character/edit/NotesEditor.tsx
'use client';

import { useState } from 'react';
import { NotesCategory } from '@/types/character';

interface NotesEditorProps {
  categories: NotesCategory[];
  onUpdate: (categories: NotesCategory[]) => void;
  readOnly?: boolean;
}

export function NotesEditor({ categories, onUpdate, readOnly = false }: NotesEditorProps) {
  const [activeTab, setActiveTab] = useState<string>(
    categories.length > 0 ? categories[0].id : ''
  );
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const activeCategory = categories.find((c) => c.id === activeTab) || categories[0];

  const updateCategoryContent = (id: string, content: string) => {
    onUpdate(categories.map((c) => (c.id === id ? { ...c, content } : c)));
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    if (categories.some((c) => c.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      alert('Eine Kategorie mit diesem Namen existiert bereits!');
      return;
    }
    const newCategory: NotesCategory = {
      id: `custom-${Date.now()}`,
      name: newCategoryName.trim(),
      content: '',
      isCustom: true,
    };
    onUpdate([...categories, newCategory]);
    setActiveTab(newCategory.id);
    setNewCategoryName('');
    setShowNewCategoryForm(false);
  };

  const deleteCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    if (!cat.isCustom) {
      alert('Standard-Kategorien können nicht gelöscht werden!');
      return;
    }
    if (!confirm(`Möchtest du die Kategorie "${cat.name}" wirklich löschen?`)) return;
    const newCategories = categories.filter((c) => c.id !== id);
    onUpdate(newCategories);
    if (activeTab === id) {
      setActiveTab(newCategories.length > 0 ? newCategories[0].id : '');
    }
  };

  const renameCategory = (id: string, newName: string) => {
    if (!newName.trim()) return;
    onUpdate(categories.map((c) => (c.id === id ? { ...c, name: newName.trim() } : c)));
  };

  // ==================== VIEW-MODE ====================
  if (readOnly) {
    return (
      <div className="bg-gray-800/30 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">📝 Notizen</h2>
        {categories.length === 0 ? (
          <div className="text-gray-500 text-sm italic">Keine Notizen vorhanden</div>
        ) : (
          <div className="space-y-3">
            {categories
              .filter((c) => c.content.trim().length > 0)
              .map((cat) => (
                <div key={cat.id} className="bg-gray-800/50 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-purple-400 mb-1">{cat.name}</h3>
                  <div className="text-gray-300 whitespace-pre-wrap text-sm">{cat.content}</div>
                </div>
              ))}
            {categories.every((c) => c.content.trim().length === 0) && (
              <div className="text-gray-500 text-sm italic">Keine Notizen vorhanden</div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ==================== EDIT-MODE ====================
  return (
    <div className="bg-gray-800/30 rounded-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">📝 Notizen</h2>
        {!showNewCategoryForm && (
          <button
            type="button"
            onClick={() => setShowNewCategoryForm(true)}
            className="px-3 py-1 bg-purple-600 rounded text-xs hover:bg-purple-700 transition"
          >
            + Kategorie
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-700 mb-3">
        {categories.map((cat) => (
          <div key={cat.id} className="relative group">
            <button
              type="button"
              onClick={() => setActiveTab(cat.id)}
              onDoubleClick={() => {
                if (cat.isCustom) {
                  const newName = prompt('Neuer Name:', cat.name);
                  if (newName) renameCategory(cat.id, newName);
                }
              }}
              className={`px-3 py-1.5 text-sm rounded-t-lg transition flex items-center gap-1 ${
                activeTab === cat.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {cat.name}
              {cat.isCustom && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCategory(cat.id);
                  }}
                  className="text-red-400 hover:text-red-300 ml-1"
                  title="Kategorie löschen"
                >
                  ×
                </button>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Neue Kategorie */}
      {showNewCategoryForm && (
        <div className="mb-3 p-2 bg-gray-800 rounded-lg flex gap-2">
          <input
            type="text"
            placeholder="Name der Kategorie"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            className="flex-1 px-2 py-1 bg-gray-700 rounded text-sm"
            autoFocus
          />
          <button
            type="button"
            onClick={addCategory}
            disabled={!newCategoryName.trim()}
            className="px-3 py-1 bg-green-600 rounded text-sm disabled:opacity-50"
          >
            Hinzufügen
          </button>
          <button
            type="button"
            onClick={() => {
              setShowNewCategoryForm(false);
              setNewCategoryName('');
            }}
            className="px-3 py-1 bg-gray-600 rounded text-sm"
          >
            Abbrechen
          </button>
        </div>
      )}

      {/* Content-Bereich */}
      {activeCategory ? (
        <textarea
          value={activeCategory.content}
          onChange={(e) => updateCategoryContent(activeCategory.id, e.target.value)}
          rows={10}
          placeholder={`Notizen für "${activeCategory.name}"...\n\nUnterstützt Markdown: **fett**, *kursiv*, # Überschrift, - Liste`}
          className="w-full px-3 py-2 bg-gray-800 rounded-lg resize-y text-sm"
        />
      ) : (
        <div className="text-gray-500 text-sm italic">
          Keine Kategorie ausgewählt. Erstelle eine neue Kategorie.
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        💡 Doppelklick auf eigene Kategorie zum Umbenennen. Markdown wird beim Anzeigen unterstützt.
      </p>
    </div>
  );
}