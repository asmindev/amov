import { useQuery } from "@tanstack/react-query"
import { getPopularMovies } from "@/api/movies.api"
import { queryKeys } from "@/lib/query-keys"

export function usePopularMovies() {
  return useQuery({
    queryKey: queryKeys.movies.popular(),
    queryFn: getPopularMovies,
  })
}
