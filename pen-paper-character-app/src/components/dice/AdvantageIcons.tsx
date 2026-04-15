'use client';

interface AdvantageIconsProps {
  onAdvantageClick: () => void;
  onDisadvantageClick: () => void;
  size?: 'small' | 'medium';
  className?: string;
}

export function AdvantageIcons({ 
  onAdvantageClick, 
  onDisadvantageClick, 
  size = 'small',
  className = ''
}: AdvantageIconsProps) {
  const sizeClasses = {
    small: 'w-5 h-5 text-xs',
    medium: 'w-7 h-7 text-sm'
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Grün für Vorteil (oben/rechts) */}
      <button
        onClick={onAdvantageClick}
        className={`${sizeClasses[size]} bg-green-600 hover:bg-green-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 text-white font-bold`}
        title="Mit Vorteil würfeln"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
          <polygon points="12 2 15 9 22 9 16 14 19 22 12 17 5 22 8 14 2 9 9 9 12 2" />
        </svg>
      </button>
      
      {/* Rot für Nachteil (unten/links) */}
      <button
        onClick={onDisadvantageClick}
        className={`${sizeClasses[size]} bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 text-white font-bold`}
        title="Mit Nachteil würfeln"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
          <polygon points="12 22 9 15 2 15 8 10 5 2 12 7 19 2 16 10 22 15 15 15 12 22" />
        </svg>
      </button>
    </div>
  );
}