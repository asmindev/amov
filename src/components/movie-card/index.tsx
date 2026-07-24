import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Plus, ThumbsUp, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { getImageUrl } from "@/helpers/image-url"
import { formatYear } from "@/helpers/format-date"
import { getMovieQuality } from "@/helpers/movie-quality"
import { recordAnalyticsEvent } from "@/api/analytics.api"
import type { Movie, Genre } from "@/types/movie.types"

type MovieCardProps = {
  movie: Movie
  rank?: number
  showRank?: boolean
  genres?: Genre[]
  logoPath?: string | null
  className?: string
  /** Expand on hover (TrendingSection). Default: false (bottom overlay). */
  expandOnHover?: boolean
}

const EXPANDED_W = 320

export function MovieCard({
  movie,
  rank,
  showRank = false,
  genres,
  logoPath,
  className,
  expandOnHover = false,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null)

  const genreNames = (() => {
    if (!genres || !movie.genreIds) return []
    return movie.genreIds
      .slice(0, 3)
      .map((id) => genres.find((g) => g.id === id)?.name)
      .filter(Boolean)
  })()

  const handleMouseEnter = () => {
    const timeout = setTimeout(() => setIsHovered(true), 150)
    setHoverTimeout(timeout)
  }

  const handleMouseLeave = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout)
    setIsHovered(false)
  }

  const trackClick = () => {
    recordAnalyticsEvent({
      eventType: "movie_click",
      mediaId: String(movie.id),
      mediaTitle: movie.title,
      mediaType: movie.mediaType || "movie",
    })
  }

  // ── Expand Mode (TrendingSection) ──
  if (expandOnHover) {
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
                <div className="flex shrink-0 items-center justify-between px-3 pt-3 pb-2">
                  <div className="flex gap-1.5">
                    <Link
                      to="/$type/$id"
                      params={{
                        type: movie.mediaType || "movie",
                        id: String(movie.id),
                      }}
                      className="flex h-7 w-9 items-center justify-center bg-primary transition-colors hover:bg-primary/90"
                      onClick={trackClick}
                    >
                      <span className="material-symbols-outlined fill !text-[18px]">
                        play_arrow
                      </span>
                    </Link>
                    <button className="flex h-7 w-9 items-center justify-center border border-white/20 bg-black/50 text-white transition-colors hover:border-white hover:bg-black/80">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button className="flex h-7 w-9 items-center justify-center border border-white/20 bg-black/50 text-white transition-colors hover:border-white hover:bg-black/80">
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <Link
                    to="/$type/$id"
                    params={{
                      type: movie.mediaType || "movie",
                      id: String(movie.id),
                    }}
                    className="flex h-7 w-9 items-center justify-center border border-white/20 bg-black/50 text-white transition-colors hover:border-white hover:bg-black/80"
                    onClick={trackClick}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Link>
                </div>

                <div className="flex shrink-0 items-center gap-1.5 px-3 pb-1 text-[11px] font-semibold text-gray-400">
                  <span className="font-bold text-green-500">
                    {Math.round(movie.voteAverage * 10)}% Match
                  </span>
                  <span className="rounded border border-white/20 bg-white/5 px-1 text-[10px] font-bold tracking-wider uppercase">
                    {getMovieQuality(movie.popularity, movie.releaseDate)}
                  </span>
                  <span className="rounded border border-white/20 bg-white/5 px-1 text-[10px] font-bold tracking-wider uppercase">
                    {movie.mediaType === "tv" ? "TV" : "Movie"}
                  </span>
                  <span>{formatYear(movie.releaseDate)}</span>
                </div>

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

  // ── Popup Overlay Mode (Discover / Grid) ──
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

              {/* Action buttons + Metadata row */}
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
                    <span className="material-symbols-outlined fill ml-0.5 !text-[20px]">
                      play_arrow
                    </span>
                  </Link>
                  <button className="flex h-7 w-9 items-center justify-center border border-white/20 bg-black/50 text-white transition-colors hover:border-white hover:bg-black/80">
                    <Plus className="h-4 w-4" />
                  </button>
                  <button className="flex h-7 w-9 items-center justify-center border border-white/20 bg-black/50 text-white transition-colors hover:border-white hover:bg-black/80">
                    <ThumbsUp className="h-4 w-4" />
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
                  <ChevronDown className="h-4 w-4" />
                </Link>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-2 text-[12px] font-semibold text-gray-400">
                <span className="font-bold text-green-500">
                  {Math.round(movie.voteAverage * 10)}% Match
                </span>
                <span className="rounded border border-white/20 bg-white/5 px-1 text-[10px] font-bold tracking-wider uppercase">
                  {getMovieQuality(movie.popularity, movie.releaseDate)}
                </span>
                <span className="rounded border border-white/20 bg-white/5 px-1 text-[10px] font-bold tracking-wider uppercase">
                  {movie.mediaType === "tv" ? "TV" : "Movie"}
                </span>
                <span>{formatYear(movie.releaseDate)}</span>
                <span className="text-yellow-500">
                  ★ {movie.voteAverage.toFixed(1)}
                </span>
              </div>

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
