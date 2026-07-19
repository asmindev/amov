import { useQueries } from "@tanstack/react-query"
import { getMovieById } from "@/api/movies.api"
import { queryKeys } from "@/lib/query-keys"

export function useMovieDetails(movieIds: number[]) {
  const results = useQueries({
    queries: movieIds.map((id) => ({
      queryKey: queryKeys.movies.detail(String(id)),
      queryFn: () => getMovieById(String(id)),
      enabled: movieIds.length > 0,
    })),
  })

  return results.map((r) => r.data ?? null)
}
