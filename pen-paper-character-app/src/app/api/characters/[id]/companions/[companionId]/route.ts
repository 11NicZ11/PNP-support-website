// src/app/api/characters/[id]/companions/[companionId]/route.ts
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
  { params }: { params: Promise<{ id: string; companionId: string }> }
) {
  try {
    const { id, companionId } = await params;
    const companion = await prisma.companion.findFirst({
      where: { id: companionId, characterId: id },
    });
    if (!companion) {
      return apiError('Gefährte nicht gefunden', 404);
    }
    return apiSuccess(parseCompanion(companion));
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden des Gefährten');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; companionId: string }> }
) {
  try {
    const { id, companionId } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.source !== undefined) updateData.source = body.source;
    if (body.sourceReference !== undefined) updateData.sourceReference = body.sourceReference;
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.creatureType !== undefined) updateData.creatureType = body.creatureType;
    if (body.size !== undefined) updateData.size = body.size;
    if (body.challengeRating !== undefined) updateData.challengeRating = body.challengeRating;
    if (body.armorClass !== undefined) updateData.armorClass = Math.max(0, parseInt(body.armorClass) || 10);
    if (body.hpMax !== undefined) updateData.hpMax = Math.max(0, parseInt(body.hpMax) || 1);
    if (body.hpCurrent !== undefined) updateData.hpCurrent = Math.max(0, parseInt(body.hpCurrent) || 0);
    if (body.tempHp !== undefined) updateData.tempHp = Math.max(0, parseInt(body.tempHp) || 0);
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
    if (body.senses !== undefined) updateData.senses = body.senses;
    if (body.languages !== undefined) updateData.languages = body.languages;
    if (body.attacks !== undefined) updateData.attacks = asJsonArray(body.attacks);
    if (body.abilities !== undefined) updateData.abilities = asJsonArray(body.abilities);
    if (body.isActive !== undefined) updateData.isActive = body.isActive !== false;
    if (body.isDismissed !== undefined) updateData.isDismissed = body.isDismissed === true;
    if (body.behavior !== undefined) updateData.behavior = body.behavior;
    if (body.behaviorNote !== undefined) updateData.behaviorNote = body.behaviorNote;
    if (body.linkedResourceId !== undefined) updateData.linkedResourceId = body.linkedResourceId;
    if (body.linkedFeatureId !== undefined) updateData.linkedFeatureId = body.linkedFeatureId;
    if (body.notes !== undefined) updateData.notes = body.notes;
    updateData.libraryEntryId =
      body.libraryEntryId !== undefined ? body.libraryEntryId : undefined;

    await prisma.companion.updateMany({
      where: { id: companionId, characterId: id },
      data: updateData,
    });

    const updated = await prisma.companion.findFirst({
      where: { id: companionId, characterId: id },
    });
    if (!updated) {
      return apiError('Gefährte nicht gefunden', 404);
    }
    return apiSuccess(parseCompanion(updated));
  } catch (error) {
    return handleApiError(error, 'Fehler beim Aktualisieren des Gefährten');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; companionId: string }> }
) {
  try {
    const { id, companionId } = await params;
    await prisma.companion.deleteMany({
      where: { id: companionId, characterId: id },
    });
    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Löschen des Gefährten');
  }
}

// 🔥 POST: Aktionen wie damage, heal, dismiss, recall
// Body: { action: 'damage' | 'heal' | 'dismiss' | 'recall', amount?: number }
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; companionId: string }> }
) {
  try {
    const { id, companionId } = await params;
    const body = await request.json();
    const action = body.action as 'damage' | 'heal' | 'dismiss' | 'recall';

    const companion = await prisma.companion.findFirst({
      where: { id: companionId, characterId: id },
    });
    if (!companion) {
      return apiError('Gefährte nicht gefunden', 404);
    }

    if (action === 'damage') {
      const amount = Math.max(0, parseInt(body.amount) || 0);
      let remaining = amount;
      let newTempHp = companion.tempHp;

      if (newTempHp > 0) {
        const dmg = Math.min(newTempHp, remaining);
        newTempHp -= dmg;
        remaining -= dmg;
      }

      const newHp = Math.max(0, companion.hpCurrent - remaining);
      const updated = await prisma.companion.update({
        where: { id: companionId },
        data: { hpCurrent: newHp, tempHp: newTempHp },
      });
      return apiSuccess(parseCompanion(updated));
    }

    if (action === 'heal') {
      const amount = Math.max(0, parseInt(body.amount) || 0);
      const newHp = Math.min(companion.hpMax, companion.hpCurrent + amount);
      const updated = await prisma.companion.update({
        where: { id: companionId },
        data: { hpCurrent: newHp },
      });
      return apiSuccess(parseCompanion(updated));
    }

    if (action === 'dismiss') {
      const updated = await prisma.companion.update({
        where: { id: companionId },
        data: { isDismissed: true, isActive: false },
      });
      return apiSuccess(parseCompanion(updated));
    }

    if (action === 'recall') {
      const updated = await prisma.companion.update({
        where: { id: companionId },
        data: { isDismissed: false, isActive: true },
      });
      return apiSuccess(parseCompanion(updated));
    }

    return apiError('Ungültige action', 400);
  } catch (error) {
    return handleApiError(error, 'Fehler bei der Companion-Aktion');
  }
}