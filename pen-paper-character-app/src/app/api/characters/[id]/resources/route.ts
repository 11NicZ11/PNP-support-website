// src/app/api/characters/[id]/resources/route.ts
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
    const resources = await prisma.characterResource.findMany({
      where: { characterId: id },
      orderBy: [{ source: 'asc' }, { name: 'asc' }],
    });
    return apiSuccess(resources);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Ressourcen');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.name) {
      return apiError('Name ist erforderlich', 400);
    }

    const resource = await prisma.characterResource.create({
      data: {
        name: body.name,
        max: Math.max(0, parseInt(body.max) || 0),
        current:
          body.current !== undefined && body.current !== null
            ? Math.max(0, toInt(body.current, 0))
            : Math.max(0, parseInt(body.max) || 0),
        rechargeType: body.rechargeType || 'long',
        source: body.source || 'class',
        sourceName: body.sourceName || '',
        icon: body.icon || '✨',
        description: body.description || '',
        classLevelId: body.classLevelId || null,
        characterId: id,
      },
    });

    return apiSuccess(resource, 201);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Erstellen der Ressource');
  }
}