import { useEffect, useRef, type RefObject } from "react"
import type { WatchProgress } from "@/hooks/use-watch-progress"

const STORAGE_KEY = "amov_watch_progress"

interface UseProgressPersistenceOpts {
  videoRef: RefObject<HTMLVideoElement | null>
  mediaType: "movie" | "tv"
  movieId: number
  duration: number
  playing: boolean
  /** Seconds between persistence writes (default 5) */
  intervalSeconds?: number
  /** Display metadata for Continue Watching on home page */
  title?: string
  posterPath?: string | null
  backdropPath?: string | null
}

function loadAll(): Record<string, WatchProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
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
 * Periodically persists the video's current playback position
 * to localStorage so it survives provider switches and page refresh.
 */
export function useProgressPersistence({
  videoRef,
  mediaType,
  movieId,
  duration,
  playing,
  intervalSeconds = 5,
  title,
  posterPath,
  backdropPath,
}: UseProgressPersistenceOpts) {
  const lastSavedRef = useRef<number>(0)
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!playing || !duration) {
      // Flush final position on pause before clearing
      const v = videoRef.current
      if (v && lastSavedRef.current > 30) {
        const all = loadAll()
        const key = `${mediaType}_${movieId}`
        all[key] = {
          id: movieId,
          type: mediaType,
          progress: (lastSavedRef.current / duration) * 100,
          timestamp: lastSavedRef.current,
          duration,
          title: title ?? undefined,
          posterPath: posterPath ?? undefined,
          backdropPath: backdropPath ?? undefined,
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
        title: title ?? undefined,
        posterPath: posterPath ?? undefined,
        backdropPath: backdropPath ?? undefined,
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
