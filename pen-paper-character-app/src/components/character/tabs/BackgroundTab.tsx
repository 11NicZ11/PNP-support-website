// src/components/character/tabs/BackgroundTab.tsx
'use client';

import {
  BackgroundEditTab,
  BackgroundData,
} from '@/components/character/editors/BackgroundEditTab';
import { BackgroundView } from '@/components/character/views/BackgroundView';
import { Attribute } from '@/components/character/editors/AttributesEditor';
import { Skill } from '@/types/skills';
import { NotesCategory } from '@/types/character';

interface BackgroundTabProps {
  characterId: string;
  mode: 'create' | 'edit' | 'view';
  background: BackgroundData;
  onBackgroundUpdate: (bg: BackgroundData) => void;
  alignment: string;
  onAlignmentChange: (alignment: string) => void;
  attributes: Attribute[];
  skills: Skill[];
  proficiencies: any[];
  onProficienciesUpdate: (profs: any[]) => void;
  onSkillsUpdate: (skills: Skill[]) => void;
  readOnly?: boolean;
  // 🔥 NEU: Notizen
  notesCategories: NotesCategory[];
  onNotesCategoriesUpdate: (categories: NotesCategory[]) => void;
}

export function BackgroundTab({
  characterId,
  mode,
  background,
  onBackgroundUpdate,
  alignment,
  onAlignmentChange,
  attributes,
  skills,
  proficiencies,
  onProficienciesUpdate,
  onSkillsUpdate,
  readOnly = false,
  notesCategories,
  onNotesCategoriesUpdate,
}: BackgroundTabProps) {
  const isView = readOnly || mode === 'view';

  if (isView) {
    return <BackgroundView background={background} />;
  }

  return (
    <BackgroundEditTab
      characterId={characterId}
      background={background}
      onUpdateBackground={onBackgroundUpdate}
      alignment={alignment}
      onAlignmentChange={onAlignmentChange}
      availableSkills={skills.map((s) => s.name)}
      availableAttributes={attributes.map((a) => a.name)}
      onSkillsUpdate={onSkillsUpdate}
      proficiencies={proficiencies}
      onProficienciesUpdate={onProficienciesUpdate}
      notesCategories={notesCategories}
      onNotesCategoriesUpdate={onNotesCategoriesUpdate}
    />
  );
}