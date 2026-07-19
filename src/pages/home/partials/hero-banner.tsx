import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Play, Volume2, VolumeX } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { getImageUrl } from "@/helpers/image-url"
import { formatRating } from "@/helpers/format-rating"
import { SLIDE_INTERVAL, HOVER_VIDEO_DELAY, HERO_MAX_VISIBLE } from "@/lib/config"
import { useMovieVideos } from "../hooks/use-movie-videos"
import { useMovieDetail } from "../hooks/use-movie-detail"
import type { Movie } from "@/types/movie.types"

type HeroBannerProps = {
  movies: Movie[]
}

export function HeroBanner({ movies }: HeroBannerProps) {
  const visibleCount = Math.min(movies.length, HERO_MAX_VISIBLE)

  const [currentIndex, setCurrentIndex] = useState(0)
  const movie = movies[currentIndex]
  const { data: video } = useMovieVideos(String(movie.id))
  const { data: detail } = useMovieDetail(String(movie.id))
  const [showVideo, setShowVideo] = useState(false)
  const [muted, setMuted] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const iframeRef = useRef<HTMLIFrameElement>(null)

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

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index)
    setShowVideo(false)
    setMuted(true)
  }, [])

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1 >= visibleCount ? 0 : prev + 1))
    setShowVideo(false)
    setMuted(true)
  }, [visibleCount])

  useEffect(() => {
    if (showVideo || isHovered) return
    const id = setTimeout(goNext, SLIDE_INTERVAL)
    return () => clearTimeout(id)
  }, [currentIndex, showVideo, isHovered, goNext])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    hoverTimer.current = setTimeout(() => {
      setShowVideo(true)
    }, HOVER_VIDEO_DELAY)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    clearTimeout(hoverTimer.current)
    setShowVideo(false)
  }, [])

  useEffect(() => {
    const timer = hoverTimer.current
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isHovered) return
    clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => {
      setShowVideo(true)
    }, HOVER_VIDEO_DELAY)
    return () => clearTimeout(hoverTimer.current)
  }, [currentIndex, isHovered])

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

  return (
    <div
      className="relative h-[85vh] w-full overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {movies.slice(0, visibleCount).map((m, i) => (
        <img
          key={m.id}
          src={getImageUrl(m.backdropPath, "original")}
          alt={m.title}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {video && (
        <iframe
          key={movie.id}
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${video.key}?autoplay=1&mute=1&enablejsapi=1&controls=0&rel=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1`}
          className={`yt-player transition-opacity duration-500 ${
            showVideo ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          title={movie.title}
        />
      )}

      {video && showVideo && (
        <button
          onClick={toggleMute}
          className="absolute top-1/2 right-6 z-20 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
        >
          {muted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <div className="absolute bottom-0 left-0 z-10 block w-full px-8 pb-12 pt-24 md:px-16">
        {detail?.logoPath ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${detail.logoPath}`}
            alt={movie.title}
            className="h-16 md:h-24 w-auto max-w-1/2 object-contain drop-shadow-lg"
          />
        ) : (
          <h1 className="font-heading text-4xl font-bold text-white drop-shadow-lg md:text-6xl lg:text-7xl">
            {movie.title}
          </h1>
        )}
        <p className="mt-4 max-w-2xl text-sm text-white/80 line-clamp-3 drop-shadow md:text-base">
          {movie.overview}
        </p>
        <div className="mt-4 flex items-center gap-4 text-sm text-white/80">
          <span className="rounded bg-primary/80 px-3 py-1 text-xs font-semibold text-primary-foreground">
            {formatRating(movie.voteAverage)}
          </span>
          <span>{movie.releaseDate?.split("-")[0]}</span>
        </div>
        {video && (
          <button
            onClick={() => setShowVideo(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-2 text-sm font-semibold text-black transition-transform hover:scale-105"
          >
            <Play className="h-5 w-5 fill-black" />
            Nonton
          </button>
        )}

        <div
          className="flex items-center justify-center gap-1.5 pb-4"
          role="tablist"
          aria-label="Movie slides"
        >
          {Array.from({ length: visibleCount }).map((_, i) => (
            <motion.button
              layout
              key={i}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === currentIndex}
              aria-label={`Slide ${i + 1}`}
              className={`relative rounded-full ${
                i === currentIndex
                  ? "h-1.5 w-12 bg-white/20"
                  : "h-1.5 w-1.5 bg-white/50 hover:bg-white/80"
              }`}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <AnimatePresence>
                {i === currentIndex && (
                  <motion.span
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 rounded-full bg-white"
                    style={{
                      animation:
                        !showVideo && !isHovered
                          ? "timer-progress 6s linear forwards"
                          : "none",
                    }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() =>
            goTo(
              currentIndex - 1 < 0 ? visibleCount - 1 : currentIndex - 1
            )
          }
          className="rounded-full bg-white/10 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() =>
            goTo(
              currentIndex + 1 >= visibleCount ? 0 : currentIndex + 1
            )
          }
          className="rounded-full bg-white/10 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
