// src/components/character/spells/views/SpellcastingHeader.tsx
'use client';

import { Attribute } from '@/components/character/editors/AttributesEditor';
import { ClassLevel } from '@/components/character/editors/ClassLevelsEditor';
import { SPELLCASTING_ABILITY_LABELS, SpellcastingAbility } from '@/types/character';
import { SpellcastingInfo } from '@/types/spells';

interface SpellcastingHeaderProps {
  classLevels: ClassLevel[];
  attributes: Attribute[];
  proficiencyBonus: number;
  spellSlots?: { rank: number; total: number; used: number }[];
}

function mapAttributeNameToAbility(name: string): SpellcastingAbility | null {
  const map: Record<string, SpellcastingAbility> = {
    Stärke: 'str',
    Geschick: 'dex',
    Konstitution: 'con',
    Intelligenz: 'int',
    Weisheit: 'wis',
    Charisma: 'cha',
  };
  return map[name] || null;
}

export function SpellcastingHeader({
  classLevels,
  attributes,
  proficiencyBonus,
  spellSlots = [],
}: SpellcastingHeaderProps) {
  // Alle Klassen mit Spellcasting sammeln
  const spellcastingClasses = classLevels.filter(
    (cl) => cl.spellcastingAbility && cl.spellcastingAbility !== 'none'
  );

  if (spellcastingClasses.length === 0) {
    return null;
  }

  const getAbilityModifier = (ability: SpellcastingAbility): number => {
    const abilityNameMap: Record<SpellcastingAbility, string> = {
      str: 'Stärke',
      dex: 'Geschick',
      con: 'Konstitution',
      int: 'Intelligenz',
      wis: 'Weisheit',
      cha: 'Charisma',
      none: '',
    };
    const attrName = abilityNameMap[ability];
    const attr = attributes.find((a) => a.name === attrName);
    const value = attr?.value ?? 10;
    return Math.floor((value - 10) / 2);
  };

  const infos: SpellcastingInfo[] = spellcastingClasses.map((cl) => {
    const abilityMod = getAbilityModifier(cl.spellcastingAbility);
    return {
      classLevelId: cl.id || '',
      className: cl.className,
      ability: cl.spellcastingAbility,
      saveDC: 8 + proficiencyBonus + abilityMod,
      attackBonus: proficiencyBonus + abilityMod,
      proficiencyBonus,
      abilityModifier: abilityMod,
    };
  });

  const totalSlotsUsed = spellSlots.reduce((sum, s) => sum + s.used, 0);
  const totalSlotsMax = spellSlots.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-lg p-4 border border-purple-500/40">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-purple-200 flex items-center gap-2">
          ✨ Spellcasting
        </h3>
        {totalSlotsMax > 0 && (
          <div className="text-xs text-gray-300">
            Zauberplätze:{' '}
            <span className="font-mono text-purple-200">
              {totalSlotsMax - totalSlotsUsed} / {totalSlotsMax}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {infos.map((info) => (
          <div
            key={info.classLevelId || info.className}
            className="bg-gray-900/60 rounded-lg p-3 border border-purple-500/20"
          >
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <span className="font-semibold text-sm text-purple-200">
                {info.className}
              </span>
              <span className="text-xs text-gray-400">
                {SPELLCASTING_ABILITY_LABELS[info.ability]}
                {info.abilityModifier !== 0 && (
                  <span className="ml-1 font-mono text-purple-300">
                    ({info.abilityModifier >= 0 ? '+' : ''}
                    {info.abilityModifier})
                  </span>
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-800/60 rounded p-2 text-center">
                <div className="text-xs text-gray-400">Save DC</div>
                <div className="text-xl font-bold text-red-300">{info.saveDC}</div>
              </div>
              <div className="bg-gray-800/60 rounded p-2 text-center">
                <div className="text-xs text-gray-400">Attack</div>
                <div className="text-xl font-bold text-orange-300">
                  +{info.attackBonus}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 text-xs text-gray-400">
        💡 Formel: Save DC = 8 + Übungsbonus ({proficiencyBonus}) +
        Attributsmodifikator · Attack = Übungsbonus + Attributsmodifikator
      </div>
    </div>
  );
}