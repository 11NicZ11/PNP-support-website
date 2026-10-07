// src/lib/api/helpers.ts
// Hilfsfunktionen für API-Routen

import { NextResponse } from 'next/server';

export const apiError = (message: string, status: number = 400): NextResponse =>
  NextResponse.json({ error: message }, { status });

export const apiSuccess = <T>(data: T, status: number = 200): NextResponse =>
  NextResponse.json(data, { status });

export const handleApiError = (error: unknown, fallback: string = 'Ein Fehler ist aufgetreten'): NextResponse => {
  console.error(error);
  return NextResponse.json({ error: fallback }, { status: 500 });
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

export const asJsonObject = (value: any): string => {
  if (!value) return '{}';
  if (typeof value === 'string') return value;
  try { return JSON.stringify(value); } catch { return '{}'; }
};