import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth-store"
import {
  loadAllProgress,
  saveAllProgress,
  type WatchProgress,
} from "@/hooks/use-watch-progress"
import { fetchWatchHistory, mergeWatchHistory } from "@/api/watch-history.api"
import { getMediaDetail } from "@/api/movies.api"

function entryKey(e: WatchProgress) {
  return `${e.type}_${e.id}`
}

function needsEnrich(e: WatchProgress) {
  return !e.title || !e.posterPath
}

export function useContinueWatching(): {
  data: WatchProgress[]
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

  // Enrich entries missing metadata (old localStorage entries)
  const staleIds = raw.filter(needsEnrich).map(entryKey).join(",")

  const { data: enriched } = useQuery({
    queryKey: ["continue-watching-enrich", staleIds],
    queryFn: async () => {
      const toFetch = raw.filter(needsEnrich)
      if (toFetch.length === 0) return raw

      const results = await Promise.allSettled(
        toFetch.map((e) =>
          getMediaDetail(
            e.type === "tv" ? "tv" : "movie",
            String(e.id)
          ).then((detail) => ({
            key: entryKey(e),
            title: detail.title,
            posterPath: detail.posterPath,
            backdropPath: detail.backdropPath,
          }))
        )
      )

      // Persist enriched metadata back to localStorage so next visit is instant
      const all = loadAllProgress()
      for (const result of results) {
        if (result.status === "fulfilled") {
          const entry = all[result.value.key]
          if (entry) {
            entry.title = result.value.title
            entry.posterPath = result.value.posterPath
            entry.backdropPath = result.value.backdropPath
          }
        }
      }
      saveAllProgress(all)

      return raw.map((e) => {
        if (!needsEnrich(e)) return e
        const found = results.find(
          (r) => r.status === "fulfilled" && r.value.key === entryKey(e)
        )
        if (found && found.status === "fulfilled") {
          return {
            ...e,
            title: found.value.title,
            posterPath: found.value.posterPath,
            backdropPath: found.value.backdropPath,
          }
        }
        return e
      })
    },
    enabled: staleIds.length > 0,
    staleTime: 300_000,
  })

  return {
    data: enriched ?? raw,
    isLoading,
  }
}
