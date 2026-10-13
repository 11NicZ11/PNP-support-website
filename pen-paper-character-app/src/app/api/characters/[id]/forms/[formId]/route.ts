// src/app/api/characters/[id]/forms/[formId]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError, asJsonArray } from '@/lib/api/helpers';
import { toInt } from '@/lib/utils';
import { parseForm } from '@/lib/api/character-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; formId: string }> }
) {
  try {
    const { id, formId } = await params;
    const form = await prisma.alternateForm.findFirst({
      where: { id: formId, characterId: id },
    });
    if (!form) {
      return apiError('Form nicht gefunden', 404);
    }
    return apiSuccess(parseForm(form));
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Form');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; formId: string }> }
) {
  try {
    const { id, formId } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.source !== undefined) updateData.source = body.source;
    if (body.sourceReference !== undefined) updateData.sourceReference = body.sourceReference;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.challengeRating !== undefined) updateData.challengeRating = body.challengeRating;
    if (body.size !== undefined) updateData.size = body.size;
    if (body.creatureType !== undefined) updateData.creatureType = body.creatureType;
    if (body.armorClass !== undefined) updateData.armorClass = Math.max(0, parseInt(body.armorClass) || 10);
    if (body.hpMax !== undefined) updateData.hpMax = Math.max(0, parseInt(body.hpMax) || 1);
    if (body.hpCurrent !== undefined) updateData.hpCurrent = Math.max(0, parseInt(body.hpCurrent) || 0);
    if (body.hpFormula !== undefined) updateData.hpFormula = body.hpFormula;
    if (body.strength !== undefined) updateData.strength = parseInt(body.strength) || 10;
    if (body.dexterity !== undefined) updateData.dexterity = parseInt(body.dexterity) || 10;
    if (body.constitution !== undefined) updateData.constitution = parseInt(body.constitution) || 10;
    if (body.intelligence !== undefined) updateData.intelligence = parseInt(body.intelligence) || 10;
    if (body.wisdom !== undefined) updateData.wisdom = parseInt(body.wisdom) || 10;
    if (body.charisma !== undefined) updateData.charisma = parseInt(body.charisma) || 10;
    if (body.speedWalk !== undefined) updateData.speedWalk = parseInt(body.speedWalk) || 0;
    if (body.speedFly !== undefined) updateData.speedFly = parseInt(body.speedFly) || 0;
    if (body.speedSwim !== undefined) updateData.speedSwim = parseInt(body.speedSwim) || 0;
    if (body.speedClimb !== undefined) updateData.speedClimb = parseInt(body.speedClimb) || 0;
    if (body.speedBurrow !== undefined) updateData.speedBurrow = parseInt(body.speedBurrow) || 0;
    if (body.attacks !== undefined) updateData.attacks = asJsonArray(body.attacks);
    if (body.abilities !== undefined) updateData.abilities = asJsonArray(body.abilities);
    if (body.activationType !== undefined) updateData.activationType = body.activationType;
    if (body.durationType !== undefined) updateData.durationType = body.durationType;
    if (body.durationValue !== undefined) updateData.durationValue = parseInt(body.durationValue) || 1;
    if (body.usesPerRest !== undefined)
      updateData.usesPerRest =
        body.usesPerRest !== null ? toInt(body.usesPerRest, 0) : null;
    if (body.rechargeType !== undefined) updateData.rechargeType = body.rechargeType;
    if (body.linkedResourceId !== undefined) updateData.linkedResourceId = body.linkedResourceId;
    if (body.linkedFeatureId !== undefined) updateData.linkedFeatureId = body.linkedFeatureId;
    if (body.isActive !== undefined) updateData.isActive = body.isActive === true;
    if (body.concentration !== undefined) updateData.concentration = body.concentration === true;
    updateData.libraryEntryId =
      body.libraryEntryId !== undefined ? body.libraryEntryId : undefined;

    await prisma.alternateForm.updateMany({
      where: { id: formId, characterId: id },
      data: updateData,
    });

    const updated = await prisma.alternateForm.findFirst({
      where: { id: formId, characterId: id },
    });
    if (!updated) {
      return apiError('Form nicht gefunden', 404);
    }
    return apiSuccess(parseForm(updated));
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren der Form');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; formId: string }> }
) {
  try {
    const { id, formId } = await params;
    await prisma.alternateForm.deleteMany({
      where: { id: formId, characterId: id },
    });
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen der Form');
  }
}

// 🔥 POST: Aktivieren / Deaktivieren einer Form
// Body: { action: 'activate' | 'deactivate' }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; formId: string }> }
) {
  try {
    const { id, formId } = await params;
    const body = await request.json();
    const action = body.action as 'activate' | 'deactivate';

    if (action !== 'activate' && action !== 'deactivate') {
      return apiError('action muss "activate" oder "deactivate" sein', 400);
    }

    const form = await prisma.alternateForm.findFirst({
      where: { id: formId, characterId: id },
    });
    if (!form) {
      return apiError('Form nicht gefunden', 404);
    }

    if (action === 'activate') {
      // Alle anderen Formen des Charakters deaktivieren (es kann nur eine aktiv sein)
      await prisma.alternateForm.updateMany({
        where: { characterId: id, id: { not: formId } },
        data: { isActive: false },
      });

      const updated = await prisma.alternateForm.update({
        where: { id: formId },
        data: {
          isActive: true,
          hpCurrent: form.hpMax,
        },
      });

      return apiSuccess(parseForm(updated));
    } else {
      const updated = await prisma.alternateForm.update({
        where: { id: formId },
        data: { isActive: false },
      });
      return apiSuccess(parseForm(updated));
    }
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktivieren/Deaktivieren der Form');
  }
}