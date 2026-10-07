// src/components/character/actions/views/ActionsView.tsx
'use client';

import { useState } from 'react';
import { Action, ActionType } from '@/types/actions';
import { ActionCard } from './ActionCard';

interface ActionsViewProps {
  actions: Action[];
  characterId: string;
  onUpdate: (updated: Action[]) => void;
  onAddAction: () => void;
  characterName?: string;
}

const ACTION_TYPE_LABELS: Record<ActionType, string> = {
  action: 'Aktionen',
  bonus_action: 'Bonusaktionen',
  reaction: 'Reaktionen',
  legendary_action: 'Legendäre Aktionen',
  lair_action: 'Lair-Aktionen',
  free_action: 'Freie Aktionen',
};

const ACTION_TYPE_ICONS: Record<ActionType, string> = {
  action: '⚔️',
  bonus_action: '⚡',
  reaction: '🔄',
  legendary_action: '👑',
  lair_action: '🏰',
  free_action: '🆓',
};

export function ActionsView({
  actions,
  characterId,
  onUpdate,
  onAddAction,
  characterName,
}: ActionsViewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (actionId: string) => {
    if (!confirm('Möchtest du diese Aktion wirklich löschen?')) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/characters/${characterId}/actions/${actionId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onUpdate(actions.filter((a) => a.id !== actionId));
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Löschen');
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      setError('Fehler beim Löschen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUses = async (actionId: string, usesRemaining: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const action = actions.find((a) => a.id === actionId);
      if (!action) return;

      const res = await fetch(`/api/characters/${characterId}/actions/${actionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...action, usesRemaining }),
      });

      if (res.ok) {
        const updated = await res.json();
        onUpdate(actions.map((a) => (a.id === actionId ? updated : a)));
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Aktualisieren');
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      setError('Fehler beim Aktualisieren');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecharge = async (actionId: string) => {
    const action = actions.find((a) => a.id === actionId);
    if (!action || !action.usesPerDay) return;
    await handleUpdateUses(actionId, action.usesPerDay);
  };

  const groupedActions = actions.reduce((acc, action) => {
    if (!acc[action.type]) acc[action.type] = [];
    acc[action.type].push(action);
    return acc;
  }, {} as Record<ActionType, Action[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">⚡ Aktionen</h2>
        <button
          type="button"
          onClick={onAddAction}
          className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
        >
          + Aktion hinzufügen
        </button>
      </div>

      {error && <div className="bg-red-500/20 text-red-300 p-3 rounded-lg">{error}</div>}

      {actions.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <p>Keine Aktionen vorhanden.</p>
          <p className="text-sm mt-1">
            Klicke auf &quot;+ Aktion hinzufügen&quot; oder verknüpfe ein Feature im Fähigkeiten-Tab.
          </p>
        </div>
      )}

      {Object.entries(groupedActions).map(([type, actions]) => (
        <div key={type}>
          <h3 className="text-sm font-semibold text-purple-400 mb-2">
            {ACTION_TYPE_ICONS[type as ActionType] || '📋'}{' '}
            {ACTION_TYPE_LABELS[type as ActionType] || type}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {actions.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                onDelete={handleDelete}
                onRecharge={handleRecharge}
                onUpdateUses={handleUpdateUses}
                isLoading={isLoading}
                characterId={characterId}
                characterName={characterName}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}