// src/lib/api/helpers.ts
// Hilfsfunktionen für API-Routen

import { NextResponse } from 'next/server';
import { ApiError } from './errors';
import { parseJsonArray } from '@/lib/utils';

export const apiError = (message: string, status: number = 400): NextResponse =>
  NextResponse.json({ error: message }, { status });

export const apiSuccess = <T>(data: T, status: number = 200): NextResponse =>
  NextResponse.json(data, { status });

export const handleApiError = (error: unknown, fallback: string = 'Ein Fehler ist aufgetreten'): NextResponse => {
  // Echten Fehler immer mit Stack serverseitig loggen — unabhängig von der Klassifikation.
  console.error(error);

  // Bewusst geworfener ApiError: Status, Code und Meldung direkt übernehmen.
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.status }
    );
  }

  // request.json() auf kaputtem/leerem Body wirft SyntaxError → 400 statt 500.
  if (error instanceof SyntaxError) {
    return NextResponse.json(
      { error: fallback, code: 'INVALID_JSON' },
      { status: 400 }
    );
  }

  // Prisma-Fehlercodes strukturell auslesen (gleicher Ansatz wie in
  // api/library/route.ts — kein Import von @prisma/client nötig).
  const prismaCode =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code: unknown }).code)
      : null;

  if (prismaCode === 'P2025') {
    // "Record not found" → 404
    return NextResponse.json(
      { error: fallback, code: 'NOT_FOUND' },
      { status: 404 }
    );
  }
  if (prismaCode === 'P2002') {
    // Unique-Constraint verletzt → 409
    return NextResponse.json(
      { error: fallback, code: 'CONFLICT' },
      { status: 409 }
    );
  }

  // Alles andere bleibt ein Serverfehler.
  return NextResponse.json(
    { error: fallback, code: 'INTERNAL' },
    { status: 500 }
  );
};

export const requireParams = (params: Record<string, string | undefined>, required: string[]): string | null => {
  for (const key of required) {
    if (!params[key]) return `Fehlender Parameter: ${key}`;
  }
  return null;
};

export const parseNumericParam = (value: string | undefined, fallback: number = 0): number => {
  if (!value) return fallback;
  const parsed = parseInt(value);
  return isNaN(parsed) ? fallback : parsed;
};

export const parseFloatParam = (value: string | undefined, fallback: number = 0): number => {
  if (!value) return fallback;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
};

export const asJsonArray = (value: any): string => {
  if (!value) return '[]';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch { return '[]'; }
};

/**
 * JSON boundary: `weaponProperties` liegt als JSON-String in der DB.
 * An jeder API-Grenze zu einem Array parsen (idempotent für Arrays).
 */
export const withParsedWeaponProperties = <T extends { weaponProperties?: unknown }>(
  row: T
): T & { weaponProperties: unknown[] } => ({
  ...row,
  weaponProperties: parseJsonArray(row.weaponProperties),
});

/**
 * JSON boundary: Inventory-Container tragen ihre Items in mehreren Ebenen
 * (items / children / children.children) — rekursiv weaponProperties parsen.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- JSON boundary: Prisma-Include-Baum mit flachen Zeilen
export const withParsedInventoryItems = (container: any): any => ({
  ...container,
  items: (container.items ?? []).map(withParsedWeaponProperties),
  children: (container.children ?? []).map(withParsedInventoryItems),
});

export const asJsonObject = (value: any): string => {
  if (!value) return '{}';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch { return '{}'; }
};