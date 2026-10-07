// src/app/api/characters/[id]/spells/[spellId]/prepare/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; spellId: string }> }
) {
  try {
    const { id, spellId } = await params;
    const body = await request.json();
    const { prepared } = body;

    if (prepared === undefined) {
      return apiError('prepared Status ist erforderlich', 400);
    }

    const spell = await prisma.spell.findFirst({
      where: { id: spellId, characterId: id },
    });
    if (!spell) return apiError('Zauber nicht gefunden', 404);

    const updated = await prisma.spell.update({
      where: { id: spellId },
      data: { prepared },
    });
    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Vorbereiten des Zaubers');
  }
}