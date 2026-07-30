# Recently Watched (Continue Watching)

**Date:** 2026-07-31
**Status:** Approved design
**Project:** Amov

## Overview

Track user's watch progress and show a "Continue Watching" section on the home page. Progress is always saved to localStorage. Authenticated users can optionally sync their watch history to their Supabase account via a manual "Sync to Cloud" button — no automatic push to avoid exposing history on shared devices.

## Data Model

Extend existing `WatchProgress` with display metadata:

```ts
interface WatchProgress {
  id: string | number
  type: "movie" | "tv" | "anime"
  progress: number        // 0–100
  timestamp: number       // seconds
  duration: number        // seconds
  title: string           // added — for rendering without API call
  posterPath: string | null  // added
  backdropPath: string | null // added
  season?: number
  episode?: number
  updatedAt: number       // Date.now()
}
```

## Storage — localStorage

Always write progress to `localStorage["amov_watch_progress"]` (existing key, extended shape). Same debounce mechanism as current `useWatchProgressTracker`.

## Storage — Supabase

Table `watch_history`:

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, default gen_random_uuid() |
| user_id | uuid | NOT NULL, FK → auth.users |
| content_type | text | NOT NULL |
| content_id | integer | NOT NULL |
| progress | real | NOT NULL default 0 |
| timestamp | integer | NOT NULL default 0 |
| duration | integer | NOT NULL default 0 |
| title | text | NOT NULL |
| poster_path | text | |
| backdrop_path | text | |
| season | integer | |
| episode | integer | |
| updated_at | timestamptz | NOT NULL default now() |

Unique: `(user_id, content_type, content_id)` — upsert on conflict.

RLS: `user_id = auth.uid()` for all operations.

## Sync Flow

- **No auto-sync.** Syncing only happens when user explicitly clicks "Sync to Cloud" button.
- **Where:** Profile dropdown in navbar (shown only when logged in).
- **Merge strategy:** Per `(content_type, content_id)`, pick whichever has the later `updatedAt`.
  - Local-only → insert to Supabase
  - Cloud-only → keep (fetch will merge into local on next home page render)
  - Both → newer `updatedAt` wins
- After sync, set `syncEnabled = true` in Zustand store. While `syncEnabled = true`, every progress write goes to both localStorage + Supabase.
- On sign out → reset `syncEnabled = false`.

## Home Page — "Continue Watching" Section

New hook `useContinueWatching()`:

1. Read all progress from localStorage
2. If `syncEnabled && user` → fetch from Supabase
3. Merge both sources: group by `(type, id)`, take latest `updatedAt`
4. Filter: progress > 0 && progress < 100 (completed items hidden)
5. Sort by `updatedAt` desc
6. Limit to 20 items

Render as a `TrendingSection` with title "Continue Watching", placed **between HeroBanner and TrendingSection** on the home page.

- Empty: section is hidden (no different from other sections)
- Loading: if syncEnabled, show skeleton; if localStorage only, instant render
- Error: silent fallback to localStorage data only

## Player — Metadata Pass-through

Extend `PlayerMessage` to include `title`, `posterPath`, `backdropPath` as optional fields. Pass them from `MovieDetailPage` and the player page.

Backward compatible: old messages without these fields continue working (entries rendered without poster will show a fallback).

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/use-watch-progress.ts` | Extend types, add metadata fields |
| `src/stores/auth-store.ts` | Add `syncEnabled` state |
| `src/api/watch-history.api.ts` | NEW — Supabase CRUD for watch history |
| `src/hooks/use-continue-watching.ts` | NEW — merged local+cloud hook |
| `src/pages/home/index.tsx` | Add Continue Watching section |
| `src/pages/home/partials/continue-watching.tsx` | NEW — render section |
| `src/pages/movie-detail/index.tsx` | Pass metadata to player |
| `src/pages/netflix-player/index.tsx` | Pass metadata in postMessage |
| `src/components/layout/navbar.tsx` | Add "Sync to Cloud" button |
| Supabase dashboard | Create `watch_history` table + RLS |
