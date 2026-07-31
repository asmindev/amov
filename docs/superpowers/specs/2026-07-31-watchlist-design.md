# Watchlist Page — Design Spec

Date: 2026-07-31
Status: Approved
Scope: Watchlist page + add/remove interactions (localStorage only, no cloud sync)

## Summary

Replace the placeholder `src/pages/watchlist/index.tsx` ("Coming soon...") with a real
watchlist page: a grid of saved movies and TV shows, backed by a global Zustand store
persisted to localStorage, with add/remove buttons on MovieCard (everywhere it renders)
and on the MovieDetail page.

## Goals

- Users can save movies/TV to a watchlist and view them in a grid on `/watchlist`.
- Add/remove is instant and reactive everywhere (card hover, detail page, watchlist page).
- Persists across sessions via localStorage (key `amov_watchlist`).

## Non-Goals (YAGNI)

- Supabase cloud sync (add later if Continue Watching sync is actually used).
- Cross-tab sync (`storage` event listener).
- Undo on remove, confirmation dialogs.
- Anime content (only `"movie" | "tv"`).
- Pagination / filters / sort UI (watchlist is small).
- Any new dependencies.

## Data Model

```ts
interface WatchlistEntry {
  id: string | number   // TMDB id
  type: "movie" | "tv"
  addedAt: number       // Date.now()
}

// persisted shape in localStorage
Record<string, WatchlistEntry>  // key: `${type}_${id}`
```

- Key format `"${type}_${id}"` mirrors `getStorageKey()` in `src/hooks/use-watch-progress.ts`.
- Storage key `"amov_watchlist"` mirrors `"amov_watch_progress"`.

## Architecture

### 1. Store — `src/stores/watchlist-store.ts` (new)

Zustand store mirroring `src/stores/auth-store.ts`:

```ts
interface WatchlistState {
  items: Record<string, WatchlistEntry>
  isLoaded: boolean
  add: (entry: WatchlistEntry) => void        // idempotent: same key updates addedAt
  remove: (type: string, id: string | number) => void
  toggle: (type: string, id: string | number) => void
  isInWatchlist: (type: string, id: string | number) => boolean
}
```

- Hydrate from localStorage on first access (lazy init, like `initAuth`).
- Every mutation persists to localStorage immediately (try/catch silent, like `saveAllProgress`).
- `remove()`/`isInWatchlist()` accept `string` type so callers with arbitrary `mediaType` work.

### 2. Hook — `src/hooks/use-watchlist.ts` (new)

```ts
export function useWatchlistItems(): {
  items: Movie[]        // full Movie objects, sorted by addedAt desc
  isLoading: boolean
  remove: (type: string, id: string | number) => void
}
```

- Reads entries from the store, sorts by `addedAt` desc (newest first — differs from Continue
  Watching's `updatedAt` sort).
- Fetches fresh details per entry via `getMediaDetail()` using `useQueries` — same pattern as
  `useContinueWatching()`.
- Entries whose detail fetch fails are skipped from the grid (no crash).

### 3. Page — `src/pages/watchlist/index.tsx` (rewrite)

```
mx-auto max-w-7xl p-6 pt-24
  h1 "Watchlist"
  p "Movies and TV shows you've saved"
  loading → skeleton (reuse TrendingSectionSkeleton or similar)
  empty → EmptyState: message + CTA link to "/" ("Browse Movies")
  else → responsive poster grid:
    grid-cols-2 sm:3 md:4 lg:5 xl:6
    <MovieCard movie progress={undefined} />  (default PopupMode)
```

### 4. Add/Remove UI

**MovieCard** (all render sites, since the store is consumed directly inside the component):
- Bookmark button (+ / ✓) top-right on hover in `ExpandMode` overlay.
- Reads `isInWatchlist()` + calls `toggle()` from the store directly.
- `MovieCardProps` unchanged where possible — the button lives inside `ExpandMode`.
  (`PopupMode` needs a decision during implementation: add a compact button there too, or
  only in `ExpandMode`. Default: both, tiny corner icon.)

**MovieDetail page**:
- Large "Add to Watchlist" / "In Watchlist" toggle button beside the play button.
- Reads/toggles the same store.

## Error Handling

- localStorage quota: silent catch, store still works in-memory.
- Detail fetch failure: skip entry from grid.
- All entries fail → simple error state with retry (match existing patterns).
- Double-click add: idempotent (same key → refresh `addedAt`).

## Testing

- One small test file for `watchlist-store.ts`: toggle add/remove, key format, idempotent add,
  localStorage persistence round-trip.
- Check repo for existing test infra (vitest/bun test) during implementation; if none, use a
  plain assert-based self-check script (no framework), matching repo conventions.

## Files Touched

| File | Action |
|---|---|
| `src/stores/watchlist-store.ts` | new |
| `src/hooks/use-watchlist.ts` | new |
| `src/pages/watchlist/index.tsx` | rewrite |
| `src/components/movie-card/expand-mode.tsx` (+ types) | add bookmark button |
| `src/pages/movie-detail/*` | add toggle button beside play |
| `src/pages/watchlist/` (empty state) | inline |

## Open Questions (resolve during implementation)

- Does MovieDetail page already have a button row where the toggle fits? (Check layout.)
- PopupMode bookmark button: include or not?
