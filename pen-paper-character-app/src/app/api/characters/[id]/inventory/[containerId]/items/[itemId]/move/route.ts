// src/app/api/characters/[id]/inventory/[containerId]/items/[itemId]/move/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError, withParsedWeaponProperties } from '@/lib/api/helpers';

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; containerId: string; itemId: string }>;
  }
) {
  try {
    const { id, containerId, itemId } = await params;
    const body = await request.json();
    const { targetContainerId } = body;

    if (!targetContainerId) {
      return apiError('targetContainerId ist erforderlich', 400);
    }

    const targetContainer = await prisma.inventoryContainer.findFirst({
      where: { id: targetContainerId, characterId: id },
    });
    if (!targetContainer) return apiError('Ziel-Container nicht gefunden', 404);

    await prisma.inventoryItem.updateMany({
      where: { id: itemId, containerId, characterId: id },
      data: { containerId: targetContainerId },
    });

    const updated = await prisma.inventoryItem.findFirst({
      where: { id: itemId, containerId: targetContainerId, characterId: id },
    });
    if (!updated) return apiError('Item nicht gefunden', 404);
    return apiSuccess(withParsedWeaponProperties(updated));
  } catch (error) {
    return handleApiError(error, 'Fehler beim Verschieben des Items');
  }
}