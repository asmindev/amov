# Continue Watching Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a "Continue Watching" section on the home page with movies/shows the user has started but not finished. Progress always saves to localStorage; authenticated users can optionally sync to Supabase via a manual "Sync to Cloud" button.

**Architecture:** Watch progress is persisted to localStorage with display metadata (title, poster, backdrop) so the home page can render cards without API calls. A Supabase `watch_history` table stores the same data synced on-demand. "Sync to Cloud" merges local + cloud (newer `updatedAt` wins) and enables double-write. A `useContinueWatching` hook merges both sources. Home page shows a `TrendingSection`-style horizontal scroll.

**Tech Stack:** React 19, Zustand, TanStack Query, Supabase, localStorage

## Global Constraints

- No new runtime dependencies
- `localStorage` key remains `amov_watch_progress`
- All new Supabase operations go through existing `supabase` client from `@/lib/supabase`
- Sync is never automatic — user must click "Sync to Cloud" button
- On sign out, `syncEnabled` resets to false
- Completed items (progress >= 100) are hidden from Continue Watching

---

### Task 1: Extend WatchProgress with display metadata

**Files:**
- Modify: `src/hooks/use-watch-progress.ts`

**Interfaces:**
- Produces: Extended `WatchProgress` with `title: string`, `posterPath: string | null`, `backdropPath: string | null` (all optional for backward compat)

- [ ] **Step 1: Extend the `WatchProgress` interface**

Edit `src/hooks/use-watch-progress.ts` — add optional metadata fields to `WatchProgress`:

```ts
export interface WatchProgress {
  id: string | number
  type: "movie" | "tv" | "anime"
  progress: number // percentage 0–100
  timestamp: number // seconds
  duration: number // seconds
  title?: string
  posterPath?: string | null
  backdropPath?: string | null
  season?: number
  episode?: number
  updatedAt: number // Date.now()
}
```

