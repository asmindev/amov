import { useEffect, type RefObject } from "react"
import dashjs from "dashjs"
import type { StreamSource } from "@/api/decryptor.api"
import { DECRYPTOR_URL } from "@/lib/config"
import { getSavedTimestamp } from "../helpers/get-saved-timestamp"
import type { StreamError } from "./use-hls-loader"

interface UseDashLoaderOpts {
  videoRef: RefObject<HTMLVideoElement | null>
  mediaType: "movie" | "tv"
  sources: StreamSource[]
  selectedQuality: number
  retryKey: number
  movieId: number
  imdbId?: string
  season?: number
  episode?: number
  onError?: (error: StreamError) => void
}

export function useDashLoader({
  videoRef,
  mediaType,
  sources,
  selectedQuality,
  retryKey,
  movieId,
  imdbId,
  season,
  episode,
  onError,
}: UseDashLoaderOpts) {
  useEffect(() => {
    const video = videoRef.current
    if (!video || sources.length === 0) return
    const sourceObj = sources[selectedQuality]
    const src = sourceObj?.url
    if (!src) return

    const isDash = src.includes(".mpd") || sourceObj?.type === "dash"
    if (!isDash) return

    const buildProxyUrl = (targetUrl: string) => {
      let pUrl = `${DECRYPTOR_URL}/proxy?url=${encodeURIComponent(targetUrl)}`
      if (imdbId) pUrl += `&imdbId=${encodeURIComponent(imdbId)}`
      if (season) pUrl += `&season=${season}`
      if (episode) pUrl += `&episode=${episode}`
      if (sourceObj?.headers) {
        pUrl += `&headers=${encodeURIComponent(typeof sourceObj.headers === "string" ? sourceObj.headers : JSON.stringify(sourceObj.headers))}`
      }
      return pUrl
    }

    const savedTs = getSavedTimestamp(mediaType, movieId)
    const proxiedUrl = buildProxyUrl(src)

    const player = dashjs.MediaPlayer().create()
    player.initialize(video, proxiedUrl, true)
    if (savedTs > 30) {
      player.seek(savedTs)
    }
    player.on(dashjs.MediaPlayer.events.ERROR, (e) => {
      console.warn("DASH playback error:", e)
      onError?.({
        type: "media",
        message: "DASH playback error",
        details: (e as { message?: string })?.message ?? "Unknown DASH error",
      })
    })

    return () => {
      player.reset()
    }
  }, [sources, selectedQuality, retryKey, movieId]) // eslint-disable-line react-hooks/exhaustive-deps
}
