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
  sorted.forEach((_e, i) => {
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
