// pen-paper-character-app\src\components\dice\DiceLog.tsx

'use client';

import { useDiceLog } from '@/contexts/DiceLogContext';
import { diceInfo, DamageDetail } from '@/lib/dice';

export function DiceLog() {
  const { logs, clearLogs, removeLog } = useDiceLog();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getDiceIcon = (diceType: string) => {
    if (diceType === 'weapon') return '⚔️';
    return diceInfo[diceType as keyof typeof diceInfo]?.icon || '🎲';
  };

  const formatRollResult = (log: any) => {
    // 🔥 NEU: Waffen-Schaden mit detaillierten Schadensarten
    if (log.sourceType === 'weapon' && log.damageDetails && Array.isArray(log.damageDetails)) {
      return (
        <div className="space-y-1">
          <div className="text-sm">
            <span className="text-gray-500">Gesamtschaden: </span>
            <span className="font-mono font-bold text-orange-400">
              {log.total}
            </span>
          </div>
          <div className="text-xs text-gray-400 space-y-0.5">
            {log.damageDetails.map((detail: DamageDetail, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-gray-500">•</span>
                <span className="font-medium">
                  {detail.type}:
                </span>
                <span className="font-mono text-white">
                  {detail.total}
                </span>
                {detail.rolls && detail.rolls.length > 0 && (
                  <span className="text-gray-500 text-[10px]">
                    ({detail.count}{detail.diceType} → {detail.rolls.join(' + ')})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Spezielle Formatierung für Initiative
    if (log.reason === 'Initiative') {
      return (
        <div className="text-sm">
          <span className="text-gray-500">Initiative: </span>
          <span className="font-mono font-bold text-white">
            {log.result}
          </span>
          {log.modifier !== undefined && log.modifier !== 0 && (
            <span className="text-gray-400">
              {' + '}{log.modifier > 0 ? `+${log.modifier}` : log.modifier}
            </span>
          )}
          <span className="text-gray-400"> = </span>
          <span className="font-mono font-bold text-purple-400">
            {log.total}
          </span>
        </div>
      );
    }

    if (log.advantageType === 'advantage' && log.allRolls && log.allRolls.length === 2) {
      const [roll1, roll2] = log.allRolls;
      const betterRoll = Math.max(roll1, roll2);
      const isBetterRoll1 = roll1 === betterRoll;
      
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">🎲 Würfe:</span>
            <span className={`font-mono font-bold ${isBetterRoll1 ? 'text-green-400 text-lg' : 'text-gray-400'}`}>
              {roll1}
            </span>
            <span className="text-gray-500">|</span>
            <span className={`font-mono font-bold ${!isBetterRoll1 ? 'text-green-400 text-lg' : 'text-gray-400'}`}>
              {roll2}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">➜ Gewählt: </span>
            <span className="font-mono font-bold text-green-400">{betterRoll}</span>
            {log.modifier !== undefined && (
              <span className="text-gray-500">
                {' '}+ {log.modifier} ={' '}
                <span className="font-bold text-purple-400">{log.total}</span>
              </span>
            )}
          </div>
        </div>
      );
    }
    
    if (log.advantageType === 'disadvantage' && log.allRolls && log.allRolls.length === 2) {
      const [roll1, roll2] = log.allRolls;
      const worseRoll = Math.min(roll1, roll2);
      const isWorseRoll1 = roll1 === worseRoll;
      
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">🎲 Würfe:</span>
            <span className={`font-mono font-bold ${isWorseRoll1 ? 'text-red-400 text-lg' : 'text-gray-400'}`}>
              {roll1}
            </span>
            <span className="text-gray-500">|</span>
            <span className={`font-mono font-bold ${!isWorseRoll1 ? 'text-red-400 text-lg' : 'text-gray-400'}`}>
              {roll2}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">➜ Gewählt: </span>
            <span className="font-mono font-bold text-red-400">{worseRoll}</span>
            {log.modifier !== undefined && (
              <span className="text-gray-500">
                {' '}+ {log.modifier} ={' '}
                <span className="font-bold text-purple-400">{log.total}</span>
              </span>
            )}
          </div>
        </div>
      );
    }
    
    // Normaler Wurf
    return (
      <div className="text-sm">
        <span className="text-gray-500">Ergebnis: </span>
        <span className="font-mono font-bold text-lg text-white">
          {log.total !== undefined ? log.total : log.result}
        </span>
        {log.modifier !== undefined && log.modifier !== 0 && (
          <span className="text-gray-400 text-xs ml-2">
            ({log.result} + {log.modifier})
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur rounded-xl border border-purple-500/20 h-full flex flex-col">
      <div className="p-4 border-b border-purple-500/20 flex justify-between items-center">
        <h2 className="text-lg font-semibold">📜 Würfel-Log</h2>
        {logs.length > 0 && (
          <button type="button"
            onClick={clearLogs}
            className="text-xs px-2 py-1 bg-red-600/50 hover:bg-red-600 rounded transition"
          >
            Alle löschen
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[calc(100vh-200px)]">
        {logs.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>🎲 Keine Würfe</p>
            <p className="text-sm mt-2">Würfel mit den Buttons um hier Ergebnisse zu sehen</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition group">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-lg">{getDiceIcon(log.dice)}</span>
                    <span className="font-semibold text-purple-400">{log.reason}</span>
                    {log.characterName && (
                      <span className="text-xs text-gray-500">({log.characterName})</span>
                    )}
                    {log.sourceType === 'weapon' && (
                      <span className="text-xs px-1.5 py-0.5 bg-orange-600/30 text-orange-300 rounded">⚔️ Waffe</span>
                    )}
                    {log.sourceType === 'spell' && (
                      <span className="text-xs px-1.5 py-0.5 bg-purple-600/30 text-purple-300 rounded">✨ Zauber</span>
                    )}
                    {log.advantageType === 'advantage' && (
                      <span className="text-xs px-1.5 py-0.5 bg-green-600/30 text-green-300 rounded">Vorteil</span>
                    )}
                    {log.advantageType === 'disadvantage' && (
                      <span className="text-xs px-1.5 py-0.5 bg-red-600/30 text-red-300 rounded">Nachteil</span>
                    )}
                  </div>
                  
                  {formatRollResult(log)}
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {formatTime(log.timestamp)}
                    {log.sourceName && (
                      <span className="ml-2 text-gray-600">📎 {log.sourceName}</span>
                    )}
                  </div>
                </div>
                <button type="button"
                  onClick={() => removeLog(log.id)}
                  className="text-gray-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                  title="Löschen"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}