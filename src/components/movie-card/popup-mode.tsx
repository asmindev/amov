import { Link } from "@tanstack/react-router"
import { motion, AnimatePresence } from "motion/react"
import { getImageUrl } from "@/helpers/image-url"
import { recordAnalyticsEvent } from "@/api/analytics.api"
import { useWatchlistStore } from "@/stores/watchlist-store"
import { useInWatchlist } from "@/hooks/use-watchlist"
import { PopupMetadataRow } from "./metadata-row"
import { useGenreNames } from "./hooks"
import type { Movie, Genre } from "@/types/movie.types"

interface PopupModeProps {
  movie: Movie
  isHovered: boolean
  handleMouseEnter: () => void
  handleMouseLeave: () => void
  showRank?: boolean
  rank?: number
  genres?: Genre[]
  logoPath?: string | null
  className?: string
}

export function PopupMode({
  movie,
  isHovered,
  handleMouseEnter,
  handleMouseLeave,
  showRank,
  rank,
  genres,
  logoPath,
  className,
}: PopupModeProps) {
  const genreNames = useGenreNames(movie, genres)
  const inList = useInWatchlist(movie.mediaType || "movie", movie.id)
  const toggle = useWatchlistStore((s) => s.toggle)

  const trackClick = () => {
    recordAnalyticsEvent({
      eventType: "movie_click",
      mediaId: String(movie.id),
      mediaTitle: movie.title,
      mediaType: movie.mediaType || "movie",
    })
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative z-0 aspect-video w-full cursor-pointer rounded-none hover:z-50 ${isHovered ? "z-50" : ""} ${className || ""}`}
    >
      {/* Rank Indicator */}
      {showRank && rank && (
        <div className="pointer-events-none absolute -bottom-2 -left-8 -z-10">
          <h1 className="text-7xl font-black text-transparent transition-all duration-200 [-webkit-text-stroke:2px_#333333] group-hover:text-white/20 lg:text-8xl">
            {rank}
          </h1>
        </div>
      )}

      {/* Landscape Image */}
      <img
        src={getImageUrl(movie.backdropPath || movie.posterPath, "w780")}
        alt={movie.title}
        className="h-full w-full rounded-none object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Popup Overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1.1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute -top-4 left-1/2 w-[110%] -translate-x-1/2 overflow-hidden rounded-none border border-border bg-card text-card-foreground"
            style={{ boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75)" }}
          >
            {/* Backdrop */}
            <div className="relative aspect-video w-full bg-black">
              <img
                src={getImageUrl(
                  movie.backdropPath || movie.posterPath,
                  "w780"
                )}
                alt={movie.title}
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-linear-to-t from-card to-transparent" />
            </div>

            {/* Details */}
            <div className="relative -mt-8 flex flex-col gap-2 px-4 pb-4">
              {/* Logo / Title */}
              {logoPath ? (
                <img
                  src={getImageUrl(logoPath, "w500")}
                  alt={movie.title}
                  className="mb-1 max-h-30 w-fit max-w-[60%] object-contain"
                />
              ) : (
                <h4 className="mb-1 line-clamp-1 text-base font-bold text-white">
                  {movie.title}
                </h4>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link
                    to="/$type/$id"
                    params={{
                      type: movie.mediaType || "movie",
                      id: String(movie.id),
                    }}
                    className="flex h-7 w-9 items-center justify-center bg-primary transition-colors hover:bg-primary/90"
                    onClick={trackClick}
                  >
                    <span className="material-symbols-outlined fill ml-0.5 text-[20px]!">
                      play_arrow
                    </span>
                  </Link>
                  <button
                    type="button"
                    aria-label={
                      inList ? "Remove from watchlist" : "Add to watchlist"
                    }
                    onClick={(e) => {
                      e.stopPropagation()
                      toggle(movie.mediaType || "movie", movie.id)
                    }}
                    className="flex h-7 w-9 items-center justify-center border border-white/20 bg-black/50 text-white transition-colors hover:border-white hover:bg-black/80"
                  >
                    {inList ? (
                      <span className="material-symbols-outlined !text-[16px]">check</span>
                    ) : (
                      <span className="material-symbols-outlined !text-[16px]">add</span>
                    )}
                  </button>
                  <button className="flex h-7 w-9 items-center justify-center border border-white/20 bg-black/50 text-white transition-colors hover:border-white hover:bg-black/80">
                    <span className="material-symbols-outlined !text-[16px]">thumb_up</span>
                  </button>
                </div>
                <Link
                  to="/$type/$id"
                  params={{
                    type: movie.mediaType || "movie",
                    id: String(movie.id),
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition-colors hover:border-white hover:bg-black/80"
                  onClick={trackClick}
                >
                  <span className="material-symbols-outlined !text-[16px]">expand_more</span>
                </Link>
              </div>

              <PopupMetadataRow movie={movie} />

              {/* Overview */}
              {movie.overview && (
                <p className="line-clamp-2 text-[11px] leading-relaxed text-gray-400">
                  {movie.overview}
                </p>
              )}

              {/* Genres */}
              {genreNames.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 text-[11px] font-medium text-gray-300">
                  {genreNames.map((g, idx) => (
                    <span key={g} className="flex items-center">
                      {idx > 0 && (
                        <span className="mx-1 inline-block h-1 w-1 rounded-full bg-white/30" />
                      )}
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