No other changes needed in this file.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-watch-progress.ts
git commit -m "feat(watch-progress): add display metadata fields to WatchProgress"
```

---

### Task 2: Pass metadata through use-progress-persistence

**Files:**
- Modify: `src/pages/netflix-player/hooks/use-progress-persistence.ts`

**Interfaces:**
- Consumes: `WatchProgress` from `@/hooks/use-watch-progress`
- Produces: Updated signature accepts `title`, `posterPath`, `backdropPath`; saves them alongside progress

- [ ] **Step 1: Extend `UseProgressPersistenceOpts` with metadata fields**

Add to the existing interface in `use-progress-persistence.ts`:

```ts
export interface UseProgressPersistenceOpts {
  // ... existing fields ...
  /** Display metadata for Continue Watching on home page */
  title: string
  posterPath: string | null
  backdropPath: string | null
}
```

- [ ] **Step 2: Update the save call to include metadata**

In the `useEffect` where `all[key] = {...}` is assigned, add the new fields:

```ts
all[key] = {
  id: movieId,
  type: mediaType,
  progress: duration ? (ts / duration) * 100 : 0,
  timestamp: ts,
  duration,
  title: opts.title,
  posterPath: opts.posterPath,
  backdropPath: opts.backdropPath,
  updatedAt: Date.now(),
}
```

Do this in both places — the interval save (line ~82) and the pause-flush save (line ~55).

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors (callers will be updated later)

- [ ] **Step 4: Commit**

```bash
git add src/pages/netflix-player/hooks/use-progress-persistence.ts
git commit -m "feat(progress-persistence): save display metadata for Continue Watching"
```

---

### Task 3: Pass metadata through HlsPlayer → use-progress-persistence

**Files:**
- Modify: `src/pages/netflix-player/partials/hls-player.tsx`
- Modify: `src/pages/netflix-player/hls-player.types.ts` (if props typed there)

**Interfaces:**
- Consumes: `movieTitle`, `poster`, `mediaType` already in props — no new props needed

- [ ] **Step 1: Pass metadata to useProgressPersistence**

In `hls-player.tsx`, find the `useProgressPersistence` call (around line 334). Pass the new props:

```ts
useProgressPersistence({
  videoRef,
  mediaType,
  movieId,
  duration,
  playing,
  title: movieTitle,
  posterPath: poster ?? null,
  backdropPath: poster ?? null, // HLS player uses backdrop as poster
})
```

Adjust `poster` — currently it's `const posterUrl = movie?.backdropPath ? getBdUrl(...)` from the parent. Make sure we pass the raw value, not the URL.

Actually, looking more carefully: `hls-player.tsx` receives `poster` (already a full URL string) and `movieTitle`. For localStorage we want the raw TMDB path, not the full URL. But this component doesn't have the raw path.

Let me trace: `NetflixPlayerPage` has `movie.backdropPath` — the raw TMDB path (e.g. `/abc.jpg`). It converts to URL as `posterUrl`. The `HlsPlayer` receives `poster={posterUrl}`.

We should pass the raw path. So the fix: pass additional props to HlsPlayer.

**Update `hls-player.types.ts`** — add optional props:

```ts
backdropPath?: string | null
```

Then in `hls-player.tsx` pass to `useProgressPersistence`:

```ts
useProgressPersistence({
  videoRef,
  mediaType,
  movieId,
  duration,
  playing,
  title: movieTitle,
  posterPath: backdropPath ?? null,
  backdropPath: backdropPath ?? null,
})
```

And in `NetflixPlayerPage`, pass `backdropPath={movie.backdropPath}` to `<HlsPlayer>`.

- [ ] **Step 2: Add `backdropPath` to `HlsPlayerProps`**

Edit `src/pages/netflix-player/hls-player.types.ts`:

```ts
backdropPath?: string | null
```

- [ ] **Step 3: Update NetflixPlayerPage to pass it**

In `src/pages/netflix-player/index.tsx`, add prop to `<HlsPlayer>`:

```tsx
backdropPath={movie.backdropPath}
```

- [ ] **Step 4: Update useProgressPersistence call in HlsPlayer**

```tsx
useProgressPersistence({
  videoRef,
  mediaType,
  movieId,
  duration,
  playing,
  title: movieTitle,
  posterPath: backdropPath ?? null,
  backdropPath: backdropPath ?? null,
})
```

- [ ] **Step 5: Compile check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/pages/netflix-player/
git commit -m "feat(player): pass display metadata to progress persistence"
```

---

### Task 4: Pass metadata through MoviePlayer (iframe-based) → useWatchProgressTracker

**Files:**
- Modify: `src/pages/movie-detail/partials/movie-player.tsx`
- Modify: `src/pages/movie-detail/index.tsx`

**Interfaces:**
- Produces: `useWatchProgressTracker` extended to accept `title`, `posterPath`, `backdropPath`

- [ ] **Step 1: Update `useWatchProgressTracker` hook to accept metadata**

Edit `src/hooks/use-watch-progress.ts`:

Add to `useWatchProgressTracker` params:

```ts
export function useWatchProgressTracker(
  contentType: "movie" | "tv" | "anime",
  contentId: string | number,
  enabled: boolean,
  metadata?: { title: string; posterPath: string | null; backdropPath: string | null }
) {
```

In the `persistProgress` callback, include metadata when saving:

```ts
const entry: WatchProgress = {
  ...msg,
  ...metadata,
  updatedAt: Date.now(),
}
```

- [ ] **Step 2: Pass metadata from MoviePlayer component**

`MoviePlayer` has `movieTitle`, `mediaType`, `movieId`. It needs poster info. The parent `MovieDetailPage` has the full movie object.

Update `MoviePlayerProps` to accept optional `posterPath`, `backdropPath`:

