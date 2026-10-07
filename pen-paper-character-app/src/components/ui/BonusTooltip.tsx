// src/components/common/BonusTooltip.tsx
// Spezielle Tooltip-Komponente für Attributs-Boni

'use client';

import { Tooltip } from './Tooltip';

interface BonusTooltipProps {
  attrName: string;
  raceBonus: number;
  backgroundBonus: number;
  children: React.ReactNode;
  className?: string;
}

export function BonusTooltip({
  attrName,
  raceBonus,
  backgroundBonus,
  children,
  className = '',
}: BonusTooltipProps) {
  const hasBonus = raceBonus > 0 || backgroundBonus > 0;

  if (!hasBonus) {
    return <>{children}</>;
  }

  const content = (
    <div className="space-y-1">
      <div className="font-semibold text-purple-300 text-xs">Bonus-Quellen:</div>
      {raceBonus > 0 && (
        <div className="text-green-400">Rasse: +{raceBonus}</div>
      )}
      {backgroundBonus > 0 && (
        <div className="text-blue-400">Hintergrund: +{backgroundBonus}</div>
      )}
      <div className="border-t border-gray-600 pt-1 text-gray-300">
        Gesamt: +{raceBonus + backgroundBonus}
      </div>
    </div>
  );

  return (
    <Tooltip content={content} position="bottom" className={className}>
      {children}
    </Tooltip>
  );
}