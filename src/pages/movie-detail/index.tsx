import { useParams, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  useMovieDetail,
  useSimilarMovies,
  useMovieVideos,
} from "./hooks/use-movie-detail"
import { getImageUrl, getBackdropUrl } from "@/helpers/image-url"
import { formatDate, formatYear } from "@/helpers/format-date"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { MovieCard } from "@/components/movie-card"
import { HOVER_VIDEO_DELAY } from "@/lib/config"
import {
  Play,
  Star,
  Clock,
  Calendar,
  Globe,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  Volume2,
  VolumeX,
} from "lucide-react"

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

export default function MovieDetailPage() {
  const { id } = useParams({ from: "/movie/$id" })
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

  return (
    <div className="relative min-h-svh bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Background Media (Image / Video) */}
      <div className="fixed inset-0 w-full h-[100vh] z-0">
        <img
          src={getBackdropUrl(movie.backdropPath, "original")}
          alt={movie.title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            showVideo ? "opacity-0" : "opacity-100"
          }`}
        />
        {trailer && (
          <div className="absolute inset-0 pointer-events-none">
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
      <div className="relative z-10 min-h-svh flex flex-col justify-end">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-50">
          <Link
            to="/discover"
            className="flex items-center gap-2 rounded-full bg-black/20 border border-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Browse
          </Link>

          {showVideo && (
            <button
              onClick={toggleMute}
              className="rounded-full bg-black/20 border border-white/10 p-3 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105"
            >
              {muted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {/* Hero Info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full px-6 md:px-16 pt-[35vh] pb-8 max-w-6xl"
        >
          {movie.logoPath ? (
            <img
              src={getImageUrl(movie.logoPath, "w500")}
              alt={movie.title}
              className="mb-6 max-h-28 md:max-h-40 w-auto max-w-xs md:max-w-md object-contain drop-shadow-2xl"
            />
          ) : (
            <h1 className="font-heading mb-6 text-5xl md:text-7xl font-black text-white drop-shadow-2xl tracking-tight">
              {movie.title}
            </h1>
          )}

          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm font-medium">
            <span className="flex items-center gap-1.5 text-green-400 bg-green-400/10 px-2 py-1 rounded-md">
              <Star className="h-4 w-4 fill-green-400" />
              {(movie.voteAverage * 10).toFixed(0)}% Match
            </span>
            <span className="text-white/80 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-white/50" />
              {formatYear(movie.releaseDate)}
            </span>
            <span className="text-white/80 flex items-center gap-1.5">
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

          <p className="max-w-2xl text-lg text-white/90 leading-relaxed drop-shadow-md mb-8">
            {movie.overview}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {trailer && !showVideo && (
              <button
                onClick={() => setShowVideo(true)}
                className="flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-bold text-black transition-transform hover:scale-105 active:scale-95"
              >
                <Play className="h-5 w-5 fill-black" />
                Play Trailer
              </button>
            )}
            {movie.imdbId && (
              <a
                href={`https://www.imdb.com/title/${movie.imdbId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-white/20 active:scale-95"
              >
                View on IMDb
              </a>
            )}
          </div>
        </motion.div>

        {/* Content Details Below Fold */}
        <div className="w-full bg-gradient-to-b from-transparent to-background pt-8 pb-32">
          <div className="px-6 md:px-16 max-w-[1400px] mx-auto space-y-20">
            
            {/* Overview & Info Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-12"
            >
              <div className="md:col-span-2 space-y-8">
                {movie.tagline && (
                  <div>
                    <h3 className="text-white/50 text-sm font-semibold uppercase tracking-wider mb-2">
                      Tagline
                    </h3>
                    <p className="text-xl italic text-white/90">
                      "{movie.tagline}"
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-white/50 text-sm font-semibold uppercase tracking-wider mb-4">
                    Genres
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((g) => (
                      <Badge
                        key={g.id}
                        variant="secondary"
                        className="bg-white/5 hover:bg-white/10 text-white/90 px-4 py-1.5 text-sm rounded-full"
                      >
                        {g.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5 backdrop-blur-sm space-y-4">
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
                <h2 className="font-heading text-2xl font-semibold mb-6">Cast & Crew</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {cast.map((member) => (
                    <div
                      key={member.id}
                      className="group flex flex-col items-center text-center"
                    >
                      <div className="mb-4 aspect-square w-full max-w-[140px] overflow-hidden rounded-full bg-white/5 border border-white/10 transition-transform duration-300 group-hover:scale-105 group-hover:border-white/30">
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
                      <p className="text-sm font-bold text-white leading-tight mb-1">
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
                <h2 className="font-heading text-2xl font-semibold mb-6">More Like This</h2>
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
      <span className="text-white/50 text-sm flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="text-right font-semibold text-white/90 text-sm">
        {value}
      </span>
    </div>
  )
}
