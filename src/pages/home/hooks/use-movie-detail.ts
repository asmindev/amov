import { useQuery } from "@tanstack/react-query"
import { getMovieById } from "@/api/movies.api"
import { queryKeys } from "@/lib/query-keys"

export function useMovieDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.movies.detail(id),
    queryFn: () => getMovieById(id),
    enabled: !!id,
  })
}
