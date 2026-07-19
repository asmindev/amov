import { useQuery } from "@tanstack/react-query"
import { getTrendingMovies } from "@/api/movies.api"
import { queryKeys } from "@/lib/query-keys"

export function useTrendingMovies() {
  return useQuery({
    queryKey: queryKeys.movies.trending(),
    queryFn: getTrendingMovies,
  })
}
