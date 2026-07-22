import { motion, AnimatePresence } from "motion/react"
import { getMovieQuality } from "@/helpers/movie-quality"

interface PausedOverlayProps {
  playing: boolean
  buffering: boolean
  isFetchingProvider: boolean
  openMenu: "settings" | "provider" | null
  movieTitle: string
  movieYear: string
  voteAverage: number
  popularity: number
  movieOverview?: string
  logoPath?: string | null
}

export function PausedOverlay({
  playing,
  buffering,
  isFetchingProvider,
  openMenu,
  movieTitle,
  movieYear,
  voteAverage,
  popularity,
  movieOverview,
  logoPath,
}: PausedOverlayProps) {
  return (
    <AnimatePresence>
      {!playing &&
        !buffering &&
        !isFetchingProvider &&
        openMenu !== "settings" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute inset-0 z-20 flex items-end bg-gradient-to-r from-black/85 via-black/40 to-transparent p-8 pb-28 text-white md:p-16 md:pb-36"
          >
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }}
              className="max-w-md space-y-4 md:max-w-xl lg:max-w-2xl"
            >
              {/* Floating logo/title */}
              {logoPath ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${logoPath}`}
                  alt={movieTitle}
                  className="h-auto max-h-20 w-auto max-w-[85%] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] md:max-h-28 lg:max-h-36"
                />
              ) : (
                <h2 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] md:text-5xl lg:text-6xl">
                  {movieTitle}
                </h2>
              )}

              {/* Metadata Row */}
              <div className="flex items-center gap-3 text-sm font-bold text-gray-300">
                {voteAverage > 0 && (
                  <span className="font-bold text-green-500">
                    {Math.round(voteAverage * 10)}% Match
                  </span>
                )}
                <span>{movieYear}</span>
                <span className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                  {getMovieQuality(popularity, movieYear)}
                </span>
              </div>

              {/* Description */}
              {movieOverview && (
                <p className="line-clamp-4 text-sm leading-relaxed text-gray-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] md:text-base md:leading-loose">
                  {movieOverview}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
    </AnimatePresence>
  )
}
