// src/types/statusEffects.ts

export interface StatusEffect {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  duration: number | null;
  durationUnit: string | null;
  isActive?: boolean;
  source: string | null;
  sourceName?: string | null;
  level?: number;
  expiresAt?: string | null;
  createdAt?: string;
  isConcentration?: boolean;
  linkedFeatureId?: string | null;
  // Library-Reference: FK auf LibraryEntry (nullable, SetNull).
  libraryEntryId?: string | null;
}

export interface PredefinedStatusEffect {
  id: string;
  name: string;
  description: string;
  icon: string;
  defaultDuration: number | null;
  durationUnit: string;
  immunityKey: string | null;
}