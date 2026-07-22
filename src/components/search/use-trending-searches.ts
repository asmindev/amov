import { useQuery } from "@tanstack/react-query"
import { getTrendingAll } from "@/api/movies.api"
import { queryKeys } from "@/lib/query-keys"

export function useTrendingSearches() {
  return useQuery({
    queryKey: [...queryKeys.movies.all, "trending-all"],
    queryFn: getTrendingAll,
    staleTime: 1000 * 60 * 10,
  })
}
