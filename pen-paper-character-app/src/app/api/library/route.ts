// src/app/api/library/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, apiSuccess, handleApiError } from '@/lib/api/helpers';

/**
 * GET /api/library?type=skill&category=
 * Beide Parameter optional.
 *   - Ohne type → alle Einträge
 *   - Ohne category → alle Kategorien des Types
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const category = url.searchParams.get('category');

    const where: any = {};
    if (type) where.type = type;
    if (category !== null && category !== undefined) where.category = category;

    const entries = await prisma.libraryEntry.findMany({
      where,
      orderBy: [{ type: 'asc' }, { category: 'asc' }, { name: 'asc' }],
    });

    return apiSuccess(
      entries.map((e) => ({
        id: e.id,
        type: e.type,
        category: e.category,
        name: e.name,
        description: e.description,
        icon: e.icon,
        isSeed: e.isSeed,
        seedKind: e.seedKind,
        isPublic: e.isPublic,
        data: (() => {
          try {
            return JSON.parse(e.data || '{}');
          } catch {
            return {};
          }
        })(),
      }))
    );
  } catch (error) {
    return handleApiError(error, 'Fehler beim Laden der Bibliothek');
  }
}

// ==================== POST-Helpers (Reference-Pattern) ====================

type PostMode = 'reuse' | 'update' | 'force-new';

const VALID_POST_MODES: PostMode[] = ['reuse', 'update', 'force-new'];

const FORCE_NEW_MAX_ATTEMPTS = 100;

/**
 * LibraryEntry.data liegt als JSON-String in der DB (Prisma-Feld `data`).
 * `any` ist hier bewusst: die Struktur unterscheidet sich je `type`.
 */
function parseEntryData(data: string): Record<string, any> {
  try {
    return JSON.parse(data || '{}');
  } catch {
    return {};
  }
}

/** Akzeptiert ein Objekt oder einen bereits serialisierten JSON-String. */
function serializeEntryData(value: unknown): string {
  if (typeof value === 'string') return value;
  return JSON.stringify(value ?? {});
}

/** Response-Body: Library-Eintrag mit geparstem `data`. */
function withParsedData<T extends { data: string }>(entry: T) {
  return { ...entry, data: parseEntryData(entry.data) };
}

/**
 * force-new: findet einen freien Namen. Bei Duplikaten werden
 * Suffixe `(2)`, `(3)`, ... angehängt (max. 100 Versuche).
 */
async function findFreeName(
  type: string,
  category: string,
  baseName: string
): Promise<string> {
  for (let attempt = 1; attempt <= FORCE_NEW_MAX_ATTEMPTS; attempt++) {
    const candidate = attempt === 1 ? baseName : `${baseName} (${attempt})`;
    const existing = await prisma.libraryEntry.findUnique({
      where: { type_category_name: { type, category, name: candidate } },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error('FORCE_NEW_LIMIT_REACHED');
}

/**
 * POST /api/library
 * Body: { type, category?, name, description?, icon?, data?, isPublic?,
 *         mode?, targetEntryId? }
 * mode: 'reuse' (Default) | 'update' | 'force-new'
 * Response enthält immer `status`: 'created' | 'reused' | 'updated'.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.type || !body.name) {
      return apiError('type und name sind erforderlich', 400);
    }

    // `mode` fehlt oder ist leer ("") → rückwärtskompatibel 'reuse'.
    const rawMode = body.mode || 'reuse';
    if (!VALID_POST_MODES.includes(rawMode)) {
      return apiError(
        "Ungültiger mode — erlaubt sind 'reuse', 'update' oder 'force-new'",
        400
      );
    }
    const mode: PostMode = rawMode;

    const category = body.category || '';

    // ---------------- mode = 'update' ----------------
    if (mode === 'update') {
      const targetEntryId = body.targetEntryId;
      if (!targetEntryId) {
        return apiError('targetEntryId ist erforderlich', 400);
      }

      const target = await prisma.libraryEntry.findUnique({
        where: { id: targetEntryId },
      });
      if (!target) return apiError('Eintrag nicht gefunden', 404);

      // 'system' → unantastbar. Übergangs-Guard: isSeed ohne seedKind
      // (vor Backfill) wird wie 'system' behandelt (Defense in Depth).
      const isSystemEntry =
        target.seedKind === 'system' ||
        (target.isSeed && target.seedKind === null);
      if (isSystemEntry) {
        return apiError('System-Einträge können nicht geändert werden', 403);
      }

      // Issue X: Kollisions-Check vor dem Update (Unique: type+category+name).
      // `type`/`category` werden hier nie mitgeschickt → zählt target.type.
      const nextName = body.name !== undefined ? body.name : target.name;
      const collision = await prisma.libraryEntry.findFirst({
        where: {
          type: target.type,
          category: target.category,
          name: nextName,
          NOT: { id: targetEntryId },
        },
        select: { id: true },
      });
      if (collision) {
        return apiError(
          `Ein Eintrag mit dem Namen „${nextName}“ existiert bereits`,
          409
        );
      }

      let updated;
      try {
        updated = await prisma.libraryEntry.update({
          where: { id: targetEntryId },
          data: {
            ...(body.name !== undefined ? { name: body.name } : {}),
            ...(body.description !== undefined
              ? { description: body.description }
              : {}),
            ...(body.icon !== undefined ? { icon: body.icon } : {}),
            ...(body.data !== undefined
              ? { data: serializeEntryData(body.data) }
              : {}),
            ...(body.isPublic !== undefined ? { isPublic: body.isPublic } : {}),
          },
        });
      } catch (err) {
        // Race-Condition-Schutz: Einzigartigkeit zwischen Check und Update verletzt.
        const code =
          err && typeof err === 'object' && 'code' in err
            ? String((err as { code?: unknown }).code)
            : null;
        if (code === 'P2002') {
          return apiError(
            `Ein Eintrag mit dem Namen „${nextName}“ existiert bereits`,
            409
          );
        }
        throw err;
      }

      return apiSuccess(
        { ...withParsedData(updated), status: 'updated' },
        200
      );
    }

    // ------------- mode = 'reuse' | 'force-new' -------------
    let name: string = body.name;

    if (mode === 'reuse') {
      const existing = await prisma.libraryEntry.findUnique({
        where: {
          type_category_name: {
            type: body.type,
            category,
            name: body.name,
          },
        },
      });
      if (existing) {
        return apiSuccess(
          { ...withParsedData(existing), status: 'reused' },
          200
        );
      }
    } else {
      // force-new: immer neu, ggf. mit Suffix `(2)`, `(3)`, ...
      name = await findFreeName(body.type, category, body.name);
    }

    const created = await prisma.libraryEntry.create({
      data: {
        type: body.type,
        category,
        name,
        description: body.description || '',
        icon: body.icon || '📚',
        data: serializeEntryData(body.data ?? {}),
        isSeed: false,
        isPublic: body.isPublic !== false,
      },
    });

    return apiSuccess({ ...withParsedData(created), status: 'created' }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'FORCE_NEW_LIMIT_REACHED') {
      return apiError(
        'Kein freier Name gefunden — zu viele Duplikate',
        409
      );
    }
    return handleApiError(error, 'Fehler beim Erstellen des Bibliothek-Eintrags');
  }
}