# Continue Watching Dismiss — Design Spec

Date: 2026-07-31
Status: Approved
Scope: Dismiss (hide) individual entries from the Continue Watching row on the home page, without deleting their watch progress.

## Summary

Add a dismiss (X) button to Continue Watching cards. Dismissing hides the entry from the row while keeping its watch progress intact — the entry reappears if the user watches that content again (progress updates reset the dismissal). Local-only: dismissal does not sync to Supabase.

## Goals

- Users can remove a Continue Watching entry from the home row.
- Watch progress data is preserved (not deleted) on dismiss.
- Watching the content again brings it back automatically.

## Non-Goals (YAGNI)

- Undo on dismiss.
- Cloud sync of dismissal state (no Supabase schema change).
- Dedicated "dismissed list" page/settings.
- Deleting progress itself (out of scope; `clearWatchProgress` already exists for that).

## Data Model

`WatchProgress` (in `src/hooks/use-watch-progress.ts`) gains one optional field:

```ts
dismissedAt?: number  // Date.now() when dismissed; entry hidden from Continue Watching
```

Backward-compatible: old entries without the field render normally. Watching the content again overwrites the entry (as today) and the new entry has no `dismissedAt` — the item reappears.

## Architecture

### 1. Helper — `src/hooks/use-watch-progress.ts`

```ts
export function dismissWatchProgress(type: string, id: string | number): void
```

- Loads all progress, sets `dismissedAt: Date.now()` on the entry (no-op if missing), saves back. Same try/catch pattern as the existing helpers.

### 2. Hook — `src/hooks/use-continue-watching.ts`

- In the `filter(...)` used for both local and merged paths, add: entries with `dismissedAt` are excluded.
- Local path: `filter(local)` → also excludes dismissed.
- Cloud path: `mergeWatchHistory(local, cloud)` then filter — the merged entry that wins carries `dismissedAt` if the local entry had it and is newer (merge by `updatedAt` already handles this; dismissed entries simply drop out of the filtered result).

### 3. UI — Continue Watching row

- `ContinueWatchingSection` renders through `TrendingSection` with a `progressMap`. The X button needs to live on the Continue Watching cards only (not every TrendingSection row).
- Option A: pass an optional `onDismiss?: (movie) => void` prop to `TrendingSection`, which renders a small X button (top-right, on hover) on each card when provided.
- Option B: render the X inside `ContinueWatchingSection` by wrapping/overlaying the card.

Pick A — one prop on the shared container, no new component, cards stay untouched. `MovieCard` itself is NOT modified (unlike the watchlist button, the dismiss button is specific to this row).

- X button: `aria-label="Remove from Continue Watching"`, `stopPropagation`, positioned top-right of the card on hover (`opacity-0 group-hover:opacity-100`), same visual language as the watchlist + button (`bg-black/60` rounded-full).

### 4. Dismiss flow

```
click X → dismissWatchProgress(type, id) → entry has dismissedAt
       → useContinueWatching filter excludes it → row re-renders without it
```

No query invalidation needed — the hook reads localStorage synchronously each render via the existing `raw` computation; the Zustand-style reactivity comes from React Query keys but the local read is plain — verify during implementation that the row updates without a manual refetch (the existing hook recomputes on every render; dismissing mutates localStorage, and the component re-renders via state change if needed — confirm in practice, add a light `useState` tick in the section if not).

## Error Handling

- Missing entry on dismiss: silent no-op (guard `if (!all[key]) return`).
- localStorage quota/parse failure: existing try/catch patterns already cover.

## Testing

- Extend `scripts/watchlist-store.selfcheck.ts`? No — that covers the watchlist store, not watch progress.
- Add a small self-check `scripts/continue-watching-dismiss.selfcheck.ts` (assert-based, no runner in repo) covering: dismiss sets `dismissedAt`, keeps progress, missing-entry no-op, and that a fresh entry (no dismissedAt) is not filtered.

## Files Touched

| File | Action |
|---|---|
| `src/hooks/use-watch-progress.ts` | add `dismissedAt` field + `dismissWatchProgress()` |
| `src/hooks/use-continue-watching.ts` | filter out dismissed entries |
| `src/pages/home/partials/trending-section.tsx` | optional `onDismiss` prop + X button |
| `src/pages/home/partials/continue-watching-section.tsx` | pass `onDismiss` |
| `scripts/continue-watching-dismiss.selfcheck.ts` | new self-check |

## Open Question (resolve during implementation)

- Row reactivity: whether the section re-renders immediately after dismiss without extra wiring (verify; add a tiny state tick if needed).
