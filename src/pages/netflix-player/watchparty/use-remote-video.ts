import { useCallback, useRef, type RefObject } from "react"

/**
 * Imperative application of remote watchparty commands (play/pause/seek) to the
 * video DOM element.
 *
 * We deliberately write to videoRef directly instead of flowing through React
 * state, so a remote seek never triggers the player's own render loop.
 *
 * Anti-echo design: every play/pause is broadcast from the player's native DOM
 * `play`/`pause` event (see hls-player.tsx), which also covers programmatic
 * autoplay from the HLS/DASH loaders and keyboard controls. To stop a remote
 * play/pause from being re-broadcast back out (and looping around the room),
 * `applyRemotePlay` and `applyRemotePause` set `remoteAppliedRef` before
 * touching the DOM; the DOM handler checks it and skips the broadcast for that
 * one event.
 */
export function useRemoteVideo({
  videoRef,
}: {
  videoRef: RefObject<HTMLVideoElement | null>
}) {
  const remoteAppliedRef = useRef(false)

  const applyRemotePlay = useCallback(() => {
    const v = videoRef.current
    if (!v || !v.paused) return
    remoteAppliedRef.current = true
    void v.play().catch(() => {})
  }, [videoRef])

  const applyRemotePause = useCallback(() => {
    const v = videoRef.current
    if (!v || v.paused) return
    remoteAppliedRef.current = true
    v.pause()
  }, [videoRef])

  const applyRemoteSeek = useCallback(
    (t: number) => {
      const v = videoRef.current
      if (!v || !isFinite(t)) return
      v.currentTime = t
    },
    [videoRef]
  )

  return { applyRemotePlay, applyRemotePause, applyRemoteSeek, remoteAppliedRef }
}
