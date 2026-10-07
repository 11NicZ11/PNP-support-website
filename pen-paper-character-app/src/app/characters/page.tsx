// src/app/characters/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CharacterListItem {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<CharacterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/characters')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCharacters(data);
        } else {
          setCharacters([]);
          if (data?.error) setError(data.error);
          else setError('Ungültige Antwort vom Server');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Verbindungsfehler zum Server');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-6">
          <p className="text-red-300">Fehler: {error}</p>
          <button type="button"
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-600 rounded-lg"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meine Charaktere</h1>
        <Link
          href="/characters/new"
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg hover:opacity-90 transition"
        >
          + Neuer Charakter
        </Link>
      </div>

      {characters.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur rounded-xl p-12 text-center border border-purple-500/20">
          <p className="text-gray-400 mb-4">Du hast noch keine Charaktere erstellt.</p>
          <Link href="/characters/new" className="text-purple-400 hover:text-purple-300">
            Erstelle deinen ersten Charakter →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((char) => (
            <Link
              key={char.id}
              href={`/characters/${char.id}`}
              className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition group"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition">
                {char.name}
              </h3>
              <p className="text-gray-400">
                {char.race || '?'} {char.class || '?'} • Level {char.level}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}