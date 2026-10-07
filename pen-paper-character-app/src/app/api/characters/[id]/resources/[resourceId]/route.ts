// src/app/api/characters/[id]/resources/[resourceId]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; resourceId: string }> }
) {
  try {
    const { id, resourceId } = await params;
    const resource = await prisma.characterResource.findFirst({
      where: { id: resourceId, characterId: id },
    });

    if (!resource) {
      return apiError('Ressource nicht gefunden', 404);
    }

    return apiSuccess(resource);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Ressource');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; resourceId: string }> }
) {
  try {
    const { id, resourceId } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.max !== undefined) updateData.max = Math.max(0, parseInt(body.max) || 0);
    if (body.current !== undefined)
      updateData.current = Math.max(0, parseInt(body.current) || 0);
    if (body.rechargeType !== undefined) updateData.rechargeType = body.rechargeType;
    if (body.source !== undefined) updateData.source = body.source;
    if (body.sourceName !== undefined) updateData.sourceName = body.sourceName;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.classLevelId !== undefined) updateData.classLevelId = body.classLevelId;

    await prisma.characterResource.updateMany({
      where: { id: resourceId, characterId: id },
      data: updateData,
    });

    const updated = await prisma.characterResource.findFirst({
      where: { id: resourceId, characterId: id },
    });

    if (!updated) {
      return apiError('Ressource nicht gefunden', 404);
    }

    return apiSuccess(updated);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren der Ressource');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; resourceId: string }> }
) {
  try {
    const { id, resourceId } = await params;

    await prisma.characterResource.deleteMany({
      where: { id: resourceId, characterId: id },
    });

    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen der Ressource');
  }
}