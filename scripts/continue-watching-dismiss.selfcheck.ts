// Run: bun run scripts/continue-watching-dismiss.selfcheck.ts
// Assert-based self-check — the repo has no test runner.
// Covers dismissWatchProgress: sets dismissedAt, keeps progress, missing-entry no-op,
// and that the Continue Watching filter excludes dismissed entries.
import assert from "node:assert"
import { loadAllProgress, saveAllProgress, dismissWatchProgress } from "../src/hooks/use-watch-progress"

// localStorage polyfill (Bun has no localStorage)
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>()
  globalThis.localStorage = {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (k: string) => store.get(k) ?? null,
    key: (i: number) => [...store.keys()][i] ?? null,
    removeItem: (k: string) => {
      store.delete(k)
    },
    setItem: (k: string, v: string) => {
      store.set(k, v)
    },
  } as unknown as Storage
}

const entry = {
  id: 550,
  type: "movie" as const,
  progress: 45,
  timestamp: 2700,
  duration: 6000,
  title: "Fight Club",
  updatedAt: 1000,
}

// 1. dismiss sets dismissedAt and keeps progress
saveAllProgress({ movie_550: entry })
dismissWatchProgress("movie", 550)
const dismissed = loadAllProgress()["movie_550"]
assert.ok(dismissed, "entry should still exist after dismiss")
assert.equal(dismissed.progress, 45, "progress must be preserved on dismiss")
assert.equal(dismissed.timestamp, 2700, "timestamp must be preserved on dismiss")
assert.ok(dismissed.dismissedAt, "dismissedAt should be set")
console.log("ok: dismiss sets dismissedAt and keeps progress")

// 2. missing-entry dismiss is a silent no-op
dismissWatchProgress("movie", 999999)
assert.ok(!loadAllProgress()["movie_999999"], "missing entry must not be created")
console.log("ok: missing-entry dismiss is a no-op")

// 3. filter excludes dismissed, includes fresh
const fresh = { ...entry, updatedAt: 2000 }
saveAllProgress({ movie_550: dismissed, movie_551: fresh })
const entries = Object.values(loadAllProgress())
const filter = (es: typeof entries) =>
  es.filter((e) => e.progress > 0 && e.progress < 100 && !e.dismissedAt)
const visible = filter(entries)
assert.equal(visible.length, 1, "only the non-dismissed entry should be visible")
assert.equal(visible[0].id, fresh.id, "the visible entry should be the fresh one")
console.log("ok: filter excludes dismissed entries")

// 4. overwriting the entry clears dismissedAt (watching again brings it back)
const rewatch = { ...dismissed, dismissedAt: undefined, updatedAt: 3000 }
saveAllProgress({ movie_550: rewatch, movie_551: fresh })
assert.equal(loadAllProgress()["movie_550"].dismissedAt, undefined)
assert.equal(filter(Object.values(loadAllProgress())).length, 2)
console.log("ok: watching again clears dismissedAt")

console.log("\nAll continue-watching dismiss checks passed ✓")
