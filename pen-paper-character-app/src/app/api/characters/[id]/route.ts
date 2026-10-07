// src/app/api/characters/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  apiError,
  apiSuccess,
  handleApiError,
  asJsonArray,
  asJsonObject,
} from '@/lib/api/helpers';
import { parseJsonArray, parseJsonObject } from '@/lib/utils';

function migrateClassProgression(value: string | null | undefined): string {
  if (!value) return 'normal';
  if (value === 'single' || value === 'multi') return 'normal';
  return value;
}

function parseClassLevels(classLevels: any[]) {
  return classLevels.map((cl) => {
    let savingThrowProficiencies: string[] = [];
    try {
      const parsed = JSON.parse(cl.savingThrowProficiencies || '[]');
      if (Array.isArray(parsed)) savingThrowProficiencies = parsed;
    } catch {
      savingThrowProficiencies = [];
    }
    return {
      ...cl,
      features: parseJsonArray(cl.features || '[]'),
      savingThrowProficiencies,
      track: cl.track === 1 ? 1 : 0,
    };
  });
}

function parseAlternateForms(forms: any[]) {
  return forms.map((f) => ({
    ...f,
    attacks: parseJsonArray(f.attacks || '[]'),
    abilities: parseJsonArray(f.abilities || '[]'),
  }));
}

function parseCompanions(companions: any[]) {
  return companions.map((c) => ({
    ...c,
    attacks: parseJsonArray(c.attacks || '[]'),
    abilities: parseJsonArray(c.abilities || '[]'),
  }));
}

function parseRaceData(raceData: any) {
  if (!raceData) return null;
  return {
    ...raceData,
    languages: parseJsonArray(raceData.languages || '[]'),
    traits: parseJsonArray(raceData.traits || '[]'),
    abilityScoreIncrease: parseJsonObject(raceData.abilityScoreIncrease || '{}'),
    subraces: parseJsonArray(raceData.subraces || '[]'),
    skillProficiencies: parseJsonArray(raceData.skillProficiencies || '[]'),
    hasSubrace: raceData.hasSubrace === true,
    bonusArmorClass: raceData.bonusArmorClass ?? 0,
    bonusHp: raceData.bonusHp ?? 0,
  };
}

function parseBackgroundData(background: any) {
  if (!background) return null;
  return {
    ...background,
    bonusSkills: parseJsonArray(background.bonusSkills || '[]'),
    bonusLanguages: parseJsonArray(background.bonusLanguages || '[]'),
    abilityScoreIncrease: parseJsonObject(background.abilityScoreIncrease || '{}'),
    toolProficiencies: parseJsonArray(background.toolProficiencies || '[]'),
  };
}

function parseSpells(spells: any[]) {
  return spells.map((spell) => ({
    ...spell,
    components: Array.isArray(spell.components)
      ? spell.components.map((c: any) => c.component)
      : [],
  }));
}

function parseDefenses(defenses: any[]) {
  return defenses.map((d) => ({
    id: d.id,
    type: d.type,
    name: d.name,
    description: d.description,
    source: d.source || 'manual',
    sourceName: d.sourceName || '',
    isCustom: d.isCustom === true,
    libraryEntryId: d.libraryEntryId ?? null,
  }));
}

// ==================== GET ====================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        attributes: true,
        skills: true,
        savingThrows: true,
        proficiencies: true,
        statusEffects: true,
        defenses: true,
        hpSources: true,
        classLevels: true,
        combatValueSources: true,
        background: true,
        raceData: true,
        spells: { include: { components: { orderBy: { order: 'asc' } } } },
        spellSlots: true,
        resources: true,
        hitDice: true,
        alternateForms: true,
        companions: true,
      },
    });

    if (!character) {
      return apiError('Charakter nicht gefunden', 404);
    }

    const result = {
      ...character,
      classProgression: migrateClassProgression(character.classProgression),
      expMode: character.expMode || 'next_only',
      expThresholds: parseJsonObject(character.expThresholds || '{}'),
      hasHitDice: character.hasHitDice !== false,
      hitDiceMode: character.hitDiceMode || 'scaled',
      attributeMethod: character.attributeMethod || 'free',
      attributeMethodState: parseJsonObject(character.attributeMethodState || '{}'),
      notesCategories: parseJsonArray(character.notesCategories || '[]'),
      spells: parseSpells(character.spells),
      spellSlots: character.spellSlots,
      classLevels: parseClassLevels(character.classLevels),
      alternateForms: parseAlternateForms(character.alternateForms),
      companions: parseCompanions(character.companions),
      background: parseBackgroundData(character.background),
      raceData: parseRaceData(character.raceData),
      defenses: parseDefenses(character.defenses),
    };

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden des Charakters');
  }
}

