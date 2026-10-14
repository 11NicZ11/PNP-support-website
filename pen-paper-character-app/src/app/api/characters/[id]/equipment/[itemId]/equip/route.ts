// src/app/api/characters/[id]/equipment/[itemId]/equip/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const body = await request.json();
    const { equipped } = body;

    if (equipped === undefined) {
      return apiError('equipped Status ist erforderlich', 400);
    }

    const item = await prisma.equipment.findFirst({
      where: { id: itemId, characterId: id },
    });
    if (!item) return apiError('Gegenstand nicht gefunden', 404);

    if (equipped && (item.type === 'armor' || item.type === 'shield')) {
      await prisma.equipment.updateMany({
        where: {
          characterId: id,
          type: item.type,
          equipped: true,
          id: { not: itemId },
        },
        data: { equipped: false },
      });
    }

    const updated = await prisma.equipment.update({
      where: { id: itemId },
      data: { equipped },
    });
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Ausrüsten');
  }
}