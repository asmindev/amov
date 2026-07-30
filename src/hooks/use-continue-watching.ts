import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth-store"
import { loadAllProgress, type WatchProgress } from "@/hooks/use-watch-progress"
import { fetchWatchHistory, mergeWatchHistory } from "@/api/watch-history.api"

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

  const data = (() => {
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

  return { data, isLoading }
}
