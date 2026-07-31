# Watchlist Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder `/watchlist` page with a real watchlist — a Zustand store persisted to localStorage, a responsive poster grid page, and add/remove buttons on MovieCard and the MovieDetail page.

**Architecture:** Zustand store (`src/stores/watchlist-store.ts`) is the single source of truth, persisted to localStorage key `amov_watchlist` on every mutation. The page reads entries via a `useWatchlistItems()` hook that fetches fresh TMDB details per entry with `useQueries` (same pattern as `useContinueWatching`). MovieCard and MovieDetail consume the store directly, so toggle buttons are reactive everywhere.

**Tech Stack:** React 19, TypeScript, Zustand (already a dependency), TanStack React Query, localStorage, existing `getMediaDetail()` API + `Movie` type, existing `MovieCard` component.

## Global Constraints

- No new dependencies.
- Storage key MUST be `amov_watchlist`; entry key format MUST be `${type}_${id}` (mirror `use-watch-progress.ts` `getStorageKey`).
- Only `"movie" | "tv"` types; no anime.
- No Supabase sync, no cross-tab sync, no undo, no confirmation dialogs.
- localStorage writes wrapped in silent try/catch (pattern: `saveAllProgress`).
- Code conventions per AGENTS.md: kebab-case files, no semicolons, `@/` path alias, React 19.
- `getMediaDetail(mediaType: "movie" | "tv", id: string)` exists in `src/api/movies.api.ts` and returns a `Movie`-shaped object with `title`, `posterPath`, `backdropPath`.

---

### Task 1: Watchlist Store

**Files:**
- Create: `src/stores/watchlist-store.ts`
- Create: `scripts/watchlist-store.selfcheck.ts` (assert-based self-check — repo has NO test runner, run with `bun run scripts/watchlist-store.selfcheck.ts`)

**Interfaces:**
- Consumes: nothing (standalone)
- Produces: `useWatchlistStore` — Zustand store with:
  - state `items: Record<string, WatchlistEntry>`, `isLoaded: boolean`
  - `add(entry: WatchlistEntry): void` — idempotent (same key refreshes `addedAt`), persists
  - `remove(type: string, id: string | number): void` — deletes key, persists
  - `toggle(type: string, id: string | number): void` — add if absent, remove if present
  - `isInWatchlist(type: string, id: string | number): boolean`
  - `WatchlistEntry = { id: string | number; type: "movie" | "tv"; addedAt: number }`
  - `hydrateWatchlist(): void` — lazy init from localStorage (call at module load via `useWatchlistStore.getState()` guard or inside `create` initializer — pick the simpler; `isLoaded` set true after)

- [ ] **Step 1: Write the failing self-check**

```ts
// scripts/watchlist-store.selfcheck.ts
// Run: bun run scripts/watchlist-store.selfcheck.ts
// Assert-based self-check — the repo has no test runner (no vitest/bun:test in package.json).
import assert from "node:assert"
import { useWatchlistStore } from "../src/stores/watchlist-store"

// Fresh state for each check
localStorage.clear()
useWatchlistStore.setState({ items: {}, isLoaded: false })

// 1. add persists entry with composite key
useWatchlistStore.getState().add({ id: 550, type: "movie", addedAt: 1000 })
const stored = JSON.parse(localStorage.getItem("amov_watchlist")!)
assert.deepEqual(stored["movie_550"], { id: 550, type: "movie", addedAt: 1000 })
console.log("ok: add persists entry with composite key")

// 2. add is idempotent — same key refreshes addedAt
useWatchlistStore.getState().add({ id: 550, type: "movie", addedAt: 2000 })
assert.equal(useWatchlistStore.getState().items["movie_550"].addedAt, 2000)
assert.equal(Object.keys(useWatchlistStore.getState().items).length, 1)
console.log("ok: add is idempotent")

// 3. toggle adds then removes
useWatchlistStore.getState().toggle("movie", 550)
assert.equal(useWatchlistStore.getState().isInWatchlist("movie", 550), true)
useWatchlistStore.getState().toggle("movie", 550)
assert.equal(useWatchlistStore.getState().isInWatchlist("movie", 550), false)
console.log("ok: toggle adds then removes")

// 4. remove deletes from localStorage
useWatchlistStore.getState().add({ id: 550, type: "movie", addedAt: 1000 })
useWatchlistStore.getState().remove("movie", 550)
assert.deepEqual(JSON.parse(localStorage.getItem("amov_watchlist")!), {})
console.log("ok: remove deletes from localStorage")

console.log("\nAll watchlist store checks passed ✓")
```

