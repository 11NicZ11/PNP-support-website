// src/app/api/characters/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  apiError,
  apiSuccess,
  handleApiError,
  asJsonArray,
  asJsonObject,
} from '@/lib/api/helpers';
import {
  migrateClassProgression,
  parseClassLevels,
  parseAlternateForms,
  parseCompanions,
  parseRaceData,
  parseBackgroundData,
  parseSpells,
  parseDefenses,
} from '@/lib/api/character-helpers';
import { toInt } from '@/lib/utils';

// ==================== POST ====================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return apiError('Name ist erforderlich', 400);
    }

    const {
      attributes = [],
      hpSources = [],
      skills = [],
      savingThrows = [],
      proficiencies = [],
      classLevels = [],
      combatValueSources = [],
      defenses = [],
      background = {},
      raceData = {},
      containers = [],
      spells = [],
      spellSlots = [],
      notesCategories = [],
      attributeMethodState = {},
      resources = [],
      hitDice = [],
      alternateForms = [],
      companions = [],
      expThresholds = {},
      ...characterData
    } = body;

    // ================================================================
    // LIBRARY OF BABYLON — Seeding beim Charakter-Erstellen
    // Wenn Client leer schickt → aus Bibliothek laden
    // ================================================================

    // ====== ATTRIBUTE ======
    let attributesToCreate = attributes.map((attr: any) => {
      const { id, baseValue, ...rest } = attr;
      return {
        name: rest.name,
        value: rest.value,
        isDefault: rest.isDefault || false,
        order: rest.order || 0,
      };
    });

    if (attributesToCreate.length === 0) {
      const libAttrs = await prisma.libraryEntry.findMany({
        where: { type: 'attribute' },
        orderBy: { name: 'asc' },
      });
      attributesToCreate = libAttrs
        .map((lib, idx) => {
          let data: any = {};
          try {
            data = JSON.parse(lib.data || '{}');
          } catch {}
          return {
            name: lib.name,
            value: 10,
            isDefault: true,
            order: data.order ?? idx,
          };
        })
        .sort((a, b) => a.order - b.order);
    }

    // ====== SKILLS ======
    let skillsToCreate = skills.map((s: any) => {
      const { id, isCustom, ...rest } = s;
      return {
        name: rest.name,
        attributeName: rest.attributeName,
        description: rest.description || '',
        isProficient: rest.isProficient || false,
        expertise: rest.expertise ?? false,
        proficiencySource: rest.proficiencySource || '',
        sourceDetail: rest.sourceDetail || '',
        modifier: rest.modifier || 0,
        libraryEntryId: rest.libraryEntryId ?? null,
      };
    });

    if (skillsToCreate.length === 0) {
      const libSkills = await prisma.libraryEntry.findMany({
        where: { type: 'skill' },
        orderBy: { name: 'asc' },
      });
      skillsToCreate = libSkills.map((lib) => {
        let data: any = {};
        try {
          data = JSON.parse(lib.data || '{}');
        } catch {}
        return {
          name: lib.name,
          attributeName: data.attributeName || 'Stärke',
          description: lib.description || '',
          isProficient: false,
          expertise: false,
          proficiencySource: '',
          sourceDetail: '',
          modifier: 0,
          libraryEntryId: lib.id,
        };
      });
    }

    // ====== SAVING THROWS ======
    let savingThrowsToCreate = savingThrows.map((st: any) => {
      const { id, ...rest } = st;
      return {
        name: rest.name,
        attributeName: rest.attributeName,
        isProficient: rest.isProficient || false,
        expertise: rest.expertise ?? false,
        proficiencySource: rest.proficiencySource || '',
        sourceDetail: rest.sourceDetail || '',
        modifier: rest.modifier || 0,
        libraryEntryId: rest.libraryEntryId ?? null,
      };
    });

    if (savingThrowsToCreate.length === 0) {
      const libSTs = await prisma.libraryEntry.findMany({
        where: { type: 'saving_throw' },
        orderBy: { name: 'asc' },
      });
      savingThrowsToCreate = libSTs.map((lib) => {
        let data: any = {};
        try {
          data = JSON.parse(lib.data || '{}');
        } catch {}
        return {
          name: lib.name,
          attributeName: data.attributeName || 'Stärke',
          isProficient: false,
          expertise: false,
          proficiencySource: '',
          sourceDetail: '',
          modifier: 0,
          libraryEntryId: lib.id,
        };
      });
    }

    // ====== PROFICIENCIES ======
        let proficienciesToCreate = proficiencies.map((p: any) => {
      const { id, ...rest } = p;
      return {
        name: rest.name,
        category: rest.category,
        description: rest.description || '',
        icon: rest.icon || '📚',
        isProficient: rest.isProficient !== false,
        proficiencySource: rest.proficiencySource || '',
        sourceDetail: rest.sourceDetail || '',
        libraryEntryId: rest.libraryEntryId ?? null,
      };
    });

    if (proficienciesToCreate.length === 0) {
      const libProfs = await prisma.libraryEntry.findMany({
        where: { type: 'proficiency' },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      });
      proficienciesToCreate = libProfs.map((lib) => ({
        name: lib.name,
        category: lib.category,
        description: lib.description || '',
        icon: lib.icon || '📚',
        isProficient: true,
        proficiencySource: '',
        sourceDetail: '',
        libraryEntryId: lib.id,
      }));
    }

    // ====== HP SOURCES ======
    const cleanHpSources = hpSources.map((h: any) => {
      const { id, ...rest } = h;
      return {
        name: rest.name,
        value: rest.value,
        sourceType: rest.sourceType || 'manual',
        sourceName: rest.sourceName || '',
      };
    });

    // ====== SPELLS ======
       const cleanSpells = spells.map((sp: any) => {
      const { id, components, ...rest } = sp;
      return {
        name: rest.name,
        level: rest.level ?? 0,
        school: rest.school || null,
        castingTime: rest.castingTime || null,
        range: rest.range || null,
        rangeValue: rest.rangeValue ?? null,
        components: Array.isArray(components) ? components : [],
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
        libraryEntryId: rest.libraryEntryId ?? null,
      };
    });

    const cleanSpellSlots = spellSlots
      .filter((s: any) => typeof s.rank === 'number' && s.rank >= 1 && s.rank <= 9)
      .map((s: any) => ({
        rank: s.rank,
        total: Math.max(0, parseInt(s.total) || 0),
        used: Math.max(0, parseInt(s.used) || 0),
      }));

    const cleanClassLevels = classLevels.map((cl: any) => {
      const featuresJson = Array.isArray(cl.features)
        ? JSON.stringify(cl.features)
        : cl.features || '[]';
      const savingThrowJson = Array.isArray(cl.savingThrowProficiencies)
        ? JSON.stringify(cl.savingThrowProficiencies)
        : cl.savingThrowProficiencies || '[]';
      return {
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
        track: cl.track === 1 ? 1 : 0,
        savingThrowProficiencies: savingThrowJson,
      };
    });

        const cleanDefenses = (Array.isArray(defenses) ? defenses : [])
      .filter((d: any) => d.source !== 'equipment')
      .map((d: any) => ({
        type: d.type,
        name: d.name,
        description: d.description || null,
        source: d.source || 'manual',
        sourceName: d.sourceName || '',
        isCustom: d.isCustom ?? false,
        libraryEntryId: d.libraryEntryId ?? null,
      }));

    const cleanAlternateForms = alternateForms.map((f: any) => ({
      name: f.name || '',
      description: f.description || '',
      source: f.source || 'wild_shape',
      sourceReference: f.sourceReference || '',
      icon: f.icon || '🐺',
      challengeRating: f.challengeRating || '0',
      size: f.size || 'medium',
      creatureType: f.creatureType || '',
      armorClass: Math.max(0, parseInt(f.armorClass) || 10),
      hpMax: Math.max(0, parseInt(f.hpMax) || 1),
      hpCurrent: toInt(f.hpCurrent, toInt(f.hpMax, 1, 0), 0),
      hpFormula: f.hpFormula || '',
      strength: parseInt(f.strength) || 10,
      dexterity: parseInt(f.dexterity) || 10,
      constitution: parseInt(f.constitution) || 10,
      intelligence: parseInt(f.intelligence) || 10,
      wisdom: parseInt(f.wisdom) || 10,
      charisma: parseInt(f.charisma) || 10,
      speedWalk: parseInt(f.speedWalk) || 0,
      speedFly: parseInt(f.speedFly) || 0,
      speedSwim: parseInt(f.speedSwim) || 0,
      speedClimb: parseInt(f.speedClimb) || 0,
      speedBurrow: parseInt(f.speedBurrow) || 0,
      attacks: asJsonArray(f.attacks || []),
      abilities: asJsonArray(f.abilities || []),
      activationType: f.activationType || 'action',
      durationType: f.durationType || 'hours',
      durationValue: parseInt(f.durationValue) || 1,
      usesPerRest:
        f.usesPerRest !== null && f.usesPerRest !== undefined
          ? parseInt(f.usesPerRest)
          : null,
      rechargeType: f.rechargeType || 'short',
      linkedResourceId: f.linkedResourceId || null,
      linkedFeatureId: f.linkedFeatureId || null,
      isActive: f.isActive === true,
      concentration: f.concentration === true,
    }));

    const cleanCompanions = companions.map((c: any) => ({
      name: c.name || '',
      type: c.type || 'familiar',
      source: c.source || 'find_familiar',
      sourceReference: c.sourceReference || '',
      icon: c.icon || '🦉',
      creatureType: c.creatureType || '',
      size: c.size || 'tiny',
      challengeRating: c.challengeRating || '0',
      armorClass: Math.max(0, parseInt(c.armorClass) || 10),
      hpMax: Math.max(0, parseInt(c.hpMax) || 1),
      hpCurrent: toInt(c.hpCurrent, toInt(c.hpMax, 1, 0), 0),
      tempHp: Math.max(0, parseInt(c.tempHp) || 0),
      strength: parseInt(c.strength) || 10,
      dexterity: parseInt(c.dexterity) || 10,
      constitution: parseInt(c.constitution) || 10,
      intelligence: parseInt(c.intelligence) || 10,
      wisdom: parseInt(c.wisdom) || 10,
      charisma: parseInt(c.charisma) || 10,
      speedWalk: parseInt(c.speedWalk) || 0,
      speedFly: parseInt(c.speedFly) || 0,
      speedSwim: parseInt(c.speedSwim) || 0,
      speedClimb: parseInt(c.speedClimb) || 0,
      speedBurrow: parseInt(c.speedBurrow) || 0,
      senses: c.senses || '',
      languages: c.languages || '',
      attacks: asJsonArray(c.attacks || []),
      abilities: asJsonArray(c.abilities || []),
      isActive: c.isActive !== false,
      isDismissed: c.isDismissed === true,
      behavior: c.behavior || 'follow',
      behaviorNote: c.behaviorNote || '',
      linkedResourceId: c.linkedResourceId || null,
      linkedFeatureId: c.linkedFeatureId || null,
      notes: c.notes || '',
    }));

    const createdCharacter = await prisma.$transaction(
      async (tx) => {
        const character = await tx.character.create({
          data: {
            name: characterData.name,
            level: characterData.level || 1,
            race: characterData.race || '',
            class: characterData.class || '',
            alignment: characterData.alignment || '',
            experience: characterData.experience || 0,
            notes: characterData.notes || '',
            currentHp: characterData.currentHp ?? 10,
            tempHp: 0,
            tempMaxHp: 0,
            tempMaxHpMax: 0,
            exhaustionLevel: 0,
            levelingMode: characterData.levelingMode || 'milestone',
            unitSystem: characterData.unitSystem || 'metric',
            classProgression: migrateClassProgression(
              characterData.classProgression || 'normal'
            ),
            nextLevelExp: characterData.nextLevelExp || 300,
            expMode: characterData.expMode || 'next_only',
            expThresholds: asJsonObject(expThresholds),
            hasHitDice: characterData.hasHitDice !== false,
            hitDiceMode: characterData.hitDiceMode || 'scaled',
            attributeMethod: characterData.attributeMethod || 'free',
            attributeMethodState: asJsonObject(attributeMethodState),
            notesCategories: asJsonArray(notesCategories),
            attributes: { create: attributesToCreate },
            hpSources: { create: cleanHpSources },
            skills: { create: skillsToCreate },
            savingThrows: { create: savingThrowsToCreate },
            proficiencies: { create: proficienciesToCreate },
            classLevels: { create: cleanClassLevels },
            defenses: { create: cleanDefenses },
            combatValueSources: {
              create: combatValueSources.map(({ id, ...r }: any) => r),
            },
            alternateForms: { create: cleanAlternateForms },
            companions: { create: cleanCompanions },
            raceData: {
              create: {
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
              },
            },
            background: {
              create: {
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
              },
            },
          },
        });

        if (cleanSpells.length > 0) {
          for (const sp of cleanSpells) {
            const { components, ...spellData } = sp;
            await tx.spell.create({
              data: {
                ...spellData,
                characterId: character.id,
                components: {
                  create: components.map((component: string, index: number) => ({
                    component,
                    order: index,
                  })),
                },
              },
            });
          }
        }

        if (cleanSpellSlots.length > 0) {
          await tx.spellSlot.createMany({
            data: cleanSpellSlots.map((s: any) => ({ ...s, characterId: character.id })),
          });
        }

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
              classLevelId: null,
              characterId: character.id,
            })),
          });
        }

        if (hitDice.length > 0) {
          await tx.characterHitDice.createMany({
            data: hitDice.map((h: any) => ({
              dieType: h.dieType,
              total: h.total || 0,
              used: h.used || 0,
              classLevelId: null,
              characterId: character.id,
            })),
          });
        }

        // Container + Items in EINER Query pro Container (nested create) statt
        // zwei Round-Trips (vorher: N Container = 2N Statements).
        for (const container of containers) {
          const itemData = (container.items || []).map((item: any) => ({
            name: item.name,
            description: item.description || '',
            quantity: item.quantity || 1,
            weight: item.weight ?? null,
            value: item.value ?? null,
            equipped: item.equipped || false,
            notes: item.notes || '',
            sourceReference: item.sourceReference ?? '',
            libraryEntryId: item.libraryEntryId ?? null,
            type: item.type || null,
            subtype: item.subtype || null,
            magicBonus: item.magicBonus || 0,
            attackBonus: item.attackBonus || 0,
            damageDice: item.damageDice || null,
            damageType: item.damageType || null,
            range: item.range || null,
            weaponProperties: item.weaponProperties
              ? asJsonArray(item.weaponProperties)
              : null,
            armorClassBonus: item.armorClassBonus || 0,
            armorType: item.armorType || null,
            maxDexBonus: item.maxDexBonus || 0,
            stealthDisadvantage: item.stealthDisadvantage || false,
            strengthRequirement: item.strengthRequirement || 0,
            shieldBonus: item.shieldBonus || 0,
            attunement: item.attunement || false,
            attuned: item.attuned || false,
            characterId: character.id,
          }));

          await tx.inventoryContainer.create({
            data: {
              name: container.name,
              type: container.type || 'container',
              description: container.description || '',
              capacity: container.capacity ?? null,
              weightLimit: container.weightLimit ?? null,
              weightUnit: container.weightUnit || 'kg',
              sourceReference: container.sourceReference ?? '',
              libraryEntryId: container.libraryEntryId ?? null,
              characterId: character.id,
              ...(itemData.length > 0 ? { items: { create: itemData } } : {}),
            },
          });
        }

        return character;
      },
      { timeout: 20000 }
    );

    const fullCharacter = await prisma.character.findUnique({
      where: { id: createdCharacter.id },
      include: {
        attributes: true,
        skills: true,
        savingThrows: true,
        proficiencies: true,
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
        inventoryContainers: { include: { items: true } },
      },
    });

    if (!fullCharacter) {
      return apiError('Charakter konnte nicht geladen werden', 500);
    }

    const result = {
      ...fullCharacter,
      classProgression: migrateClassProgression(fullCharacter.classProgression),
      expMode: fullCharacter.expMode || 'next_only',
      expThresholds: JSON.parse(fullCharacter.expThresholds || '{}'),
      hasHitDice: fullCharacter.hasHitDice !== false,
      hitDiceMode: fullCharacter.hitDiceMode || 'scaled',
      attributeMethodState: JSON.parse(fullCharacter.attributeMethodState || '{}'),
      notesCategories: JSON.parse(fullCharacter.notesCategories || '[]'),
      spells: parseSpells(fullCharacter.spells),
      classLevels: parseClassLevels(fullCharacter.classLevels),
      alternateForms: parseAlternateForms(fullCharacter.alternateForms),
      companions: parseCompanions(fullCharacter.companions),
      background: parseBackgroundData(fullCharacter.background),
      raceData: parseRaceData(fullCharacter.raceData),
      defenses: parseDefenses(fullCharacter.defenses),
    };

    return apiSuccess(result, 201);
  } catch (error) {
    console.error('Fehler beim Erstellen:', error);
    return handleApiError(error, 'Fehler beim Erstellen des Charakters');
  }
}

// ==================== GET (Liste) ====================
export async function GET() {
  try {
    const characters = await prisma.character.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        level: true,
        race: true,
        class: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return apiSuccess(characters);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Charaktere');
  }
}