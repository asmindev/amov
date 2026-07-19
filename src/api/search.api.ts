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
