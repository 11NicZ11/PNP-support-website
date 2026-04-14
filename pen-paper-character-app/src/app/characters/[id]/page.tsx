'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HealthBar } from '@/components/character/HealthBar';
import { SavingThrows } from '@/components/character/SavingThrows';
import { InitiativeButton } from '@/components/character/InitiativeButton';
import { DefensesModal } from '@/components/character/DefensesModal';

interface Character {
  id: string;
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
  proficiencyBonus: number;
  initiativeBonus: number;
  savingThrowStrength: boolean;
  savingThrowDexterity: boolean;
  savingThrowConstitution: boolean;
  savingThrowIntelligence: boolean;
  savingThrowWisdom: boolean;
  savingThrowCharisma: boolean;
  damageImmunities: string;
  damageResistances: string;
  conditionImmunities: string;
  notes: string;
}

export default function CharacterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDefenses, setShowDefenses] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCharacter = async () => {
    const response = await fetch(`/api/characters/${id}`);
    const data = await response.json();
    setCharacter(data);
    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      loadCharacter();
    }
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        router.push('/characters');
        router.refresh();
      } else {
        alert('Fehler beim Löschen des Charakters');
      }
    } catch (error) {
      console.error('Fehler:', error);
      alert('Fehler beim Löschen');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const parseJsonArray = (jsonString: string): string[] => {
    try {
      return JSON.parse(jsonString || '[]');
    } catch {
      return [];
    }
  };

  const getModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!character) {
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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <Link href="/characters" className="text-purple-400 hover:text-purple-300">
          ← Zurück zur Übersicht
        </Link>
        <div className="flex gap-3">
          <Link
            href={`/characters/${id}/edit`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            ✏️ Bearbeiten
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
          >
            🗑️ Löschen
          </button>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-purple-500/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-orange-900/50 p-6 border-b border-purple-500/20">
          <h1 className="text-3xl font-bold">{character.name}</h1>
          <p className="text-gray-300 mt-2">
            {character.race} {character.class} • Level {character.level}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Übungsbonus: +{Math.floor((character.level + 7) / 4)}
          </p>
        </div>

        <div className="p-6">
          {/* Initiative Bereich */}
          <div className="mb-6">
            <InitiativeButton
              dexterity={character.dexterity}
              initiativeBonus={character.initiativeBonus || 0}
            />
          </div>

          {/* Defenses Button */}
          <div className="mb-8">
            <button
              onClick={() => setShowDefenses(true)}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center justify-center gap-2"
            >
              🛡️ Defenses & Immunitäten anzeigen/bearbeiten
            </button>
          </div>

          {/* HP Bereich mit schnellen Änderungen */}
          <div className="mb-8">
            <HealthBar 
              characterId={character.id}
              currentHp={character.currentHp}
              maxHp={character.maxHp}
              tempHp={character.tempHp}
              tempMaxHp={character.tempMaxHp}
              onUpdate={(updated) => setCharacter(updated)}
            />
          </div>

          {/* Attribute */}
          <h2 className="text-xl font-semibold mb-4">Attribute</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-400">💪 Stärke</div>
              <div className="text-2xl font-bold">{character.strength}</div>
              <div className="text-xs text-gray-500">Mod: {getModifier(character.strength) >= 0 ? `+${getModifier(character.strength)}` : getModifier(character.strength)}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-400">🤸 Geschick</div>
              <div className="text-2xl font-bold">{character.dexterity}</div>
              <div className="text-xs text-gray-500">Mod: {getModifier(character.dexterity) >= 0 ? `+${getModifier(character.dexterity)}` : getModifier(character.dexterity)}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-400">🛡️ Konstitution</div>
              <div className="text-2xl font-bold">{character.constitution}</div>
              <div className="text-xs text-gray-500">Mod: {getModifier(character.constitution) >= 0 ? `+${getModifier(character.constitution)}` : getModifier(character.constitution)}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-400">📚 Intelligenz</div>
              <div className="text-2xl font-bold">{character.intelligence}</div>
              <div className="text-xs text-gray-500">Mod: {getModifier(character.intelligence) >= 0 ? `+${getModifier(character.intelligence)}` : getModifier(character.intelligence)}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-400">🧠 Weisheit</div>
              <div className="text-2xl font-bold">{character.wisdom}</div>
              <div className="text-xs text-gray-500">Mod: {getModifier(character.wisdom) >= 0 ? `+${getModifier(character.wisdom)}` : getModifier(character.wisdom)}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-400">✨ Charisma</div>
              <div className="text-2xl font-bold">{character.charisma}</div>
              <div className="text-xs text-gray-500">Mod: {getModifier(character.charisma) >= 0 ? `+${getModifier(character.charisma)}` : getModifier(character.charisma)}</div>
            </div>
          </div>

          {/* Kampfwerte */}
          <h2 className="text-xl font-semibold mb-4">⚔️ Kampfwerte</h2>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-sm text-gray-400">🛡️ Rüstungsklasse</div>
              <div className="text-xl font-bold">{character.armorClass}</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-sm text-gray-400">👟 Bewegungsrate</div>
              <div className="text-xl font-bold">{character.speed} ft</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-sm text-gray-400">⚡ Übungsbonus</div>
              <div className="text-xl font-bold">+{Math.floor((character.level + 7) / 4)}</div>
            </div>
          </div>

          {/* Rettungswürfe */}
          <div className="mb-8">
            <SavingThrows
              characterId={character.id}
              strength={character.strength}
              dexterity={character.dexterity}
              constitution={character.constitution}
              intelligence={character.intelligence}
              wisdom={character.wisdom}
              charisma={character.charisma}
              proficiencyBonus={Math.floor((character.level + 7) / 4)}
              savingThrows={{
                strength: character.savingThrowStrength,
                dexterity: character.savingThrowDexterity,
                constitution: character.savingThrowConstitution,
                intelligence: character.savingThrowIntelligence,
                wisdom: character.savingThrowWisdom,
                charisma: character.savingThrowCharisma,
              }}
              onUpdate={(updated) => setCharacter(updated)}
            />
          </div>

          {/* Notizen */}
          {character.notes && (
            <>
              <h2 className="text-xl font-semibold mb-4">📝 Notizen</h2>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-300 whitespace-pre-wrap">{character.notes}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Defenses Modal */}
      <DefensesModal
        isOpen={showDefenses}
        onClose={() => setShowDefenses(false)}
        characterId={character.id}
        damageImmunities={parseJsonArray(character.damageImmunities)}
        damageResistances={parseJsonArray(character.damageResistances)}
        conditionImmunities={parseJsonArray(character.conditionImmunities)}
        onUpdate={(updated) => setCharacter(updated)}
      />

      {/* Löschen Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md mx-4 border border-red-500/30">
            <h2 className="text-xl font-bold mb-4">Charakter löschen?</h2>
            <p className="text-gray-300 mb-6">
              Bist du sicher, dass du <strong>{character.name}</strong> löschen möchtest?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-50"
              >
                {isDeleting ? 'Wird gelöscht...' : 'Ja, löschen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}