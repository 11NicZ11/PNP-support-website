// src/app/api/characters/[id]/hp-sources/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hpSources = await prisma.hpSource.findMany({
      where: { characterId: id },
      orderBy: { createdAt: 'asc' },
    });
    return apiSuccess(hpSources);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der HP-Quellen');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, value } = body;

    if (!name || typeof value !== 'number') {
      return apiError('name und value sind erforderlich', 400);
    }

    const hpSource = await prisma.hpSource.create({
      data: { name, value, characterId: id },
    });
    return apiSuccess(hpSource, 201);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Erstellen der HP-Quelle');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { sourceId, name, value } = body;

    if (!sourceId) return apiError('sourceId ist erforderlich', 400);

    const result = await prisma.hpSource.updateMany({
      where: { id: sourceId, characterId: id },
      data: { name, value },
    });
    if (result.count === 0) return apiError('Quelle nicht gefunden', 404);
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren der HP-Quelle');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const sourceId = url.searchParams.get('sourceId');

    if (!sourceId) return apiError('sourceId ist erforderlich', 400);

    await prisma.hpSource.deleteMany({
      where: { id: sourceId, characterId: id },
    });
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen der HP-Quelle');
  }
}