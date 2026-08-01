import { useEffect, useRef, type RefObject } from "react"
import type { PlaybackActions } from "../controller/use-player-controller"

const MEDIA_ERROR_MESSAGES: Record<number, string> = {
  1: "Media loading aborted",
  2: "Network error while loading media",
  3: "Media decoding failed",
  4: "Media format not supported or source unavailable",
}

interface UseVideoBindingsOpts {
  videoRef: RefObject<HTMLVideoElement | null>
  actions: Pick<PlaybackActions, "dispatch" | "showUI">
  openMenuRef: RefObject<"settings" | "provider" | "episodes" | null>
  onPlay?: () => void
  onPause?: () => void
}

export function useVideoBindings({
  videoRef,
  actions,
  openMenuRef,
  onPlay,
  onPause,
}: UseVideoBindingsOpts) {
  const dispatchRef = useRef(actions.dispatch)
  const showUIRef = useRef(actions.showUI)
  const openMenuRefInner = useRef(openMenuRef)
  const onPlayRef = useRef(onPlay)
  const onPauseRef = useRef(onPause)

  useEffect(() => {
    dispatchRef.current = actions.dispatch
    showUIRef.current = actions.showUI
    openMenuRefInner.current = openMenuRef
    onPlayRef.current = onPlay
    onPauseRef.current = onPause
  })

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    let rafId = 0
    let pauseDebounce: ReturnType<typeof setTimeout> | null = null
    let bufferingDebounce: ReturnType<typeof setTimeout> | null = null

    const handlePlay = () => {
      dispatchRef.current({ type: "PLAY" })
      onPlayRef.current?.()
    }
    const handlePause = () => {
      if (pauseDebounce) clearTimeout(pauseDebounce)
      pauseDebounce = setTimeout(() => {
        if (v && v.paused && !v.seeking) {
          dispatchRef.current({ type: "PAUSE" })
          onPauseRef.current?.()
        }
      }, 150)
    }
    const handleTimeUpdate = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        dispatchRef.current({ type: "TIMEUPDATE", time: v.currentTime })
      })
    }
    const handleProgress = () => {
      const ranges: { start: number; end: number }[] = []
      for (let i = 0; i < v.buffered.length; i++) {
        ranges.push({ start: v.buffered.start(i), end: v.buffered.end(i) })
      }
      dispatchRef.current({ type: "BUFFERED", ranges })
    }
    const handleDuration = () => {
      if (isFinite(v.duration) && v.duration !== 0) {
        dispatchRef.current({ type: "DURATION", duration: v.duration })
      }
    }
    const handleWaiting = () => {
      if (bufferingDebounce) clearTimeout(bufferingDebounce)
      bufferingDebounce = setTimeout(() => {
        dispatchRef.current({ type: "BUFFERING", buffering: true })
      }, 200)
    }
    const handlePlaying = () => {
      if (bufferingDebounce) clearTimeout(bufferingDebounce)
      dispatchRef.current({ type: "BUFFERING", buffering: false })
      dispatchRef.current({ type: "STREAM_ERROR", error: null })
    }
    const handleVolume = () => {
      dispatchRef.current({
        type: "VOLUME_CHANGE",
        volume: v.volume,
        muted: v.muted,
      })
    }
    const handleError = () => {
      const code = v.error?.code ?? 0
      dispatchRef.current({
        type: "STREAM_ERROR",
        error: {
          type: code === 2 ? "network" : "media",
          message: MEDIA_ERROR_MESSAGES[code] ?? "Video playback failed",
          details: v.error?.message ?? undefined,
        },
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
      if (rafId) cancelAnimationFrame(rafId)
      if (pauseDebounce) clearTimeout(pauseDebounce)
      if (bufferingDebounce) clearTimeout(bufferingDebounce)
    }
  }, [videoRef])
}
