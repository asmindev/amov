import { Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { Volume2, VolumeX, History, RotateCcw } from "lucide-react"
import { getImageUrl } from "@/helpers/image-url"
import { formatYear } from "@/helpers/format-date"
import { getMovieQuality } from "@/helpers/movie-quality"
import { getMaturityRating } from "@/helpers/maturity-rating"
import { clearWatchProgress } from "@/hooks/use-watch-progress"

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
  }
  trailer?: {
    key: string
  }
  showVideo: boolean
  muted: boolean
  toggleMute: () => void
  savedProgress: {
    timestamp: number
    duration: number
  } | null
  setShowVideo: (show: boolean) => void
}

export function MovieHero({
  movie,
  trailer,
  showVideo,
  muted,
  toggleMute,
  savedProgress,
  setShowVideo,
}: MovieHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-[1400px] px-6 pt-[35vh] pb-8 md:px-16"
    >
      {showVideo && (
        <button
          onClick={toggleMute}
          className="absolute right-6 bottom-8 z-50 rounded-full border border-white/10 bg-black/20 p-3 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 md:right-16 md:bottom-8"
        >
          {muted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>
      )}
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
        <span className="text-gray-300">
          {formatYear(movie.releaseDate)}
        </span>
        <span className="rounded-none border border-white/20 bg-white/5 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-white uppercase">
          {getMaturityRating(movie.genres, movie.voteAverage)}
        </span>
        <span className="text-gray-300">{formatRuntime(movie.runtime)}</span>
        <span className="rounded-none border border-white/20 bg-white/5 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-white uppercase">
          {getMovieQuality(movie.popularity, movie.releaseDate)}
        </span>
        <span className="rounded-none border border-white/20 bg-white/5 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-white uppercase">
          HD
        </span>
      </div>

      <p className="mb-8 max-w-2xl text-lg leading-relaxed text-white/90 drop-shadow-md">
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
              <History className="h-3 w-3 text-primary" />
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
            onClick={() => clearWatchProgress("movie", movie.id)}
            className="mt-1.5 flex items-center gap-1 text-xs text-white/40 transition-colors hover:text-white/70"
          >
            <RotateCcw className="h-3 w-3" />
            Start from beginning
          </button>
        </motion.div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Link
          to="/movie/$id"
          params={{ id: movie.id.toString() }}
          search={{ play: true }}
          className="flex items-center gap-2 rounded-none bg-white px-8 py-3.5 text-base font-bold text-black shadow-lg transition-all hover:scale-105 hover:bg-gray-200 active:scale-95"
        >
          <span className="material-symbols-outlined fill !text-[24px]">
            play_arrow
          </span>
          {savedProgress && savedProgress.timestamp > 30 ? "Resume" : "Play"}
        </Link>

        <Link
          to="/movie/$id/netflix"
          params={{ id: movie.id.toString() }}
          className="flex items-center gap-2 rounded-none bg-white/15 px-8 py-3.5 text-base font-bold text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/25 active:scale-95"
        >
          <span className="material-symbols-outlined !text-[24px]">
            live_tv
          </span>
          Custom Player
        </Link>

        {trailer && !showVideo && (
          <button
            onClick={() => setShowVideo(true)}
            className="flex items-center gap-2 rounded-none bg-white/15 px-8 py-3.5 text-base font-bold text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/25 active:scale-95"
          >
            <span className="material-symbols-outlined !text-[24px]">
              movie
            </span>
            Trailer
          </button>
        )}
        {movie.imdbId && (
          <a
            href={`https://www.imdb.com/title/${movie.imdbId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-none bg-white/15 px-8 py-3.5 text-base font-bold text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/25 active:scale-95"
          >
            <span className="material-symbols-outlined !text-[24px]">
              open_in_new
            </span>
            IMDb
          </a>
        )}
      </div>
    </motion.div>
  )
}