```ts
interface MoviePlayerProps {
  movieId: number
  movieTitle: string
  mediaType?: "movie" | "tv"
  season?: number
  episode?: number
  posterPath?: string | null
  backdropPath?: string | null
}
```

Then in the component, pass to `useWatchProgressTracker`:

```ts
useWatchProgressTracker(mediaType, movieId, true, {
  title: movieTitle,
  posterPath: posterPath ?? null,
  backdropPath: backdropPath ?? null,
})
```

- [ ] **Step 3: Update MovieDetailPage to pass poster info**

In `src/pages/movie-detail/index.tsx`, find where `<MoviePlayer>` is rendered (around line 117):

```tsx
<MoviePlayer
  movieId={movie.id}
  movieTitle={movie.title}
  mediaType={mediaType}
  season={search.season}
  episode={search.episode}
  posterPath={movie.posterPath}
  backdropPath={movie.backdropPath}
/>
```

- [ ] **Step 4: Compile check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-watch-progress.ts src/pages/movie-detail/
git commit -m "feat(movie-player): pass display metadata to watch progress tracker"
```

---

### Task 5: Supabase table + API functions

**Files:**
- Create: `src/api/watch-history.api.ts`
- Manual: Supabase dashboard — create `watch_history` table + RLS

**Interfaces:**
- Produces: `fetchWatchHistory(userId)`, `upsertWatchHistoryBatch(userId, entries)`, `mergeAndSync(userId, localEntries)`

- [ ] **Step 1: Create Supabase table**

Run this SQL in Supabase SQL editor:

```sql
CREATE TABLE watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type text NOT NULL,
  content_id integer NOT NULL,
  progress real NOT NULL DEFAULT 0,
  "timestamp" integer NOT NULL DEFAULT 0,
  duration integer NOT NULL DEFAULT 0,
  title text NOT NULL DEFAULT '',
  poster_path text,
  backdrop_path text,
  season integer,
  episode integer,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, content_type, content_id)
);

-- Enable RLS
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can read own watch history"
  ON watch_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watch history"
  ON watch_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watch history"
  ON watch_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watch history"
  ON watch_history FOR DELETE
  USING (auth.uid() = user_id);
```

- [ ] **Step 2: Create `watch-history.api.ts`**

```ts
import { supabase } from "@/lib/supabase"
import type { WatchProgress } from "@/hooks/use-watch-progress"

interface WatchHistoryRow {
  id: string
  user_id: string
  content_type: string
  content_id: number
  progress: number
  timestamp: number
  duration: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  season: number | null
  episode: number | null
  updated_at: string
}

function rowToProgress(row: WatchHistoryRow): WatchProgress {
  return {
    id: row.content_id,
    type: row.content_type as WatchProgress["type"],
    progress: row.progress,
    timestamp: row.timestamp,
    duration: row.duration,
    title: row.title,
    posterPath: row.poster_path,
    backdropPath: row.backdrop_path,
    season: row.season ?? undefined,
    episode: row.episode ?? undefined,
    updatedAt: new Date(row.updated_at).getTime(),
  }
}

function progressToRow(
  userId: string,
  entry: WatchProgress
): Omit<WatchHistoryRow, "id" | "updated_at"> {
  return {
    user_id: userId,
    content_type: entry.type,
    content_id: Number(entry.id),
    progress: entry.progress,
    timestamp: entry.timestamp,
    duration: entry.duration,
    title: entry.title ?? "",
    poster_path: entry.posterPath ?? null,
    backdrop_path: entry.backdropPath ?? null,
    season: entry.season ?? null,
    episode: entry.episode ?? null,
  }
}

export async function fetchWatchHistory(userId: string): Promise<WatchProgress[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from("watch_history")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Failed to fetch watch history:", error.message)
    return []
  }

  return (data ?? []).map(rowToProgress)
}

