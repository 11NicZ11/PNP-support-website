'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CharacterFormData {
  name: string;
  level: number;
  race: string;
  class: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  maxHp: number;
  currentHp: number;
  tempHp: number;
  tempMaxHp: number;
  armorClass: number;
  speed: number;
  initiativeBonus: number;
  savingThrowStrength: boolean;
  savingThrowDexterity: boolean;
  savingThrowConstitution: boolean;
  savingThrowIntelligence: boolean;
  savingThrowWisdom: boolean;
  savingThrowCharisma: boolean;
  notes: string;
}

export default function EditCharacterPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [formData, setFormData] = useState<CharacterFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/characters/${id}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            name: data.name,
            level: data.level,
            race: data.race,
            class: data.class,
            strength: data.strength,
            dexterity: data.dexterity,
            constitution: data.constitution,
            intelligence: data.intelligence,
            wisdom: data.wisdom,
            charisma: data.charisma,
            maxHp: data.maxHp,
            currentHp: data.currentHp,
            tempHp: data.tempHp || 0,
            tempMaxHp: data.tempMaxHp || 0,
            armorClass: data.armorClass,
            speed: data.speed,
            initiativeBonus: data.initiativeBonus || 0,
            savingThrowStrength: data.savingThrowStrength || false,
            savingThrowDexterity: data.savingThrowDexterity || false,
            savingThrowConstitution: data.savingThrowConstitution || false,
            savingThrowIntelligence: data.savingThrowIntelligence || false,
            savingThrowWisdom: data.savingThrowWisdom || false,
            savingThrowCharisma: data.savingThrowCharisma || false,
            notes: data.notes || '',
          });
          setLoading(false);
        })
        .catch(err => {
          console.error('Fehler:', err);
          setError('Charakter konnte nicht geladen werden');
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern');
      }

      router.push(`/characters/${id}`);
      router.refresh();
    } catch (error) {
      console.error('Fehler:', error);
      setError('Fehler beim Speichern des Charakters');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => prev ? {
      ...prev,
      [name]: type === 'checkbox' ? checked : (
        name === 'name' || name === 'race' || name === 'class' || name === 'notes'
          ? value 
          : parseInt(value) || 0
      )
    } : null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Charakter nicht gefunden</h1>
        <Link href="/characters" className="text-purple-400 hover:text-purple-300">
          ← Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center mb-6">
        <Link href={`/characters/${id}`} className="text-purple-400 hover:text-purple-300">
          ← Zurück
        </Link>
        <h1 className="text-2xl font-bold ml-4">Charakter bearbeiten</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900/50 backdrop-blur rounded-xl p-6 border border-purple-500/20">
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 text-red-300">
            {error}
          </div>
        )}

        {/* Basis Information */}
        <h2 className="text-lg font-semibold mb-3">📋 Basis Informationen</h2>
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
            <p className="text-xs text-gray-500 mt-1">Übungsbonus: +{Math.floor((formData.level + 7) / 4)}</p>
          </div>
        </div>

        {/* Attribute */}
        <h2 className="text-lg font-semibold mb-3">🎲 Attribute</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">💪 Stärke</label>
            <input
              type="number"
              name="strength"
              value={formData.strength}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">🤸 Geschick</label>
            <input
              type="number"
              name="dexterity"
              value={formData.dexterity}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">🛡️ Konstitution</label>
            <input
              type="number"
              name="constitution"
              value={formData.constitution}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">📚 Intelligenz</label>
            <input
              type="number"
              name="intelligence"
              value={formData.intelligence}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">🧠 Weisheit</label>
            <input
              type="number"
              name="wisdom"
              value={formData.wisdom}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">✨ Charisma</label>
            <input
              type="number"
              name="charisma"
              value={formData.charisma}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Trefferpunkte */}
        <h2 className="text-lg font-semibold mb-3">❤️ Trefferpunkte</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Maximale TP</label>
            <input
              type="number"
              name="maxHp"
              value={formData.maxHp}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Aktuelle TP</label>
            <input
              type="number"
              name="currentHp"
              value={formData.currentHp}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Temporäre Werte */}
        <h2 className="text-lg font-semibold mb-3">🛡️ Temporäre Werte</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Temporäre HP (Schild/Barriere)</label>
            <input
              type="number"
              name="tempHp"
              value={formData.tempHp}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Zusätzliche Schutzpunkte, die zuerst abgezogen werden</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">✨ Temporäre Max-HP</label>
            <input
              type="number"
              name="tempMaxHp"
              value={formData.tempMaxHp}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Erhöht die maximalen TP (z.B. durch Zauber wie "Aid")</p>
          </div>
        </div>

        {/* Kampfwerte */}
        <h2 className="text-lg font-semibold mb-3">⚔️ Kampfwerte</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Rüstungsklasse (RK)</label>
            <input
              type="number"
              name="armorClass"
              value={formData.armorClass}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bewegungsrate (ft)</label>
            <input
              type="number"
              name="speed"
              value={formData.speed}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">🎯 Initiative Bonus</label>
            <input
              type="number"
              name="initiativeBonus"
              value={formData.initiativeBonus}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Zusätzlicher Bonus auf Initiative (z.B. durch Feats oder Magie)</p>
          </div>
        </div>

        {/* Rettungswürfe Übungen */}
        <h2 className="text-lg font-semibold mb-3">🎲 Rettungswürfe (Übungen)</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="savingThrowStrength"
              checked={formData.savingThrowStrength}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 focus:ring-purple-500"
            />
            <span>💪 Stärke</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="savingThrowDexterity"
              checked={formData.savingThrowDexterity}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 focus:ring-purple-500"
            />
            <span>🤸 Geschick</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="savingThrowConstitution"
              checked={formData.savingThrowConstitution}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 focus:ring-purple-500"
            />
            <span>🛡️ Konstitution</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="savingThrowIntelligence"
              checked={formData.savingThrowIntelligence}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 focus:ring-purple-500"
            />
            <span>📚 Intelligenz</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="savingThrowWisdom"
              checked={formData.savingThrowWisdom}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 focus:ring-purple-500"
            />
            <span>🧠 Weisheit</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="savingThrowCharisma"
              checked={formData.savingThrowCharisma}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800 focus:ring-purple-500"
            />
            <span>✨ Charisma</span>
          </label>
        </div>

        {/* Notizen */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">📝 Notizen</label>
          <textarea
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            placeholder="Hintergrundgeschichte, Ausrüstung, Zauber, Notizen..."
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? 'Wird gespeichert...' : '💾 Speichern'}
          </button>
          <Link
            href={`/characters/${id}`}
            className="flex-1 py-3 bg-gray-700 rounded-lg font-semibold text-center hover:bg-gray-600 transition"
          >
            Abbrechen
          </Link>
        </div>
      </form>
    </div>
  );
}