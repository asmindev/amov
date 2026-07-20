import { useParams, Link } from "@tanstack/react-router"
import { motion } from "motion/react"
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
import {
  Play,
  Star,
  Clock,
  Calendar,
  Globe,
  TrendingUp,
  DollarSign,
  ChevronLeft,
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

  const trailer = videos?.results.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  )

  if (isPending) {
    return (
      <div className="min-h-svh">
        <Skeleton className="h-[60vh] w-full rounded-none" />
        <div className="mx-auto max-w-6xl px-6 pt-8 space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-24 w-full" />
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

  const similarMovies = similar?.results.slice(0, 10) ?? []

  return (
    <div className="min-h-svh bg-background">
      {/* Hero backdrop */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <img
          src={getBackdropUrl(movie.backdropPath, "original")}
          alt={movie.title}
          className="h-full w-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

        {/* Back button */}
        <Link
          to="/discover"
          className="absolute left-6 top-6 flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute bottom-0 left-0 right-0 px-6 pb-10 md:px-12 lg:px-20"
        >
          {/* Logo or title */}
          {movie.logoPath ? (
            <img
              src={getImageUrl(movie.logoPath, "w500")}
              alt={movie.title}
              className="mb-4 max-h-24 w-auto max-w-xs object-contain drop-shadow-2xl lg:max-h-32 lg:max-w-sm"
            />
          ) : (
            <h1 className="font-heading mb-4 text-4xl font-black text-white drop-shadow-2xl lg:text-6xl">
              {movie.title}
            </h1>
          )}

          {/* Meta row */}
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1 font-semibold text-yellow-400">
              <Star className="h-4 w-4 fill-yellow-400" />
              {movie.voteAverage.toFixed(1)}
              <span className="text-white/50 font-normal">
                ({movie.voteCount.toLocaleString()})
              </span>
            </span>
            <span className="text-white/60">·</span>
            <span className="flex items-center gap-1 text-white/70">
              <Clock className="h-3.5 w-3.5" />
              {formatRuntime(movie.runtime)}
            </span>
            <span className="text-white/60">·</span>
            <span className="flex items-center gap-1 text-white/70">
              <Calendar className="h-3.5 w-3.5" />
              {formatYear(movie.releaseDate)}
            </span>
            <span className="text-white/60">·</span>
            <span className="flex items-center gap-1 text-white/70 uppercase text-xs">
              <Globe className="h-3.5 w-3.5" />
              {movie.originalLanguage}
            </span>
          </div>

          {/* Genres */}
          <div className="mb-5 flex flex-wrap gap-2">
            {movie.genres.map((g) => (
              <Badge key={g.id} variant="outline" className="border-white/20 text-white/80 bg-white/5">
                {g.name}
              </Badge>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {trailer ? (
              <a
                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/90 active:scale-95"
              >
                <Play className="h-4 w-4 fill-black" />
                Play Trailer
              </a>
            ) : null}
            {movie.imdbId && (
              <a
                href={`https://www.imdb.com/title/${movie.imdbId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg bg-yellow-400/10 border border-yellow-400/30 px-6 py-3 text-sm font-bold text-yellow-400 transition hover:bg-yellow-400/20"
              >
                IMDb
              </a>
            )}
          </div>
        </motion.div>
      </div>

      {/* Content below fold */}
      <div className="mx-auto max-w-6xl px-6 pb-20 md:px-12 lg:px-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
          {/* Left column */}
          <div>
            {/* Tagline */}
            {movie.tagline && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-8 mb-4 text-lg italic text-white/50"
              >
                "{movie.tagline}"
              </motion.p>
            )}

            {/* Overview */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="leading-relaxed text-white/80 text-[15px]"
            >
              {movie.overview || "No overview available."}
            </motion.p>

            {/* Cast */}
            {movie.cast && movie.cast.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-10"
              >
                <h2 className="font-heading mb-4 text-xl font-semibold">Cast</h2>
                <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
                  {movie.cast.slice(0, 15).map((member) => (
                    <div
                      key={member.id}
                      className="flex-shrink-0 w-24 text-center"
                    >
                      <div className="mb-2 h-24 w-24 overflow-hidden rounded-full bg-white/5">
                        <img
                          src={getImageUrl(member.profilePath, "w185")}
                          alt={member.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=333&color=fff&size=96`
                          }}
                        />
                      </div>
                      <p className="text-[11px] font-semibold text-white leading-tight line-clamp-2">
                        {member.name}
                      </p>
                      <p className="text-[10px] text-white/50 mt-0.5 line-clamp-1">
                        {member.character}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Similar movies */}
            {similarMovies.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12"
              >
                <h2 className="font-heading mb-4 text-xl font-semibold">
                  More Like This
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                  {similarMovies.map((m) => (
                    <MovieCard key={m.id} movie={m} className="w-full" />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-8 space-y-6 lg:mt-8"
          >
            {/* Poster */}
            <div className="overflow-hidden rounded-xl shadow-2xl shadow-black/60">
              <img
                src={getImageUrl(movie.posterPath, "w500")}
                alt={movie.title}
                className="w-full object-cover"
              />
            </div>

            {/* Info table */}
            <div className="space-y-3 rounded-xl bg-white/5 p-4 text-sm">
              <InfoRow label="Status" value={movie.status} />
              <InfoRow
                label="Release Date"
                value={formatDate(movie.releaseDate ?? "")}
              />
              <InfoRow
                label="Runtime"
                value={formatRuntime(movie.runtime)}
                icon={<Clock className="h-3.5 w-3.5" />}
              />
              <InfoRow
                label="Budget"
                value={formatMoney(movie.budget)}
                icon={<DollarSign className="h-3.5 w-3.5" />}
              />
              <InfoRow
                label="Revenue"
                value={formatMoney(movie.revenue)}
                icon={<TrendingUp className="h-3.5 w-3.5" />}
              />
              <InfoRow
                label="Popularity"
                value={movie.popularity.toFixed(1)}
              />
              <InfoRow
                label="Language"
                value={movie.originalLanguage.toUpperCase()}
                icon={<Globe className="h-3.5 w-3.5" />}
              />
            </div>
          </motion.div>
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
    <div className="flex items-start justify-between gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
      <span className="text-white/50 shrink-0">{label}</span>
      <span className="text-right font-medium text-white flex items-center gap-1">
        {icon}
        {value}
      </span>
    </div>
  )
}
