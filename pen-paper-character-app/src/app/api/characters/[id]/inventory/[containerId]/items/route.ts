// src/app/api/characters/[id]/inventory/[containerId]/items/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError, withParsedWeaponProperties } from '@/lib/api/helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; containerId: string }> }
) {
  try {
    const { id, containerId } = await params;
    const body = await request.json();

    if (id === 'new') {
      return apiSuccess(
        {
          id: `temp-item-${Date.now()}`,
          message: 'Item lokal gespeichert (neuer Character)',
        },
        201
      );
    }

    const container = await prisma.inventoryContainer.findFirst({
      where: { id: containerId, characterId: id },
    });
    if (!container) return apiError('Container nicht gefunden', 404);

    const item = await prisma.inventoryItem.create({
      data: {
        name: body.name,
        description: body.description || '',
        quantity: body.quantity || 1,
        weight: body.weight || null,
        value: body.value || null,
        equipped: body.equipped || false,
        notes: body.notes || '',
        sourceReference: body.sourceReference ?? '',
        containerId,
        characterId: id,
        equipmentId: body.equipmentId || null,
        libraryEntryId: body.libraryEntryId ?? null,
        type: body.type || null,
        subtype: body.subtype || null,
        magicBonus: body.magicBonus || 0,
        attackBonus: body.attackBonus || 0,
        damageDice: body.damageDice || null,
        damageType: body.damageType || null,
        rangeType: body.rangeType ?? null,
        rangeValue: body.rangeValue != null ? parseFloat(body.rangeValue) : null,
        rangeMaxValue: body.rangeMaxValue != null ? parseFloat(body.rangeMaxValue) : null,
        weaponProperties: body.weaponProperties
          ? JSON.stringify(body.weaponProperties)
          : null,
        weaponPropertyRows: {
          create: (Array.isArray(body.weaponPropertyRows) ? body.weaponPropertyRows : []).map(
            (p: any, i: number) => ({
              name: p.name,
              valueNumber: p.valueNumber != null ? parseFloat(p.valueNumber) : null,
              libraryEntryId: p.libraryEntryId ?? null,
              order: i,
            })
          ),
        },
        armorClassBonus: body.armorClassBonus || 0,
        armorType: body.armorType || null,
        maxDexBonus: body.maxDexBonus || 0,
        stealthDisadvantage: body.stealthDisadvantage || false,
        strengthRequirement: body.strengthRequirement || 0,
        shieldBonus: body.shieldBonus || 0,
        attunement: body.attunement || false,
        attuned: body.attuned || false,
      },
      include: { weaponPropertyRows: { orderBy: { order: 'asc' } } },
    });

    return apiSuccess(withParsedWeaponProperties(item), 201);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Erstellen des Items');
  }
}