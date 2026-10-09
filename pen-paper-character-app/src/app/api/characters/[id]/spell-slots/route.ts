// src/app/api/characters/[id]/spell-slots/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, handleApiError } from '@/lib/api/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slots = await prisma.spellSlot.findMany({
      where: { characterId: id },
      orderBy: { rank: 'asc' },
    });
    return apiSuccess(slots);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Zauberplätze');
  }
}

/**
 * Bulk-Replace aller Spell-Slots des Charakters.
 * Body: { slots: [{ rank, total, used }, ...] }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const slots = Array.isArray(body.slots) ? body.slots : [];

    await prisma.$transaction(async (tx) => {
      await tx.spellSlot.deleteMany({ where: { characterId: id } });

      const valid = slots
        .filter((s: any) => typeof s.rank === 'number' && s.rank >= 1 && s.rank <= 9)
        .map((s: any) => ({
          rank: s.rank,
          total: Math.max(0, parseInt(s.total) || 0),
          used: Math.max(0, parseInt(s.used) || 0),
          characterId: id,
        }));

      if (valid.length > 0) {
        await tx.spellSlot.createMany({ data: valid });
      }
    });

    const result = await prisma.spellSlot.findMany({
      where: { characterId: id },
      orderBy: { rank: 'asc' },
    });

    return apiSuccess(result);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren der Zauberplätze');
  }
}