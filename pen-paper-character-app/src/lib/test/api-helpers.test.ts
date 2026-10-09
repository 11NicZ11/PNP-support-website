// src/lib/test/api-helpers.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleApiError } from '../api/helpers';
import { ApiError } from '../api/errors';

describe('handleApiError — Fehlerklassifikation', () => {
  beforeEach(() => {
    // Stack-Logging unterdrücken und gleichzeitig prüfen, dass geloggt wird.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ApiError → eigener Status, Code und Meldung', async () => {
    const res = handleApiError(new ApiError(404, 'NOT_FOUND', 'Charakter nicht gefunden'));
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ error: 'Charakter nicht gefunden', code: 'NOT_FOUND' });
  });

  it('Prisma P2025 → 404 NOT_FOUND mit Fallback-Meldung', async () => {
    const prismaError = Object.assign(new Error('Record to update not found.'), { code: 'P2025' });
    const res = handleApiError(prismaError, 'Charakter nicht gefunden');
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.code).toBe('NOT_FOUND');
    expect(body.error).toBe('Charakter nicht gefunden');
  });

  it('Prisma P2002 → 409 CONFLICT', async () => {
    const prismaError = Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
    const res = handleApiError(prismaError, 'Eintrag existiert bereits');
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.code).toBe('CONFLICT');
    expect(body.error).toBe('Eintrag existiert bereits');
  });

  it('SyntaxError (kaputter JSON-Body) → 400 INVALID_JSON', async () => {
    let syntaxError: unknown = undefined;
    try {
      JSON.parse('{bad');
    } catch (e) {
      syntaxError = e;
    }
    expect(syntaxError).toBeInstanceOf(SyntaxError);

    const res = handleApiError(syntaxError, 'Fehler beim Erstellen des Zaubers');
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('INVALID_JSON');
    expect(body.error).toBe('Fehler beim Erstellen des Zaubers');
  });

  it('beliebiger Fehler → 500 INTERNAL mit Fallback-Meldung', async () => {
    const res = handleApiError(new Error('DB down'), 'Fehler beim Laden');
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.code).toBe('INTERNAL');
    expect(body.error).toBe('Fehler beim Laden');
  });

  it('ohne Fallback-Text kommt der Default-Text', async () => {
    const res = handleApiError(new Error('x'));
    const body = await res.json();
    expect(body.error).toBe('Ein Fehler ist aufgetreten');
    expect(body.code).toBe('INTERNAL');
  });

  it('Antwort enthält immer error UND code (Response-Shape-Vertrag)', async () => {
    const res = handleApiError(new ApiError(409, 'CONFLICT', 'x'), 'Fallback');
    const body = await res.json();
    expect(Object.keys(body).sort()).toEqual(['code', 'error']);
  });

  it('logged den echten Fehler serverseitig (console.error)', () => {
    const err = new Error('real problem');
    handleApiError(err, 'Fallback');
    expect(console.error).toHaveBeenCalledWith(err);
  });
});