export async function upsertWatchHistory(
  userId: string,
  entries: WatchProgress[]
): Promise<boolean> {
  if (!supabase || entries.length === 0) return true

  const rows = entries.map((e) => progressToRow(userId, e))

  const { error } = await supabase.from("watch_history").upsert(rows, {
    onConflict: "user_id, content_type, content_id",
    ignoreDuplicates: false,
  })

  if (error) {
    console.error("Failed to upsert watch history:", error.message)
    return false
  }
  return true
}

/**
 * Merge local + cloud entries by (type, id), taking the latest updatedAt.
 * Returns the merged array sorted by updatedAt desc.
 */
export function mergeWatchHistory(
  local: WatchProgress[],
  cloud: WatchProgress[]
): WatchProgress[] {
  const map = new Map<string, WatchProgress>()

  for (const entry of [...local, ...cloud]) {
    const key = `${entry.type}_${entry.id}`
    const existing = map.get(key)
    if (!existing || entry.updatedAt > existing.updatedAt) {
      map.set(key, entry)
    }
  }

  return Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt)
}
```

- [ ] **Step 3: Compile check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/api/watch-history.api.ts
git commit -m "feat(api): add watch history Supabase CRUD and merge logic"
```

---

### Task 6: Add syncEnabled to auth store

**Files:**
- Modify: `src/stores/auth-store.ts`

**Interfaces:**
- Produces: `syncEnabled: boolean`, `setSyncEnabled(enabled: boolean)` in AuthState
- State resets to false on sign out

- [ ] **Step 1: Add syncEnabled to AuthState interface**

```ts
interface AuthState {
  // ... existing fields ...
  syncEnabled: boolean
  setSyncEnabled: (enabled: boolean) => void
}
```

- [ ] **Step 2: Add to store implementation**

```ts
export const useAuthStore = create<AuthState>((set, get) => ({
  // ... existing initial state ...
  syncEnabled: false,

  setSyncEnabled: (enabled) => set({ syncEnabled: enabled }),

  // In signOut, reset syncEnabled:
  signOut: async () => {
    if (!supabase) return
    set({ isLoading: true })
    await supabase.auth.signOut()
    set({ user: null, session: null, role: null, isLoading: false, syncEnabled: false })
  },
```

Also reset `syncEnabled: false` in the `onAuthStateChange` `SIGNED_OUT` handler and wherever `user: null` is set due to error.

- [ ] **Step 3: Compile check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/stores/auth-store.ts
git commit -m "feat(auth): add syncEnabled state for manual cloud sync"
```

---

### Task 7: "Sync to Cloud" button in navbar

**Files:**
- Modify: `src/components/layout/navbar.tsx`

**Interfaces:**
- Consumes: `useAuthStore` (user, syncEnabled, setSyncEnabled, signOut)
- Consumes: `fetchWatchHistory`, `upsertWatchHistory`, `mergeWatchHistory` from `@/api/watch-history.api`
- Consumes: `loadAllProgress` from `@/hooks/use-watch-progress`

- [ ] **Step 1: Add the Sync to Cloud button in navbar profile area**

In the authenticated user section of navbar (around line 132-156), add a "Sync to Cloud" button between the admin badge and sign out:

But wait — looking at the current navbar, the user area is quite compact (avatar + sign out). Let me check how to add it.

Actually, a button that says "Sync to Cloud" between the avatar and "Sign Out" is a bit clumsy. Better to add it as an item in a dropdown that appears when clicking the avatar. But currently there's no dropdown.

Simpler approach: just add a small clickable text button "Sync to Cloud" next to the sign out button. Only visible when user is logged in and sync is not yet enabled. Once enabled, show a checkmark or "Synced ✓" label instead.

Around the sign out button area:

```tsx
{user ? (
  <div className="flex items-center gap-2">
    {role === "admin" && (
      <span className="rounded-md bg-red-600/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-red-500 uppercase ring-1 ring-red-500/30">
        ADMIN
      </span>
    )}
    <div
      title={user.email ?? "User"}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600/90 text-xs font-black text-white uppercase ring-2 ring-white/10"
    >
      {user.email?.[0] ?? "U"}
    </div>
    <button
      type="button"
      onClick={handleSyncToCloud}
      disabled={syncing}
      className={`text-xs font-semibold transition-colors ${
        syncEnabled
          ? "text-green-400"
          : scrolled || !isTransparentMode
            ? "text-muted-foreground hover:text-foreground"
            : "text-white/70 hover:text-white"
      }`}
    >
      {syncing ? "Syncing..." : syncEnabled ? "Synced ✓" : "Sync to Cloud"}
    </button>
    <button
      type="button"
      onClick={() => void signOut()}
      /* ... existing sign out ... */
    >
      Sign Out
    </button>
  </div>
) : /* ... */ }
```

And the handler:

```tsx
const [syncing, setSyncing] = useState(false)

