// src/components/character/view/ClassLevelsView.tsx
'use client';

import { ClassLevel } from '../editors/ClassLevelsEditor';
import {
  ClassProgression,
  CLASS_PROGRESSION_LABELS,
  HpSource,
  LevelingMode,
} from '@/types/character';
import {
  CLASS_FEATURE_KINDS,
  CLASS_FEATURE_SOURCES,
  CLASS_FEATURE_TYPES,
  CLASS_FEATURE_RECHARGE,
} from '@/types/classFeatures';
import {
  CharacterResource,
  CharacterHitDice,
  RESOURCE_RECHARGE_TYPES,
} from '@/types/resources';

interface ClassLevelsViewProps {
  classLevels: ClassLevel[];
  characterLevel: number;
  levelingMode: LevelingMode;
  experience: number;
  nextLevelExp: number;
  classProgression: ClassProgression;
  hpSources: HpSource[];
  constitutionValue: number;
  resources?: CharacterResource[];
  hitDice?: CharacterHitDice[];
  hasHitDice?: boolean;
}

export function ClassLevelsView({
  classLevels,
  characterLevel,
  levelingMode,
  experience,
  nextLevelExp,
  classProgression,
  hpSources,
  constitutionValue,
  resources = [],
  hitDice = [],
  hasHitDice = true,
}: ClassLevelsViewProps) {
  const getConMod = () => Math.floor((constitutionValue - 10) / 2);
  const getConModTotal = () => getConMod() * (characterLevel || 1);

  const totalHp = hpSources.reduce((sum, s) => sum + s.value, 0);
  const hasReachedNextLevel = experience >= nextLevelExp && levelingMode === 'exp';
  const expProgress = nextLevelExp > 0 ? Math.min(100, (experience / nextLevelExp) * 100) : 0;

  const getFeaturesByLevel = (features: any[]) => {
    if (!Array.isArray(features)) return [];
    const map: Record<number, any[]> = {};
    features.forEach((f) => {
      if (!map[f.level]) map[f.level] = [];
      map[f.level].push(f);
    });
    return Object.entries(map)
      .map(([lvl, feats]) => ({ level: parseInt(lvl), features: feats }))
      .sort((a, b) => a.level - b.level);
  };

  const renderClass = (cls: ClassLevel, idx: number) => {
    const featuresByLevel = getFeaturesByLevel(cls.features as any[]);
    const allLevels = Array.from({ length: cls.level }, (_, i) => i + 1);

    return (
      <div
        key={cls.id || idx}
        className={`rounded-lg border p-4 ${
          cls.isActive
            ? 'bg-gray-800/30 border-purple-500/30'
            : 'bg-gray-900/30 border-gray-700 opacity-75'
        }`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-purple-400">
            {cls.className} {cls.subclass && `â€“ ${cls.subclass}`}
          </h3>
          <div className="text-right">
            <div className="text-xs text-gray-400">Level</div>
            <div className="text-2xl font-bold">{cls.level}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
          <span>ðŸŽ² TrefferwÃ¼rfel: {cls.hitDie}</span>
          {cls.subclassLevel && <span>Subklasse ab Level {cls.subclassLevel}</span>}
          {cls.spellcastingAbility !== 'none' && (
            <span className="text-purple-300">
              âœ¨ Spellcasting: {cls.spellcastingAbility.toUpperCase()}
            </span>
          )}
          {!cls.isActive && (
            <span className="text-yellow-400">
              âš ï¸ Verlassen auf Level {cls.leftAtLevel ?? cls.level}
            </span>
          )}
          {cls.sourceReference && <span className="text-gray-500">ðŸ“– {cls.sourceReference}</span>}
        </div>

        {cls.savingThrowProficiencies && cls.savingThrowProficiencies.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-gray-400">RettungswÃ¼rfe:</span>
            {cls.savingThrowProficiencies.map((name) => (
              <span key={name} className="px-2 py-0.5 bg-purple-600/30 rounded">
                {name}
              </span>
            ))}
          </div>
        )}

        {cls.notes && (
          <div className="bg-gray-800/50 rounded p-2 text-xs text-gray-300 italic mb-3">
            ðŸ“ {cls.notes}
          </div>
        )}

        {featuresByLevel.length > 0 && (
          <div className="border-t border-gray-700 pt-3 space-y-3">
            {allLevels.map((lvl) => {
              const featuresAtLevel = featuresByLevel.find((f) => f.level === lvl)?.features || [];
              if (featuresAtLevel.length === 0) return null;
              return (
                <div key={lvl}>
                  <div className="text-xs font-semibold text-gray-400 mb-1">
                    Level {lvl}
                  </div>
                  <div className="space-y-1">
                    {featuresAtLevel.map((f: any) => {
                      const kindData = CLASS_FEATURE_KINDS.find((k) => k.value === (f.kind ?? 'feature'));
                      const sourceIcon =
                        CLASS_FEATURE_SOURCES.find((s) => s.value === f.source)?.icon || 'â€¢';
                      const typeData = CLASS_FEATURE_TYPES.find((t) => t.value === f.type);
                      const rechargeData = CLASS_FEATURE_RECHARGE.find(
                        (r) => r.value === f.rechargeType
                      );
                      return (
                        <div key={f.id} className="bg-gray-800/50 rounded-lg p-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span>{kindData?.icon || sourceIcon}</span>
                            <span className={`font-medium text-sm ${kindData?.color || ''}`}>
                              {f.name}
                            </span>
                            {f.kind && f.kind !== 'feature' && kindData && (
                              <span className="text-xs text-gray-400">{kindData.label}</span>
                            )}
                            {(!f.kind || f.kind === 'feature') && typeData && (
                              <span className="text-xs text-gray-400">
                                {typeData.icon} {typeData.label}
                              </span>
                            )}
                            {f.isConcentration && <span className="text-xs text-yellow-400">ðŸ§ </span>}
                            {f.attackRoll && <span className="text-xs text-orange-400">ðŸŽ¯</span>}
                            {f.savingThrow && (
                              <span className="text-xs text-red-400">ðŸ›¡ï¸ {f.savingThrow}</span>
                            )}
                            {f.usesPerRest && rechargeData && (
                              <span className="text-xs text-blue-400">
                                {f.usesPerRest}Ã— / {rechargeData.label}
                              </span>
                            )}
                          </div>
                          {f.description && (
                            <div className="text-xs text-gray-300 mt-1 whitespace-pre-wrap">
                              {f.description}
                            </div>
                          )}
                          {f.sourceReference && (
                            <div className="text-xs text-gray-500 mt-1">
                              ðŸ“– {f.sourceReference}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const track0Classes = classLevels.filter((cl) => cl.track === 0);
  const track1Classes = classLevels.filter((cl) => cl.track === 1);

  return (
    <div className="space-y-6">
      {/* Level-Ãœbersicht */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">ðŸŽšï¸ Level</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Gesamt-Level</div>
            <div className="text-3xl font-bold text-purple-400">{characterLevel}</div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-400">Progression</div>
            <div className="text-lg font-semibold">
              {CLASS_PROGRESSION_LABELS[classProgression]?.label || classProgression}
            </div>
          </div>
          {levelingMode === 'exp' && (
            <>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400">EXP</div>
                <div className="text-xl font-bold">{experience}</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-400">NÃ¤chstes Level</div>
                <div className="text-xl font-bold">{nextLevelExp}</div>
              </div>
            </>
          )}
        </div>
        {levelingMode === 'exp' && (
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Fortschritt</span>
              {hasReachedNextLevel && (
                <span className="text-green-400 font-semibold">
                  âœ¨ Level-Up verfÃ¼gbar!
                </span>
              )}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${hasReachedNextLevel ? 'bg-green-500' : 'bg-purple-500'}`}
                style={{ width: `${expProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* HP-Quellen */}
      <div className="bg-gray-800/30 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">â¤ï¸ Trefferpunkte</h3>
          <div className="text-2xl font-bold text-purple-400">{totalHp}</div>
        </div>
        <div className="space-y-1">
          {hpSources.map((src, idx) => (
            <div
              key={src.id || idx}
              className="flex justify-between items-center bg-gray-800/50 rounded px-3 py-2"
            >
              <div>
                <span className="text-sm">{src.name}</span>
                {src.sourceType !== 'manual' && (
                  <span className="text-xs text-gray-500 ml-2">({src.sourceType})</span>
                )}
              </div>
              <span className="font-mono text-purple-300">{src.value}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          ðŸ’¡ Konstitutions-Modifikator: {getConMod() >= 0 ? '+' : ''}
          {getConMod()} Ã— Level {characterLevel} = {getConModTotal()}
        </p>
      </div>

      {/* TrefferwÃ¼rfel */}
      {hasHitDice && hitDice.length > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">ðŸŽ² TrefferwÃ¼rfel</h3>
          <div className="flex flex-wrap gap-3">
            {hitDice.map((h) => {
              const available = h.total - h.used;
              return (
                <div
                  key={h.id}
                  className="bg-gray-800/50 rounded-lg p-3 text-center min-w-[100px]"
                >
                  <div className="text-xs text-gray-400 mb-1">{h.dieType.toUpperCase()}</div>
                  <div className="text-2xl font-bold">
                    <span
                      className={
                        available === 0
                          ? 'text-red-400'
                          : available <= h.total / 2
                          ? 'text-yellow-400'
                          : 'text-green-400'
                      }
                    >
                      {available}
                    </span>
                    <span className="text-gray-500 text-lg"> / {h.total}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ressourcen */}
      {resources.length > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">âœ¨ Ressourcen</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {resources.map((r) => {
              const rechargeData = RESOURCE_RECHARGE_TYPES.find(
                (t) => t.value === r.rechargeType
              );
              return (
                <div
                  key={r.id}
                  className="bg-gray-800/50 rounded-lg p-2 flex items-center gap-2"
                >
                  <span className="text-xl">{r.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{r.name}</div>
                    {rechargeData && (
                      <div className="text-xs text-gray-500">
                        {rechargeData.icon} {rechargeData.label}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-mono">
                    <span
                      className={
                        r.current === 0
                          ? 'text-red-400'
                          : r.current < r.max / 2
                          ? 'text-yellow-400'
                          : 'text-green-400'
                      }
                    >
                      {r.current}
                    </span>
                    <span className="text-gray-500"> / {r.max}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Klassen */}
      {classProgression === 'dual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-blue-300">ðŸ“¦ Container A</h4>
            {track0Classes.length === 0 && (
              <div className="text-xs text-gray-500 italic text-center py-4">
                Keine Klassen
              </div>
            )}
            {classLevels.map((cls, idx) => (cls.track === 0 ? renderClass(cls, idx) : null))}
          </div>
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-orange-300">ðŸ“¦ Container B</h4>
            {track1Classes.length === 0 && (
              <div className="text-xs text-gray-500 italic text-center py-4">
                Keine Klassen
              </div>
            )}
            {classLevels.map((cls, idx) => (cls.track === 1 ? renderClass(cls, idx) : null))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {classLevels.length === 0 && (
            <div className="text-gray-500 italic text-center py-4">
              Keine Klassen eingetragen.
            </div>
          )}
          {classLevels.map((cls, idx) => renderClass(cls, idx))}
        </div>
      )}
    </div>
  );
}