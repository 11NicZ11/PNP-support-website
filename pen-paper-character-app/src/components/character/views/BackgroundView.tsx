// pen-paper-character-app\src\components\character\view\BackgroundView.tsx

'use client';

import { AbilityScoreIncreaseView } from './AbilityScoreIncreaseView';
import { BackgroundData } from '@/types/background';

// Export bleibt erhalten (06-do-not: exports nicht umbenennen).
export type { BackgroundData };

interface BackgroundViewProps {
  background: BackgroundData;
}

export function BackgroundView({ background }: BackgroundViewProps) {
  const hasContent =
    background.name ||
    background.traits ||
    background.ideals ||
    background.bonds ||
    background.flaws ||
    background.features ||
    background.bonusSkills.length > 0 ||
    background.bonusLanguages.length > 0 ||
    background.allies ||
    background.organizations ||
    Object.keys(background.abilityScoreIncrease?.bonuses || {}).length > 0 ||
    (background.toolProficiencies?.length || 0) > 0;

  if (!hasContent) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p className="text-lg">📜 Keine Hintergrundinformationen vorhanden.</p>
        <p className="text-sm mt-2">Klicke auf &quot;Bearbeiten&quot;, um einen Hintergrund hinzuzufügen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {background.name && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-md font-semibold text-purple-400">Hintergrund</h3>
          <p className="text-gray-200 text-lg">{background.name}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {background.traits && (
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h3 className="text-md font-semibold text-purple-400">Persönlichkeitsmerkmale</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{background.traits}</p>
          </div>
        )}
        {background.ideals && (
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h3 className="text-md font-semibold text-purple-400">Ideale</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{background.ideals}</p>
          </div>
        )}
        {background.bonds && (
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h3 className="text-md font-semibold text-purple-400">Bindungen</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{background.bonds}</p>
          </div>
        )}
        {background.flaws && (
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h3 className="text-md font-semibold text-purple-400">Schwächen</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{background.flaws}</p>
          </div>
        )}
      </div>

      {background.features && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-md font-semibold text-purple-400">Feature</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{background.features}</p>
        </div>
      )}

      {background.allies && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-md font-semibold text-purple-400">Verbündete</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{background.allies}</p>
        </div>
      )}

      {background.organizations && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-md font-semibold text-purple-400">Organisationen</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{background.organizations}</p>
        </div>
      )}

      <AbilityScoreIncreaseView
        value={background.abilityScoreIncrease}
        label="Statuswert-Erhöhungen"
      />

      {background.toolProficiencies && background.toolProficiencies.length > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-md font-semibold text-purple-300 mb-2">Werkzeug-Übungen</h3>
          <div className="flex flex-wrap gap-2">
            {background.toolProficiencies.map((tool: string) => (
              <span key={tool} className="px-2 py-1 bg-blue-600/30 rounded-lg text-sm">{tool}</span>
            ))}
          </div>
        </div>
      )}

      {(background.bonusSkills.length > 0 || background.bonusLanguages.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {background.bonusSkills.length > 0 && (
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h3 className="text-md font-semibold text-purple-400 mb-2">Bonus-Fertigkeiten</h3>
              <div className="flex flex-wrap gap-2">
                {background.bonusSkills.map((s: string) => (
                  <span key={s} className="px-2 py-1 bg-purple-600/30 rounded text-sm">{s}</span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Diese Fertigkeiten sind durch den Hintergrund geübt.</p>
            </div>
          )}
          {background.bonusLanguages.length > 0 && (
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h3 className="text-md font-semibold text-purple-400 mb-2">Bonus-Sprachen</h3>
              <div className="flex flex-wrap gap-2">
                {background.bonusLanguages.map((l: string) => (
                  <span key={l} className="px-2 py-1 bg-indigo-600/30 rounded text-sm">{l}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}