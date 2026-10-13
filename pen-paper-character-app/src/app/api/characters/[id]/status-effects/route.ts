// src/app/api/characters/[id]/status-effects/route.ts
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
    const effects = await prisma.statusEffect.findMany({
      where: { characterId: id },
      orderBy: { createdAt: 'asc' },
    });
    return apiSuccess(effects);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Status-Effekte');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.name) return apiError('Name ist erforderlich', 400);

    const statusEffect = await prisma.statusEffect.create({
      data: {
        name: body.name,
        description: body.description,
        icon: body.icon || '⚠️',
        duration: body.duration ? toInt(body.duration, 0) : null,
        durationUnit: body.durationUnit,
        source: body.source,
        sourceName: body.sourceName,
        level: body.level || 1,
        libraryEntryId: body.libraryEntryId ?? null,
        characterId: id,
        isActive: true,
      },
    });

    return apiSuccess(statusEffect, 201);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Erstellen des Status-Effekts');
  }
}