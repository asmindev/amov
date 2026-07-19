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

export async function getNetflixMovies() {
  const res = await apiClient.get<unknown>(endpoints.movies.discover, {
    with_companies: "213",
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
