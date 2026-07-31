import type { Movie, Genre } from "@/types/movie.types"

export type MovieCardProps = {
  movie: Movie
  rank?: number
  showRank?: boolean
  genres?: Genre[]
  logoPath?: string | null
  className?: string
  /** Expand on hover (TrendingSection). Default: false (bottom overlay). */
  expandOnHover?: boolean
  /** Watch progress percentage 0–100 (Continue Watching). Shows progress bar. */
  progress?: number
  /** When provided, shows a dismiss (X) button on hover (Continue Watching). */
  onDismiss?: (movie: Movie) => void
}
