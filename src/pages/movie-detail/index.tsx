import { useParams, useSearch } from "@tanstack/react-router"
import { useState, useEffect, useRef, useCallback } from "react"
import {
  useMovieDetail,
  useSimilarMovies,
  useMovieVideos,
} from "./hooks/use-movie-detail"
import { HOVER_VIDEO_DELAY } from "@/lib/config"
import { Skeleton } from "@/components/ui/skeleton"
import { getWatchProgress } from "@/hooks/use-watch-progress"

// Import modular partial components
import { MoviePlayer } from "./partials/movie-player"
import { MovieBillboard } from "./partials/movie-billboard"
import { MovieHero } from "./partials/movie-hero"
import { DetailsSection } from "./partials/details-section"
import { CastSection } from "./partials/cast-section"
import { SimilarSection } from "./partials/similar-section"

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
      <MovieBillboard
        movie={movie}
        trailer={trailer}
        showVideo={showVideo}
        iframeRef={iframeRef}
      />

      {/* Foreground Content */}
      <div className="relative z-10 flex min-h-svh flex-col justify-end">
        {/* Hero Info */}
        <MovieHero
          movie={movie}
          trailer={trailer}
          showVideo={showVideo}
          muted={muted}
          toggleMute={toggleMute}
          savedProgress={savedProgress}
          setShowVideo={setShowVideo}
        />

        {/* Content Details Below Fold */}
        <div className="w-full bg-gradient-to-b from-transparent to-background pt-8 pb-32">
          <div className="mx-auto max-w-[1400px] space-y-20 px-6 md:px-16">
            {/* Overview & Info Section */}
            <DetailsSection movie={movie} />

            {/* Cast Section */}
            <CastSection cast={cast} />

            {/* Similar Movies Section */}
            <SimilarSection similarMovies={similarMovies} />
          </div>
        </div>
      </div>
    </div>
  )
}
