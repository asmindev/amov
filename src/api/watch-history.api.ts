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
