import { useQuery } from "@tanstack/react-query"
import { getNetflixMovies } from "@/api/movies.api"
import { queryKeys } from "@/lib/query-keys"

export function useNetflixMovies() {
  return useQuery({
    queryKey: queryKeys.movies.netflix(),
    queryFn: getNetflixMovies,
  })
}
