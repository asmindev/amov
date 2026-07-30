import { useQuery, useQueries } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth-store"
import { loadAllProgress, type WatchProgress } from "@/hooks/use-watch-progress"
import { fetchWatchHistory, mergeWatchHistory } from "@/api/watch-history.api"
import { getMediaDetail } from "@/api/movies.api"

function needsFetch(e: WatchProgress) {
  return !e.title || !e.posterPath
}

export function useContinueWatching(): {
  data: (WatchProgress & {
    title: string
    posterPath: string | null
    backdropPath: string | null
  })[]
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
      entries.filter((e) => e.progress > 0 && e.progress < 100)

    if (!syncEnabled || !user) {
      return filter(local).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20)
    }

    const cloud = cloudQuery.data ?? []
    const merged = mergeWatchHistory(local, cloud)
    return filter(merged).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20)
  })()

  const staleEntries = raw.filter(needsFetch)

  // Fetch TMDB details for entries missing metadata (old data / cloud-only items)
  const details = useQueries({
    queries: staleEntries.map((e) => ({
      queryKey: ["movie-detail", e.type, e.id],
      queryFn: () =>
        getMediaDetail(e.type === "tv" ? "tv" : "movie", String(e.id)),
      staleTime: 300_000,
    })),
  })

  const data = raw.map((e) => {
    if (!needsFetch(e)) {
      return {
        ...e,
        title: e.title!,
        posterPath: e.posterPath ?? null,
        backdropPath: e.backdropPath ?? null,
      }
    }
    const idx = staleEntries.findIndex((s) => s.id === e.id && s.type === e.type)
    const detail = idx !== -1 ? details[idx]?.data : null
    if (detail) {
      return {
        ...e,
        title: detail.title,
        posterPath: detail.posterPath,
        backdropPath: detail.backdropPath,
      }
    }
    return {
      ...e,
      title: e.title ?? "Unknown",
      posterPath: e.posterPath ?? null,
      backdropPath: e.backdropPath ?? null,
    }
  })

  return { data, isLoading }
}
