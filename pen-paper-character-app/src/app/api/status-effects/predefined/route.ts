// src/app/api/status-effects/predefined/route.ts
import { prisma } from '@/lib/prisma';
import { apiSuccess, handleApiError } from '@/lib/api/helpers';

export async function GET() {
  try {
    const predefinedEffects = await prisma.predefinedStatusEffect.findMany();
    return apiSuccess(predefinedEffects);
  } catch (error) {
    // Falls die Tabelle noch nicht existiert, leeres Array zurückgeben
    console.error('Fehler beim Laden der vordefinierten Effekte:', error);
    return apiSuccess([]);
  }
}