- [ ] **Step 2: Run self-check to verify it fails**

Run: `bun run scripts/watchlist-store.selfcheck.ts`
Expected: FAIL — module not found (store file missing yet).

- [ ] **Step 3: Write minimal implementation**

```ts
// src/stores/watchlist-store.ts
import { create } from "zustand"

const STORAGE_KEY = "amov_watchlist"

export interface WatchlistEntry {
  id: string | number
  type: "movie" | "tv"
  addedAt: number
}

function getKey(type: string, id: string | number): string {
  return `${type}_${id}`
}

function loadAll(): Record<string, WatchlistEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, WatchlistEntry>) : {}
  } catch {
    return {}
  }
}

function saveAll(items: Record<string, WatchlistEntry>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

interface WatchlistState {
  items: Record<string, WatchlistEntry>
  isLoaded: boolean
  add: (entry: WatchlistEntry) => void
  remove: (type: string, id: string | number) => void
  toggle: (type: string, id: string | number) => void
  isInWatchlist: (type: string, id: string | number) => boolean
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  items: loadAll(),
  isLoaded: true,
  add: (entry) => {
    const key = getKey(entry.type, entry.id)
    const items = { ...get().items, [key]: entry }
    set({ items })
    saveAll(items)
  },
  remove: (type, id) => {
    const key = getKey(type, id)
    const items = { ...get().items }
    delete items[key]
    set({ items })
    saveAll(items)
  },
  toggle: (type, id) => {
    const key = getKey(type, id)
    if (get().items[key]) {
      get().remove(type, id)
    } else {
      get().add({ id, type, addedAt: Date.now() })
    }
  },
  isInWatchlist: (type, id) => get().items[getKey(type, id)] !== undefined,
}))
```

- [ ] **Step 4: Run self-check to verify it passes**

Run: `bun run scripts/watchlist-store.selfcheck.ts`
Expected: PASS — 4 checks, "All watchlist store checks passed ✓".

- [ ] **Step 5: Run the repo typecheck**

Run: `bun run typecheck` (this is `tsc -b` — no `--noEmit` flag in this repo)
Expected: no new type errors.

- [ ] **Step 6: Commit**

```bash
git add src/stores/watchlist-store.ts scripts/watchlist-store.selfcheck.ts
git commit -m "feat: watchlist Zustand store with localStorage persistence"
```

---

### Task 2: useWatchlistItems Hook

**Files:**
- Create: `src/hooks/use-watchlist.ts`

**Interfaces:**
- Consumes:
  - `useWatchlistStore` from Task 1 (`items`, `remove`, `isLoaded`)
  - `getMediaDetail(mediaType: "movie" | "tv", id: string)` from `@/api/movies.api`
  - `Movie` type from `@/types/movie.types`
- Produces:
  - `useWatchlistItems(): { items: Movie[]; isLoading: boolean; remove: (type: string, id: string | number) => void; isEmpty: boolean }`
  - items sorted by `addedAt` desc; entries whose detail fetch fails are skipped

- [ ] **Step 1: Write minimal implementation**

```ts
// src/hooks/use-watchlist.ts
import { useQueries } from "@tanstack/react-query"
import { useWatchlistStore } from "@/stores/watchlist-store"
import { getMediaDetail } from "@/api/movies.api"
import type { Movie } from "@/types/movie.types"

export function useWatchlistItems() {
  const entries = useWatchlistStore((s) => s.items)
  const remove = useWatchlistStore((s) => s.remove)

  const sorted = Object.values(entries).sort((a, b) => b.addedAt - a.addedAt)

  const details = useQueries({
    queries: sorted.map((e) => ({
      queryKey: ["movie-detail", e.type, e.id],
      queryFn: () => getMediaDetail(e.type, String(e.id)),
      staleTime: 300_000,
    })),
  })

  const items: Movie[] = []
  sorted.forEach((e, i) => {
    const detail = details[i]?.data
    if (detail) items.push(detail)
    // fetch failures are skipped — entry stays in localStorage, reappears next visit
  })

  return {
    items,
    isLoading: details.some((q) => q.isLoading),
    remove,
    isEmpty: items.length === 0 && !details.some((q) => q.isLoading),
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: no new type errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-watchlist.ts
git commit -m "feat: useWatchlistItems hook with per-entry TMDB detail fetch"
```