// ==================== PUT ====================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const {
      skills,
      savingThrows,
      statusEffects,
      proficiencies,
      hpSources,
      attributes,
      classLevels,
      combatValueSources,
      defenses,
      background,
      raceData,
      spells,
      spellSlots,
      notesCategories,
      attributeMethodState,
      containers,
      resources,
      hitDice,
      alternateForms,
      companions,
      ...characterData
    } = data;

    await prisma.$transaction(async (tx) => {
      await tx.character.update({
        where: { id },
        data: {
          name: characterData.name,
          level: characterData.level,
          race: characterData.race,
          class: characterData.class,
          alignment: characterData.alignment,
          experience: characterData.experience,
          notes: characterData.notes ?? undefined,
          currentHp: characterData.currentHp,
          tempHp: characterData.tempHp,
          tempMaxHp: characterData.tempMaxHp,
          tempMaxHpMax: characterData.tempMaxHpMax,
          exhaustionLevel:
            characterData.exhaustionLevel !== undefined
              ? characterData.exhaustionLevel
              : undefined,
          lastShortRest:
            characterData.lastShortRest !== undefined
              ? characterData.lastShortRest
                ? new Date(characterData.lastShortRest)
                : null
              : undefined,
          lastLongRest:
            characterData.lastLongRest !== undefined
              ? characterData.lastLongRest
                ? new Date(characterData.lastLongRest)
                : null
              : undefined,
          levelingMode: characterData.levelingMode,
          unitSystem: characterData.unitSystem,
          classProgression:
            characterData.classProgression !== undefined
              ? migrateClassProgression(characterData.classProgression)
              : undefined,
          nextLevelExp: characterData.nextLevelExp,
          expMode: characterData.expMode,
          expThresholds:
            characterData.expThresholds !== undefined
              ? asJsonObject(characterData.expThresholds)
              : undefined,
          hasHitDice:
            characterData.hasHitDice !== undefined
              ? characterData.hasHitDice
              : undefined,
          hitDiceMode: characterData.hitDiceMode,
          attributeMethod: characterData.attributeMethod,
          attributeMethodState: attributeMethodState
            ? asJsonObject(attributeMethodState)
            : undefined,
          notesCategories: notesCategories
            ? asJsonArray(notesCategories)
            : undefined,
        },
      });

      if (raceData) {
        const raceUpdate = {
          name: raceData.name || '',
          sizeCategory: raceData.sizeCategory || 'Mittel',
          size: raceData.size || 'Mittel',
          height: raceData.height || '',
          weight: raceData.weight || '',
          age: raceData.age || '',
          speed: parseInt(raceData.speed) || 30,
          description: raceData.description || '',
          languages: asJsonArray(raceData.languages),
          traits: asJsonArray(raceData.traits),
          abilityScoreIncrease: asJsonObject(raceData.abilityScoreIncrease),
          subraces: asJsonArray(raceData.subraces),
          skillProficiencies: asJsonArray(raceData.skillProficiencies),
          alignment: raceData.alignment || '',
          faith: raceData.faith || '',
          personality: raceData.personality || '',
          bonds: raceData.bonds || '',
          ideals: raceData.ideals || '',
          flaws: raceData.flaws || '',
          hasSubrace: raceData.hasSubrace === true,
          bonusArmorClass: parseInt(raceData.bonusArmorClass) || 0,
          bonusHp: parseInt(raceData.bonusHp) || 0,
        };

        await tx.race.upsert({
          where: { characterId: id },
          update: raceUpdate,
          create: { ...raceUpdate, characterId: id },
        });
      }

      if (background) {
        const bgUpdate = {
          name: background.name || '',
          traits: background.traits || '',
          ideals: background.ideals || '',
          bonds: background.bonds || '',
          flaws: background.flaws || '',
          features: background.features || '',
          bonusSkills: asJsonArray(background.bonusSkills),
          bonusLanguages: asJsonArray(background.bonusLanguages),
          allies: background.allies || '',
          organizations: background.organizations || '',
          abilityScoreIncrease: asJsonObject(background.abilityScoreIncrease),
          toolProficiencies: asJsonArray(background.toolProficiencies),
        };
        await tx.background.upsert({
          where: { characterId: id },
          update: bgUpdate,
          create: { ...bgUpdate, characterId: id },
        });
      }

      // WICHTIG: Nur Collections neu aufbauen, die im Payload enthalten sind.
      // Sonst löscht z.B. ein reiner HP-Update (HealthBar) alle Attribute/Fertigkeiten.
      if (attributes) {
        await tx.attribute.deleteMany({ where: { characterId: id } });
        if (attributes.length) {
          await tx.attribute.createMany({
            data: attributes.map((attr: any) => ({
              name: attr.name,
              value: attr.value,
              isDefault: attr.isDefault || false,
              order: attr.order || 0,
              characterId: id,
            })),
          });
        }
      }

      if (skills) {
        await tx.skill.deleteMany({ where: { characterId: id } });
        if (skills.length) {
          await tx.skill.createMany({
            data: skills.map((s: any) => ({
              name: s.name,
              attributeName: s.attributeName,
              description: s.description || '',
              isProficient: s.isProficient || false,
              expertise: s.expertise ?? false,
              proficiencySource: s.proficiencySource || '',
              sourceDetail: s.sourceDetail || '',
              modifier: s.modifier || 0,
              libraryEntryId: s.libraryEntryId ?? null,
              characterId: id,
            })),
          });
        }
      }

      if (savingThrows) {
        await tx.savingThrow.deleteMany({ where: { characterId: id } });
        if (savingThrows.length) {
          await tx.savingThrow.createMany({
            data: savingThrows.map((st: any) => ({
              name: st.name,
              attributeName: st.attributeName,
              isProficient: st.isProficient || false,
              expertise: st.expertise ?? false,
              proficiencySource: st.proficiencySource || '',
              sourceDetail: st.sourceDetail || '',
              modifier: st.modifier || 0,
              libraryEntryId: st.libraryEntryId ?? null,
              characterId: id,
            })),
          });
        }
      }

                  if (statusEffects) {
        await tx.statusEffect.deleteMany({ where: { characterId: id } });
        if (statusEffects.length) {
          await tx.statusEffect.createMany({
            data: statusEffects.map((e: any) => ({
              name: e.name,
              description: e.description || '',
              icon: e.icon || '⚠️',
              duration: e.duration,
              durationUnit: e.durationUnit,
              source: e.source || '',
              sourceName: e.sourceName || '',
              level: e.level || 1,
              isActive: e.isActive !== false,
              isConcentration: e.isConcentration || false,
              linkedFeatureId: e.linkedFeatureId || null,
              libraryEntryId: e.libraryEntryId ?? null,
              characterId: id,
            })),
          });
        }
      }

            if (proficiencies) {
        await tx.proficiency.deleteMany({ where: { characterId: id } });
        if (proficiencies.length) {
          await tx.proficiency.createMany({
            data: proficiencies.map((p: any) => ({
              name: p.name,
              category: p.category,
              description: p.description || '',
              icon: p.icon || '📚',
              isProficient: p.isProficient !== false,
              proficiencySource: p.proficiencySource || '',
              sourceDetail: p.sourceDetail || '',
              libraryEntryId: p.libraryEntryId ?? null,
              characterId: id,
            })),
          });
        }
      }

      if (hpSources) {
        await tx.hpSource.deleteMany({ where: { characterId: id } });
        if (hpSources.length) {
          await tx.hpSource.createMany({
            data: hpSources.map((h: any) => ({
              name: h.name,
              value: h.value,
              sourceType: h.sourceType || 'manual',
              sourceName: h.sourceName || '',
              characterId: id,
            })),
          });
        }
      }

      // ========== DEFENSES (relational, komplett neu aufbauen) ==========
            if (defenses && Array.isArray(defenses)) {
        await tx.defense.deleteMany({ where: { characterId: id } });
        if (defenses.length > 0) {
          await tx.defense.createMany({
            data: defenses.map((d: any) => ({
              type: d.type,
              name: d.name,
              description: d.description || null,
              source: d.source || 'manual',
              sourceName: d.sourceName || '',
              isCustom: d.isCustom ?? false,
              libraryEntryId: d.libraryEntryId ?? null,
              characterId: id,
            })),
          });
        }
      }

      if (classLevels) {
        const existingClassLevels = await tx.characterClassLevel.findMany({
          where: { characterId: id },
        });

        const incomingKeys = new Set(
          classLevels.map((cl: any) => {
            const track = cl.track === 1 ? 1 : 0;
            return `${cl.className}|${cl.level}|${track}`;
          })
        );

        const staleClassLevelIds = existingClassLevels
          .filter((existing) => {
            const key = `${existing.className}|${existing.level}|${existing.track}`;
            return !incomingKeys.has(key);
          })
          .map((existing) => existing.id);

        if (staleClassLevelIds.length > 0) {
          await tx.characterClassLevel.deleteMany({
            where: { id: { in: staleClassLevelIds } },
          });
        }

        for (const cl of classLevels) {
          const featuresJson = Array.isArray(cl.features)
            ? JSON.stringify(cl.features)
            : cl.features || '[]';
          const savingThrowJson = Array.isArray(cl.savingThrowProficiencies)
            ? JSON.stringify(cl.savingThrowProficiencies)
            : cl.savingThrowProficiencies || '[]';
          const track = cl.track === 1 ? 1 : 0;

          await tx.characterClassLevel.upsert({
            where: {
              characterId_className_level_track: {
                characterId: id,
                className: cl.className,
                level: cl.level,
                track,
              },
            },
            update: {
              subclass: cl.subclass || null,
              subclassLevel: cl.subclassLevel ?? null,
              hitDie: cl.hitDie || 'd8',
              features: featuresJson,
              spellcastingAbility: cl.spellcastingAbility || 'none',
              isActive: cl.isActive !== false,
              leftAtLevel: cl.leftAtLevel ?? null,
              notes: cl.notes || '',
              sourceReference: cl.sourceReference || '',
              track,
              savingThrowProficiencies: savingThrowJson,
            },
            create: {
              characterId: id,
              className: cl.className,
              subclass: cl.subclass || null,
              subclassLevel: cl.subclassLevel ?? null,
              level: cl.level,
              hitDie: cl.hitDie || 'd8',
              features: featuresJson,
              spellcastingAbility: cl.spellcastingAbility || 'none',
              isActive: cl.isActive !== false,
              leftAtLevel: cl.leftAtLevel ?? null,
              notes: cl.notes || '',
              sourceReference: cl.sourceReference || '',
              track,
              savingThrowProficiencies: savingThrowJson,
            },
          });
        }
      }

      if (combatValueSources) {
        await tx.combatValueSource.deleteMany({ where: { characterId: id } });
        if (combatValueSources.length) {
          await tx.combatValueSource.createMany({
            data: combatValueSources.map((cvs: any) => ({
              type: cvs.type,
              name: cvs.name,
              value: cvs.value,
              dependsOn: cvs.dependsOn,
              characterId: id,
            })),
          });
        }
      }

      if (spells) {
        await tx.spell.deleteMany({ where: { characterId: id } });
        for (const sp of spells) {
          const { id: _spellId, components, ...rest } = sp;
          await tx.spell.create({
            data: {
              name: rest.name,
              level: rest.level ?? 0,
              school: rest.school || null,
              castingTime: rest.castingTime || null,
              range: rest.range || null,
              rangeValue: rest.rangeValue ?? null,
              components: {
                create: (Array.isArray(components) ? components : []).map(
                  (component: string, index: number) => ({
                    component,
                    order: index,
                  })
                ),
              },
              materialComponent: rest.materialComponent || null,
              duration: rest.duration || null,
              description: rest.description || '',
              higherLevels: rest.higherLevels || null,
              concentration: rest.concentration || false,
              ritual: rest.ritual || false,
              prepared: rest.prepared || false,
              alwaysPrepared: rest.alwaysPrepared || false,
              attackType: rest.attackType || null,
              savingThrow: rest.savingThrow || null,
              damageDice: rest.damageDice || null,
              damageType: rest.damageType || null,
              aoeShape: rest.aoeShape || null,
              aoeSize: rest.aoeSize ?? null,
              upcastEnabled: rest.upcastEnabled || false,
              upcastType: rest.upcastType || null,
              upcastValue: rest.upcastValue || null,
              spellcastingClassLevelId: rest.spellcastingClassLevelId || null,
              libraryEntryId: rest.libraryEntryId ?? null,
              characterId: id,
            },
          });
        }
      }

      if (spellSlots) {
        await tx.spellSlot.deleteMany({ where: { characterId: id } });
        if (spellSlots.length) {
          const validSlots = spellSlots
            .filter((s: any) => typeof s.rank === 'number' && s.rank >= 1 && s.rank <= 9)
            .map((s: any) => ({
              rank: s.rank,
              total: Math.max(0, parseInt(s.total) || 0),
              used: Math.max(0, parseInt(s.used) || 0),
              spellcastingClassLevelId: s.spellcastingClassLevelId || null,
              characterId: id,
            }));
          if (validSlots.length > 0) {
            await tx.spellSlot.createMany({ data: validSlots });
          }
        }
      }

      if (resources && Array.isArray(resources)) {
        await tx.characterResource.deleteMany({ where: { characterId: id } });
        if (resources.length > 0) {
          await tx.characterResource.createMany({
            data: resources.map((r: any) => ({
              name: r.name,
              max: r.max || 0,
              current: r.current ?? r.max ?? 0,
              rechargeType: r.rechargeType || 'long',
              source: r.source || 'class',
              sourceName: r.sourceName || '',
              icon: r.icon || '✨',
              description: r.description || '',
              classLevelId: r.classLevelId || null,
              characterId: id,
            })),
          });
        }
      }

      if (hitDice && Array.isArray(hitDice)) {
        await tx.characterHitDice.deleteMany({ where: { characterId: id } });
        if (hitDice.length > 0) {
          await tx.characterHitDice.createMany({
            data: hitDice.map((h: any) => ({
              dieType: h.dieType,
              total: h.total || 0,
              used: h.used || 0,
              classLevelId: h.classLevelId || null,
              characterId: id,
            })),
          });
        }
      }

      if (alternateForms && Array.isArray(alternateForms)) {
        const existingForms = await tx.alternateForm.findMany({
          where: { characterId: id },
        });
        const incomingIds = new Set(
          alternateForms
            .filter((f: any) => f.id && !f.id.startsWith('temp-'))
            .map((f: any) => f.id)
        );

        const staleFormIds = existingForms
          .filter((existing) => !incomingIds.has(existing.id))
          .map((existing) => existing.id);

        if (staleFormIds.length > 0) {
          await tx.alternateForm.deleteMany({
            where: { id: { in: staleFormIds } },
          });
        }

        for (const form of alternateForms) {
          const formData = {
            name: form.name || '',
            description: form.description || '',
            source: form.source || 'wild_shape',
            sourceReference: form.sourceReference || '',
            icon: form.icon || '🐺',
            challengeRating: form.challengeRating || '0',
            size: form.size || 'medium',
            creatureType: form.creatureType || '',
            armorClass: Math.max(0, parseInt(form.armorClass) || 10),
            hpMax: Math.max(0, parseInt(form.hpMax) || 1),
            hpCurrent: Math.max(
              0,
              parseInt(form.hpCurrent) ?? parseInt(form.hpMax) ?? 1
            ),
            hpFormula: form.hpFormula || '',
            strength: parseInt(form.strength) || 10,
            dexterity: parseInt(form.dexterity) || 10,
            constitution: parseInt(form.constitution) || 10,
            intelligence: parseInt(form.intelligence) || 10,
            wisdom: parseInt(form.wisdom) || 10,
            charisma: parseInt(form.charisma) || 10,
            speedWalk: parseInt(form.speedWalk) || 0,
            speedFly: parseInt(form.speedFly) || 0,
            speedSwim: parseInt(form.speedSwim) || 0,
            speedClimb: parseInt(form.speedClimb) || 0,
            speedBurrow: parseInt(form.speedBurrow) || 0,
            attacks: asJsonArray(form.attacks || []),
            abilities: asJsonArray(form.abilities || []),
            activationType: form.activationType || 'action',
            durationType: form.durationType || 'hours',
            durationValue: parseInt(form.durationValue) || 1,
            usesPerRest:
              form.usesPerRest !== null && form.usesPerRest !== undefined
                ? parseInt(form.usesPerRest)
                : null,
            rechargeType: form.rechargeType || 'short',
            linkedResourceId: form.linkedResourceId || null,
            linkedFeatureId: form.linkedFeatureId || null,
            isActive: form.isActive === true,
            concentration: form.concentration === true,
          };

          if (form.id && !form.id.startsWith('temp-')) {
            await tx.alternateForm.updateMany({
              where: { id: form.id, characterId: id },
              data: formData,
            });
          } else {
            await tx.alternateForm.create({
              data: { ...formData, characterId: id },
            });
          }
        }
      }

      if (companions && Array.isArray(companions)) {
        const existingCompanions = await tx.companion.findMany({
          where: { characterId: id },
        });
        const incomingIds = new Set(
          companions
            .filter((c: any) => c.id && !c.id.startsWith('temp-'))
            .map((c: any) => c.id)
        );

        const staleCompanionIds = existingCompanions
          .filter((existing) => !incomingIds.has(existing.id))
          .map((existing) => existing.id);

        if (staleCompanionIds.length > 0) {
          await tx.companion.deleteMany({
            where: { id: { in: staleCompanionIds } },
          });
        }

        for (const comp of companions) {
          const compData = {
            name: comp.name || '',
            type: comp.type || 'familiar',
            source: comp.source || 'find_familiar',
            sourceReference: comp.sourceReference || '',
            icon: comp.icon || '🦉',
            creatureType: comp.creatureType || '',
            size: comp.size || 'tiny',
            challengeRating: comp.challengeRating || '0',
            armorClass: Math.max(0, parseInt(comp.armorClass) || 10),
            hpMax: Math.max(0, parseInt(comp.hpMax) || 1),
            hpCurrent: Math.max(
              0,
              parseInt(comp.hpCurrent) ?? parseInt(comp.hpMax) ?? 1
            ),
            tempHp: Math.max(0, parseInt(comp.tempHp) || 0),
            strength: parseInt(comp.strength) || 10,
            dexterity: parseInt(comp.dexterity) || 10,
            constitution: parseInt(comp.constitution) || 10,
            intelligence: parseInt(comp.intelligence) || 10,
            wisdom: parseInt(comp.wisdom) || 10,
            charisma: parseInt(comp.charisma) || 10,
            speedWalk: parseInt(comp.speedWalk) || 0,
            speedFly: parseInt(comp.speedFly) || 0,
            speedSwim: parseInt(comp.speedSwim) || 0,
            speedClimb: parseInt(comp.speedClimb) || 0,
            speedBurrow: parseInt(comp.speedBurrow) || 0,
            senses: comp.senses || '',
            languages: comp.languages || '',
            attacks: asJsonArray(comp.attacks || []),
            abilities: asJsonArray(comp.abilities || []),
            isActive: comp.isActive !== false,
            isDismissed: comp.isDismissed === true,
            behavior: comp.behavior || 'follow',
            behaviorNote: comp.behaviorNote || '',
            linkedResourceId: comp.linkedResourceId || null,
            linkedFeatureId: comp.linkedFeatureId || null,
            notes: comp.notes || '',
          };

          if (comp.id && !comp.id.startsWith('temp-')) {
            await tx.companion.updateMany({
              where: { id: comp.id, characterId: id },
              data: compData,
            });
          } else {
            await tx.companion.create({
              data: { ...compData, characterId: id },
            });
          }
        }
      }
    });

    const updated = await prisma.character.findUnique({
      where: { id },
      include: {
        attributes: true,
        skills: true,
        savingThrows: true,
        proficiencies: true,
        statusEffects: true,
        defenses: true,
        hpSources: true,
        classLevels: true,
        combatValueSources: true,
        background: true,
        raceData: true,
        spells: { include: { components: { orderBy: { order: 'asc' } } } },
        spellSlots: true,
        resources: true,
        hitDice: true,
        alternateForms: true,
        companions: true,
      },
    });

    if (!updated) {
      return apiError('Charakter nicht gefunden', 404);
    }

    const result = {
      ...updated,
      classProgression: migrateClassProgression(updated.classProgression),
      expMode: updated.expMode || 'next_only',
      expThresholds: parseJsonObject(updated.expThresholds || '{}'),
      hasHitDice: updated.hasHitDice !== false,
      hitDiceMode: updated.hitDiceMode || 'scaled',
      attributeMethod: updated.attributeMethod || 'free',
      attributeMethodState: parseJsonObject(updated.attributeMethodState || '{}'),
      notesCategories: parseJsonArray(updated.notesCategories || '[]'),
      spells: parseSpells(updated.spells),
      spellSlots: updated.spellSlots,
      classLevels: parseClassLevels(updated.classLevels),
      alternateForms: parseAlternateForms(updated.alternateForms),
      companions: parseCompanions(updated.companions),
      background: parseBackgroundData(updated.background),
      raceData: parseRaceData(updated.raceData),
      defenses: parseDefenses(updated.defenses),
    };

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren des Charakters');
  }
}

