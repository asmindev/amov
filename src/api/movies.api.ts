import { apiClient } from "./client"
import { endpoints } from "./endpoints"
import {
  NETFLIX_PROVIDER_ID,
  WATCH_REGION,
  DEFAULT_SORT_BY,
} from "@/lib/config"
import {
  MovieDetailSchema,
  MovieListSchema,
  VideoListSchema,
} from "@/types/movie.types"

export async function getTrendingMovies() {
  const res = await apiClient.get<unknown>(endpoints.movies.trending)
  return MovieListSchema.parse(res)
}

export async function getTrendingAll() {
  const res = await apiClient.get<unknown>(endpoints.movies.trendingAll)
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
    with_watch_providers: NETFLIX_PROVIDER_ID,
    watch_region: WATCH_REGION,
    sort_by: DEFAULT_SORT_BY,
  })
  return MovieListSchema.parse(res)
}

export async function getMovieById(id: string) {
  const lang =
    typeof window !== "undefined"
      ? (localStorage.getItem("app-language") || "en-US").split("-")[0]
      : "en"

  const res = await apiClient.get<unknown>(endpoints.movies.detail(id), {
    append_to_response: "images,credits",
    include_image_language: `${lang},en,null`,
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
  country?: string
  sortBy?: string
  query?: string
  type?: "all" | "movie" | "tv"
}

export async function getDiscoverMovies(page = 1, filters?: DiscoverFilters) {
  const isSearch = !!filters?.query

  if (isSearch) {
    const searchEndpoint =
      filters?.type === "tv"
        ? endpoints.search.tv
        : filters?.type === "movie"
          ? endpoints.search.movies
          : endpoints.search.multi

    const res = await apiClient.get<unknown>(searchEndpoint, {
      query: filters.query!,
      page: String(page),
      include_adult: "false",
    })
    return MovieListSchema.parse(res)
  }

  // Discover (no query)
  const discoverEndpoint =
    filters?.type === "tv" ? endpoints.tv.discover : endpoints.movies.discover

  const params: Record<string, string> = {
    sort_by: filters?.sortBy || DEFAULT_SORT_BY,
    include_adult: "false",
    page: String(page),
  }

  if (filters?.genres?.length) {
    params.with_genres = filters.genres.join("|")
  }

  if (filters?.year) {
    if (filters?.type === "tv") {
      params.first_air_date_year = filters.year
    } else {
      params.primary_release_year = filters.year
    }
  }

  if (filters?.country) {
    params.with_origin_country = filters.country
  }

  if (filters?.providers?.length) {
    params.with_watch_providers = filters.providers.join("|")
    params.watch_region = WATCH_REGION
  }

  const res = await apiClient.get<unknown>(discoverEndpoint, params)
  return MovieListSchema.parse(res)
}

