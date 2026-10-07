// src/app/api/library/[entryId]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;
    const body = await request.json();

    const existing = await prisma.libraryEntry.findUnique({
      where: { id: entryId },
    });
    if (!existing) return apiError('Eintrag nicht gefunden', 404);

    // 'system' → unantastbar. Übergangs-Guard: isSeed ohne seedKind
    // (vor Backfill) wird wie 'system' behandelt (Defense in Depth).
    const isSystemEntry =
      existing.seedKind === 'system' ||
      (existing.isSeed && existing.seedKind === null);
    if (isSystemEntry) {
      return apiError('System-Einträge können nicht bearbeitet werden', 403);
    }

    const updated = await prisma.libraryEntry.update({
      where: { id: entryId },
      data: {
        name: body.name ?? existing.name,
        description: body.description ?? existing.description,
        icon: body.icon ?? existing.icon,
        data:
          body.data !== undefined
            ? typeof body.data === 'string'
              ? body.data
              : JSON.stringify(body.data)
            : existing.data,
        isPublic: body.isPublic ?? existing.isPublic,
      },
    });

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren des Eintrags');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;

    const existing = await prisma.libraryEntry.findUnique({
      where: { id: entryId },
    });
    if (!existing) return apiError('Eintrag nicht gefunden', 404);
    if (existing.isSeed) {
      return apiError('System-Einträge können nicht gelöscht werden', 403);
    }

    await prisma.libraryEntry.delete({ where: { id: entryId } });
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen des Eintrags');
  }
}