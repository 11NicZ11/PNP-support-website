// src/app/api/characters/[id]/spells/[spellId]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

const COMPONENTS_INCLUDE = { components: { orderBy: { order: 'asc' } } } as const;

function toComponentNames(components: { component: string }[]): string[] {
  return components.map((c) => c.component);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; spellId: string }> }
) {
  try {
    const { id, spellId } = await params;
    const spell = await prisma.spell.findFirst({
      where: { id: spellId, characterId: id },
      include: COMPONENTS_INCLUDE,
    });
    if (!spell) return apiError('Zauber nicht gefunden', 404);

    const result = {
      ...spell,
      components: toComponentNames(spell.components),
    };
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden des Zaubers');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; spellId: string }> }
) {
  try {
    const { id, spellId } = await params;
    const body = await request.json();

    await prisma.spell.updateMany({
      where: { id: spellId, characterId: id },
      data: {
        name: body.name,
        level: body.level,
        school: body.school,
        castingTime: body.castingTime,
        range: body.range,
        rangeValue: body.rangeValue,
        materialComponent: body.materialComponent,
        duration: body.duration,
        description: body.description,
        higherLevels: body.higherLevels,
        concentration: body.concentration,
        ritual: body.ritual,
        prepared: body.prepared,
        alwaysPrepared: body.alwaysPrepared,
        attackType: body.attackType,
        savingThrow: body.savingThrow,
        damageDice: body.damageDice,
        damageType: body.damageType,
        aoeShape: body.aoeShape,
        aoeSize: body.aoeSize,
        upcastEnabled: body.upcastEnabled,
        upcastType: body.upcastType,
        upcastValue: body.upcastValue,
        libraryEntryId: body.libraryEntryId,
      },
    });

    // Komponenten nur anfassen, wenn das Feld im Payload enthalten ist
    // (z.B. reiner prepared-Toggle überschreibt sie nicht).
    if (Array.isArray(body.components)) {
      await prisma.$transaction([
        prisma.spellComponent.deleteMany({ where: { spellId } }),
        prisma.spellComponent.createMany({
          data: body.components.map((component: string, index: number) => ({
            spellId,
            component,
            order: index,
          })),
        }),
      ]);
    }

    const updated = await prisma.spell.findFirst({
      where: { id: spellId, characterId: id },
      include: COMPONENTS_INCLUDE,
    });
    if (!updated) return apiError('Zauber nicht gefunden', 404);

    const result = {
      ...updated,
      components: toComponentNames(updated.components),
    };
    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren des Zaubers');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; spellId: string }> }
) {
  try {
    const { id, spellId } = await params;
    await prisma.spell.deleteMany({
      where: { id: spellId, characterId: id },
    });
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen des Zaubers');
  }
}