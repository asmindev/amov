// scripts/watchlist-store.selfcheck.ts
// Run: bun run scripts/watchlist-store.selfcheck.ts
// Assert-based self-check — the repo has no test runner (no vitest/bun:test in package.json).
import assert from "node:assert"

// Bun has no built-in localStorage — polyfill for this self-check
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    get length() { return store.size },
    key: (i) => [...store.keys()][i] ?? null,
  } as Storage
}

import { useWatchlistStore } from "../src/stores/watchlist-store"

// Fresh state for each check
localStorage.clear()
useWatchlistStore.setState({ items: {}, isLoaded: false })

// 1. add persists entry with composite key
useWatchlistStore.getState().add({ id: 550, type: "movie", addedAt: 1000 })
const stored = JSON.parse(localStorage.getItem("amov_watchlist")!)
assert.deepEqual(stored["movie_550"], { id: 550, type: "movie", addedAt: 1000 })
console.log("ok: add persists entry with composite key")

// 2. add is idempotent — same key refreshes addedAt
useWatchlistStore.getState().add({ id: 550, type: "movie", addedAt: 2000 })
assert.equal(useWatchlistStore.getState().items["movie_550"].addedAt, 2000)
assert.equal(Object.keys(useWatchlistStore.getState().items).length, 1)
console.log("ok: add is idempotent")

// 3. toggle adds then removes
localStorage.clear()
useWatchlistStore.setState({ items: {}, isLoaded: false })
useWatchlistStore.getState().toggle("movie", 550)
assert.equal(useWatchlistStore.getState().isInWatchlist("movie", 550), true)
useWatchlistStore.getState().toggle("movie", 550)
assert.equal(useWatchlistStore.getState().isInWatchlist("movie", 550), false)
console.log("ok: toggle adds then removes")

// 4. remove deletes from localStorage
useWatchlistStore.getState().add({ id: 550, type: "movie", addedAt: 1000 })
useWatchlistStore.getState().remove("movie", 550)
assert.deepEqual(JSON.parse(localStorage.getItem("amov_watchlist")!), {})
console.log("ok: remove deletes from localStorage")

console.log("\nAll watchlist store checks passed ✓")
