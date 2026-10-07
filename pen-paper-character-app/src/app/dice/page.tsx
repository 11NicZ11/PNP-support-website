// pen-paper-character-app\src\app\dice\page.tsx

'use client';

import { DiceSet } from '@/components/dice/DiceSet';
import { DiceLog } from '@/components/dice/DiceLog';

export default function DicePage() {
  return (
    <div className="flex gap-6 px-4 py-12 max-w-7xl mx-auto">
      {/* Hauptinhalt */}
      <div className="flex-1 min-w-0">
        <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-purple-500/20 p-6">
          <h1 className="text-3xl font-bold mb-6">🎲 Würfel Becher</h1>
          <p className="text-gray-400 mb-8">
            Klicke auf einen Würfel um zu würfeln. Alle Ergebnisse werden im Log auf der rechten Seite gespeichert.
          </p>
          
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3">Standard Würfel</h2>
            <DiceSet />
          </div>
          
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h3 className="text-md font-semibold mb-2">💡 Tipp</h3>
            <p className="text-sm text-gray-400">
              Du kannst auch direkt auf den Charakter-Seiten auf Attribute klicken, um 
              Attributsproben zu würfeln. Der Charakter-Name wird dann automatisch im Log vermerkt.
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar mit DiceLog */}
      <div className="w-80 flex-shrink-0 hidden lg:block">
        <div className="sticky top-20">
          <DiceLog />
        </div>
      </div>
    </div>
  );
}