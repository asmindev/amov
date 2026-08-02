import {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
  type RefObject,
} from "react"
import type { WatchProgress } from "@/hooks/use-watch-progress"
import type { PlaybackStore } from "../controller/use-player-controller"

const STORAGE_KEY = "amov_watch_progress"

interface UseProgressSyncOpts {
  videoRef: RefObject<HTMLVideoElement | null>
  mediaType: "movie" | "tv"
  movieId: number
  /** External store from usePlayerController */
  store: PlaybackStore
  /** Seconds between persistence writes (default 5) */
  intervalSeconds?: number
  title?: string
  originalTitle?: string
}

function loadAll(): Record<string, WatchProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, WatchProgress>) : {}
  } catch {
    return {}
  }
}

function saveAll(data: Record<string, WatchProgress>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // quota exceeded
  }
}

/**
 * Periodically persists the player's current playback position
 * to localStorage so it survives provider switches and page refresh.
 *
 * Rewritten from use-progress-persistence: reads `currentTime` and
 * `duration` from the controller store (`store.getSnapshot()`) instead
 * of receiving them as props. The write-to-localStorage logic is
 * preserved unchanged.
 */
export function useProgressSync({
  videoRef,
  mediaType,
  movieId,
  store,
  intervalSeconds = 5,
  title,
  originalTitle,
}: UseProgressSyncOpts) {
  // Subscribe to the two primitives the effect depends on (primitive
  // snapshots keep Object.is comparison working — a fresh object per
  // snapshot would re-render on every store update and reset the timer).
  const playing = useSyncExternalStore(
    store.subscribe,
    useCallback(() => store.getSnapshot().playing, [store])
  )
  const duration = useSyncExternalStore(
    store.subscribe,
    useCallback(() => store.getSnapshot().duration, [store])
  )

  const lastSavedRef = useRef<number>(0)
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!playing || !duration) {
      // Flush final position on pause — read video directly, not the ref (may be stale)
      const v = videoRef.current
      const ts = v && v.paused ? v.currentTime : lastSavedRef.current
      if (ts > 30) {
        const all = loadAll()
        const key = `${mediaType}_${movieId}`
        all[key] = {
          id: movieId,
          type: mediaType,
          progress: (ts / duration) * 100,
          timestamp: ts,
          duration,
          title,
          originalTitle,
          updatedAt: Date.now(),
        }
        saveAll(all)
      }
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current)
        saveTimerRef.current = null
      }
      return
    }

    saveTimerRef.current = setInterval(() => {
      const v = videoRef.current
      if (!v || v.paused || v.ended) return
      const ts = v.currentTime
      if (Math.abs(ts - lastSavedRef.current) < 1) return
      lastSavedRef.current = ts

      const all = loadAll()
      const key = `${mediaType}_${movieId}`
      all[key] = {
        id: movieId,
        type: mediaType,
        progress: duration ? (ts / duration) * 100 : 0,
        timestamp: ts,
        duration,
        title,
        originalTitle,
        updatedAt: Date.now(),
      }
      saveAll(all)
    }, intervalSeconds * 1000)

    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current)
        saveTimerRef.current = null
      }
    }
  }, [playing, duration, mediaType, movieId, videoRef, intervalSeconds])
}
