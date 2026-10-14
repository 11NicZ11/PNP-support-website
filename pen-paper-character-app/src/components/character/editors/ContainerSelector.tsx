// pen-paper-character-app\src\components\character\edit\ContainerSelector.tsx

'use client';

import { useState } from 'react';
import { useEffect, useRef } from 'react';
import { UnitSystem } from '@/types/character';
import { parseWeightInput, getWeightUnitLabel } from '@/lib/units';

interface ContainerSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (name: string, weightLimit?: number | null, containerWeight?: number | null, sourceReference?: string) => void;
  initialName?: string;
  initialWeightLimit?: number | null;
  initialContainerWeight?: number | null;
  initialSourceReference?: string;
  unitSystem: UnitSystem;
  mode?: 'create' | 'edit';
}

export function ContainerSelector({ 
  isOpen, 
  onClose, 
  onSelect,
  initialName = '',
  initialWeightLimit = null,
  initialContainerWeight = null,
  initialSourceReference = '',
  unitSystem,
  mode = 'create'
}: ContainerSelectorProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [containerName, setContainerName] = useState(initialName);
  const [weightLimit, setWeightLimit] = useState<number | null>(initialWeightLimit);
  const [containerWeight, setContainerWeight] = useState<string>(initialContainerWeight != null ? String(initialContainerWeight) : '');
  const [sourceReference, setSourceReference] = useState(initialSourceReference);
  const [hasWeightLimit, setHasWeightLimit] = useState(mode === 'create' ? true : (initialWeightLimit !== null && initialWeightLimit > 0));

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
      if (mode === 'create') {
        setContainerName('');
        setWeightLimit(null);
        setContainerWeight('');
        setSourceReference('');
        setHasWeightLimit(true);
      } else {
        setContainerName(initialName);
        setWeightLimit(initialWeightLimit);
        setContainerWeight(initialContainerWeight != null ? String(initialContainerWeight) : '');
        setSourceReference(initialSourceReference);
        setHasWeightLimit(initialWeightLimit !== null && initialWeightLimit > 0);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, mode, initialName, initialWeightLimit, initialContainerWeight, initialSourceReference]);

  if (!isOpen) return null;

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!containerName.trim()) {
      alert('Bitte gib einen Namen für den Container ein.');
      return;
    }
    
    // 🔥 FIX: Wenn hasWeightLimit true ist, muss ein Gewicht angegeben werden
    if (hasWeightLimit && (!weightLimit || weightLimit <= 0)) {
      alert('Bitte gib ein gültiges Gewichtslimit ein.');
      return;
    }
    
    const finalWeightLimit = hasWeightLimit ? weightLimit : null;
    const finalContainerWeight = containerWeight.trim() ? parseWeightInput(containerWeight, unitSystem) : null;

    onSelect(
      containerName.trim(),
      finalWeightLimit,
      finalContainerWeight,
      sourceReference.trim()
    );
  };

  const handleCloseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const title = mode === 'create' ? '📦 Neuen Container erstellen' : '📦 Container bearbeiten';
  const submitLabel = mode === 'create' ? 'Erstellen' : 'Speichern';

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]"
      onClick={handleModalClick}
    >
      <div 
        ref={modalRef}
        className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-purple-500/30"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button 
            onClick={handleCloseClick} 
            className="text-gray-400 hover:text-white text-2xl"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={containerName}
              onChange={(e) => setContainerName(e.target.value)}
              placeholder="z.B. Rucksack, Truhe, Bag of Holding"
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
              autoFocus
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-1">
              <input
                type="checkbox"
                checked={!hasWeightLimit}
                onChange={(e) => setHasWeightLimit(!e.target.checked)}
                className="rounded"
              />
              {hasWeightLimit ? '♾️ Unendlich Platz' : 'Gewichtslimit festlegen'}
            </label>
            {hasWeightLimit && (
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  step="0.1"
                  value={weightLimit || ''}
                  onChange={(e) => setWeightLimit(parseFloat(e.target.value) || null)}
                  placeholder="z.B. 30"
                  min="0.1"
                  className="flex-1 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
                />
                <span className="px-2 py-2 text-gray-400 text-sm self-center">
                  {getWeightUnitLabel(unitSystem)}
                </span>
              </div>
            )}
            {!hasWeightLimit && (
              <div className="text-xs text-gray-400 mt-1">
                💡 Der Container kann unendlich viele Items aufnehmen.
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Eigengewicht des Containers ({getWeightUnitLabel(unitSystem)})
            </label>
            <input
              type="number"
              step="0.1"
              value={containerWeight}
              onChange={(e) => setContainerWeight(e.target.value)}
              placeholder="z.B. 2"
              min="0"
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quellenangabe</label>
            <input
              type="text"
              value={sourceReference}
              onChange={(e) => setSourceReference(e.target.value)}
              placeholder="z. B. PHB S. 149"
              className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg font-semibold hover:opacity-90 transition"
            >
              {submitLabel}
            </button>
            <button
              type="button"
              onClick={handleCloseClick}
              className="px-6 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}