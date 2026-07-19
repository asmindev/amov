import { apiClient } from "./client"
import { endpoints } from "./endpoints"
import { GenreListSchema } from "@/types/movie.types"

export async function getGenres() {
  const res = await apiClient.get<unknown>(endpoints.genres.list)
  return GenreListSchema.parse(res)
}
