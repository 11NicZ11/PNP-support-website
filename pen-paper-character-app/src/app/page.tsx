// pen-paper-character-app\src\app\page.tsx

'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    setIsRolling(true);
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 20) + 1;
      setDiceValue(roll);
      setIsRolling(false);
    }, 500);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-gradient">
            Deine Charaktere.
            <br />
            Deine Regeln.
            <br />
            Deine Welt.
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Erstelle und verwalte deine Pen & Paper Charaktere komplett frei. 
            Keine Einschränkungen, keine gekauften Bücher - nur deine Fantasie.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/characters/new"
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg font-semibold hover:opacity-90 transition transform hover:scale-105"
            >
              Charakter erstellen
            </Link>
            <Link
              href="/characters"
              className="px-8 py-3 bg-gray-800/50 backdrop-blur rounded-lg font-semibold hover:bg-gray-800 transition border border-purple-500/30"
            >
              Charaktere verwalten
            </Link>
          </div>
        </div>
      </div>

      {/* Würfel Demo */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gray-900/50 backdrop-blur rounded-2xl p-8 border border-purple-500/20">
            <h2 className="text-3xl font-bold mb-4">Probiere den Würfel aus!</h2>
            <p className="text-gray-400 mb-8">W20 Demo - Spüre den Nervenkitzel</p>
            
            <button type="button"
              onClick={rollDice}
              disabled={isRolling}
              className="relative w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-orange-600 rounded-2xl shadow-2xl dice-glow transition-all hover:scale-105 disabled:opacity-50"
            >
              {isRolling ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : diceValue !== null ? (
                <span className="text-5xl font-bold text-white">{diceValue}</span>
              ) : (
                <span className="text-2xl font-bold text-white">W20</span>
              )}
            </button>
            
            {diceValue !== null && !isRolling && (
              <p className="text-purple-400">
                Du hast eine {diceValue === 20 ? '💥 KRITISCHE 20! 💥' : diceValue === 1 ? '😱 Kritischer Fehlschlag! 😱' : `${diceValue} geworfen`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Warum dieser Character Manager?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: '🎲 Völlige Freiheit',
                description: 'Keine vorgegebenen Rassen oder Klassen. Erstelle genau das, was du dir vorstellst.'
              },
              {
                title: '📚 Keine Bücher nötig',
                description: 'Anders als D&D Beyond - du brauchst keine Regelbücher zu kaufen.'
              },
              {
                title: '⚡ Echtzeit Updates',
                description: 'Änderungen werden sofort gespeichert und synchronisiert.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-900/30 backdrop-blur rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition">
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}