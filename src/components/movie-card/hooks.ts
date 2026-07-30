import { useState } from "react"
import type { Movie, Genre } from "@/types/movie.types"

export function useMovieCardHover() {
  const [isHovered, setIsHovered] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null)

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => setIsHovered(true), 150)
    setHoverTimeout(timeout)
  }

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout)
    setIsHovered(false)
  }

  return { isHovered, handleMouseEnter, handleMouseLeave }
}

export function useGenreNames(movie: Movie, genres?: Genre[]): string[] {
  if (!genres || !movie.genreIds) return []
  return movie.genreIds
    .slice(0, 3)
    .map((id) => genres.find((g) => g.id === id)?.name)
    .filter(Boolean) as string[]
}
