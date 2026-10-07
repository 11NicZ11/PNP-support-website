// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { DND_STATUS_EFFECTS, DND_DAMAGE_TYPES, DND_CONDITIONS } from '../src/lib/defaults/defenses';
import { DND_SKILLS } from '../src/lib/defaults/skills';
import {
  DND_LANGUAGES,
  DND_ARMORS,
  DND_WEAPONS,
  DND_TOOLS,
} from '../src/lib/defaults/proficiencies';
import { DND_ACTIONS } from '../src/lib/defaults/actions';
import { DND_WEAPON_PROPERTIES } from '../src/lib/defaults/weaponProperties';

const prisma = new PrismaClient();

// Mapping von internal-Attributnamen auf Anzeigenamen
const ATTR_MAP: Record<string, string> = {
  strength: 'Stärke',
  dexterity: 'Geschick',
  constitution: 'Konstitution',
  intelligence: 'Intelligenz',
  wisdom: 'Weisheit',
  charisma: 'Charisma',
};

async function seedSkills() {
  console.log('🌱 Seeding skill templates...');
  for (const skill of DND_SKILLS) {
    await prisma.libraryEntry.upsert({
      where: {
        type_category_name: {
          type: 'skill',
          category: '',
          name: skill.name,
        },
      },
      update: {
        description: skill.description,
        data: JSON.stringify({
          attributeName: ATTR_MAP[skill.attribute] || skill.attribute,
        }),
        isSeed: true,
      },
      create: {
        type: 'skill',
        category: '',
        name: skill.name,
        description: skill.description,
        icon: '🎯',
        data: JSON.stringify({
          attributeName: ATTR_MAP[skill.attribute] || skill.attribute,
        }),
        isSeed: true,
        isPublic: true,
      },
    });
  }
}

async function seedProficiencies() {
  console.log('🌱 Seeding proficiency templates...');
  const groups = [
    { list: DND_LANGUAGES, category: 'language' },
    { list: DND_ARMORS, category: 'armor' },
    { list: DND_WEAPONS, category: 'weapon' },
    { list: DND_TOOLS, category: 'tool' },
  ];

  for (const { list, category } of groups) {
    for (const prof of list) {
      await prisma.libraryEntry.upsert({
        where: {
          type_category_name: {
            type: 'proficiency',
            category,
            name: prof.name,
          },
        },
        update: {
          description: prof.description,
          icon: prof.icon,
          isSeed: true,
        },
        create: {
          type: 'proficiency',
          category,
          name: prof.name,
          description: prof.description,
          icon: prof.icon,
          isSeed: true,
          isPublic: true,
        },
      });
    }
  }
}

async function seedDefenses() {
  console.log('🌱 Seeding defense templates...');

  // Damage Types → damage_immunity + damage_resistance (gleiche Basis)
  for (const dmg of DND_DAMAGE_TYPES) {
    for (const cat of ['damage_immunity', 'damage_resistance']) {
      await prisma.libraryEntry.upsert({
        where: {
          type_category_name: {
            type: 'defense',
            category: cat,
            name: dmg.name,
          },
        },
        update: { description: dmg.description, isSeed: true },
        create: {
          type: 'defense',
          category: cat,
          name: dmg.name,
          description: dmg.description,
          icon: cat === 'damage_immunity' ? '✨' : '🛡️',
          isSeed: true,
          isPublic: true,
        },
      });
    }
  }

  // Conditions
  for (const cond of DND_CONDITIONS) {
    await prisma.libraryEntry.upsert({
      where: {
        type_category_name: {
          type: 'defense',
          category: 'condition_immunity',
          name: cond.name,
        },
      },
      update: { description: cond.description, isSeed: true },
      create: {
        type: 'defense',
        category: 'condition_immunity',
        name: cond.name,
        description: cond.description,
        icon: '💪',
        isSeed: true,
        isPublic: true,
      },
    });
  }
}

async function seedSavingThrows() {
  console.log('🌱 Seeding saving throw templates...');
  const defaults = [
    { name: 'Stärke-Rettungswurf', attributeName: 'Stärke' },
    { name: 'Geschick-Rettungswurf', attributeName: 'Geschick' },
    { name: 'Konstitutions-Rettungswurf', attributeName: 'Konstitution' },
    { name: 'Intelligenz-Rettungswurf', attributeName: 'Intelligenz' },
    { name: 'Weisheits-Rettungswurf', attributeName: 'Weisheit' },
    { name: 'Charisma-Rettungswurf', attributeName: 'Charisma' },
  ];

  for (const st of defaults) {
    await prisma.libraryEntry.upsert({
      where: {
        type_category_name: {
          type: 'saving_throw',
          category: '',
          name: st.name,
        },
      },
      update: {
        data: JSON.stringify({ attributeName: st.attributeName }),
        isSeed: true,
      },
      create: {
        type: 'saving_throw',
        category: '',
        name: st.name,
        description: '',
        icon: '🎲',
        data: JSON.stringify({ attributeName: st.attributeName }),
        isSeed: true,
        isPublic: true,
      },
    });
  }
}

