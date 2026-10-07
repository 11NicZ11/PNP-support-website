// src/app/api/characters/[id]/defenses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const defenses = await prisma.defense.findMany({
      where: { characterId: id },
    });

    const damageImmunities = defenses.filter((d) => d.type === 'damage_immunity');
    const damageResistances = defenses.filter((d) => d.type === 'damage_resistance');
    const conditionImmunities = defenses.filter((d) => d.type === 'condition_immunity');

    return apiSuccess({ damageImmunities, damageResistances, conditionImmunities });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Defenses');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, name, description, source, isCustom } = body;

    if (!type || !name) {
      return apiError('type und name sind erforderlich', 400);
    }

    const defense = await prisma.defense.create({
      data: {
        type,
        name,
        description: description || '',
        source: source || 'custom',
        isCustom: isCustom ?? true,
        characterId: id,
      },
    });

    return apiSuccess(defense, 201);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Erstellen der Defense');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const defenseId = url.searchParams.get('defenseId');

    if (!defenseId) {
      return apiError('defenseId ist erforderlich', 400);
    }

    await prisma.defense.deleteMany({
      where: { id: defenseId, characterId: id },
    });

    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen der Defense');
  }
}