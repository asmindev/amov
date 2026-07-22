import { useCallback, useEffect, useRef, useState } from "react"
import { Link } from "@tanstack/react-router"
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { getImageUrl } from "@/helpers/image-url"
import {
  SLIDE_INTERVAL,
  HOVER_VIDEO_DELAY,
  HERO_MAX_VISIBLE,
} from "@/lib/config"
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
      className="relative h-[614px] w-full overflow-hidden md:h-[870px]"
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
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-r from-background via-background/20 to-transparent" />

      {video && (
        <iframe
          key={movie.id}
          ref={iframeRef}
          src={`https://www.youtube.com/embed/${video.key}?autoplay=1&mute=1&enablejsapi=1&controls=0&rel=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1`}
          className={`yt-player z-[1] transition-opacity duration-500 ${
            showVideo ? "opacity-100" : "pointer-events-none opacity-0"
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

      <div className="absolute bottom-0 left-0 z-10 block w-full px-8 pt-24 pb-12 md:px-16">
        {detail?.logoPath ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${detail.logoPath}`}
            alt={movie.title}
            className={`w-auto max-w-1/2 origin-bottom-left object-contain drop-shadow-lg transition-all duration-700 ${
              showVideo ? "h-12 md:h-16" : "h-16 md:h-24"
            }`}
          />
        ) : (
          <h1
            className={`origin-bottom-left font-heading font-black tracking-tighter text-white drop-shadow-2xl transition-all duration-700 ${
              showVideo
                ? "text-3xl md:text-4xl lg:text-5xl"
                : "text-4xl md:text-6xl lg:text-7xl"
            }`}
          >
            {movie.title}
          </h1>
        )}
        <div
          className={`overflow-hidden transition-all duration-700 ${
            showVideo ? "mt-0 max-h-0 opacity-0" : "mt-4 max-h-32 opacity-100"
          }`}
        >
          <p className="line-clamp-3 max-w-2xl text-sm leading-relaxed text-gray-300 drop-shadow md:text-base">
            {movie.overview}
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm font-semibold tracking-wide">
          <span className="text-green-500">
            {Math.round(movie.voteAverage * 10)}% Match
          </span>
          <span className="text-white">{movie.releaseDate?.split("-")[0]}</span>
          <span className="rounded border border-white/20 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
            HD
          </span>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Link
            to="/movie/$id"
            params={{ id: movie.id.toString() }}
            search={{ play: true }}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
          >
            <span className="material-symbols-outlined fill !text-[20px]">
              play_arrow
            </span>
            Play
          </Link>
          <Link
            to="/movie/$id"
            params={{ id: movie.id.toString() }}
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-white/20 active:scale-95"
          >
            <span className="material-symbols-outlined !text-[20px]">info</span>
            Detail
          </Link>
        </div>

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

      <div className="absolute right-4 bottom-4 z-20 flex items-center gap-2">
        <button
          onClick={() =>
            goTo(currentIndex - 1 < 0 ? visibleCount - 1 : currentIndex - 1)
          }
          className="rounded-full bg-white/10 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() =>
            goTo(currentIndex + 1 >= visibleCount ? 0 : currentIndex + 1)
          }
          className="rounded-full bg-white/10 p-2 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