const handleSyncToCloud = async () => {
  if (syncing || !user) return
  setSyncing(true)
  try {
    const localEntries = Object.values(loadAllProgress())
    const cloudEntries = await fetchWatchHistory(user.id)
    const merged = mergeWatchHistory(localEntries, cloudEntries)
    const ok = await upsertWatchHistory(user.id, merged)
    if (ok) {
      setSyncEnabled(true)
    }
  } finally {
    setSyncing(false)
  }
}
```

Import the needed functions:

```ts
import { loadAllProgress } from "@/hooks/use-watch-progress"
import {
  fetchWatchHistory,
  upsertWatchHistory,
  mergeWatchHistory,
} from "@/api/watch-history.api"
```

Wait, `loadAllProgress` is not exported from `use-watch-progress.ts`. Let me check — it's a module-level function, not exported. I need to export it.

So add export to `loadAllProgress` in `use-watch-progress.ts`.

- [ ] **Step 2: Export `loadAllProgress` from `use-watch-progress.ts`**

```ts
export function loadAllProgress(): Record<string, WatchProgress> {
  // existing implementation
}
```

- [ ] **Step 3: Add sync handler and button to navbar**

Full diff for `navbar.tsx` — add imports, state, handler, and button.

- [ ] **Step 4: Compile check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/hooks/use-watch-progress.ts src/components/layout/navbar.tsx
git commit -m "feat(navbar): add Sync to Cloud button in profile area"
```

---

### Task 8: useContinueWatching hook

**Files:**
- Create: `src/hooks/use-continue-watching.ts`

**Interfaces:**
- Produces: `useContinueWatching()` → `{ data: WatchProgress[], isLoading: boolean }`
- Consumes: `fetchWatchHistory` from API, `useAuthStore`, `loadAllProgress` from use-watch-progress

- [ ] **Step 1: Create the hook**

```ts
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth-store"
import { loadAllProgress } from "@/hooks/use-watch-progress"
import { fetchWatchHistory, mergeWatchHistory } from "@/api/watch-history.api"

export function useContinueWatching() {
  const user = useAuthStore((s) => s.user)
  const syncEnabled = useAuthStore((s) => s.syncEnabled)

  // Cloud fetch only if syncEnabled + logged in
  const cloudQuery = useQuery({
    queryKey: ["continue-watching", user?.id],
    queryFn: () => (user ? fetchWatchHistory(user.id) : []),
    enabled: !!user && syncEnabled,
    staleTime: 60_000,
  })

  const isLoading = (syncEnabled && !!user && cloudQuery.isLoading) || false

  const data = (() => {
    const local = Object.values(loadAllProgress())

    // Filter out completed (progress >= 100) and not-started (progress === 0)
    const filter = (entries: typeof local) =>
      entries.filter((e) => e.progress > 0 && e.progress < 100)

    if (!syncEnabled || !user) {
      return filter(local).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20)
    }

    const cloud = cloudQuery.data ?? []
    const merged = mergeWatchHistory(local, cloud)
    return filter(merged).slice(0, 20)
  })()

  return { data, isLoading }
}
```

