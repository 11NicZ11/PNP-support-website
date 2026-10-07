// src/components/character/forms/characterFormTypes.ts
import { Attribute } from '../editors/AttributesEditor';
import { BackgroundData } from '../editors/BackgroundEditTab';
import { RaceData } from '../editors/RaceEditor';
import { ClassLevel } from '../editors/ClassLevelsEditor';
import { CombatValueSource } from '../editors/CombatValuesEditor';
import { SavingThrow } from '../editors/SavingThrowsEditor';
import { DefenseItem } from '../modals/DefensesModal';
import { Skill } from '@/types/skills';
import {
  AttributeMethod,
  AttributeMethodState,
  ClassProgression,
  ExpMode,
  HitDiceMode,
  HpSource,
  LevelingMode,
  NotesCategory,
  UnitSystem,
} from '@/types/character';
import { CharacterResource, CharacterHitDice } from '@/types/resources';
import { AlternateForm } from '@/types/forms';
import { Companion } from '@/types/companions';
import { Spell, SpellSlot } from '@/types/spells';
import { InventoryContainer } from '@/types/inventory';

export interface CharacterFormData {
  name: string;
  levelingMode: LevelingMode;
  unitSystem: UnitSystem;
  classProgression: ClassProgression;
  attributeMethod: AttributeMethod;
  attributeMethodState: AttributeMethodState;
  notesCategories: NotesCategory[];
  level: number;
  race: string;
  class: string;
  alignment: string;
  notes: string;
  experience: number;
  nextLevelExp: number;
  expMode: ExpMode;
  expThresholds: Record<number, number>;
  hasHitDice: boolean;
  hitDiceMode: HitDiceMode;
  currentHp?: number;
  tempHp?: number;
  tempMaxHp?: number;
  tempMaxHpMax?: number;
  exhaustionLevel?: number;
  attributes: Attribute[];
  hpSources: HpSource[];
  skills: Skill[];
  savingThrows: SavingThrow[];
  proficiencies: any[];
  classLevels: ClassLevel[];
  combatValueSources: CombatValueSource[];
  background: BackgroundData;
  raceData: RaceData;
  defenses: DefenseItem[];
  containers?: InventoryContainer[];
  spells?: Spell[];
  spellSlots?: SpellSlot[];
  resources?: CharacterResource[];
  hitDice?: CharacterHitDice[];
  alternateForms?: AlternateForm[];
  companions?: Companion[];
}

export interface CharacterFormProps {
  characterId: string;
  initialData?: Partial<CharacterFormData>;
  mode: 'create' | 'edit' | 'view';
  onSave?: (data: CharacterFormData) => Promise<void>;
  onCancel?: () => void;
  readOnly?: boolean;
}