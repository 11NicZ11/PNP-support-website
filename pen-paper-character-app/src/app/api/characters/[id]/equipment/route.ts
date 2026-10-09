// src/app/api/characters/[id]/equipment/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError, asJsonArray } from '@/lib/api/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const equipment = await prisma.equipment.findMany({
      where: { characterId: id },
      orderBy: [{ equipped: 'desc' }, { type: 'asc' }, { name: 'asc' }],
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
        weight: body.weight ? parseFloat(body.weight) : null,
        costAmount: body.costAmount ? parseInt(body.costAmount) : null,
        costUnit: body.costUnit || 'gp',
        magicBonus: body.magicBonus ? parseInt(body.magicBonus) : 0,
        attackBonus: body.attackBonus ? parseInt(body.attackBonus) : 0,
        damageDice: body.damageDice || null,
        damageType: body.damageType || null,
        range: body.range || null,
        weaponProperties: body.weaponProperties ? asJsonArray(body.weaponProperties) : null,
        armorClassBonus: body.armorClassBonus ? parseInt(body.armorClassBonus) : null,
        armorType: body.armorType || null,
        maxDexBonus: body.maxDexBonus ? parseInt(body.maxDexBonus) : null,
        stealthDisadvantage: body.stealthDisadvantage || false,
        strengthRequirement: body.strengthRequirement ? parseInt(body.strengthRequirement) : null,
        shieldBonus: body.shieldBonus ? parseInt(body.shieldBonus) : null,
        attunement: body.attunement || false,
        attuned: body.attuned || false,
        notes: body.notes || null,
        sourceReference: body.sourceReference ?? '',
        libraryEntryId: body.libraryEntryId ?? null,
        characterId: id,
      },
    });

    return apiSuccess(equipment, 201);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Erstellen der Ausrüstung');
  }
}