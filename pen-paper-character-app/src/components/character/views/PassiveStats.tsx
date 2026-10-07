// pen-paper-character-app\src\components\character\view\PassiveStats.tsx

'use client';

interface PassiveStatsProps {
  skills: any[];
  attributes: any[];
  proficiencyBonus: number;
}

export function PassiveStats({ skills, attributes, proficiencyBonus }: PassiveStatsProps) {
  // Finde Wahrnehmung Skill
  const perceptionSkill = skills.find(s => s.name === 'Wahrnehmung');
  const insightSkill = skills.find(s => s.name === 'Einsicht');

  const getAttributeValue = (attributeName: string) => {
    const attr = attributes.find(a => a.name === attributeName);
    return attr ? attr.value : 10;
  };

  const getModifier = (value: number) => Math.floor((value - 10) / 2);

  const getSkillBonus = (skill: any) => {
    const attrValue = getAttributeValue(skill.attributeName);
    return getModifier(attrValue) + (skill.isProficient ? proficiencyBonus : 0);
  };

  const passivePerception = 10 + (perceptionSkill ? getSkillBonus(perceptionSkill) : 0);
  const passiveInsight = 10 + (insightSkill ? getSkillBonus(insightSkill) : 0);

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-gray-400">Passive Wahrnehmung</div>
      <div className="text-xl font-bold text-purple-400">{passivePerception}</div>
      <div className="text-xs text-gray-400">Passives Einsicht</div>
      <div className="text-md font-semibold text-purple-300">{passiveInsight}</div>
    </div>
  );
}