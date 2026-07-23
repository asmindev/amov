import { useEffect, type RefObject } from "react"

interface UseVideoEventsOpts {
  videoRef: RefObject<HTMLVideoElement | null>
  onPlay: () => void
  onPause: () => void
  onTimeUpdate: () => void
  onDuration: () => void
  onWaiting: () => void
  onPlaying: () => void
  onVolume: () => void
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
}: UseVideoEventsOpts) {
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    v.addEventListener("play", onPlay)
    v.addEventListener("pause", onPause)
    v.addEventListener("timeupdate", onTimeUpdate)
    v.addEventListener("durationchange", onDuration)
    v.addEventListener("waiting", onWaiting)
    v.addEventListener("playing", onPlaying)
    v.addEventListener("volumechange", onVolume)
    return () => {
      v.removeEventListener("play", onPlay)
      v.removeEventListener("pause", onPause)
      v.removeEventListener("timeupdate", onTimeUpdate)
      v.removeEventListener("durationchange", onDuration)
      v.removeEventListener("waiting", onWaiting)
      v.removeEventListener("playing", onPlaying)
      v.removeEventListener("volumechange", onVolume)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
