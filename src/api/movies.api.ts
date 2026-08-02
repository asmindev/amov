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
  EpisodeListSchema,
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

export async function getMediaDetail(type: "movie" | "tv", id: string) {
  const lang =
    typeof window !== "undefined"
      ? (localStorage.getItem("app-language") || "en-US").split("-")[0]
      : "en"

  const endpoint =
    type === "tv" ? endpoints.tv.detail(id) : endpoints.movies.detail(id)

  const res = await apiClient.get<unknown>(endpoint, {
    append_to_response: "images,credits,external_ids",
    include_image_language: `${lang},id,en,null`,
  })
  const parsed = MovieDetailSchema.parse(res)
  return { ...parsed, mediaType: type }
}

/**
 * Fetch the English title of a movie/TV show by querying TMDB with
 * `language=en-US`. Used by the Moviebox provider for title matching
 * (original vs English). Falls back to the localized title on failure.
 */
export async function getEnglishTitle(
  type: "movie" | "tv",
  id: string
): Promise<string> {
  const endpoint =
    type === "tv" ? endpoints.tv.detail(id) : endpoints.movies.detail(id)
  try {
    const res = await apiClient.get<unknown>(endpoint, {
      language: "en-US",
    })
    const raw = res as {
      title?: string
      name?: string
      original_title?: string
      original_name?: string
    }
    return raw.title || raw.name || raw.original_title || raw.original_name || ""
  } catch {
    return ""
  }
}

export async function getMovieById(id: string) {
  return getMediaDetail("movie", id)
}

export async function getSimilarMedia(type: "movie" | "tv", id: string) {
  const endpoint =
    type === "tv" ? endpoints.tv.similar(id) : endpoints.movies.similar(id)
  const res = await apiClient.get<unknown>(endpoint)
  return MovieListSchema.parse(res)
}

export async function getSimilarMovies(id: string) {
  return getSimilarMedia("movie", id)
}

export async function getMediaVideos(type: "movie" | "tv", id: string) {
  const endpoint =
    type === "tv" ? endpoints.tv.videos(id) : endpoints.movies.videos(id)
  const res = await apiClient.get<unknown>(endpoint)
  return VideoListSchema.parse(res)
}

export async function getTvSeasonDetail(tvId: string, seasonNumber: number) {
  const res = await apiClient.get<unknown>(
    endpoints.tv.season(tvId, seasonNumber)
  )
  return EpisodeListSchema.parse(res)
}

export async function getMovieVideos(id: string) {
  return getMediaVideos("movie", id)
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

    const searchParams: Record<string, string> = {
      query: filters.query!,
      page: String(page),
      include_adult: "false",
    }

    if (filters?.year) {
      if (filters?.type === "tv") {
        searchParams.first_air_date_year = filters.year
      } else if (filters?.type === "movie") {
        searchParams.primary_release_year = filters.year
      }
    }

    const res = await apiClient.get<unknown>(searchEndpoint, searchParams)
    const raw = res as { results: Array<{ media_type: string }> }
    raw.results = raw.results.filter(
      (r) => r.media_type === "movie" || r.media_type === "tv"
    )
    return MovieListSchema.parse(raw)
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
