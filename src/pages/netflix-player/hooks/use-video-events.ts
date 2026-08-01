import { useEffect, useRef, type RefObject } from "react"
import type { StreamError } from "./use-hls-loader"

interface UseVideoEventsOpts {
  videoRef: RefObject<HTMLVideoElement | null>
  onPlay: () => void
  onPause: () => void
  onTimeUpdate: () => void
  onProgress: () => void
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
  onProgress,
  onDuration,
  onWaiting,
  onPlaying,
  onVolume,
  onError,
}: UseVideoEventsOpts) {
  const onPlayRef = useRef(onPlay)
  const onPauseRef = useRef(onPause)
  const onTimeUpdateRef = useRef(onTimeUpdate)
  const onProgressRef = useRef(onProgress)
  const onDurationRef = useRef(onDuration)
  const onWaitingRef = useRef(onWaiting)
  const onPlayingRef = useRef(onPlaying)
  const onVolumeRef = useRef(onVolume)
  const onErrorRef = useRef(onError)

  // Sync refs inside effect (not during render)
  useEffect(() => {
    onPlayRef.current = onPlay
    onPauseRef.current = onPause
    onTimeUpdateRef.current = onTimeUpdate
    onProgressRef.current = onProgress
    onDurationRef.current = onDuration
    onWaitingRef.current = onWaiting
    onPlayingRef.current = onPlaying
    onVolumeRef.current = onVolume
    onErrorRef.current = onError
  })

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const handlePlay = () => onPlayRef.current()
    const handlePause = () => onPauseRef.current()
    const handleTimeUpdate = () => onTimeUpdateRef.current()
    const handleProgress = () => onProgressRef.current()
    const handleDuration = () => onDurationRef.current()
    const handleWaiting = () => onWaitingRef.current()
    const handlePlaying = () => onPlayingRef.current()
    const handleVolume = () => onVolumeRef.current()
    const handleError = () => {
      const code = v.error?.code ?? 0
      onErrorRef.current?.({
        type: code === 2 ? "network" : "media",
        message: MEDIA_ERROR_MESSAGES[code] ?? "Video playback failed",
        details: v.error?.message ?? undefined,
      })
    }

    v.addEventListener("play", handlePlay)
    v.addEventListener("pause", handlePause)
    v.addEventListener("timeupdate", handleTimeUpdate)
    v.addEventListener("progress", handleProgress)
    v.addEventListener("durationchange", handleDuration)
    v.addEventListener("waiting", handleWaiting)
    v.addEventListener("playing", handlePlaying)
    v.addEventListener("volumechange", handleVolume)
    v.addEventListener("error", handleError)
    return () => {
      v.removeEventListener("play", handlePlay)
      v.removeEventListener("pause", handlePause)
      v.removeEventListener("timeupdate", handleTimeUpdate)
      v.removeEventListener("progress", handleProgress)
      v.removeEventListener("durationchange", handleDuration)
      v.removeEventListener("waiting", handleWaiting)
      v.removeEventListener("playing", handlePlaying)
      v.removeEventListener("volumechange", handleVolume)
      v.removeEventListener("error", handleError)
    }
  }, [videoRef])
}
