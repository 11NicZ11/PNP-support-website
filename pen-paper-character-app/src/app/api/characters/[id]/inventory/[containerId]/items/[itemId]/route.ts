// src/app/api/characters/[id]/inventory/[containerId]/items/[itemId]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string; containerId: string; itemId: string }>;
  }
) {
  try {
    const { id, containerId, itemId } = await params;
    await prisma.inventoryItem.deleteMany({
      where: { id: itemId, containerId, characterId: id },
    });
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen des Items');
  }
}

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

    await prisma.inventoryItem.updateMany({
      where: { id: itemId, containerId, characterId: id },
      data: {
        name: body.name,
        description: body.description,
        quantity: body.quantity,
        weight: body.weight,
        value: body.value,
        equipped: body.equipped,
        notes: body.notes,
        libraryEntryId:
          body.libraryEntryId !== undefined ? body.libraryEntryId : undefined,
      },
    });

    const updated = await prisma.inventoryItem.findFirst({
      where: { id: itemId, containerId, characterId: id },
    });
    if (!updated) return apiError('Item nicht gefunden', 404);
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren des Items');
  }
}