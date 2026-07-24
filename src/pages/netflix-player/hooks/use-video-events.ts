import { useEffect, type RefObject } from "react"
import type { StreamError } from "./use-hls-loader"

interface UseVideoEventsOpts {
  videoRef: RefObject<HTMLVideoElement | null>
  onPlay: () => void
  onPause: () => void
  onTimeUpdate: () => void
  onDuration: () => void
  onWaiting: () => void
  onPlaying: () => void
  onVolume: () => void
  onError?: (error: StreamError) => void
}

const MEDIA_ERROR_MESSAGES: Record<number, string> = {
  1: "Media loading aborted",
  2: "Network error while loading media",
  3: "Media decoding failed",
  4: "Media format not supported or source unavailable",
}

export function useVideoEvents({
  videoRef,
  onPlay,
  onPause,
  onTimeUpdate,
  onDuration,
  onWaiting,
  onPlaying,
  onVolume,
  onError,
}: UseVideoEventsOpts) {
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const handleError = () => {
      const code = v.error?.code ?? 0
      onError?.({
        type: code === 2 ? "network" : "media",
        message: MEDIA_ERROR_MESSAGES[code] ?? "Video playback failed",
        details: v.error?.message ?? undefined,
      })
    }

    v.addEventListener("play", onPlay)
    v.addEventListener("pause", onPause)
    v.addEventListener("timeupdate", onTimeUpdate)
    v.addEventListener("durationchange", onDuration)
    v.addEventListener("waiting", onWaiting)
    v.addEventListener("playing", onPlaying)
    v.addEventListener("volumechange", onVolume)
    v.addEventListener("error", handleError)
    return () => {
      v.removeEventListener("play", onPlay)
      v.removeEventListener("pause", onPause)
      v.removeEventListener("timeupdate", onTimeUpdate)
      v.removeEventListener("durationchange", onDuration)
      v.removeEventListener("waiting", onWaiting)
      v.removeEventListener("playing", onPlaying)
      v.removeEventListener("volumechange", onVolume)
      v.removeEventListener("error", handleError)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
