import { apiClient } from "./client"
import { endpoints } from "./endpoints"
import { GenreListSchema } from "@/types/movie.types"

export async function getGenres(type: "movie" | "tv" = "movie") {
  const endpoint =
    type === "tv" ? endpoints.genres.tvList : endpoints.genres.list
  const res = await apiClient.get<unknown>(endpoint)
  return GenreListSchema.parse(res)
}