// ==================== DELETE ====================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      await tx.skill.deleteMany({ where: { characterId: id } });
      await tx.savingThrow.deleteMany({ where: { characterId: id } });
      await tx.proficiency.deleteMany({ where: { characterId: id } });
      await tx.statusEffect.deleteMany({ where: { characterId: id } });
      await tx.defense.deleteMany({ where: { characterId: id } });
      await tx.hpSource.deleteMany({ where: { characterId: id } });
      await tx.attribute.deleteMany({ where: { characterId: id } });
      await tx.characterResource.deleteMany({ where: { characterId: id } });
      await tx.characterHitDice.deleteMany({ where: { characterId: id } });
      await tx.alternateForm.deleteMany({ where: { characterId: id } });
      await tx.companion.deleteMany({ where: { characterId: id } });
      await tx.characterClassLevel.deleteMany({ where: { characterId: id } });
      await tx.combatValueSource.deleteMany({ where: { characterId: id } });
      await tx.background.deleteMany({ where: { characterId: id } });
      await tx.race.deleteMany({ where: { characterId: id } });
      await tx.spell.deleteMany({ where: { characterId: id } });
      await tx.spellSlot.deleteMany({ where: { characterId: id } });
      await tx.inventoryItem.deleteMany({ where: { characterId: id } });
      await tx.inventoryContainer.deleteMany({ where: { characterId: id } });
      await tx.character.delete({ where: { id } });
    });

    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen des Charakters');
  }
}