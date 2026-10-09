// src/lib/api/errors.ts
// ApiError — bewusst geworfener Fehler mit eigenem HTTP-Status und Code.
// Wird von handleApiError (helpers.ts) erkannt und direkt durchgereicht,
// damit Routen in Zukunft gezielt 404/409/400 statt pauschal 500 werfen können.

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}
