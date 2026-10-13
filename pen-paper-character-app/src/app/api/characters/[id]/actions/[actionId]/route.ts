// src/app/api/characters/[id]/actions/[actionId]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';
import { toInt } from '@/lib/utils';
import { parseAction } from '@/lib/api/character-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; actionId: string }> }
) {
  try {
    const { id, actionId } = await params;

    const action = await prisma.action.findFirst({
      where: { id: actionId, characterId: id },
    });
    if (!action) return apiError('Aktion nicht gefunden', 404);

    return apiSuccess(parseAction(action));
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Aktion');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; actionId: string }> }
) {
  try {
    const { id, actionId } = await params;
    const body = await request.json();

    await prisma.action.updateMany({
      where: { id: actionId, characterId: id },
      data: {
        name: body.name,
        type: body.type,
        description: body.description,
        sourceType: body.sourceType,
        sourceId: body.sourceId,
        isCustom: body.isCustom,
        attackBonus:
          body.attackBonus !== undefined && body.attackBonus !== null
            ? toInt(body.attackBonus, 0)
            : null,
        damageDice: body.damageDice,
        damageType: body.damageType,
        range: body.range,
        areaOfEffect: body.areaOfEffect,
        usesPerDay:
          body.usesPerDay !== undefined && body.usesPerDay !== null
            ? toInt(body.usesPerDay, 0)
            : null,
        usesRemaining:
          body.usesRemaining !== undefined && body.usesRemaining !== null
            ? toInt(body.usesRemaining, 0)
            : null,
        rechargeType: body.rechargeType,
        rechargeOnShortRest: body.rechargeOnShortRest,
        rechargeOnLongRest: body.rechargeOnLongRest,
        concentration: body.concentration,
        savingThrow: body.savingThrow,
        savingThrowDC:
          body.savingThrowDC !== undefined && body.savingThrowDC !== null
            ? toInt(body.savingThrowDC, 0)
            : null,
        linkedFeatureId: body.linkedFeatureId,
        linkedClassLevelId: body.linkedClassLevelId,
                libraryEntryId: body.libraryEntryId,
      },
    });

    const updated = await prisma.action.findFirst({
      where: { id: actionId, characterId: id },
    });
    if (!updated) return apiError('Aktion nicht gefunden', 404);

    return apiSuccess(parseAction(updated));
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren der Aktion');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; actionId: string }> }
) {
  try {
    const { id, actionId } = await params;

    await prisma.action.deleteMany({
      where: { id: actionId, characterId: id },
    });

    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen der Aktion');
  }
}