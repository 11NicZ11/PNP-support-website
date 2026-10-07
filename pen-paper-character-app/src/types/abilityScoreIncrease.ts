// pen-paper-character-app\src\types\abilityScoreIncrease.ts

export interface AbilityScoreIncrease {
  type: 'standard' | 'three_plus_one';
  bonuses: Record<string, number>;
}