// src/app/api/characters/[id]/inventory/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const containers = await prisma.inventoryContainer.findMany({
      where: {
        characterId: id,
        parentId: null,
      },
      include: {
        items: true,
        children: {
          include: {
            items: true,
            children: {
              include: { items: true },
            },
          },
        },
      },
    });
    return apiSuccess(containers);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Container');
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

    const container = await prisma.inventoryContainer.create({
      data: {
        name: body.name,
        type: 'container',
        description: body.description || '',
        capacity: body.capacity || null,
        weightLimit: body.weightLimit ? parseFloat(body.weightLimit) : null,
        weightUnit: body.weightUnit || 'kg',
        sourceReference: body.sourceReference ?? '',
        libraryEntryId: body.libraryEntryId ?? null,
        characterId: id,
      },
    });

    return apiSuccess(container, 201);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Erstellen des Containers');
  }
}