// src/components/library/LibraryPage.tsx
'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLibraryAdmin } from '@/hooks/useLibraryAdmin';
import { LibraryEntryCard } from './LibraryEntryCard';

const TYPE_TABS: { value: string; label: string; icon: string }[] = [
  { value: 'all', label: 'Alle', icon: '📚' },
  { value: 'skill', label: 'Fertigkeiten', icon: '🎯' },
  { value: 'saving_throw', label: 'Rettungswürfe', icon: '🎲' },
  { value: 'proficiency', label: 'Übungen', icon: '📖' },
  { value: 'defense', label: 'Verteidigungen', icon: '🛡️' },
  { value: 'status_effect', label: 'Status-Effekte', icon: '✨' },
  { value: 'attribute', label: 'Attribute', icon: '💪' },
  { value: 'action', label: 'Aktionen', icon: '⚡' },
  { value: 'weapon_property', label: 'Waffen-Eigenschaften', icon: '⚔️' },
];

const CATEGORY_LABELS: Record<string, string> = {
  language: 'Sprachen',
  armor: 'Rüstungen',
  weapon: 'Waffen',
  tool: 'Werkzeuge',
  damage_immunity: 'Schadensimmunitäten',
  damage_resistance: 'Schadensresistenzen',
  condition_immunity: 'Zustandsimmunitäten',
  action: 'Aktionen',
  bonus_action: 'Bonusaktionen',
  reaction: 'Reaktionen',
};

function LibraryPageInner() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'all';
  const initialCategory = searchParams.get('category') || null;

  const { entries, loading, error, reload, update, remove } = useLibraryAdmin();
  const [activeType, setActiveType] = useState<string>(initialType);
  const [activeCategory, setActiveCategory] = useState<string | null>(
    initialCategory
  );
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = entries;
    if (activeType !== 'all') {
      list = list.filter((e) => e.type === activeType);
    }
    if (activeCategory) {
      list = list.filter((e) => e.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }
    // Kopie sortieren — sonst mutiert .sort() das Array aus dem Hook-State (Pitfall #4)
    return [...list].sort((a, b) => {
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.name.localeCompare(b.name);
    });
  }, [entries, activeType, activeCategory, search]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: entries.length };
    entries.forEach((e) => {
      map[e.type] = (map[e.type] || 0) + 1;
    });
    return map;
  }, [entries]);

  // Kategorien, die im aktiven Type tatsächlich vorkommen (abgeleitet, nicht hardcodiert)
  const categoryChips = useMemo(() => {
    if (activeType === 'all') return [];
    // Zähler innerhalb des aktiven Types, unabhängig vom Suchtext
    const map = new Map<string, number>();
    entries.forEach((e) => {
      if (e.type !== activeType || !e.category) return;
      map.set(e.category, (map.get(e.category) || 0) + 1);
    });
    return [...map.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => a.category.localeCompare(b.category));
  }, [entries, activeType]);

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    setActiveCategory(null);
  };

  // Klick auf den aktiven Chip hebt den Filter wieder auf
  const toggleCategory = (category: string) =>
    setActiveCategory(activeCategory === category ? null : category);

  const clearCategoryFilter = () => setActiveCategory(null);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-start gap-4 mb-6 flex-wrap">
        <div>
          <Link href="/characters" className="text-purple-400">
            ← Zurück
          </Link>
          <h1 className="text-2xl font-bold inline ml-4">
            🏛️ Bibliothek von Babylon
          </h1>
          <p className="text-sm text-gray-400 mt-2 max-w-2xl">
            Deine persönliche Sammlung wiederverwendbarer Bausteine. Alles, was
            du hier oder beim Charakter-Erstellen anlegst, steht dir in jeder
            neuen Kampagne sofort zur Verfügung.
          </p>
        </div>
        <button type="button"
          onClick={reload}
          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
        >
          🔄 Neu laden
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {TYPE_TABS.map((tab) => (
          <button type="button"
            key={tab.value}
            onClick={() => handleTypeChange(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              activeType === tab.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800/50 hover:bg-gray-800 text-gray-300'
            }`}
          >
            {tab.icon} {tab.label}
            <span className="ml-1.5 text-xs opacity-70">
              ({counts[tab.value] || 0})
            </span>
          </button>
        ))}
      </div>

      {/* Kategorie-Chips des aktiven Types */}
      {activeType !== 'all' && categoryChips.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-4">
          <span className="text-xs text-gray-400 self-center">Kategorie:</span>
          {categoryChips.map((cat) => (
            <button type="button"
              key={cat.category}
              onClick={() => toggleCategory(cat.category)}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                activeCategory === cat.category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800/50 hover:bg-gray-800 text-gray-300'
              }`}
            >
              {CATEGORY_LABELS[cat.category] || cat.category}
              <span className="ml-1.5 text-xs opacity-70">({cat.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Aktiver Kategorie-Filter */}
      {activeCategory && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-400">Gefiltert nach:</span>
          <span className="px-2 py-1 bg-purple-600/30 border border-purple-500/40 rounded-full text-xs flex items-center gap-1">
            {CATEGORY_LABELS[activeCategory] || activeCategory}
            <button type="button"
              onClick={clearCategoryFilter}
              className="text-red-400 hover:text-red-300"
              title="Filter entfernen"
            >
              ✕
            </button>
          </span>
        </div>
      )}

      {/* Suche */}
      <input
        type="text"
        placeholder="Suchen…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 bg-gray-800 rounded-lg mb-6 border border-gray-700"
      />

      {error && (
        <div className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-500 py-12">Lade Bibliothek…</div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center text-gray-500 py-12 italic bg-gray-800/30 rounded-lg">
          Keine Einträge gefunden.
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <LibraryEntryCard
              key={entry.id}
              entry={entry}
              onUpdate={update}
              onDelete={remove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function LibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500">
          Lade Bibliothek…
        </div>
      }
    >
      <LibraryPageInner />
    </Suspense>
  );
}