import { Link } from "@tanstack/react-router"
import { motion, AnimatePresence } from "motion/react"
import {
  useWatchProgressTracker,
  getWatchProgress,
} from "@/hooks/use-watch-progress"

const PLAYER_COLOR = "EF4444"

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}

interface MoviePlayerProps {
  movieId: number
  movieTitle: string
  mediaType?: "movie" | "tv"
  season?: number
  episode?: number
}

export function MoviePlayer({
  movieId,
  movieTitle,
  mediaType = "movie",
  season = 1,
  episode = 1,
}: MoviePlayerProps) {
  const isTv = mediaType === "tv"
  const saved = getWatchProgress(mediaType, movieId)

  const baseUrl = isTv
    ? `https://player.videasy.net/tv/${movieId}/${season}/${episode}`
    : `https://player.videasy.net/movie/${movieId}`

  const playerUrl = [
    baseUrl,
    `?color=${PLAYER_COLOR}`,
    `&overlay=true`,
    saved && saved.timestamp > 30
      ? `&progress=${Math.floor(saved.timestamp)}`
      : "",
  ].join("")

  useWatchProgressTracker(mediaType, movieId, true)

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      <iframe
        key={playerUrl}
        src={playerUrl}
        className="h-full w-full border-0"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture"
        title={movieTitle}
      />

      <Link
        to="/$type/$id"
        params={{ type: mediaType, id: movieId.toString() }}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20"
      >
        <span className="material-symbols-outlined !text-[16px] ">chevron_left</span>
        Back to Details
      </Link>

      {saved && saved.timestamp > 30 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute right-6 bottom-20 z-50 flex items-center gap-3 rounded-xl border border-red-500/30 bg-black/70 px-5 py-3 text-sm text-white shadow-xl backdrop-blur-md"
          >
            <span className="material-symbols-outlined !text-[16px] shrink-0 text-red-400">history</span>
            <span>
              Resumed from{" "}
              <span className="font-bold text-red-400">
                {formatTimestamp(Math.floor(saved.timestamp))}
              </span>
            </span>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
