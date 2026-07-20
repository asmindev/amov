import { useQuery } from "@tanstack/react-query"
import { getDiscoverMovies } from "@/api/movies.api"
import { searchMovies } from "@/api/search.api"
import { queryKeys } from "@/lib/query-keys"

export function useDiscover(query?: string) {
  return useQuery({
    queryKey: query ? queryKeys.search.query(query) : queryKeys.movies.discover(),
    queryFn: () => (query ? searchMovies(query) : getDiscoverMovies()),
  })
}

