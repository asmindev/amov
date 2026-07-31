import { useQuery, useQueries } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth-store"
import { loadAllProgress, type WatchProgress } from "@/hooks/use-watch-progress"
import { fetchWatchHistory, mergeWatchHistory } from "@/api/watch-history.api"
import { getMediaDetail } from "@/api/movies.api"

export interface ContinueWatchingItem {
  id: string | number
  type: "movie" | "tv"
  progress: number
  timestamp: number
  duration: number
  title: string
  posterPath: string | null
  backdropPath: string | null
  season?: number
  episode?: number
  updatedAt: number
}

export function useContinueWatching(): {
  data: ContinueWatchingItem[]
  isLoading: boolean
} {
  const user = useAuthStore((s) => s.user)
  const syncEnabled = useAuthStore((s) => s.syncEnabled)

  const cloudQuery = useQuery({
    queryKey: ["continue-watching", user?.id],
    queryFn: () => (user ? fetchWatchHistory(user.id) : []),
    enabled: !!user && syncEnabled,
    staleTime: 60_000,
  })

  const isLoading = (syncEnabled && !!user && cloudQuery.isLoading) || false

  const raw = (() => {
    const local = Object.values(loadAllProgress())

    const filter = (entries: WatchProgress[]) =>
      entries.filter(
        (e) => e.progress > 0 && e.progress < 100 && !e.dismissedAt
      )

    if (!syncEnabled || !user) {
      return filter(local).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20)
    }

    const cloud = cloudQuery.data ?? []
    const merged = mergeWatchHistory(local, cloud)
    return filter(merged).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20)
  })()

  // Always fetch fresh details from TMDB for every entry
  const details = useQueries({
    queries: raw.map((e) => ({
      queryKey: ["movie-detail", e.type, e.id],
      queryFn: () =>
        getMediaDetail(e.type === "tv" ? "tv" : "movie", String(e.id)),
      staleTime: 300_000,
    })),
  })

  const data = raw.map((e, i) => {
    const detail = details[i]?.data
    if (detail) {
      return {
        id: e.id,
        type: (e.type === "tv" ? "tv" : "movie") as "movie" | "tv",
        progress: e.progress,
        timestamp: e.timestamp,
        duration: e.duration,
        title: detail.title,
        posterPath: detail.posterPath,
        backdropPath: detail.backdropPath,
        season: e.season,
        episode: e.episode,
        updatedAt: e.updatedAt,
      }
    }
    // Fallback to localStorage metadata while fetching
    return {
      id: e.id,
      type: (e.type === "tv" ? "tv" : "movie") as "movie" | "tv",
      progress: e.progress,
      timestamp: e.timestamp,
      duration: e.duration,
      title: e.title ?? "Unknown",
      posterPath: e.posterPath ?? null,
      backdropPath: e.backdropPath ?? null,
      season: e.season,
      episode: e.episode,
      updatedAt: e.updatedAt,
    }
  })

  return { data, isLoading }
}
