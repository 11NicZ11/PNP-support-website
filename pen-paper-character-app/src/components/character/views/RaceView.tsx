// src/components/character/view/RaceView.tsx
'use client';

import { RaceData } from '../editors/RaceEditor';
import { AbilityScoreIncreaseView } from './AbilityScoreIncreaseView';
import { UnitSystem } from '@/types/character';
import { formatDistance, ftToM } from '@/lib/units';

interface RaceViewProps {
  raceData: RaceData | null;
  raceName?: string;
  unitSystem?: UnitSystem;
  alignment?: string;
}

export function RaceView({
  raceData,
  raceName,
  unitSystem = 'metric',
  alignment,
}: RaceViewProps) {
  if (!raceData || !raceData.name) {
    return (
      <div className="text-gray-500 italic">Keine Rasse angegeben.</div>
    );
  }

  const speedDisplay = formatDistance(ftToM(raceData.speed), unitSystem);

  const hasRaceBonuses =
    (raceData.bonusArmorClass ?? 0) !== 0 || (raceData.bonusHp ?? 0) !== 0;

  return (
    <div className="space-y-4">
      <div className="bg-gray-800/30 rounded-lg p-4">
        <h2 className="text-xl font-semibold text-purple-400">
          {raceData.name || raceName}
        </h2>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <span className="text-sm text-gray-400">Größenkategorie:</span>{' '}
            {raceData.sizeCategory || 'Mittel'}
          </div>
          <div>
            <span className="text-sm text-gray-400">Bewegung:</span>{' '}
            {speedDisplay}
          </div>
          {raceData.height && (
            <div>
              <span className="text-sm text-gray-400">Größe:</span>{' '}
              {raceData.height}
            </div>
          )}
          {raceData.weight && (
            <div>
              <span className="text-sm text-gray-400">Gewicht:</span>{' '}
              {raceData.weight}
            </div>
          )}
          {raceData.age && (
            <div>
              <span className="text-sm text-gray-400">Alter:</span>{' '}
              {raceData.age}
            </div>
          )}
        </div>
        {raceData.description && (
          <p className="text-gray-300 mt-2">{raceData.description}</p>
        )}
      </div>

      {hasRaceBonuses && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-md font-semibold text-purple-300 mb-2">
            ✨ Weitere Rassen-Boni
          </h3>
          <div className="flex flex-wrap gap-3 text-sm">
            {(raceData.bonusArmorClass ?? 0) !== 0 && (
              <span className="px-2 py-1 bg-blue-600/30 rounded-lg">
                🛡️ RK {raceData.bonusArmorClass >= 0 ? '+' : ''}
                {raceData.bonusArmorClass}
              </span>
            )}
            {(raceData.bonusHp ?? 0) !== 0 && (
              <span className="px-2 py-1 bg-red-600/30 rounded-lg">
                ❤️ HP {raceData.bonusHp >= 0 ? '+' : ''}
                {raceData.bonusHp}
              </span>
            )}
          </div>
        </div>
      )}

      {alignment && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-md font-semibold text-purple-300 mb-2">
            Gesinnung
          </h3>
          <p className="text-gray-300">{alignment}</p>
        </div>
      )}

      {raceData.faith && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-md font-semibold text-purple-300 mb-2">
            Glaube / Gottheit
          </h3>
          <p className="text-gray-300">{raceData.faith}</p>
        </div>
      )}

      {(raceData.personality ||
        raceData.bonds ||
        raceData.ideals ||
        raceData.flaws) && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-md font-semibold text-purple-300 mb-2">
            Charakteristiken
          </h3>
          <div className="space-y-2">
            {raceData.personality && (
              <div>
                <span className="text-xs text-gray-400">
                  Persönlichkeitsmerkmale:
                </span>
                <p className="text-gray-300 text-sm">{raceData.personality}</p>
              </div>
            )}
            {raceData.bonds && (
              <div>
                <span className="text-xs text-gray-400">Verbundenheiten:</span>
                <p className="text-gray-300 text-sm">{raceData.bonds}</p>
              </div>
            )}
            {raceData.ideals && (
              <div>
                <span className="text-xs text-gray-400">Ideale:</span>
                <p className="text-gray-300 text-sm">{raceData.ideals}</p>
              </div>
            )}
            {raceData.flaws && (
              <div>
                <span className="text-xs text-gray-400">Makel:</span>
                <p className="text-gray-300 text-sm">{raceData.flaws}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <AbilityScoreIncreaseView
        value={raceData.abilityScoreIncrease}
        label="Attributs-Boni"
      />

      {raceData.skillProficiencies && raceData.skillProficiencies.length > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-md font-semibold text-purple-300 mb-2">
            Fertigkeiten (durch Rasse)
          </h3>
          <div className="flex flex-wrap gap-2">
            {raceData.skillProficiencies.map((prof, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-indigo-600/30 rounded-lg text-sm"
              >
                {prof.skillName}
                {prof.source && (
                  <span className="text-xs text-gray-400 ml-1">
                    ({prof.source})
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {raceData.languages.length > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-md font-semibold text-purple-300 mb-2">
            Sprachen
          </h3>
          <div className="flex flex-wrap gap-2">
            {raceData.languages.map((lang) => (
              <span
                key={lang}
                className="px-2 py-1 bg-indigo-600/30 rounded-lg text-sm"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {raceData.traits.length > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-md font-semibold text-purple-300 mb-2">
            Rassenmerkmale
          </h3>
          <div className="space-y-2">
            {raceData.traits.map((trait, idx) => (
              <div key={idx} className="bg-gray-800/50 rounded p-2">
                <span className="font-semibold">{trait.name}</span>
                <p className="text-sm text-gray-300">{trait.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {raceData.hasSubrace && raceData.subraces.length > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-md font-semibold text-purple-300 mb-2">
            Unterrassen
          </h3>
          <div className="space-y-2">
            {raceData.subraces.map((subrace, idx) => (
              <div key={idx} className="bg-gray-800/50 rounded p-2">
                <span className="font-semibold">{subrace.name}</span>
                {subrace.description && (
                  <p className="text-sm text-gray-300">{subrace.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}