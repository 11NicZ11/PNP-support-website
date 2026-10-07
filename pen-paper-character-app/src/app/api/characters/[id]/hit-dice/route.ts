// src/app/api/characters/[id]/hit-dice/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

const VALID_DICE = ['d6', 'd8', 'd10', 'd12'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hitDice = await prisma.characterHitDice.findMany({
      where: { characterId: id },
      orderBy: [{ dieType: 'asc' }],
    });
    return apiSuccess(hitDice);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Trefferwürfel');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.dieType || !VALID_DICE.includes(body.dieType)) {
      return apiError('Ungültiger Würfeltyp. Erlaubt: d6, d8, d10, d12', 400);
    }

    const hitDice = await prisma.characterHitDice.create({
      data: {
        dieType: body.dieType,
        total: Math.max(0, parseInt(body.total) || 0),
        used: Math.max(0, parseInt(body.used) || 0),
        classLevelId: body.classLevelId || null,
        characterId: id,
      },
    });

    return apiSuccess(hitDice, 201);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Erstellen der Trefferwürfel');
  }
}