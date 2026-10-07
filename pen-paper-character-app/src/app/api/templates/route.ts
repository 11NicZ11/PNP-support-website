// src/app/api/templates/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

/**
 * GET /api/templates?type=skill&category=
 * Liefert alle Template-Einträge aus der Bibliothek von Babylon.
 * Query-Parameter:
 *   - type: 'skill' | 'saving_throw' | 'proficiency' | 'defense' | 'status_effect'
 *   - category: (optional) z.B. 'language', 'damage_immunity'
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const category = url.searchParams.get('category');

    if (!type) {
      return apiError('Query-Parameter "type" ist erforderlich', 400);
    }

    const where: any = { type };
    if (category !== null) where.category = category;

    const entries = await prisma.libraryEntry.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    const parsed = entries.map((e) => {
      let data: any = {};
      try {
        data = JSON.parse(e.data || '{}');
      } catch {
        data = {};
      }
      return {
        id: e.id,
        type: e.type,
        category: e.category,
        name: e.name,
        description: e.description,
        icon: e.icon,
        isSeed: e.isSeed,
        isPublic: e.isPublic,
        data,
      };
    });

    return apiSuccess(parsed);
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Templates');
  }
}