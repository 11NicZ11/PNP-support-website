'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CharacterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    race: '',
    class: '',
    level: 1,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    maxHp: 10,
    armorClass: 10,
    speed: 30,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('1. Sende Daten:', formData);
      
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('2. Response Status:', response.status);
      console.log('3. Response OK:', response.ok);
      
      const data = await response.json();
      console.log('4. Response Data:', data);

      if (!response.ok) {
        throw new Error(data.error || data.details || `HTTP ${response.status}`);
      }

      console.log('5. Erfolg, redirecte...');
      router.push('/characters');
      router.refresh();
    } catch (error: any) {
      console.error('DETAILIERTER FEHLER:', error);
      setError(error?.message || 'Ein unbekannter Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'race' || name === 'class' 
        ? value 
        : parseInt(value) || 0
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6">
      <div className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-purple-500/20">
        <h2 className="text-2xl font-bold mb-4">Neuen Charakter erstellen</h2>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 text-red-300">
            <strong>Fehler:</strong> {error}
          </div>
        )}
        
        <div className="grid gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rasse</label>
              <input
                type="text"
                name="race"
                value={formData.race}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Klasse</label>
              <input
                type="text"
                name="class"
                value={formData.class}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <input
              type="number"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {isLoading ? 'Wird erstellt...' : 'Charakter erstellen'}
        </button>
      </div>
    </form>
  );
}