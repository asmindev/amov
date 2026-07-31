import { motion, AnimatePresence } from "motion/react"
import { getImageUrl } from "@/helpers/image-url"
import { recordAnalyticsEvent } from "@/api/analytics.api"
import { ActionButtons } from "./action-buttons"
import { MetadataRow } from "./metadata-row"
import { ThinProgressBar, LabeledProgressBar } from "./progress-bar"
import { useGenreNames } from "./hooks"
import type { Movie, Genre } from "@/types/movie.types"

const EXPANDED_W = 320

interface ExpandModeProps {
  movie: Movie
  isHovered: boolean
  handleMouseEnter: () => void
  handleMouseLeave: () => void
  showRank?: boolean
  rank?: number
  genres?: Genre[]
  logoPath?: string | null
  className?: string
  progress?: number
  onDismiss?: (movie: Movie) => void
}

export function ExpandMode({
  movie,
  isHovered,
  handleMouseEnter,
  handleMouseLeave,
  showRank,
  rank,
  genres,
  logoPath,
  className,
  progress,
  onDismiss,
}: ExpandModeProps) {
  const genreNames = useGenreNames(movie, genres)

  const trackClick = () => {
    recordAnalyticsEvent({
      eventType: "movie_click",
      mediaId: String(movie.id),
      mediaTitle: movie.title,
      mediaType: movie.mediaType || "movie",
    })
  }

  return (
    <motion.div
      layout
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={false}
      animate={{ width: isHovered ? EXPANDED_W : undefined }}
      transition={{
        layout: { type: "spring", stiffness: 400, damping: 30 },
        default: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
      }}
      className={`group relative z-0 aspect-[2/3] w-48 shrink-0 cursor-pointer overflow-hidden rounded-none border border-border bg-card text-card-foreground hover:z-30 ${className || ""}`}
      style={{
        height: 288,
        boxShadow: isHovered
          ? "0 25px 50px -12px rgba(0, 0, 0, 0.75)"
          : "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      {/* Rank Indicator */}
      {showRank && rank && !isHovered && (
        <div className="pointer-events-none absolute -bottom-2 -left-8 -z-10">
          <h1 className="text-7xl font-black text-transparent transition-all duration-200 [-webkit-text-stroke:2px_#333333] group-hover:text-white/20 lg:text-8xl">
            {rank}
          </h1>
        </div>
      )}

      {/* Dismiss (Continue Watching) — inside the card so hover state stays active */}
      {onDismiss && (
        <button
          type="button"
          aria-label="Remove from Continue Watching"
          onClick={(e) => {
            e.stopPropagation()
            onDismiss(movie)
          }}
          className={`absolute right-2 top-2 z-40 rounded-full bg-black/60 p-1.5 text-white backdrop-blur transition-opacity hover:bg-black/80 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="material-symbols-outlined !text-[14px]">close</span>
        </button>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {!isHovered ? (
          <motion.div
            key="poster"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0"
          >
            <img
              src={getImageUrl(
                movie.posterPath || movie.backdropPath,
                "w500"
              )}
              alt={movie.title}
              className="h-full w-full rounded-none object-cover"
            />
            {progress !== undefined && <ThinProgressBar progress={progress} />}
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex h-full w-full flex-col overflow-hidden"
          >
            {/* Backdrop */}
            <div className="relative h-[55%] w-full shrink-0 bg-black">
              <img
                src={getImageUrl(
                  movie.backdropPath || movie.posterPath,
                  "w780"
                )}
                alt={movie.title}
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-linear-to-t from-card to-transparent" />
              {logoPath && (
                <img
                  src={getImageUrl(logoPath, "w500")}
                  alt={movie.title}
                  className="absolute bottom-2 left-3 z-10 max-h-10 w-auto max-w-[80%] object-contain drop-shadow-lg"
                />
              )}
            </div>

            {/* Details */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <ActionButtons movie={movie} onTrackClick={trackClick} />

              {progress !== undefined && <LabeledProgressBar progress={progress} />}

              <MetadataRow movie={movie} />

              {!logoPath && (
                <h4 className="line-clamp-1 shrink-0 px-3 pb-1 text-xs font-bold text-white">
                  {movie.title}
                </h4>
              )}

              {movie.overview && (
                <p className="line-clamp-2 px-3 pb-1 text-[10px] leading-relaxed text-gray-400">
                  {movie.overview}
                </p>
              )}

              <div className="flex-1" />

              {genreNames.length > 0 && (
                <div className="flex shrink-0 flex-wrap items-center gap-1 px-3 pb-3 text-[11px] font-medium text-gray-300">
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
    </motion.div>
  )
}
