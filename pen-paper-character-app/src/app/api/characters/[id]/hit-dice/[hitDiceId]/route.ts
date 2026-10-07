// src/app/api/characters/[id]/hit-dice/[hitDiceId]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; hitDiceId: string }> }
) {
  try {
    const { id, hitDiceId } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.dieType !== undefined) updateData.dieType = body.dieType;
    if (body.total !== undefined) updateData.total = Math.max(0, parseInt(body.total) || 0);
    if (body.used !== undefined) updateData.used = Math.max(0, parseInt(body.used) || 0);
    if (body.classLevelId !== undefined) updateData.classLevelId = body.classLevelId;

    await prisma.characterHitDice.updateMany({
      where: { id: hitDiceId, characterId: id },
      data: updateData,
    });

    const updated = await prisma.characterHitDice.findFirst({
      where: { id: hitDiceId, characterId: id },
    });

    if (!updated) {
      return apiError('Trefferwürfel nicht gefunden', 404);
    }

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren der Trefferwürfel');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; hitDiceId: string }> }
) {
  try {
    const { id, hitDiceId } = await params;

    await prisma.characterHitDice.deleteMany({
      where: { id: hitDiceId, characterId: id },
    });

    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen der Trefferwürfel');
  }
}