import { z } from "zod"
import { PaginatedSchema } from "./api.types"

const TmdbMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string(),
  poster_path: z.string().nullable(),
  backdrop_path: z.string().nullable(),
  release_date: z.string().nullable().default(""),
  vote_average: z.number(),
  vote_count: z.number(),
  genre_ids: z.array(z.number()),
  popularity: z.number(),
  adult: z.boolean(),
  original_language: z.string(),
})

export const MovieSchema = TmdbMovieSchema.transform((m) => ({
  id: m.id,
  title: m.title,
  overview: m.overview,
  posterPath: m.poster_path,
  backdropPath: m.backdrop_path,
  releaseDate: m.release_date,
  voteAverage: m.vote_average,
  voteCount: m.vote_count,
  genreIds: m.genre_ids,
  popularity: m.popularity,
  adult: m.adult,
  originalLanguage: m.original_language,
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

const TmdbLogoItemSchema = z.object({
  file_path: z.string(),
  iso_639_1: z.string().nullable(),
})

const TmdbImagesSchema = z.object({
  logos: z.array(TmdbLogoItemSchema).default([]),
})

const TmdbMovieDetailSchema = TmdbMovieSchema.extend({
  runtime: z.number().nullable(),
  tagline: z.string().nullable(),
  budget: z.number(),
  revenue: z.number(),
  status: z.string(),
  genres: z.array(GenreSchema),
  imdb_id: z.string().nullable(),
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
  const logo =
    logos.find((l) => l.iso_639_1 === "en") ??
    logos.find((l) => l.iso_639_1 === null) ??
    logos[0]

  return {
    id: m.id,
    title: m.title,
    overview: m.overview,
    posterPath: m.poster_path,
    backdropPath: m.backdrop_path,
    releaseDate: m.release_date,
    voteAverage: m.vote_average,
    voteCount: m.vote_count,
    genreIds: m.genre_ids,
    popularity: m.popularity,
    adult: m.adult,
    originalLanguage: m.original_language,
    runtime: m.runtime,
    tagline: m.tagline,
    budget: m.budget,
    revenue: m.revenue,
    status: m.status,
    genres: m.genres,
    imdbId: m.imdb_id,
    logoPath: logo?.file_path ?? null,
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
