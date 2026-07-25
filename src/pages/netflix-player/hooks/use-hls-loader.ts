import { useEffect, type RefObject } from "react"
import Hls from "hls.js"
import type { StreamSource } from "@/api/decryptor.api"
import { DECRYPTOR_URL } from "@/lib/config"
import { getSavedTimestamp } from "../helpers/get-saved-timestamp"

export interface StreamError {
  type: "network" | "media" | "source" | "unknown"
  message: string
  details?: string
}

interface UseHlsLoaderOpts {
  videoRef: RefObject<HTMLVideoElement | null>
  hlsRef: RefObject<Hls | null>
  sources: StreamSource[]
  selectedQuality: number
  retryKey: number
  movieId: number
  imdbId?: string
  season?: number
  episode?: number
  onError?: (error: StreamError) => void
  onNetworkError?: () => void
}

export function useHlsLoader({
  videoRef,
  hlsRef,
  sources,
  selectedQuality,
  retryKey,
  movieId,
  imdbId,
  season,
  episode,
  onError,
  onNetworkError,
}: UseHlsLoaderOpts) {
  useEffect(() => {
    const video = videoRef.current
    if (!video || sources.length === 0) return
    const sourceObj = sources[selectedQuality]
    const src = sourceObj?.url
    if (!src) return

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
        enableWorker: true,
        startFragPrefetch: true,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        backBufferLength: 60,
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

          const proxyUrl = buildProxyUrl(targetUrl)
          xhr.open("GET", proxyUrl, true)
        },
      })

      let networkErrorCount = 0
      const MAX_NETWORK_ERRORS = 3

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              networkErrorCount++
              if (networkErrorCount >= MAX_NETWORK_ERRORS) {
                onError?.({
                  type: "network",
                  message: "Stream unreachable",
                  details: `CDN returned errors after ${MAX_NETWORK_ERRORS} attempts. The source may be offline.`,
                })
                hls.destroy()
              } else {
                hls.startLoad()
              }
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              onError?.({
                type: "media",
                message: "Playback error",
                details:
                  data.details ?? "The media format could not be decoded.",
              })
              hls.destroy()
              break
            default:
              onError?.({
                type: "unknown",
                message: "Stream error",
                details: data.details,
              })
              hls.destroy()
              break
          }
        } else if (
          data.type === Hls.ErrorTypes.NETWORK_ERROR &&
          data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR
        ) {
          onNetworkError?.()
        }
      })

      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        void video.play()
      })
      hlsRef.current = hls
    } else {
      const proxiedUrl = src.startsWith("http") ? buildProxyUrl(src) : src

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
  }, [sources, selectedQuality, retryKey, movieId]) // eslint-disable-line react-hooks/exhaustive-deps
}
