// src/app/api/characters/[id]/equipment/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';
import { toInt } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const equipment = await prisma.equipment.findMany({
      where: { characterId: id },
      orderBy: [{ equipped: 'desc' }, { type: 'asc' }, { name: 'asc' }],
      include: { weaponPropertyRows: { orderBy: { order: 'asc' } } },
    });
    return apiSuccess(equipment);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Ausrüstung');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.name || !body.type) {
      return apiError('Name und Typ sind erforderlich', 400);
    }

    const equipment = await prisma.equipment.create({
      data: {
        name: body.name,
        type: body.type,
        subtype: body.subtype || null,
        description: body.description || '',
        equipped: body.equipped || false,
        quantity: body.quantity || 1,
        weight: body.weight != null ? parseFloat(body.weight) : null,
        costAmount: body.costAmount ? toInt(body.costAmount, 0) : null,
        costUnit: body.costUnit || 'gp',
        magicBonus: body.magicBonus ? toInt(body.magicBonus, 0) : 0,
        attackBonus: body.attackBonus ? toInt(body.attackBonus, 0) : 0,
        damageDice: body.damageDice || null,
        damageType: body.damageType || null,
        rangeType: body.rangeType ?? null,
        rangeValue: body.rangeValue != null ? parseFloat(body.rangeValue) : null,
        rangeMaxValue: body.rangeMaxValue != null ? parseFloat(body.rangeMaxValue) : null,
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
        armorClassBonus: body.armorClassBonus ? toInt(body.armorClassBonus, 0) : null,
        armorType: body.armorType || null,
        maxDexBonus: body.maxDexBonus ? toInt(body.maxDexBonus, 0) : null,
        stealthDisadvantage: body.stealthDisadvantage || false,
        strengthRequirement: body.strengthRequirement ? toInt(body.strengthRequirement, 0) : null,
        shieldBonus: body.shieldBonus ? toInt(body.shieldBonus, 0) : null,
        attunement: body.attunement || false,
        attuned: body.attuned || false,
        notes: body.notes || null,
        sourceReference: body.sourceReference ?? '',
        libraryEntryId: body.libraryEntryId ?? null,
        characterId: id,
      },
      include: { weaponPropertyRows: { orderBy: { order: 'asc' } } },
    });

    return apiSuccess(equipment, 201);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Erstellen der Ausrüstung');
  }
}