import { useQuery } from "@tanstack/react-query"
import { getTopRatedMovies } from "@/api/movies.api"
import { queryKeys } from "@/lib/query-keys"

export function useTopRatedMovies() {
  return useQuery({
    queryKey: queryKeys.movies.topRated(),
    queryFn: getTopRatedMovies,
  })
}
