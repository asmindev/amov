import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { motion } from "motion/react"
import { getImageUrl } from "@/helpers/image-url"
import { formatYear } from "@/helpers/format-date"
import { getMovieQuality } from "@/helpers/movie-quality"
import { getMaturityRating } from "@/helpers/maturity-rating"
import { clearWatchProgress } from "@/hooks/use-watch-progress"
import { useWatchlistStore } from "@/stores/watchlist-store"
import { useInWatchlist } from "@/hooks/use-watchlist"
import { useAuthStore } from "@/stores/auth-store"
import { createWatchpartyRoom } from "@/api/watchparty.api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function formatRuntime(minutes: number | null): string {
  if (!minutes) return "N/A"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}

interface MovieHeroProps {
  movie: {
    id: number
    title: string
    logoPath: string | null
    voteAverage: number
    releaseDate?: string
    genres: { id: number; name: string }[]
    runtime: number | null
    popularity: number
    overview: string
    imdbId: string | null
    mediaType?: "movie" | "tv"
  }
  savedProgress: {
    timestamp: number
    duration: number
  } | null
}

export function MovieHero({ movie, savedProgress }: MovieHeroProps) {
  const mediaType = movie.mediaType || "movie"
  const inList = useInWatchlist(mediaType, movie.id)
  const toggle = useWatchlistStore((s) => s.toggle)
  const navigate = useNavigate()
  const { user, setAuthModalOpen } = useAuthStore()
  const [creatingRoom, setCreatingRoom] = useState(false)
  const [roomError, setRoomError] = useState<string | null>(null)

  const handleStartWatchparty = async () => {
    if (!user) {
      setAuthModalOpen(true, "signin")
      return
    }
    if (creatingRoom) return
    setCreatingRoom(true)
    setRoomError(null)
    try {
      const room = await createWatchpartyRoom({
        tmdbId: movie.id,
        title: movie.title,
        mediaType,
      })
      if (room) {
        await navigate({
          to: "/$type/$id/netflix",
          params: { type: mediaType, id: movie.id.toString() },
          search: { room: room.slug },
        })
      } else {
        setRoomError("Couldn't start a watchparty. Check that Supabase is configured and try again.")
      }
    } finally {
      setCreatingRoom(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-[1400px] px-6 pt-[62vh] pb-8 md:px-16 md:pt-[35vh]"
    >
      {movie.logoPath ? (
        <img
          src={getImageUrl(movie.logoPath, "w500")}
          alt={movie.title}
          className="mb-6 max-h-28 w-auto max-w-xs object-contain drop-shadow-2xl md:max-h-40 md:max-w-md"
        />
      ) : (
        <h1 className="mb-6 font-heading text-5xl font-black tracking-tight text-white drop-shadow-2xl md:text-7xl">
          {movie.title}
        </h1>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3.5 text-sm font-bold">
        {movie.voteAverage > 0 && (
          <span className="text-[#46d369]">
            {(movie.voteAverage * 10).toFixed(0)}% Match
          </span>
        )}
        <span className="text-gray-300">{formatYear(movie.releaseDate)}</span>
        <span className="rounded-none border border-white/20 bg-white/5 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-white uppercase">
          {getMaturityRating(movie.genres, movie.voteAverage)}
        </span>
        <span className="text-gray-300">{formatRuntime(movie.runtime)}</span>
        <span className="rounded-none border border-white/20 bg-white/5 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-white uppercase">
          {getMovieQuality(movie.popularity, movie.releaseDate)}
        </span>
      </div>

      <p className="hidden max-w-2xl text-lg leading-relaxed text-white/90 drop-shadow-md md:mb-8 md:block">
        {movie.overview}
      </p>

      {/* ── Watch progress banner ── */}
      {savedProgress && savedProgress.timestamp > 30 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 max-w-sm"
        >
          <div className="mb-1.5 flex items-center justify-between text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined !text-[12px] text-primary">history</span>
              Continue watching
            </span>
            <span className="font-mono">
              {formatTimestamp(Math.floor(savedProgress.timestamp))}
              {savedProgress.duration > 0 &&
                ` / ${formatTimestamp(Math.floor(savedProgress.duration))}`}
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/10">
            <div
              className="h-1.5 bg-primary transition-all duration-300"
              style={{
                width:
                  savedProgress.duration > 0
                    ? `${Math.min(100, (savedProgress.timestamp / savedProgress.duration) * 100).toFixed(1)}%`
                    : "0%",
              }}
            />
          </div>
          <button
            onClick={() => clearWatchProgress(mediaType, movie.id)}
            className="mt-1.5 flex items-center gap-1 text-xs text-white/40 transition-colors hover:text-white/70"
          >
            <span className="material-symbols-outlined !text-[12px] ">replay</span>
            Start from beginning
          </button>
        </motion.div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-4">
        <Link
          to="/$type/$id/netflix"
          params={{ type: mediaType, id: movie.id.toString() }}
          className="flex items-center gap-1.5 rounded-none bg-primary px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-gray-200 active:scale-95 md:gap-2 md:px-8 md:py-3.5 md:text-base"
        >
          <span className="material-symbols-outlined fill text-xl md:text-2xl!">
            play_arrow
          </span>
          {savedProgress && savedProgress.timestamp > 30 ? "Resume" : "Play"}
        </Link>

        <button
          type="button"
          onClick={handleStartWatchparty}
          disabled={creatingRoom}
          className="flex items-center gap-1.5 rounded-none bg-white/15 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/25 active:scale-95 md:gap-2 md:px-8 md:py-3.5 md:text-base disabled:opacity-60"
        >
          {creatingRoom ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <span className="material-symbols-outlined !text-[20px] md:!text-[24px]">
              groups
            </span>
          )}
          Watchparty
        </button>

        {roomError && (
          <p className="w-full text-xs text-red-400">{roomError}</p>
        )}

        {/* button watchlist */}
        <Button
          type="button"
          aria-pressed={inList}
          onClick={() => mediaType && toggle(mediaType, movie.id)}
          className={cn(
            "flex items-center gap-1.5 rounded-none px-5 py-3 text-sm font-bold text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95 md:gap-2 md:px-8 md:py-3.5 md:text-base",
            inList
              ? "bg-primary hover:bg-gray-200"
              : "bg-white/15 hover:bg-white/25"
          )}
        >
          {inList ? (
            <span className="material-symbols-outlined !text-[16px] ">check</span>
          ) : (
            <span className="material-symbols-outlined !text-[16px] ">add</span>
          )}
          {inList ? "In Watchlist" : "Add to Watchlist"}
        </Button>
      </div>
    </motion.div>
  )
}
