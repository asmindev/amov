// src/stores/watchlist-store.ts
import { create } from "zustand"

const STORAGE_KEY = "amov_watchlist"

export interface WatchlistEntry {
  id: string | number
  type: "movie" | "tv"
  addedAt: number
}

function getKey(type: string, id: string | number): string {
  return `${type}_${id}`
}

function loadAll(): Record<string, WatchlistEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, WatchlistEntry>) : {}
  } catch {
    return {}
  }
}

function saveAll(items: Record<string, WatchlistEntry>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

interface WatchlistState {
  items: Record<string, WatchlistEntry>
  isLoaded: boolean
  add: (entry: WatchlistEntry) => void
  remove: (type: string, id: string | number) => void
  toggle: (type: string, id: string | number) => void
  isInWatchlist: (type: string, id: string | number) => boolean
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  items: loadAll(),
  isLoaded: true,
  add: (entry) => {
    const key = getKey(entry.type, entry.id)
    const items = { ...get().items, [key]: entry }
    set({ items })
    saveAll(items)
  },
  remove: (type, id) => {
    const key = getKey(type, id)
    const items = { ...get().items }
    delete items[key]
    set({ items })
    saveAll(items)
  },
  toggle: (type, id) => {
    const key = getKey(type, id)
    if (get().items[key]) {
      get().remove(type, id)
    } else {
      get().add({ id, type: type as WatchlistEntry["type"], addedAt: Date.now() })
    }
  },
  isInWatchlist: (type, id) => get().items[getKey(type, id)] !== undefined,
}))
