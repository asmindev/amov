import { ExpandMode } from "./expand-mode"
import { PopupMode } from "./popup-mode"
import { useMovieCardHover } from "./hooks"
import { recordAnalyticsEvent } from "@/api/analytics.api"
import type { MovieCardProps } from "./types"

export function MovieCard({
  movie,
  rank,
  showRank = false,
  genres,
  logoPath,
  className,
  expandOnHover = false,
  progress,
}: MovieCardProps) {
  const { isHovered, handleMouseEnter, handleMouseLeave } = useMovieCardHover()

  const trackClick = () => {
    recordAnalyticsEvent({
      eventType: "movie_click",
      mediaId: String(movie.id),
      mediaTitle: movie.title,
      mediaType: movie.mediaType || "movie",
    })
  }

  if (expandOnHover) {
    return (
      <ExpandMode
        movie={movie}
        isHovered={isHovered}
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
        showRank={showRank}
        rank={rank}
        genres={genres}
        logoPath={logoPath}
        className={className}
        progress={progress}
      />
    )
  }

  return (
    <PopupMode
      movie={movie}
      isHovered={isHovered}
      handleMouseEnter={handleMouseEnter}
      handleMouseLeave={handleMouseLeave}
      showRank={showRank}
      rank={rank}
      genres={genres}
      logoPath={logoPath}
      className={className}
    />
  )
}
