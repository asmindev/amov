import { useQuery } from "@tanstack/react-query"
import {
  getMediaDetail,
  getSimilarMedia,
  getMediaVideos,
  getTvSeasonDetail,
} from "@/api/movies.api"
import { queryKeys } from "@/lib/query-keys"

export function useMediaDetail(type: "movie" | "tv", id: string) {
  return useQuery({
    queryKey: queryKeys.media.detail(type, id),
    queryFn: () => getMediaDetail(type, id),
    enabled: !!id && !!type,
  })
}

export function useSimilarMedia(type: "movie" | "tv", id: string) {
  return useQuery({
    queryKey: queryKeys.media.similar(type, id),
    queryFn: () => getSimilarMedia(type, id),
    enabled: !!id && !!type,
  })
}

export function useMediaVideos(type: "movie" | "tv", id: string) {
  return useQuery({
    queryKey: queryKeys.media.videos(type, id),
    queryFn: () => getMediaVideos(type, id),
    enabled: !!id && !!type,
  })
}

export function useTvSeasonEpisodes(tvId: string, seasonNumber: number) {
  return useQuery({
    queryKey: queryKeys.media.season(tvId, seasonNumber),
    queryFn: () => getTvSeasonDetail(tvId, seasonNumber),
    enabled: !!tvId && seasonNumber >= 0,
  })
}

export function useMovieDetail(id: string) {
  return useMediaDetail("movie", id)
}

export function useSimilarMovies(id: string) {
  return useSimilarMedia("movie", id)
}

export function useMovieVideos(id: string) {
  return useMediaVideos("movie", id)
}
