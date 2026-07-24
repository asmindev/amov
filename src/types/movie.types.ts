import { z } from "zod"
import { PaginatedSchema } from "./api.types"

const TmdbMovieSchema = z.object({
  id: z.number(),
  title: z.string().optional(),
  name: z.string().optional(),
  overview: z.string().optional().default(""),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  release_date: z.string().nullable().optional().default(""),
  first_air_date: z.string().nullable().optional().default(""),
  vote_average: z.number().optional().default(0),
  vote_count: z.number().optional().default(0),
  genre_ids: z.array(z.number()).optional().default([]),
  popularity: z.number().optional().default(0),
  adult: z.boolean().optional().default(false),
  original_language: z.string().optional().default("en"),
  media_type: z.enum(["movie", "tv"]).optional(),
})

export const MovieSchema = TmdbMovieSchema.transform((m) => ({
  id: m.id,
  title: m.title || m.name || "",
  overview: m.overview,
  posterPath: m.poster_path ?? null,
  backdropPath: m.backdrop_path ?? null,
  releaseDate: m.release_date || m.first_air_date || "",
  voteAverage: m.vote_average,
  voteCount: m.vote_count,
  genreIds: m.genre_ids,
  popularity: m.popularity,
  adult: m.adult,
  originalLanguage: m.original_language,
  mediaType: m.media_type ?? (m.title ? "movie" : m.name ? "tv" : "movie"),
}))

export type Movie = z.infer<typeof MovieSchema>

export const MovieListSchema = PaginatedSchema(MovieSchema)
export type MovieList = z.infer<typeof MovieListSchema>

export const GenreSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export type Genre = z.infer<typeof GenreSchema>

export const GenreListSchema = z.object({
  genres: z.array(GenreSchema),
})

export type GenreList = z.infer<typeof GenreListSchema>

const TmdbCastMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  character: z.string(),
  profile_path: z.string().nullable(),
  order: z.number(),
})

export const CastMemberSchema = TmdbCastMemberSchema.transform((c) => ({
  id: c.id,
  name: c.name,
  character: c.character,
  profilePath: c.profile_path,
  order: c.order,
}))

export type CastMember = z.infer<typeof CastMemberSchema>

const TmdbImageItemSchema = z.object({
  file_path: z.string(),
  iso_639_1: z.string().nullable().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  vote_average: z.number().optional(),
})

const TmdbImagesSchema = z.object({
  logos: z.array(TmdbImageItemSchema).default([]),
  backdrops: z.array(TmdbImageItemSchema).default([]),
})

const TmdbTvSeasonSchema = z.object({
  id: z.number(),
  name: z.string(),
  season_number: z.number(),
  episode_count: z.number().optional().default(0),
  poster_path: z.string().nullable().optional(),
  overview: z.string().optional().default(""),
})

export const TvSeasonSchema = TmdbTvSeasonSchema.transform((s) => ({
  id: s.id,
  name: s.name,
  seasonNumber: s.season_number,
  episodeCount: s.episode_count,
  posterPath: s.poster_path ?? null,
  overview: s.overview,
}))

export type TvSeason = z.infer<typeof TvSeasonSchema>

export const EpisodeSchema = z.object({
  id: z.number(),
  name: z.string(),
  overview: z.string().optional().default(""),
  episode_number: z.number(),
  season_number: z.number(),
  still_path: z.string().nullable().optional(),
  air_date: z.string().nullable().optional().default(""),
  runtime: z.number().nullable().optional(),
  vote_average: z.number().optional().default(0),
})

export const EpisodeListSchema = z.object({
  id: z.number().optional(),
  name: z.string().optional(),
  overview: z.string().optional().default(""),
  season_number: z.number().optional(),
  episodes: z.array(EpisodeSchema).default([]),
})

export type Episode = z.infer<typeof EpisodeSchema>
export type EpisodeList = z.infer<typeof EpisodeListSchema>

const TmdbMovieDetailSchema = TmdbMovieSchema.extend({
  runtime: z.number().nullable().optional(),
  episode_run_time: z.array(z.number()).optional(),
  number_of_seasons: z.number().optional(),
  number_of_episodes: z.number().optional(),
  seasons: z.array(TmdbTvSeasonSchema).optional(),
  tagline: z.string().nullable().optional(),
  budget: z.number().optional().default(0),
  revenue: z.number().optional().default(0),
  status: z.string().optional().default(""),
  genres: z.array(GenreSchema).optional().default([]),
  imdb_id: z.string().nullable().optional(),
  external_ids: z
    .object({
      imdb_id: z.string().nullable().optional(),
    })
    .optional(),
  genre_ids: z.array(z.number()).optional().default([]),
  images: TmdbImagesSchema.optional(),
  credits: z
    .object({
      cast: z.array(TmdbCastMemberSchema),
    })
    .optional(),
})

export const MovieDetailSchema = TmdbMovieDetailSchema.transform((m) => {
  const logos = m.images?.logos ?? []
  const backdrops = m.images?.backdrops ?? []
  const lang =
    typeof window !== "undefined"
      ? (localStorage.getItem("app-language") || "en-US").split("-")[0]
      : "en"
  const logo =
    logos.find((l) => l.iso_639_1 === lang) ??
    logos.find((l) => l.iso_639_1 === "en") ??
    logos.find((l) => l.iso_639_1 === null) ??
    logos[0]

  // Pick backdrop with highest resolution or fallback to default backdrop_path
  const bestBackdrop =
    backdrops.length > 0
      ? [...backdrops].sort((a, b) => (b.width || 0) - (a.width || 0))[0]
          ?.file_path
      : null

  const backdropPath = bestBackdrop ?? m.backdrop_path ?? null

  const runtime =
    m.runtime ??
    (m.episode_run_time && m.episode_run_time.length > 0
      ? m.episode_run_time[0]
      : null)

  return {
    id: m.id,
    title: m.title || m.name || "",
    overview: m.overview,
    posterPath: m.poster_path ?? null,
    backdropPath,
    releaseDate: m.release_date || m.first_air_date || "",
    voteAverage: m.vote_average,
    voteCount: m.vote_count,
    genreIds: m.genre_ids,
    popularity: m.popularity,
    adult: m.adult,
    originalLanguage: m.original_language,
    runtime,
    numberOfSeasons: m.number_of_seasons,
    numberOfEpisodes: m.number_of_episodes,
    seasons: m.seasons?.map((s) => ({
      id: s.id,
      name: s.name,
      seasonNumber: s.season_number,
      episodeCount: s.episode_count,
      posterPath: s.poster_path ?? null,
      overview: s.overview,
    })),
    tagline: m.tagline ?? null,
    budget: m.budget,
    revenue: m.revenue,
    status: m.status,
    genres: m.genres,
    imdbId: m.imdb_id ?? m.external_ids?.imdb_id ?? null,
    logoPath: logo?.file_path ?? null,
    mediaType: m.media_type ?? (m.title ? "movie" : m.name ? "tv" : "movie"),
    cast: m.credits?.cast.map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profilePath: c.profile_path,
      order: c.order,
    })),
  }
})

export type MovieDetail = z.infer<typeof MovieDetailSchema>

export const VideoSchema = z.object({
  key: z.string(),
  site: z.string(),
  type: z.string(),
  name: z.string(),
})

export type Video = z.infer<typeof VideoSchema>

export const VideoListSchema = z.object({
  results: z.array(VideoSchema),
})

export type VideoList = z.infer<typeof VideoListSchema>
