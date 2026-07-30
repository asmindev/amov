import { useCallback, useEffect, useRef, useState } from "react"

export interface WatchProgress {
  id: string | number
  type: "movie" | "tv" | "anime"
  progress: number // percentage 0–100
  timestamp: number // seconds
  duration: number // seconds
  title?: string
  posterPath?: string | null
  backdropPath?: string | null
  season?: number
  episode?: number
  updatedAt: number // Date.now()
}

export interface PlayerMessage {
  id: string | number
  type: "movie" | "tv" | "anime"
  progress: number
  timestamp: number
  duration: number
  season?: number
  episode?: number
}

const STORAGE_KEY = "amov_watch_progress"

function getStorageKey(type: string, id: string | number): string {
  return `${type}_${id}`
}

export function loadAllProgress(): Record<string, WatchProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, WatchProgress>) : {}
  } catch {
    return {}
  }
}

function saveAllProgress(data: Record<string, WatchProgress>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

export function getWatchProgress(
  type: string,
  id: string | number
): WatchProgress | null {
  const all = loadAllProgress()
  return all[getStorageKey(type, id)] ?? null
}

export function clearWatchProgress(type: string, id: string | number) {
  const all = loadAllProgress()
  delete all[getStorageKey(type, id)]
  saveAllProgress(all)
}

/**
 * Hook that listens to Videasy player postMessage events and persists
 * watch progress to localStorage.
 *
 * @param contentType  "movie" | "tv" | "anime"
 * @param contentId    The TMDB content ID
 * @param enabled      Whether the player is currently mounted/visible
 */
export function useWatchProgressTracker(
  contentType: "movie" | "tv" | "anime",
  contentId: string | number,
  enabled: boolean,
  metadata?: { title: string; posterPath: string | null; backdropPath: string | null }
) {
  const [lastProgress, setLastProgress] = useState<WatchProgress | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const persistProgress = useCallback(
    (msg: PlayerMessage) => {
      const key = getStorageKey(contentType, contentId)
      const all = loadAllProgress()
      const entry: WatchProgress = {
        ...msg,
        ...metadata,
        updatedAt: Date.now(),
      }
      all[key] = entry
      saveAllProgress(all)
      setLastProgress(entry)
    },
    [contentType, contentId, metadata]
  )

  useEffect(() => {
    if (!enabled) return

    const handler = (event: MessageEvent) => {
      if (typeof event.data !== "string") return
      try {
        const msg = JSON.parse(event.data) as PlayerMessage
        // Validate it's a Videasy progress message
        if (
          msg &&
          typeof msg.timestamp === "number" &&
          typeof msg.duration === "number"
        ) {
          // Debounce saves to every 5 s to avoid hammering localStorage
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
          saveTimerRef.current = setTimeout(() => {
            persistProgress(msg)
          }, 5000)
        }
      } catch {
        // Non-JSON messages from other iframes — ignore
      }
    }

    window.addEventListener("message", handler)
    return () => {
      window.removeEventListener("message", handler)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [enabled, persistProgress])

  return { lastProgress }
}