---

### Task 3: Watchlist Page

**Files:**
- Rewrite: `src/pages/watchlist/index.tsx`

**Interfaces:**
- Consumes:
  - `useWatchlistItems()` from Task 2
  - `MovieCard` from `@/components/movie-card`
  - `Link` from `@tanstack/react-router`
  - Skeleton pattern: `TrendingSectionSkeleton` from `@/pages/home/partials/skeletons` (or inline simple grid skeleton if that export doesn't fit)
- Produces: the rendered `/watchlist` page

- [ ] **Step 1: Rewrite the page**

```tsx
// src/pages/watchlist/index.tsx
import { Link } from "@tanstack/react-router"
import { MovieCard } from "@/components/movie-card"
import { useWatchlistItems } from "@/hooks/use-watchlist"

export default function WatchlistPage() {
  const { items, isLoading, isEmpty, remove } = useWatchlistItems()

  return (
    <div className="mx-auto max-w-7xl p-6 pt-24">
      <h1 className="font-heading text-2xl font-semibold">Watchlist</h1>
      <p className="mt-2 text-muted-foreground">Movies and TV shows you've saved</p>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="mt-24 flex flex-col items-center gap-4 text-center">
          <p className="text-lg text-white">Your watchlist is empty</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Save movies and TV shows you want to watch later — they'll show up here.
          </p>
          <Link
            to="/"
            className="mt-2 rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-black transition-opacity hover:opacity-80"
          >
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify `MovieCard` accepts `Movie` and renders without `progress` prop**

Check `src/components/movie-card/types.ts`: `MovieCardProps.movie: Movie`, all other props optional. Confirm `TrendingSection` usage as reference. If `Movie` lacks a field MovieCard requires, the build error will surface here — resolve by passing what MovieCard needs.

- [ ] **Step 3: Typecheck + build**

Run: `bun run typecheck && bun run build`
Expected: clean. (Build may fail on pre-existing unrelated issues — the 6c3dde3 commit fixed 4 TS errors; verify none are new.)

- [ ] **Step 4: Commit**

```bash
git add src/pages/watchlist/index.tsx
git commit -m "feat: watchlist page with responsive poster grid and empty state"
```

---

### Task 4: MovieCard Bookmark Button

**Files:**
- Modify: `src/components/movie-card/expand-mode.tsx`
- Modify: `src/components/movie-card/popup-mode.tsx`
- Modify: `src/components/movie-card/types.ts` (if a class override is needed)

**Interfaces:**
- Consumes: `useWatchlistStore` from Task 1 (`isInWatchlist`, `toggle`)
- Produces: a bookmark button in both modes:
  - Rendered top-right of the card, visible on hover (or always visible on the poster overlay)
  - Icon: `Bookmark` (lucide-react) when not saved, `Bookmark` filled (or `Check`) when saved
  - `aria-label`: "Add to watchlist" / "Remove from watchlist"
  - `onClick` calls `toggle(type, id)` and stops propagation (no card click-through)
  - `type` from `movie.mediaType` — if it is not `"movie" | "tv"`, default to `"movie"` (spec: only movie/tv)

- [ ] **Step 1: Inspect both modes' JSX to find the overlay container**

Read `src/components/movie-card/expand-mode.tsx` and `popup-mode.tsx`. Identify the element that wraps the poster (the hover overlay anchor). The button should be absolutely positioned top-right of that container.

- [ ] **Step 2: Add the bookmark button to `ExpandMode`**

In the overlay wrapper (the element that receives `handleMouseEnter`/`handleMouseLeave`), add:

```tsx
<button
  type="button"
  aria-label={inList ? "Remove from watchlist" : "Add to watchlist"}
  onClick={(e) => {
    e.stopPropagation()
    toggle(movie.mediaType === "tv" ? "tv" : "movie", movie.id)
  }}
  className="absolute right-2 top-2 z-20 rounded-full bg-black/60 p-2 text-white backdrop-blur transition-opacity hover:bg-black/80"
>
  {inList ? <Bookmark className="h-4 w-4 fill-current" /> : <Bookmark className="h-4 w-4" />}
</button>
```

with `const inList = useWatchlistStore((s) => s.isInWatchlist(movie.mediaType === "tv" ? "tv" : "movie", movie.id))` and `const toggle = useWatchlistStore((s) => s.toggle)` at the top of the component, plus `import { Bookmark } from "lucide-react"`.

- [ ] **Step 3: Add the same button to `PopupMode`**

Same pattern; place inside the popup overlay so it does not overlap the metadata row.

- [ ] **Step 4: Typecheck + build**

Run: `bun run typecheck && bun run build`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/components/movie-card/expand-mode.tsx src/components/movie-card/popup-mode.tsx
git commit -m "feat: bookmark toggle button on MovieCard (expand + popup modes)"
```

---

### Task 5: MovieDetail Toggle Button

**Files:**
- Modify: `src/pages/movie-detail/index.tsx` (or wherever the play button row lives — locate during step 1)

**Interfaces:**
- Consumes: `useWatchlistStore` from Task 1 (`isInWatchlist`, `toggle`)
- Produces: a labeled toggle button beside the play button:
  - When not saved: outline/secondary style, icon `Plus`, label "Add to Watchlist"
  - When saved: filled/primary style, icon `Check`, label "In Watchlist"
  - `aria-pressed={inList}`
  - `onClick` toggles with `mediaType === "tv" ? "tv" : "movie"` and the detail page's content id

- [ ] **Step 1: Locate the button row**

Read `src/pages/movie-detail/index.tsx` (and its partials, e.g. `hero`/`details-section.tsx`) to find where the play/watch buttons are rendered. Confirm how `mediaType` and `id` are available there (from the detail query or route params).

- [ ] **Step 2: Add the toggle button**

Insert next to the existing play button, matching the existing button classes (secondary/outline style). Copy the button styling of the existing "Play" button and invert it (outline instead of filled, or `bg-white/10`).

```tsx
<button
  type="button"
  aria-pressed={inList}
  onClick={() => toggle(mediaType === "tv" ? "tv" : "movie", id)}
  className="[match existing button classes, outline variant]"
>
  {inList ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
  {inList ? "In Watchlist" : "Add to Watchlist"}
</button>
```

- [ ] **Step 3: Typecheck + build**

Run: `bun run typecheck && bun run build`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/pages/movie-detail/
git commit -m "feat: add-to-watchlist toggle on movie detail page"
```

---

### Task 6: Manual Smoke Test + Final Verification

**Files:** none (verification only)

- [ ] **Step 1: Run the store self-check**

Run: `bun run scripts/watchlist-store.selfcheck.ts`
Expected: 4 checks PASS, "All watchlist store checks passed ✓".

- [ ] **Step 2: Full typecheck + build**

Run: `bun run typecheck && bun run build`
Expected: clean, no new errors.

- [ ] **Step 3: Manual smoke test (dev server)**

Run: `bun run dev`, open the app:
1. Home page → hover any MovieCard → bookmark appears → click → icon fills.
2. Navigate to `/watchlist` → the movie is in the grid.
3. MovieDetail page → "Add to Watchlist" button toggles state.
4. Refresh `/watchlist` → item persists (localStorage).
5. Remove from watchlist (click bookmark in watchlist grid or card) → item disappears.
6. Empty watchlist → empty state + "Browse Movies" CTA navigates to `/`.

Expected: all flows work.

- [ ] **Step 4: Verify no git leftovers**

Run: `git status`
Expected: only intended changes; no `graphify-out/` or spec/plan files accidentally staged.

- [ ] **Step 5: Final commit if any verification fixes were made**

```bash
git add -A
git commit -m "fix: watchlist verification fixes"
```
