// src/lib/enums/spellSchools.ts
// Einzige Quelle für Zauberschulen (Sprint 1B). Anreichertere Form mit
// deutschen Labels und Tailwind-Farben; die frühere String-Liste in
// lib/enums/equipmentTypes.ts wird hiervon abgeleitet/gere-exportt.
export const SPELL_SCHOOLS = [
  { value: 'abjuration', label: 'Bannmagie', color: 'text-blue-400' },
  { value: 'conjuration', label: 'Beschwörung', color: 'text-green-400' },
  { value: 'divination', label: 'Erkenntnismagie', color: 'text-purple-400' },
  { value: 'enchantment', label: 'Verzauberung', color: 'text-pink-400' },
  { value: 'evocation', label: 'Hervorrufung', color: 'text-orange-400' },
  { value: 'illusion', label: 'Illusion', color: 'text-indigo-400' },
  { value: 'necromancy', label: 'Nekromantie', color: 'text-red-400' },
  { value: 'transmutation', label: 'Verwandlung', color: 'text-yellow-400' },
] as const;

export type SpellSchool = (typeof SPELL_SCHOOLS)[number]['value'];