async function seedAttributes() {
  console.log('🌱 Seeding attribute templates...');
  const defaults = [
    { name: 'Stärke', order: 0 },
    { name: 'Geschick', order: 1 },
    { name: 'Konstitution', order: 2 },
    { name: 'Intelligenz', order: 3 },
    { name: 'Weisheit', order: 4 },
    { name: 'Charisma', order: 5 },
  ];

  for (const attr of defaults) {
    await prisma.libraryEntry.upsert({
      where: {
        type_category_name: {
          type: 'attribute',
          category: '',
          name: attr.name,
        },
      },
      update: {
        data: JSON.stringify({ order: attr.order, isDefault: true }),
        isSeed: true,
      },
      create: {
        type: 'attribute',
        category: '',
        name: attr.name,
        description: '',
        icon: '💪',
        data: JSON.stringify({ order: attr.order, isDefault: true }),
        isSeed: true,
        isPublic: true,
      },
    });
  }
}

async function seedStatusEffects() {
  console.log('🌱 Seeding status effect templates...');
  for (const effect of DND_STATUS_EFFECTS) {
    // Neue Bibliothek
    await prisma.libraryEntry.upsert({
      where: {
        type_category_name: {
          type: 'status_effect',
          category: '',
          name: effect.name,
        },
      },
      update: {
        description: effect.description,
        icon: effect.icon,
        data: JSON.stringify({
          defaultDuration: effect.defaultDuration,
          durationUnit: effect.durationUnit,
          immunityKey: effect.immunityKey,
        }),
        isSeed: true,
      },
      create: {
        type: 'status_effect',
        category: '',
        name: effect.name,
        description: effect.description,
        icon: effect.icon,
        data: JSON.stringify({
          defaultDuration: effect.defaultDuration,
          durationUnit: effect.durationUnit,
          immunityKey: effect.immunityKey,
        }),
        isSeed: true,
        isPublic: true,
      },
    });

    // Backward-compat: auch in PredefinedStatusEffect (alte Tabelle)
    await prisma.predefinedStatusEffect.upsert({
      where: { name: effect.name },
      update: {},
      create: {
        name: effect.name,
        description: effect.description,
        icon: effect.icon,
        defaultDuration: effect.defaultDuration,
        durationUnit: effect.durationUnit,
        immunityKey: effect.immunityKey,
      },
    });
  }
}

async function seedActions() {
  console.log('🌱 Seeding action templates...');
  for (const action of DND_ACTIONS) {
    const data = JSON.stringify({
      attackBonus: null,
      damageDice: null,
      damageType: null,
      usesPerDay: null,
      rechargeType: 'manual',
    });

    await prisma.libraryEntry.upsert({
      where: {
        type_category_name: {
          type: 'action',
          category: action.type,
          name: action.name,
        },
      },
      update: {
        description: action.description,
        data,
        isSeed: true,
      },
      create: {
        type: 'action',
        category: action.type,
        name: action.name,
        description: action.description,
        icon: '⚡',
        data,
        isSeed: true,
        isPublic: true,
      },
    });
  }
}

async function seedWeaponProperties() {
  console.log('🌱 Seeding weapon property templates...');
  for (const prop of DND_WEAPON_PROPERTIES) {
    await prisma.libraryEntry.upsert({
      where: {
        type_category_name: {
          type: 'weapon_property',
          category: '',
          name: prop.name,
        },
      },
      update: {
        description: prop.description,
        isSeed: true,
      },
      create: {
        type: 'weapon_property',
        category: '',
        name: prop.name,
        description: prop.description,
        icon: '⚔️',
        data: '{}',
        isSeed: true,
        isPublic: true,
      },
    });
  }
}

// ==================== SEEDKIND-ZUORDNUNG ====================
// Einzige Stelle, die festlegt, welche Kataloge unantastbar ('system')
// und welche editierbar bleiben ('template'). User-Einträge bleiben null.
// Läuft NACH allen Seeds → füllt damit auch bestehende Zeilen nach
// (Backfill nach der `add_seed_kind_to_library_entry`-Migration).
const SEED_KIND_BY_TYPE: Record<string, 'system' | 'template'> = {
  attribute: 'system',
  defense: 'system', // damage_immunity / damage_resistance / condition_immunity
  status_effect: 'system',
  skill: 'template',
  saving_throw: 'template',
  proficiency: 'template',
  action: 'template',
  weapon_property: 'template',
  spell: 'template', // Katalog folgt in Etappe 3.5b — hier schon vorbereitet
};

async function assignSeedKinds() {
  console.log('🌱 Assigning seedKind per catalog...');
  for (const [type, kind] of Object.entries(SEED_KIND_BY_TYPE)) {
    // isSeed-Filter: User-Einträge werden nie angerührt.
    await prisma.libraryEntry.updateMany({
      where: { type, isSeed: true },
      data: { seedKind: kind },
    });
  }
}

async function main() {
  console.log('🌱 Seeding Library of Babylon...');
  await seedSkills();
  await seedProficiencies();
  await seedDefenses();
  await seedStatusEffects();
  await seedSavingThrows();
  await seedAttributes();
  await seedActions();
  await seedWeaponProperties();
  await assignSeedKinds();
  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });