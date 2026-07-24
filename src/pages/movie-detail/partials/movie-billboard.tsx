import type { RefObject } from "react"
import { getBackdropUrl } from "@/helpers/image-url"

interface MovieBillboardProps {
  movie: {
    backdropPath: string | null
    title: string
  }
  trailer?: {
    key: string
  }
  showVideo: boolean
  iframeRef: RefObject<HTMLIFrameElement | null>
}

export function MovieBillboard({
  movie,
  trailer,
  showVideo,
  iframeRef,
}: MovieBillboardProps) {
  return (
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
            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&enablejsapi=1&controls=0&rel=0&disablekb=1&fs=0&iv_load_policy=3&playsinline=1&loop=1&playlist=${trailer.key}`}
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
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-background/80 via-background/20 to-transparent" />
    </div>
  )
}
