import { useEffect, type RefObject } from "react"
import Hls from "hls.js"
import type { StreamSource } from "@/api/decryptor.api"
import { DECRYPTOR_URL } from "@/lib/config"
import { getSavedTimestamp } from "../helpers/get-saved-timestamp"

interface UseHlsLoaderOpts {
  videoRef: RefObject<HTMLVideoElement | null>
  hlsRef: RefObject<Hls | null>
  sources: StreamSource[]
  selectedQuality: number
  movieId: number
}

export function useHlsLoader({
  videoRef,
  hlsRef,
  sources,
  selectedQuality,
  movieId,
}: UseHlsLoaderOpts) {
  useEffect(() => {
    const video = videoRef.current
    if (!video || sources.length === 0) return
    const src = sources[selectedQuality]?.url
    if (!src) return

    const savedTs = getSavedTimestamp(movieId)

    hlsRef.current?.destroy()
    hlsRef.current = null

    const isHls = src.includes(".m3u8") || src.includes("/hls/")
    if (Hls.isSupported() && isHls) {
      let currentRemoteBase = ""
      if (src.startsWith("http://") || src.startsWith("https://")) {
        currentRemoteBase = src.substring(0, src.lastIndexOf("/") + 1)
      }

      const hls = new Hls({
        startPosition: savedTs > 30 ? savedTs : -1,
        xhrSetup: (xhr, url) => {
          let targetUrl = url
          const localHost = window.location.host
          const isLocal =
            url.includes(localHost) ||
            url.includes("/api/decryptor") ||
            (!url.startsWith("http://") && !url.startsWith("https://"))

          if (isLocal && currentRemoteBase) {
            const relativePath = url
              .replace(/^https?:\/\/[^/]+/, "")
              .replace(/^\/api\/decryptor\//, "")
              .replace(/^\//, "")
            targetUrl = new URL(relativePath, currentRemoteBase).toString()
          } else if (!isLocal) {
            currentRemoteBase = url.substring(0, url.lastIndexOf("/") + 1)
          }

          const proxyUrl = `${DECRYPTOR_URL}/proxy?url=${encodeURIComponent(targetUrl)}`
          xhr.open("GET", proxyUrl, true)
        },
      })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        void video.play()
      })
      hlsRef.current = hls
    } else {
      const proxiedUrl = src.startsWith("http")
        ? `${DECRYPTOR_URL}/proxy?url=${encodeURIComponent(src)}`
        : src

      video.src = proxiedUrl

      if (savedTs > 30) {
        video.addEventListener(
          "loadedmetadata",
          () => {
            video.currentTime = savedTs
          },
          { once: true }
        )
      }
      void video.play().catch(() => {})
    }
    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [sources, selectedQuality, movieId]) // eslint-disable-line react-hooks/exhaustive-deps
}
