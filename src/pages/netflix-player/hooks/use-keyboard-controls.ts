import { useEffect, type RefObject } from "react"

interface UseKeyboardControlsOpts {
  videoRef: RefObject<HTMLVideoElement | null>
  seek: (delta: number) => void
  showUI: () => void
  toggleFullscreen: () => void
}

export function useKeyboardControls({
  videoRef,
  seek,
  showUI,
  toggleFullscreen,
}: UseKeyboardControlsOpts) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return
      const v = videoRef.current
      if (!v) return
      showUI()
      switch (e.code) {
        case "Space":
        case "KeyK":
          e.preventDefault()
          if (v.paused) {
            void v.play()
          } else {
            v.pause()
          }
          break
        case "ArrowLeft":
        case "KeyJ":
          seek(-10)
          break
        case "ArrowRight":
        case "KeyL":
          seek(10)
          break
        case "ArrowUp":
          v.volume = Math.min(1, v.volume + 0.1)
          break
        case "ArrowDown":
          v.volume = Math.max(0, v.volume - 0.1)
          break
        case "KeyM":
          v.muted = !v.muted
          break
        case "KeyF":
          toggleFullscreen()
          break
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [videoRef, seek, showUI, toggleFullscreen])
}
