// src/app/api/characters/[id]/actions/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

function parseAction(action: any) {
  return {
    ...action,
    concentration: action.concentration || false,
    savingThrowDC: action.savingThrowDC ?? null,
    linkedFeatureId: action.linkedFeatureId ?? null,
    linkedClassLevelId: action.linkedClassLevelId ?? null,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const actions = await prisma.action.findMany({
      where: { characterId: id },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
    return apiSuccess(actions.map(parseAction));
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Aktionen');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.name || !body.type || typeof body.description !== 'string') {
      return apiError(
        'Name und Typ sind erforderlich; Beschreibung muss ein Text sein',
        400
      );
    }

    const action = await prisma.action.create({
      data: {
        name: body.name,
        type: body.type,
        description: body.description,
        sourceType: body.sourceType || 'custom',
        sourceId: body.sourceId || null,
        isCustom: body.isCustom ?? true,
        attackBonus: body.attackBonus ? parseInt(body.attackBonus) : null,
        damageDice: body.damageDice || null,
        damageType: body.damageType || null,
        range: body.range || null,
        areaOfEffect: body.areaOfEffect || null,
        usesPerDay: body.usesPerDay ? parseInt(body.usesPerDay) : null,
        usesRemaining:
          body.usesRemaining !== undefined && body.usesRemaining !== null
            ? parseInt(body.usesRemaining)
            : body.usesPerDay
            ? parseInt(body.usesPerDay)
            : null,
        rechargeType: body.rechargeType || 'long',
        rechargeOnShortRest: body.rechargeOnShortRest || false,
        rechargeOnLongRest: body.rechargeOnLongRest || false,
        concentration: body.concentration || false,
        savingThrow: body.savingThrow || null,
        savingThrowDC:
          body.savingThrowDC !== undefined && body.savingThrowDC !== null
            ? parseInt(body.savingThrowDC)
            : null,
        linkedFeatureId: body.linkedFeatureId || null,
        linkedClassLevelId: body.linkedClassLevelId || null,
                libraryEntryId: body.libraryEntryId ?? null,
        characterId: id,
      },
    });

    return apiSuccess(parseAction(action), 201);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Erstellen der Aktion');
  }
}