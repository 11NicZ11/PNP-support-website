// src/app/api/characters/[id]/inventory/[containerId]/items/[itemId]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError, withParsedWeaponProperties } from '@/lib/api/helpers';

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
        rangeType: body.rangeType !== undefined ? body.rangeType : undefined,
        rangeValue: body.rangeValue !== undefined ? (body.rangeValue != null ? parseFloat(body.rangeValue) : null) : undefined,
        rangeMaxValue: body.rangeMaxValue !== undefined ? (body.rangeMaxValue != null ? parseFloat(body.rangeMaxValue) : null) : undefined,
        weaponProperties: body.weaponProperties !== undefined ? JSON.stringify(body.weaponProperties) : undefined,
        libraryEntryId:
          body.libraryEntryId !== undefined ? body.libraryEntryId : undefined,
      },
    });

    // weaponPropertyRows komplett ersetzen (wie andere Collections).
    if (body.weaponPropertyRows !== undefined) {
      await prisma.inventoryItemWeaponProperty.deleteMany({ where: { inventoryItemId: itemId } });
      const rows = Array.isArray(body.weaponPropertyRows) ? body.weaponPropertyRows : [];
      if (rows.length > 0) {
        await prisma.inventoryItemWeaponProperty.createMany({
          data: rows.map((p: any, i: number) => ({
            inventoryItemId: itemId,
            name: p.name,
            valueNumber: p.valueNumber != null ? parseFloat(p.valueNumber) : null,
            libraryEntryId: p.libraryEntryId ?? null,
            order: i,
          })),
        });
      }
    }

    const updated = await prisma.inventoryItem.findFirst({
      where: { id: itemId, containerId, characterId: id },
      include: { weaponPropertyRows: { orderBy: { order: 'asc' } } },
    });
    if (!updated) return apiError('Item nicht gefunden', 404);
    return apiSuccess(withParsedWeaponProperties(updated));
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren des Items');
  }
}