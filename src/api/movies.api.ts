import { apiClient } from "./client"
import { endpoints } from "./endpoints"
import {
  MovieDetailSchema,
  MovieListSchema,
  VideoListSchema,
} from "@/types/movie.types"

export async function getTrendingMovies() {
  const res = await apiClient.get<unknown>(endpoints.movies.trending)
  return MovieListSchema.parse(res)
}

export async function getTopRatedMovies() {
  const res = await apiClient.get<unknown>(endpoints.movies.topRated)
  return MovieListSchema.parse(res)
}

export async function getPopularMovies() {
  const res = await apiClient.get<unknown>(endpoints.movies.popular)
  return MovieListSchema.parse(res)
}

export async function getNetflixMovies() {
  const res = await apiClient.get<unknown>(endpoints.movies.discover, {
    with_watch_providers: "8",
    watch_region: "ID",
    sort_by: "popularity.desc",
  })
  return MovieListSchema.parse(res)
}

export async function getMovieById(id: string) {
  const res = await apiClient.get<unknown>(endpoints.movies.detail(id), {
    append_to_response: "images",
    include_image_language: "en,null",
  })
  return MovieDetailSchema.parse(res)
}

export async function getSimilarMovies(id: string) {
  const res = await apiClient.get<unknown>(endpoints.movies.similar(id))
  return MovieListSchema.parse(res)
}

export async function getMovieVideos(id: string) {
  const res = await apiClient.get<unknown>(endpoints.movies.videos(id))
  return VideoListSchema.parse(res)
}

export async function getMoviesByGenre(genreId: string) {
  const res = await apiClient.get<unknown>(endpoints.movies.discover, {
    with_genres: genreId,
  })
  return MovieListSchema.parse(res)
}

export type DiscoverFilters = {
  genres?: number[]
  year?: string
  providers?: number[]
}

export async function getDiscoverMovies(page = 1, filters?: DiscoverFilters) {
  const params: Record<string, string> = {
    sort_by: "popularity.desc",
    page: String(page),
  }

  if (filters?.genres?.length) {
    params.with_genres = filters.genres.join("|")
  }

  if (filters?.year) {
    params.primary_release_year = filters.year
  }

  if (filters?.providers?.length) {
    params.with_watch_providers = filters.providers.join("|")
    params.watch_region = "ID"
  }

  const res = await apiClient.get<unknown>(endpoints.movies.discover, params)
  return MovieListSchema.parse(res)
}

