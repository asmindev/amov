import { useQuery } from "@tanstack/react-query"
import { getGenres } from "@/api/genres.api"
import { queryKeys } from "@/lib/query-keys"

export function useGenres() {
  return useQuery({
    queryKey: queryKeys.genres.all,
    queryFn: getGenres,
  })
}
