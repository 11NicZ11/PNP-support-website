// src/app/api/characters/[id]/spells/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

const COMPONENTS_INCLUDE = { components: { orderBy: { order: 'asc' } } } as const;

function toComponentNames(components: { component: string }[]): string[] {
  return components.map((c) => c.component);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const spells = await prisma.spell.findMany({
      where: { characterId: id },
      orderBy: [{ level: 'asc' }, { name: 'asc' }],
      include: COMPONENTS_INCLUDE,
    });

    const parsed = spells.map((spell) => ({
      ...spell,
      components: toComponentNames(spell.components),
    }));

    return apiSuccess(parsed);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Zauber');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.name) {
      return apiError('Name ist erforderlich', 400);
    }

    const spell = await prisma.spell.create({
      data: {
        name: body.name,
        level: body.level ?? 0,
        school: body.school || null,
        castingTime: body.castingTime || null,
        range: body.range || null,
        rangeValue: body.rangeValue ?? null,
        components: {
          create: (Array.isArray(body.components) ? body.components : []).map(
            (component: string, index: number) => ({
              component,
              order: index,
            })
          ),
        },
        materialComponent: body.materialComponent || null,
        duration: body.duration || null,
        description: body.description || '',
        higherLevels: body.higherLevels || null,
        concentration: body.concentration || false,
        ritual: body.ritual || false,
        prepared: body.prepared || false,
        alwaysPrepared: body.alwaysPrepared || false,
        attackType: body.attackType || null,
        savingThrow: body.savingThrow || null,
        damageDice: body.damageDice || null,
        damageType: body.damageType || null,
        aoeShape: body.aoeShape || null,
        aoeSize: body.aoeSize ?? null,
        upcastEnabled: body.upcastEnabled || false,
        upcastType: body.upcastType || null,
        upcastValue: body.upcastValue || null,
        spellcastingClassLevelId: body.spellcastingClassLevelId || null,
        libraryEntryId: body.libraryEntryId ?? null,
        characterId: id,
      },
      include: COMPONENTS_INCLUDE,
    });

    const result = {
      ...spell,
      components: toComponentNames(spell.components),
    };

    return apiSuccess(result, 201);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Erstellen des Zaubers');
  }
}