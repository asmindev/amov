import { useParams, useSearch, Link } from "@tanstack/react-router"
import { motion, AnimatePresence } from "motion/react"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  useMovieDetail,
  useSimilarMovies,
  useMovieVideos,
} from "./hooks/use-movie-detail"
import { getImageUrl, getBackdropUrl } from "@/helpers/image-url"
import { formatDate, formatYear } from "@/helpers/format-date"
import { HOVER_VIDEO_DELAY } from "@/lib/config"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { MovieCard } from "@/components/movie-card"
import {
  useWatchProgressTracker,
  getWatchProgress,
  clearWatchProgress,
} from "@/hooks/use-watch-progress"
import {
  Play,
  Star,
  Clock,
  Calendar,
  Globe,
  TrendingUp,
  DollarSign,
  Volume2,
  VolumeX,
  ChevronLeft,
  RotateCcw,
  History,
  MonitorPlay,
} from "lucide-react"

// Videasy player accent color — red theme (#EF4444)
const PLAYER_COLOR = "EF4444"

function formatRuntime(minutes: number | null): string {
  if (!minutes) return "N/A"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function formatMoney(amount: number): string {
  if (!amount) return "N/A"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount)
}

function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${m}:${String(s).padStart(2, "0")}`
}

// ─── Dedicated player view with all Videasy features ─────────────────────────

function MoviePlayer({
  movieId,
  movieTitle,
}: {
  movieId: number
  movieTitle: string
}) {
  // Load saved progress before mounting the iframe (so URL is stable)
  const saved = getWatchProgress("movie", movieId)

  // Build the Videasy embed URL with ALL supported parameters
  const playerUrl = [
    `https://player.videasy.net/movie/${movieId}`,
    `?color=${PLAYER_COLOR}`,
    `&overlay=true`,
    saved && saved.timestamp > 30
      ? `&progress=${Math.floor(saved.timestamp)}`
      : "",
  ].join("")

  // Track live progress → localStorage
  useWatchProgressTracker("movie", movieId, true)

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

      {/* Back button */}
      <Link
        to="/movie/$id"
        params={{ id: movieId.toString() }}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Details
      </Link>

      {/* Resume indicator — shown briefly when resuming */}
      {saved && saved.timestamp > 30 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute right-6 bottom-20 z-50 flex items-center gap-3 rounded-xl border border-red-500/30 bg-black/70 px-5 py-3 text-sm text-white shadow-xl backdrop-blur-md"
          >
            <History className="h-4 w-4 shrink-0 text-red-400" />
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MovieDetailPage() {
  const { id } = useParams({ from: "/movie/$id" })
  const { play } = useSearch({ from: "/movie/$id" })
  const { data: movie, isPending, isError } = useMovieDetail(id)
  const { data: similar } = useSimilarMovies(id)
  const { data: videos } = useMovieVideos(id)

  const [showVideo, setShowVideo] = useState(false)
  const [muted, setMuted] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const trailer = videos?.results.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  )

  const postCommand = useCallback((func: string, args = "") => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "*"
    )
  }, [])

  const toggleMute = useCallback(() => {
    if (muted) {
      postCommand("unMute")
      postCommand("setVolume", "100")
    } else {
      postCommand("mute")
    }
    setMuted((prev) => !prev)
  }, [muted, postCommand])

  // Auto-play trailer after delay
  useEffect(() => {
    if (!trailer) return
    const timer = setTimeout(() => setShowVideo(true), HOVER_VIDEO_DELAY * 2)
    return () => clearTimeout(timer)
  }, [trailer])

  useEffect(() => {
    if (showVideo) {
      postCommand("playVideo")
      if (!muted) {
        postCommand("unMute")
        postCommand("setVolume", "100")
      }
    } else {
      postCommand("pauseVideo")
    }
  }, [showVideo, muted, postCommand])

  if (isPending) {
    return (
      <div className="min-h-svh bg-background">
        <Skeleton className="h-[100vh] w-full rounded-none" />
        <div className="absolute bottom-20 left-10 space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
      </div>
    )
  }

  if (isError || !movie) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-destructive">Failed to load movie details.</p>
      </div>
    )
  }

  const similarMovies = similar?.results.slice(0, 12) ?? []
  const cast = movie.cast?.slice(0, 18) ?? []
  const savedProgress = getWatchProgress("movie", movie.id)

  if (play) {
    return <MoviePlayer movieId={movie.id} movieTitle={movie.title} />
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Background Media (Image / Video) */}
      <div className="fixed inset-0 z-0 h-[100vh] w-full">
        <img
          src={getBackdropUrl(movie.backdropPath, "original")}
          alt={movie.title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            showVideo ? "opacity-0" : "opacity-100"
          }`}
        />
        {trailer && (
          <div className="pointer-events-none absolute inset-0">
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&enablejsapi=1&controls=0&rel=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1`}
              className={`yt-player transition-opacity duration-1000 ${
                showVideo ? "opacity-100" : "opacity-0"
              }`}
              allow="autoplay; encrypted-media"
              allowFullScreen
              title={movie.title}
            />
          </div>
        )}

        {/* Gradients to blend background into content */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex min-h-svh flex-col justify-end">
        {/* Hero Info */}
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

          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm font-medium">
            <span className="flex items-center gap-1.5 rounded-md bg-green-400/10 px-2 py-1 text-green-400">
              <Star className="h-4 w-4 fill-green-400" />
              {(movie.voteAverage * 10).toFixed(0)}% Match
            </span>
            <span className="flex items-center gap-1.5 text-white/80">
              <Calendar className="h-4 w-4 text-white/50" />
              {formatYear(movie.releaseDate)}
            </span>
            <span className="flex items-center gap-1.5 text-white/80">
              <Clock className="h-4 w-4 text-white/50" />
              {formatRuntime(movie.runtime)}
            </span>
            <Badge
              variant="outline"
              className="border-white/20 bg-white/10 text-white"
            >
              HD
            </Badge>
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
              <div className="h-1 w-full rounded-full bg-white/10">
                <div
                  className="h-1 rounded-full bg-primary transition-all duration-300"
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
              className="flex items-center gap-2 rounded-md bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
            >
              <Play className="h-5 w-5 fill-primary-foreground" />
              {savedProgress && savedProgress.timestamp > 30
                ? "Continue Watching"
                : "Watch Movie"}
            </Link>

            <Link
              to="/movie/$id/netflix"
              params={{ id: movie.id.toString() }}
              className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-8 py-3.5 text-base font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95"
            >
              <MonitorPlay className="h-5 w-5" />
              Custom Player
            </Link>

            {trailer && !showVideo && (
              <button
                onClick={() => setShowVideo(true)}
                className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-8 py-3.5 text-base font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95"
              >
                Trailer
              </button>
            )}
            {movie.imdbId && (
              <a
                href={`https://www.imdb.com/title/${movie.imdbId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-8 py-3.5 text-base font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20 active:scale-95"
              >
                View on IMDb
              </a>
            )}
          </div>
        </motion.div>

        {/* Content Details Below Fold */}
        <div className="w-full bg-gradient-to-b from-transparent to-background pt-8 pb-32">
          <div className="mx-auto max-w-[1400px] space-y-20 px-6 md:px-16">
            {/* Overview & Info Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 gap-12 md:grid-cols-3"
            >
              <div className="space-y-8 md:col-span-2">
                {movie.tagline && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold tracking-wider text-white/50 uppercase">
                      Tagline
                    </h3>
                    <p className="text-xl text-white/90 italic">
                      &ldquo;{movie.tagline}&rdquo;
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="mb-4 text-sm font-semibold tracking-wider text-white/50 uppercase">
                    Genres
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((g) => (
                      <Badge
                        key={g.id}
                        variant="secondary"
                        className="rounded-full bg-white/5 px-4 py-1.5 text-sm text-white/90 hover:bg-white/10"
                      >
                        {g.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4 rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
                  <InfoRow label="Status" value={movie.status} />
                  <InfoRow
                    label="Release Date"
                    value={formatDate(movie.releaseDate ?? "")}
                  />
                  <InfoRow
                    label="Original Language"
                    value={movie.originalLanguage.toUpperCase()}
                    icon={<Globe className="h-4 w-4" />}
                  />
                  <InfoRow
                    label="Budget"
                    value={formatMoney(movie.budget)}
                    icon={<DollarSign className="h-4 w-4" />}
                  />
                  <InfoRow
                    label="Revenue"
                    value={formatMoney(movie.revenue)}
                    icon={<TrendingUp className="h-4 w-4" />}
                  />
                </div>
              </div>
            </motion.section>

            {/* Cast Section */}
            {cast.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="mb-6 font-heading text-2xl font-semibold">
                  Cast & Crew
                </h2>
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 md:gap-6 lg:grid-cols-8">
                  {cast.map((member) => (
                    <div
                      key={member.id}
                      className="group flex flex-col items-center text-center"
                    >
                      <div className="mb-3 aspect-square w-full max-w-[96px] overflow-hidden rounded-full border border-white/10 bg-white/5 transition-transform duration-300 group-hover:scale-105 group-hover:border-white/30">
                        <img
                          src={getImageUrl(member.profilePath, "w185")}
                          alt={member.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              member.name
                            )}&background=111&color=fff&size=200`
                          }}
                        />
                      </div>
                      <p className="mb-1 text-sm leading-tight font-bold text-white">
                        {member.name}
                      </p>
                      <p className="text-xs text-white/50">
                        {member.character}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Similar Movies Section */}
            {similarMovies.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="mb-6 font-heading text-2xl font-semibold">
                  More Like This
                </h2>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {similarMovies.map((m) => (
                    <MovieCard key={m.id} movie={m} className="w-full" />
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="flex items-center gap-2 text-sm text-white/50">
        {icon}
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-white/90">
        {value}
      </span>
    </div>
  )
}
