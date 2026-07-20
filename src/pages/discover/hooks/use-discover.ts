import { useInfiniteQuery } from "@tanstack/react-query"
import { getDiscoverMovies, type DiscoverFilters } from "@/api/movies.api"
import { queryKeys } from "@/lib/query-keys"

export function useDiscover(query?: string, filters?: DiscoverFilters) {
  const combinedFilters: DiscoverFilters = {
    ...filters,
    query: query || undefined,
  }

  return useInfiniteQuery({
    queryKey: [...queryKeys.movies.discoverInfinite(), combinedFilters],
    queryFn: ({ pageParam = 1 }) =>
      getDiscoverMovies(pageParam, combinedFilters),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
  })
}
