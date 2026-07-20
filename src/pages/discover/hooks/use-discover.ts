import { useInfiniteQuery } from "@tanstack/react-query"
import { getDiscoverMovies } from "@/api/movies.api"
import { searchMovies } from "@/api/search.api"
import { queryKeys } from "@/lib/query-keys"

export function useDiscover(query?: string) {
  return useInfiniteQuery({
    queryKey: query ? queryKeys.search.infinite(query) : queryKeys.movies.discoverInfinite(),
    queryFn: ({ pageParam = 1 }) =>
      query ? searchMovies(query, pageParam) : getDiscoverMovies(pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1
      }
      return undefined
    },
    initialPageParam: 1,
  })
}
