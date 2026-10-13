# Component / UI rules

Read `shared.md` first. Applies to files under `src/components/`.

## React

- Client components start with `'use client'`. API routes never do.
- No `useEffect` to derive state — use `useMemo` or compute in render.
- `useCallback` only for props to memoized children or dependency lists.
- No direct `fetch` in components when a hook exists (`useLibrary`,
  `useDice`, etc.). If no hook exists, check before writing one.
- Lists: `key={item.id}`, never the index.
- Import types from `src/types/`, never redeclare them.

## Buttons and forms

- Every `<button>` gets `type="button"`, **except** the intended submit
  button of a form. The whole character editor lives inside one
  `<form>` (`CharacterForm`) — an untyped button triggers a silent
  PUT.
- Never nest `<form>` elements. A dialog with its own `<form>` must
  render **outside** the main form, or React's event bubbling will
  trigger both.
- Modal pattern:

```tsx
<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
  <div className="bg-gray-800 rounded-xl max-w-lg w-full border border-purple-500/30">
    {/* header with ✕ button, body, footer with buttons */}
  </div>
</div>
```

No portal. `if (!isOpen) return null;` **after** all hooks.

## Styling (Tailwind, dark theme)

- Background: `bg-gray-900/50`, `bg-gray-800/30`
- Border: `border-purple-500/20`, `border-gray-700/50`
- Accent: `bg-purple-600 hover:bg-purple-700`
- Secondary text: `text-gray-400`
- Success / error / warning: `text-green-400` / `text-red-400` /
  `text-yellow-400`
- No new colors. No inline styles except dynamic values (bar width,
  percentages).

## Hooks

- `useLibrary` once per component. Not in `.map()`, loops, or
  conditions. Load, then `filter`.
- `.sort()` mutates — always copy first: `[...entries].sort(...)`.

## Error handling

- Every `fetch` checks `res.ok`. Failures reach `setError` (or a
  rollback) — never `console.error` alone.
- Info messages ("Ritual gewirkt") go to a toast. Failures
  ("Speichern fehlgeschlagen") go to `setError`.