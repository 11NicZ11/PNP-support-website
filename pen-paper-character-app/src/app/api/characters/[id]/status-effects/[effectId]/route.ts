// src/app/api/characters/[id]/status-effects/[effectId]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; effectId: string }> }
) {
  try {
    const { id, effectId } = await params;

    const result = await prisma.statusEffect.deleteMany({
      where: { id: effectId, characterId: id },
    });
    if (result.count === 0) return apiError('Effekt nicht gefunden', 404);

    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen des Status-Effekts');
  }
}