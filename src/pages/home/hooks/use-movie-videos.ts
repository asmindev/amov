import { useQuery } from "@tanstack/react-query"
import { getMovieVideos } from "@/api/movies.api"
import { queryKeys } from "@/lib/query-keys"

export function useMovieVideos(id: string) {
  return useQuery({
    queryKey: queryKeys.movies.videos(id),
    queryFn: () => getMovieVideos(id),
    enabled: !!id,
    select: (data) => {
      const trailer =
        data.results.find(
          (v) => v.type === "Trailer" && v.site === "YouTube"
        ) ?? data.results.find((v) => v.site === "YouTube")
      return trailer ?? null
    },
  })
}
