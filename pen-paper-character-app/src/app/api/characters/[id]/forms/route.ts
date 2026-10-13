// src/app/api/characters/[id]/forms/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError, asJsonArray } from '@/lib/api/helpers';
import { parseJsonArray, toInt } from '@/lib/utils';

function parseForm(form: any) {
  return {
    ...form,
    attacks: parseJsonArray(form.attacks || '[]'),
    abilities: parseJsonArray(form.abilities || '[]'),
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const forms = await prisma.alternateForm.findMany({
      where: { characterId: id },
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });
    return apiSuccess(forms.map(parseForm));
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Formen');
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

    const form = await prisma.alternateForm.create({
      data: {
        name: body.name,
        description: body.description || '',
        source: body.source || 'wild_shape',
        sourceReference: body.sourceReference || '',
        icon: body.icon || '🐺',
        challengeRating: body.challengeRating || '0',
        size: body.size || 'medium',
        creatureType: body.creatureType || '',
        armorClass: Math.max(0, parseInt(body.armorClass) || 10),
        hpMax: Math.max(0, parseInt(body.hpMax) || 1),
        hpCurrent: toInt(body.hpCurrent, toInt(body.hpMax, 1, 0), 0),
        hpFormula: body.hpFormula || '',
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
        attacks: asJsonArray(body.attacks || []),
        abilities: asJsonArray(body.abilities || []),
        activationType: body.activationType || 'action',
        durationType: body.durationType || 'hours',
        durationValue: parseInt(body.durationValue) || 1,
        usesPerRest:
          body.usesPerRest !== null && body.usesPerRest !== undefined
            ? toInt(body.usesPerRest, 0)
            : null,
        rechargeType: body.rechargeType || 'short',
        linkedResourceId: body.linkedResourceId || null,
        linkedFeatureId: body.linkedFeatureId || null,
        isActive: body.isActive === true,
        concentration: body.concentration === true,
        libraryEntryId: body.libraryEntryId ?? null,
        characterId: id,
      },
    });

    return apiSuccess(parseForm(form), 201);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Erstellen der Form');
  }
}