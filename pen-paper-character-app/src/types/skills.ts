// src/types/skills.ts

export type SkillSource =
  | 'class'
  | 'race'
  | 'background'
  | 'feat'
  | 'custom';

export interface Skill {
  id: string;
  name: string;
  attributeName?: string;
  isProficient: boolean;
  expertise?: boolean;
  isCustom?: boolean;
  description?: string;
  modifier?: number;
  proficiencySource?: string;
  sourceDetail?: string;
  // 🔥 NEU
  source?: SkillSource;
  linkedClassLevelId?: string | null;
  // Library-Reference: FK auf LibraryEntry (nullable, SetNull).
  libraryEntryId?: string | null;
}