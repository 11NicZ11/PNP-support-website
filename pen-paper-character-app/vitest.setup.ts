// pen-paper-character-app\vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Silence the DiceLogContext global callback for tests that don't assert logging.
// `src/lib/dice.ts` uses module-level mutable state; reset it before every test.
import { setGlobalLogCallback } from './src/lib/dice';

beforeEach(() => {
  setGlobalLogCallback(() => {});
});

afterEach(() => {
  cleanup();             // unmount React trees (RTL 16)
  vi.restoreAllMocks();  // undo Math.random / fetch spies
  localStorage.clear();  // jsdom storage is shared across tests
});