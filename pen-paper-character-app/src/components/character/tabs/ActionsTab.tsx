// src/components/character/tabs/ActionsTab.tsx
'use client';

import { ActionsView } from '@/components/actions/ActionsView';
import { Action } from '@/types/actions';

interface ActionsTabProps {
  characterId: string;
  actions: Action[];
  onActionsUpdate: (actions: Action[]) => void;
  onAddAction: () => void;
  characterName?: string;
}

export function ActionsTab({
  characterId,
  actions,
  onActionsUpdate,
  onAddAction,
  characterName,
}: ActionsTabProps) {
  return (
    <ActionsView
      actions={actions}
      characterId={characterId}
      onUpdate={onActionsUpdate}
      onAddAction={onAddAction}
      characterName={characterName}
    />
  );
}