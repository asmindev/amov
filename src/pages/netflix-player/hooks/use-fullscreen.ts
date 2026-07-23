import { useState, useEffect, useCallback, type RefObject } from "react"

export function useFullscreen(
  containerRef: RefObject<HTMLDivElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>
) {
  const [fullscreen, setFullscreen] = useState(false)
  const [iosNativeFullscreen, setIosNativeFullscreen] = useState(false)

  // ── Fullscreen sync ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => {
      const isFs =
        !!document.fullscreenElement ||
        !!(document as unknown as { webkitFullscreenElement?: Element })
          .webkitFullscreenElement
      setFullscreen(isFs)
    }

    document.addEventListener("fullscreenchange", handler)
    document.addEventListener("webkitfullscreenchange", handler)

    const v = videoRef.current
    const onWebkitBeginFs = () => {
      setFullscreen(true)
      setIosNativeFullscreen(true)
    }
    const onWebkitEndFs = () => {
      setFullscreen(false)
      setIosNativeFullscreen(false)
    }

    if (v) {
      v.addEventListener("webkitbeginfullscreen", onWebkitBeginFs)
      v.addEventListener("webkitendfullscreen", onWebkitEndFs)
    }

    return () => {
      document.removeEventListener("fullscreenchange", handler)
      document.removeEventListener("webkitfullscreenchange", handler)
      if (v) {
        v.removeEventListener("webkitbeginfullscreen", onWebkitBeginFs)
        v.removeEventListener("webkitendfullscreen", onWebkitEndFs)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current
    const v = videoRef.current

    if (el && typeof el.requestFullscreen === "function") {
      if (!document.fullscreenElement) {
        void el.requestFullscreen()
      } else {
        void document.exitFullscreen()
      }
    } else if (
      v &&
      "webkitEnterFullscreen" in v &&
      typeof (v as unknown as { webkitEnterFullscreen: () => void })
        .webkitEnterFullscreen === "function"
    ) {
      const iosVideo = v as unknown as {
        webkitEnterFullscreen: () => void
        webkitExitFullscreen: () => void
        webkitDisplayingFullscreen?: boolean
      }
      if (iosVideo.webkitDisplayingFullscreen) {
        iosVideo.webkitExitFullscreen?.()
      } else {
        iosVideo.webkitEnterFullscreen()
      }
    }
  }, [containerRef, videoRef])

  return { fullscreen, iosNativeFullscreen, toggleFullscreen }
}
