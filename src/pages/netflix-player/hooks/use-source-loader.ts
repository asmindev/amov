import { useEffect, useRef, type RefObject } from "react"
import Hls from "hls.js"
import * as dashjs from "dashjs"
import type { StreamSource } from "@/api/decryptor.api"
import { DECRYPTOR_URL } from "@/lib/config"
import { getSavedTimestamp } from "../helpers/get-saved-timestamp"
import type { PlaybackActions } from "../controller/use-player-controller"

export interface StreamError {
  type: "network" | "media" | "source" | "unknown"
  message: string
  details?: string
}

interface UseSourceLoaderOpts {
  videoRef: RefObject<HTMLVideoElement | null>
  hlsRef: RefObject<Hls | null>
  actions: Pick<PlaybackActions, "dispatch">
  sources: StreamSource[]
  selectedQuality: number
  retryKey: number
  mediaType: "movie" | "tv"
  movieId: number
  imdbId?: string
  season?: number
  episode?: number
}

/**
 * Combined HLS + DASH source loader.
 *
 * Ports the instantiation logic from use-hls-loader and use-dash-loader
 * (config preserved as-is) but reports failures through the reducer via
 * `actions.dispatch` instead of `onError` callbacks:
 * - fatal HLS errors / DASH errors -> STREAM_ERROR
 * - non-fatal FRAG_LOAD_ERROR -> INCR_NETWORK_ERROR
 * - fresh stream metadata -> SET_STREAMS
 *
 * The effect re-runs when the selected quality, retry key, or source list
 * changes; `sources` must be referentially stable for providers that
 * refetch in place.
 */
export function useSourceLoader({
  videoRef,
  hlsRef,
  actions,
  sources,
  selectedQuality,
  retryKey,
  mediaType,
  movieId,
  imdbId,
  season,
  episode,
}: UseSourceLoaderOpts) {
  const dispatchRef = useRef(actions.dispatch)

  // Sync the dispatch ref on every render (actions object identity is stable,
  // but keep the pattern consistent with the other rewired hooks).
  useEffect(() => {
    dispatchRef.current = actions.dispatch
  })

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

    const savedTs = getSavedTimestamp(mediaType, movieId)
    const isHls = src.includes(".m3u8")
    const isDash = src.includes(".mpd") || sourceObj?.type === "dash"

    if (isDash && !(Hls.isSupported() && isHls)) {
      // ── DASH path (preserved from use-dash-loader) ──
      const proxiedUrl = buildProxyUrl(src)

      const player = dashjs.MediaPlayer().create()
      player.initialize(video, proxiedUrl, true)
      if (savedTs > 30) {
        player.seek(savedTs)
      }
      player.on(dashjs.MediaPlayer.events.ERROR, (e: dashjs.ErrorEvent) => {
        console.warn("DASH playback error:", e)
        dispatchRef.current({
          type: "STREAM_ERROR",
          error: {
            type: "media",
            message: "DASH playback error",
            details: (e as { message?: string })?.message ?? "Unknown DASH error"
          }
        })
      })

      return () => {
        player.reset()
      }
    }

    hlsRef.current?.destroy()
    hlsRef.current = null

    if (Hls.isSupported() && isHls) {
      // ── HLS path (config preserved from use-hls-loader) ──
      let currentRemoteBase = ""
      if (src.startsWith("http://") || src.startsWith("https://")) {
        currentRemoteBase = src.substring(0, src.lastIndexOf("/") + 1)
      }

      const hls = new Hls({
        enableWorker: true,
        startFragPrefetch: true,
        maxBufferLength: 60,
        maxMaxBufferLength: 120,
        backBufferLength: 60,
        startPosition: savedTs > 30 ? savedTs : -1,
        xhrSetup: (xhr, url) => {
          let targetUrl = url

          // If currentRemoteBase is known and the URL points to our host
          // but not the CDN, it's a domain-relative path (e.g. /seg/001.ts)
          // that got resolved against the proxy response URL instead of the CDN.
          if (currentRemoteBase) {
            try {
              const cdnHost = new URL(currentRemoteBase).host
              const isCdnUrl = url.includes(cdnHost)
              const isLocalhost = url.startsWith("http://localhost") || url.startsWith("https://localhost")
              if (!isCdnUrl && (isLocalhost || url.includes(window.location.host))) {
                const protocolIdx = url.indexOf("://") + 3
                const path = url.substring(url.indexOf("/", protocolIdx))
                targetUrl = new URL(path, currentRemoteBase).toString()
              } else if (!isCdnUrl && !isLocalhost && !url.startsWith("http")) {
                targetUrl = new URL(url, currentRemoteBase).toString()
              } else if (isCdnUrl) {
                currentRemoteBase = url.substring(0, url.lastIndexOf("/") + 1)
              }
            } catch {
              // fall through with targetUrl = url
            }
          } else if (url.startsWith("http")) {
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
                dispatchRef.current({
                  type: "STREAM_ERROR",
                  error: {
                    type: "network",
                    message: "Stream unreachable",
                    details: `CDN returned errors after ${MAX_NETWORK_ERRORS} attempts. The source may be offline.`
                  }
                })
                hls.destroy()
              } else {
                hls.startLoad()
              }
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              dispatchRef.current({
                type: "STREAM_ERROR",
                error: {
                  type: "media",
                  message: "Playback error",
                  details:
                    data.details ?? "The media format could not be decoded."
                }
              })
              hls.destroy()
              break
            default:
              dispatchRef.current({
                type: "STREAM_ERROR",
                error: {
                  type: "unknown",
                  message: "Stream error",
                  details: data.details
                }
              })
              hls.destroy()
              break
          }
        } else if (
          data.type === Hls.ErrorTypes.NETWORK_ERROR &&
          data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR
        ) {
          dispatchRef.current({ type: "INCR_NETWORK_ERROR" })
        }
      })

      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        void video.play()
      })
      hlsRef.current = hls
    } else {
      // ── Plain video fallback (non-HLS / unsupported) ──
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