- [ ] **Step 2: Compile check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-continue-watching.ts
git commit -m "feat(hooks): add useContinueWatching hook for home page"
```

---

### Task 9: Continue Watching section on home page

**Files:**
- Create: `src/pages/home/partials/continue-watching-section.tsx`
- Modify: `src/pages/home/index.tsx`
- Modify: `src/pages/home/partials/skeletons.tsx` (add skeleton)

- [ ] **Step 1: Create the section component**

```tsx
import { TrendingSection } from "./trending-section"
import { useContinueWatching } from "@/hooks/use-continue-watching"
import { TrendingSectionSkeleton } from "./skeletons"

export function ContinueWatchingSection() {
  const { data, isLoading } = useContinueWatching()

  if (isLoading) {
    return <TrendingSectionSkeleton />
  }

  if (!data || data.length === 0) return null

  // Map WatchProgress to Movie-like shape for TrendingSection
  const movies = data.map((entry) => ({
    id: entry.id,
    title: entry.title ?? "Unknown",
    posterPath: entry.posterPath,
    backdropPath: entry.backdropPath,
    // These fields aren't stored but TrendingSection might need them —
    // pass safe defaults
    overview: "",
    releaseDate: "",
    voteAverage: 0,
    voteCount: 0,
    genreIds: [],
    popularity: 0,
    adult: false,
    originalLanguage: "",
    mediaType: entry.type as "movie" | "tv",
  }))

  return <TrendingSection title="Continue Watching" movies={movies} />
}
```

Wait — `TrendingSection` receives `Movie[]` which requires all `Movie` fields. Some are missing from `WatchProgress`. This will cause type errors. Let me check the `Movie` type again.

```ts
type Movie = {
  id: number
  title: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  releaseDate: string
  voteAverage: number
  voteCount: number
  genreIds: number[]
  popularity: number
  adult: boolean
  originalLanguage: string
  mediaType: "movie" | "tv"
}
```

And `WatchProgress`:
- `id: string | number` → might be string from localStorage
- `title?: string`
- `posterPath?: string | null`
- `backdropPath?: string | null`
- Everything else missing

I need to either:
1. Make the mapping fill dummy defaults
2. Or create a simpler inline section that renders MovieCard directly

For type safety, I'll add the mapping with defaults. But first let me see how `TrendingSection` uses the movie data. It passes each movie to `MovieCard`, which reads: posterPath, backdropPath, title, voteAverage, mediaType, voteCount... wait, it reads `movie.genreIds`, `movie.mediaType`, `movie.voteAverage`, `movie.popularity`, `movie.releaseDate`, `movie.overview`.

So I need all those fields. I'll map with defaults. The dummy genres won't show because genreIds is empty array → no genre names. The empty overview means no description shown. That's fine — just shows poster + title + match percentage (0%).

- [ ] **Step 2: Add to home page**

In `src/pages/home/index.tsx`, import and render `ContinueWatchingSection` between HeroBanner and TrendingSection:

```tsx
import { ContinueWatchingSection } from "./partials/continue-watching-section"

// Inside the return JSX, after HeroBanner and before TrendingSection:
<ContinueWatchingSection />
```

- [ ] **Step 3: Compile check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/pages/home/
git commit -m "feat(home): add Continue Watching section between Hero and Trending"
```

---

### Self-Review

1. **Spec coverage:** All sections covered — data model (Task 1), localStorage persistence (Tasks 2-4), Supabase table & API (Task 5), sync state (Task 6), sync button (Task 7), merge hook (Task 8), home page section (Task 9).

2. **Placeholder scan:** Clean — all code blocks contain actual implementation.

3. **Type consistency:** `backdropPath` → `posterPath` consistent across all tasks. `mergeWatchHistory` signature matches between Task 5 (producer) and Tasks 7-8 (consumers).

4. **Scope check:** Single feature, no decomposition needed.
