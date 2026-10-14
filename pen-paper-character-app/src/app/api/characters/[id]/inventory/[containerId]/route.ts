// src/app/api/characters/[id]/inventory/[containerId]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; containerId: string }> }
) {
  try {
    const { id, containerId } = await params;

    const container = await prisma.inventoryContainer.findFirst({
      where: { id: containerId, characterId: id },
      include: {
        items: true,
        children: { include: { items: true } },
      },
    });

    if (!container) return apiError('Container nicht gefunden', 404);
    return apiSuccess(container);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden des Containers');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; containerId: string }> }
) {
  try {
    const { id, containerId } = await params;
    await prisma.inventoryContainer.deleteMany({
      where: { id: containerId, characterId: id },
    });
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen des Containers');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; containerId: string }> }
) {
  try {
    const { id, containerId } = await params;
    const body = await request.json();

    await prisma.inventoryContainer.updateMany({
      where: { id: containerId, characterId: id },
      data: {
        name: body.name,
        description: body.description,
        capacity: body.capacity,
        weightLimit: body.weightLimit,
        containerWeight:
          body.containerWeight !== undefined ? body.containerWeight : undefined,
        sourceReference:
          body.sourceReference !== undefined ? body.sourceReference : undefined,
        libraryEntryId:
          body.libraryEntryId !== undefined ? body.libraryEntryId : undefined,
      },
    });

    const updated = await prisma.inventoryContainer.findFirst({
      where: { id: containerId, characterId: id },
      include: {
        items: true,
        children: { include: { items: true } },
      },
    });
    if (!updated) return apiError('Container nicht gefunden', 404);
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren des Containers');
  }
}