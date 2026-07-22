import { apiClient } from "./client"
import { endpoints } from "./endpoints"
import { MovieListSchema } from "@/types/movie.types"

export async function searchMovies(query: string, page = 1) {
  const res = await apiClient.get<unknown>(endpoints.search.movies, {
    query,
    page: String(page),
  })
  return MovieListSchema.parse(res)
}

export async function searchMulti(query: string, page = 1) {
  const res = await apiClient.get<unknown>(endpoints.search.multi, {
    query,
    include_adult: "false",
    page: String(page),
  })
  const raw = res as { results: Array<{ media_type: string }> }
  raw.results = raw.results.filter(
    (r) => r.media_type === "movie" || r.media_type === "tv"
  )
  return MovieListSchema.parse(raw)
}
