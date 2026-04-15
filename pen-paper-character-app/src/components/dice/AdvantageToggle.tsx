'use client';

import { useState } from 'react';

export type AdvantageState = 'normal' | 'advantage' | 'disadvantage';

interface AdvantageToggleProps {
  onAdvantageChange?: (state: AdvantageState) => void;
  initialValue?: AdvantageState;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function AdvantageToggle({ 
  onAdvantageChange, 
  initialValue = 'normal',
  size = 'small',
  className = ''
}: AdvantageToggleProps) {
  const [state, setState] = useState<AdvantageState>(initialValue);

  const handleClick = () => {
    const nextState: AdvantageState = 
      state === 'normal' ? 'advantage' : 
      state === 'advantage' ? 'disadvantage' : 'normal';
    
    setState(nextState);
    if (onAdvantageChange) {
      onAdvantageChange(nextState);
    }
  };

  const sizeClasses = {
    small: 'w-5 h-5 text-xs',
    medium: 'w-7 h-7 text-sm',
    large: 'w-9 h-9 text-base'
  };

  const getIcon = () => {
    switch (state) {
      case 'advantage':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <polygon points="12 2 15 9 22 9 16 14 19 22 12 17 5 22 8 14 2 9 9 9 12 2" />
          </svg>
        );
      case 'disadvantage':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <polygon points="12 22 9 15 2 15 8 10 5 2 12 7 19 2 16 10 22 15 15 15 12 22" />
          </svg>
        );
      default:
        return <span className="text-xs">A</span>;
    }
  };

  const getColors = () => {
    switch (state) {
      case 'advantage':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'disadvantage':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-gray-700 hover:bg-gray-600 text-gray-300';
    }
  };

  const getTitle = () => {
    switch (state) {
      case 'advantage':
        return 'Mit Vorteil würfeln (klicken für Nachteil)';
      case 'disadvantage':
        return 'Mit Nachteil würfeln (klicken für normal)';
      default:
        return 'Normal würfeln (klicken für Vorteil)';
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${sizeClasses[size]} ${getColors()} rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 ${className}`}
      title={getTitle()}
    >
      {getIcon()}
    </button>
  );
}