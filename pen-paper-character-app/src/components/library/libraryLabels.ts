// src/components/library/libraryLabels.ts
// Einzige Quelle für Bibliotheks-Labels (Sprint 1B).
// LIBRARY_CATEGORY_LABELS: die Plural-Fassung (Inhalt von LibraryPage)
// wurde als kanonisch gewählt — LibraryEntryCard zeigt die Kategorie-
// Badges damit ebenfalls im Plural (User-Entscheidung: Vereinheitlichung).

export const LIBRARY_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  skill: { label: 'Fertigkeit', icon: '🎯' },
  saving_throw: { label: 'Rettungswurf', icon: '🎲' },
  proficiency: { label: 'Übung', icon: '📖' },
  defense: { label: 'Verteidigung', icon: '🛡️' },
  status_effect: { label: 'Status-Effekt', icon: '✨' },
  attribute: { label: 'Attribut', icon: '💪' },
  action: { label: 'Aktion', icon: '⚡' },
  weapon_property: { label: 'Waffen-Eigenschaft', icon: '⚔️' },
};

export const LIBRARY_CATEGORY_LABELS: Record<string, string> = {
  language: 'Sprachen',
  armor: 'Rüstungen',
  weapon: 'Waffen',
  tool: 'Werkzeuge',
  damage_immunity: 'Schadensimmunitäten',
  damage_resistance: 'Schadensresistenzen',
  condition_immunity: 'Zustandsimmunitäten',
  action: 'Aktionen',
  bonus_action: 'Bonusaktionen',
  reaction: 'Reaktionen',
};
