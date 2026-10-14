// src/app/api/characters/[id]/equipment/[itemId]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';
import { toInt } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const equipment = await prisma.equipment.findFirst({
      where: { id: itemId, characterId: id },
    });
    if (!equipment) {
      return apiError('Gegenstand nicht gefunden', 404);
    }
    return apiSuccess(equipment);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden des Gegenstands');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    const body = await request.json();

    await prisma.equipment.updateMany({
      where: { id: itemId, characterId: id },
      data: {
        name: body.name,
        type: body.type,
        subtype: body.subtype,
        description: body.description,
        equipped: body.equipped,
        quantity: body.quantity,
        weight: body.weight != null ? parseFloat(body.weight) : null,
        costAmount: body.costAmount ? toInt(body.costAmount, 0) : null,
        costUnit: body.costUnit,
        attackBonus:
          body.attackBonus !== undefined ? toInt(body.attackBonus, 0) : undefined,
        damageDice: body.damageDice,
        damageType: body.damageType,
        rangeType: body.rangeType !== undefined ? body.rangeType : undefined,
        rangeValue: body.rangeValue !== undefined ? (body.rangeValue != null ? parseFloat(body.rangeValue) : null) : undefined,
        rangeMaxValue: body.rangeMaxValue !== undefined ? (body.rangeMaxValue != null ? parseFloat(body.rangeMaxValue) : null) : undefined,
        armorClassBonus:
          body.armorClassBonus !== undefined
            ? toInt(body.armorClassBonus, 0)
            : undefined,
        armorType: body.armorType,
        maxDexBonus:
          body.maxDexBonus !== undefined ? toInt(body.maxDexBonus, 0) : undefined,
        stealthDisadvantage: body.stealthDisadvantage,
        strengthRequirement:
          body.strengthRequirement !== undefined
            ? toInt(body.strengthRequirement, 0)
            : undefined,
        shieldBonus:
          body.shieldBonus !== undefined ? toInt(body.shieldBonus, 0) : undefined,
        attunement: body.attunement,
        attuned: body.attuned,
        notes: body.notes,
        sourceReference:
          body.sourceReference !== undefined ? body.sourceReference : undefined,
        libraryEntryId:
          body.libraryEntryId !== undefined ? body.libraryEntryId : undefined,
      },
    });

    // weaponPropertyRows komplett ersetzen (wie andere Collections).
    if (body.weaponPropertyRows !== undefined) {
      await prisma.equipmentWeaponProperty.deleteMany({ where: { equipmentId: itemId } });
      const rows = Array.isArray(body.weaponPropertyRows) ? body.weaponPropertyRows : [];
      if (rows.length > 0) {
        await prisma.equipmentWeaponProperty.createMany({
          data: rows.map((p: any, i: number) => ({
            equipmentId: itemId,
            name: p.name,
            valueNumber: p.valueNumber != null ? parseFloat(p.valueNumber) : null,
            libraryEntryId: p.libraryEntryId ?? null,
            order: i,
          })),
        });
      }
    }

    const updated = await prisma.equipment.findFirst({
      where: { id: itemId, characterId: id },
      include: { weaponPropertyRows: { orderBy: { order: 'asc' } } },
    });
    if (!updated) return apiError('Gegenstand nicht gefunden', 404);
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren des Gegenstands');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const { id, itemId } = await params;
    await prisma.equipment.deleteMany({
      where: { id: itemId, characterId: id },
    });
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen des Gegenstands');
  }
}