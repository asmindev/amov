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

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current
    const v = videoRef.current

    try {
      const currentFs =
        document.fullscreenElement ||
        (document as unknown as { webkitFullscreenElement?: Element })
          .webkitFullscreenElement

      if (currentFs) {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if (
          (
            document as unknown as {
              webkitExitFullscreen?: () => Promise<void>
            }
          ).webkitExitFullscreen
        ) {
          await (
            document as unknown as { webkitExitFullscreen: () => Promise<void> }
          ).webkitExitFullscreen()
        }
      } else if (el) {
        const elWithWebkit = el as unknown as {
          requestFullscreen?: () => Promise<void>
          webkitRequestFullscreen?: () => Promise<void>
        }
        if (elWithWebkit.requestFullscreen) {
          await elWithWebkit.requestFullscreen()
        } else if (elWithWebkit.webkitRequestFullscreen) {
          await elWithWebkit.webkitRequestFullscreen()
        } else {
          throw new Error("Fullscreen API not supported on element")
        }
      }
    } catch {
      // Fallback for older iOS (<17.4): native video player
      if (
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
    }
  }, [containerRef, videoRef])

  return { fullscreen, iosNativeFullscreen, toggleFullscreen }
}
