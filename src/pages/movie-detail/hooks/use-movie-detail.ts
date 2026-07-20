import { useQuery } from "@tanstack/react-query"
import { getMovieById } from "@/api/movies.api"
import { getSimilarMovies } from "@/api/movies.api"
import { getMovieVideos } from "@/api/movies.api"
import { queryKeys } from "@/lib/query-keys"

export function useMovieDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.movies.detail(id),
    queryFn: () => getMovieById(id),
    enabled: !!id,
  })
}

export function useSimilarMovies(id: string) {
  return useQuery({
    queryKey: queryKeys.movies.similar(id),
    queryFn: () => getSimilarMovies(id),
    enabled: !!id,
  })
}

export function useMovieVideos(id: string) {
  return useQuery({
    queryKey: queryKeys.movies.videos(id),
    queryFn: () => getMovieVideos(id),
    enabled: !!id,
  })
}
