import { ExpandMode } from "./expand-mode"
import { PopupMode } from "./popup-mode"
import { useMovieCardHover } from "./hooks"
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
  onDismiss,
}: MovieCardProps) {
  const { isHovered, handleMouseEnter, handleMouseLeave } = useMovieCardHover()

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
        onDismiss={onDismiss}
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
