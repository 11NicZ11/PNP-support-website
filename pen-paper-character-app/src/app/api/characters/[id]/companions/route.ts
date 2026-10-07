// src/app/api/characters/[id]/companions/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError, asJsonArray } from '@/lib/api/helpers';
import { parseJsonArray } from '@/lib/utils';

function parseCompanion(companion: any) {
  return {
    ...companion,
    attacks: parseJsonArray(companion.attacks || '[]'),
    abilities: parseJsonArray(companion.abilities || '[]'),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const companions = await prisma.companion.findMany({
      where: { characterId: id },
      orderBy: [{ isDismissed: 'asc' }, { name: 'asc' }],
    });
    return apiSuccess(companions.map(parseCompanion));
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Gefährten');
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

    const companion = await prisma.companion.create({
      data: {
        name: body.name,
        type: body.type || 'familiar',
        source: body.source || 'find_familiar',
        sourceReference: body.sourceReference || '',
        icon: body.icon || '🦉',
        creatureType: body.creatureType || '',
        size: body.size || 'tiny',
        challengeRating: body.challengeRating || '0',
        armorClass: Math.max(0, parseInt(body.armorClass) || 10),
        hpMax: Math.max(0, parseInt(body.hpMax) || 1),
        hpCurrent: Math.max(0, parseInt(body.hpCurrent) ?? parseInt(body.hpMax) ?? 1),
        tempHp: Math.max(0, parseInt(body.tempHp) || 0),
        strength: parseInt(body.strength) || 10,
        dexterity: parseInt(body.dexterity) || 10,
        constitution: parseInt(body.constitution) || 10,
        intelligence: parseInt(body.intelligence) || 10,
        wisdom: parseInt(body.wisdom) || 10,
        charisma: parseInt(body.charisma) || 10,
        speedWalk: parseInt(body.speedWalk) || 0,
        speedFly: parseInt(body.speedFly) || 0,
        speedSwim: parseInt(body.speedSwim) || 0,
        speedClimb: parseInt(body.speedClimb) || 0,
        speedBurrow: parseInt(body.speedBurrow) || 0,
        senses: body.senses || '',
        languages: body.languages || '',
        attacks: asJsonArray(body.attacks || []),
        abilities: asJsonArray(body.abilities || []),
        isActive: body.isActive !== false,
        isDismissed: body.isDismissed === true,
        behavior: body.behavior || 'follow',
        behaviorNote: body.behaviorNote || '',
        linkedResourceId: body.linkedResourceId || null,
        linkedFeatureId: body.linkedFeatureId || null,
        notes: body.notes || '',
        libraryEntryId: body.libraryEntryId ?? null,
        characterId: id,
      },
    });

    return apiSuccess(parseCompanion(companion), 201);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Erstellen des Gefährten');
  }
}