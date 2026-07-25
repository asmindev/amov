import { useQueries } from "@tanstack/react-query"
import { getMediaDetail } from "@/api/movies.api"
import { queryKeys } from "@/lib/query-keys"

interface MediaItem {
  id: number
  mediaType?: "movie" | "tv"
}

export function useMovieDetails(items: MediaItem[]) {
  const results = useQueries({
    queries: items.map(({ id, mediaType = "movie" }) => ({
      queryKey: queryKeys.movies.detail(String(id)),
      queryFn: () => getMediaDetail(mediaType, String(id)),
      enabled: items.length > 0,
    })),
  })

  return results.map((r) => r.data ?? null)
}
