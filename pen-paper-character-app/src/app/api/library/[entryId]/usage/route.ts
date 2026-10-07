// src/app/api/library/[entryId]/usage/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

/**
 * GET /api/library/[entryId]/usage
 * Wie viele Charakter-Einträge zeigen auf diesen Library-Eintrag?
 *
 * Kein Ownership-Check: LibraryEntry ist global, die Zählung liefert nur
 * eine Anzeige für die Rückfrage-UI.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;

    const entry = await prisma.libraryEntry.findUnique({
      where: { id: entryId },
      select: { id: true },
    });
    if (!entry) return apiError('Eintrag nicht gefunden', 404);

    const [
      skills,
      savingThrows,
      proficiencies,
      defenses,
      statusEffects,
      actions,
      spells,
      equipment,
      inventoryItems,
      alternateForms,
      companions,
      inventoryContainers,
    ] = await Promise.all([
      prisma.skill.count({ where: { libraryEntryId: entryId } }),
      prisma.savingThrow.count({ where: { libraryEntryId: entryId } }),
      prisma.proficiency.count({ where: { libraryEntryId: entryId } }),
      prisma.defense.count({ where: { libraryEntryId: entryId } }),
      prisma.statusEffect.count({ where: { libraryEntryId: entryId } }),
      prisma.action.count({ where: { libraryEntryId: entryId } }),
      prisma.spell.count({ where: { libraryEntryId: entryId } }),
      prisma.equipment.count({ where: { libraryEntryId: entryId } }),
      prisma.inventoryItem.count({ where: { libraryEntryId: entryId } }),
      prisma.alternateForm.count({ where: { libraryEntryId: entryId } }),
      prisma.companion.count({ where: { libraryEntryId: entryId } }),
      prisma.inventoryContainer.count({ where: { libraryEntryId: entryId } }),
    ]);

    return apiSuccess({
      entryId,
      totalUsage:
        skills + savingThrows + proficiencies + defenses + statusEffects +
        actions + spells + equipment + inventoryItems + alternateForms +
        companions + inventoryContainers,
      breakdown: {
        skills, savingThrows, proficiencies, defenses, statusEffects,
        actions, spells, equipment, inventoryItems, alternateForms, companions,
        inventoryContainers,
      },
    });
  } catch (error) {
    return handleApiError(error, 'Fehler beim Ermitteln der Bibliotheks-Nutzung');
  }
}