# Player Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the monolithic `hls-player.tsx` (883 lines, 22 useState, 90 hook calls) into a clean controller + UI architecture with `useSyncExternalStore` selectors and code-split lazy modals, while maintaining ALL existing features (playback, HLS/DASH, subtitles, quality, settings, episodes, watchparty, progress persistence, keyboard, fullscreen).

**Architecture:** One `useReducer` + external store (`useSyncExternalStore`) for all playback state. Hooks dispatch actions (video events → dispatch, source loader → dispatch, subtitle engine → dispatch). Partial components subscribe to minimal slices via selectors — only BottomControls and SubtitleOverlay re-render on `timeupdate`. Settings modal and episodes drawer are lazy-loaded. Watchparty hooks remain imperative (bypass reducer).

**Tech Stack:** React 19, `useSyncExternalStoreWithSelector`, `@supabase/supabase-js` (realtime), HLS.js, dashjs, Tailwind v4, shadcn/ui, TanStack Router

## Global Constraints

- No new runtime dependencies
- `localStorage` keys unchanged: `amov_watch_progress`, `amov_sub_*`, `amov_watchlist`
- HLS/DASH loader config preserved as-is (startPosition, proxy URL, failover logic)
- All Supabase operations go through existing `supabase` client from `@/lib/supabase`
- Repo conventions: no semicolons, double quotes, trailing commas (ES5), kebab-case files, `@/` alias
- `verbatimModuleSyntax` enabled — use `import type` for type-only imports
- No test framework — verification via `bun run typecheck`, `bun run lint`, `bun run build`
- Watchparty hooks (`src/pages/netflix-player/watchparty/`) are reused as-is, only wiring changes
- Movie-detail migration: delete iframe `movie-player.tsx`, remove `showVideo` state

---

### Task 1: Controller Types & Reducer

**Files:**
- Create: `src/pages/netflix-player/controller/types.ts`
- Create: `src/pages/netflix-player/controller/reducer.ts`

**Interfaces:**
- Produces: `PlaybackState`, `PlaybackAction` types, `playbackReducer(state, action)` pure function

- [ ] **Step 1: Create `controller/types.ts` with PlaybackState and PlaybackAction**

```ts
// src/pages/netflix-player/controller/types.ts
import type { StreamSource, StreamSubtitle } from "@/api/decryptor.api"
import type { DecryptorProvider } from "@/lib/config"
import type { ParsedCue } from "../hooks/use-subtitles"
import type { StreamError } from "../hooks/use-hls-loader"

export interface PlaybackState {
  // Core
  playing: boolean
  currentTime: number
  duration: number
  bufferedRanges: { start: number; end: number }[]
  volume: number
  muted: boolean
  playbackRate: number

  // Loading
  buffering: boolean
  isFetchingProvider: boolean
  streamError: StreamError | null
  networkErrorCount: number
  retryKey: number

  // Quality & source
  selectedQuality: number
  providerIndex: number

  // Subtitles
  selectedSub: string | null
  currentCues: ParsedCue[]
  vttUrl: string | null
  subError: boolean

  // UI
  uiVisible: boolean
  mobileSkipVisible: boolean
  openMenu: "settings" | "provider" | "episodes" | null
  hoverX: number | null
  isDragging: boolean
  showVolSlider: boolean
  skipIndicator: { type: "forward" | "backward"; id: number } | null

  // Fullscreen
  fullscreen: boolean
  iosNativeFullscreen: boolean

  // Source metadata
  sources: StreamSource[]
  subtitles: StreamSubtitle[]
  allProviders: readonly string[]
  provider: DecryptorProvider
}

export type PlaybackAction =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "TIMEUPDATE"; time: number }
  | { type: "DURATION"; duration: number }
  | { type: "BUFFERED"; ranges: { start: number; end: number }[] }
  | { type: "VOLUME_CHANGE"; volume: number; muted: boolean }
  | { type: "BUFFERING"; buffering: boolean }
  | { type: "STREAM_ERROR"; error: StreamError | null }
  | { type: "SET_QUALITY"; index: number }
  | { type: "SET_SUB"; url: string | null }
  | { type: "SET_CUES"; cues: ParsedCue[] }
  | { type: "SET_VTT"; url: string | null }
  | { type: "SET_SUB_ERROR"; error: boolean }
  | { type: "SET_MENU"; open: "settings" | "provider" | "episodes" | null }
  | { type: "SET_HOVER"; x: number | null }
  | { type: "SET_DRAGGING"; dragging: boolean }
  | { type: "SET_VOL_SLIDER"; show: boolean }
  | { type: "SHOW_UI"; visible: boolean }
  | { type: "SKIP_INDICATOR"; indicator: { type: "forward" | "backward"; id: number } | null }
  | { type: "SET_STREAMS"; sources: StreamSource[]; subtitles: StreamSubtitle[] }
  | { type: "SET_FULLSCREEN"; fullscreen: boolean; iosNativeFullscreen: boolean }
  | { type: "INCR_RETRY" }
  | { type: "INCR_NETWORK_ERROR" }
  | { type: "SET_PLAYBACK_RATE"; rate: number }
  | { type: "SET_PROVIDER_INDEX"; index: number }
  | { type: "SET_FETCHING_PROVIDER"; fetching: boolean }
  | { type: "SET_ALL_PROVIDERS"; providers: readonly string[] }
  | { type: "SET_PROVIDER"; provider: DecryptorProvider }
  | { type: "SET_MOBILE_SKIP_VISIBLE"; visible: boolean }

export interface InitialPlaybackState {
  savedProgress: { timestamp: number; duration: number } | null
  sources: StreamSource[]
  subtitles: StreamSubtitle[]
  provider: DecryptorProvider
  providerIndex: number
  allProviders: readonly string[]
}
```

- [ ] **Step 2: Create `controller/reducer.ts` with playbackReducer**

```ts
// src/pages/netflix-player/controller/reducer.ts
import type { PlaybackState, PlaybackAction, InitialPlaybackState } from "./types"

export function createInitialState(init: InitialPlaybackState): PlaybackState {
  return {
    playing: false,
    currentTime: init.savedProgress?.timestamp ?? 0,
    duration: init.savedProgress?.duration ?? 0,
    bufferedRanges: [],
    volume: 1,
    muted: false,
    playbackRate: 1,
    buffering: false,
    isFetchingProvider: false,
    streamError: null,
    networkErrorCount: 0,
    retryKey: 0,
    selectedQuality: 0,
    providerIndex: init.providerIndex,
    selectedSub: null,
    currentCues: [],
    vttUrl: null,
    subError: false,
    uiVisible: true,
    mobileSkipVisible: true,
    openMenu: null,
    hoverX: null,
    isDragging: false,
    showVolSlider: false,
    skipIndicator: null,
    fullscreen: false,
    iosNativeFullscreen: false,
    sources: init.sources,
    subtitles: init.subtitles,
    allProviders: init.allProviders,
    provider: init.provider,
  }
}

export function playbackReducer(
  state: PlaybackState,
  action: PlaybackAction
): PlaybackState {
  switch (action.type) {
    case "PLAY":
      return { ...state, playing: true }
    case "PAUSE":
      return { ...state, playing: false }
    case "TIMEUPDATE":
      return { ...state, currentTime: action.time }
    case "DURATION":
      return { ...state, duration: action.duration }
    case "BUFFERED":
      return { ...state, bufferedRanges: action.ranges }
    case "VOLUME_CHANGE":
      return { ...state, volume: action.volume, muted: action.muted }
    case "BUFFERING":
      return { ...state, buffering: action.buffering }
    case "STREAM_ERROR":
      return { ...state, streamError: action.error }
    case "SET_QUALITY":
      return { ...state, selectedQuality: action.index }
    case "SET_SUB":
      return { ...state, selectedSub: action.url }
    case "SET_CUES":
      return { ...state, currentCues: action.cues }
    case "SET_VTT":
      return { ...state, vttUrl: action.url }
    case "SET_SUB_ERROR":
      return { ...state, subError: action.error }
    case "SET_MENU":
      return { ...state, openMenu: action.open }
    case "SET_HOVER":
      return { ...state, hoverX: action.x }
    case "SET_DRAGGING":
      return { ...state, isDragging: action.dragging }
    case "SET_VOL_SLIDER":
      return { ...state, showVolSlider: action.show }
    case "SHOW_UI":
      return { ...state, uiVisible: action.visible }
    case "SKIP_INDICATOR":
      return { ...state, skipIndicator: action.indicator }
    case "SET_STREAMS":
      return { ...state, sources: action.sources, subtitles: action.subtitles }
    case "SET_FULLSCREEN":
      return {
        ...state,
        fullscreen: action.fullscreen,
        iosNativeFullscreen: action.iosNativeFullscreen,
      }
    case "INCR_RETRY":
      return { ...state, retryKey: state.retryKey + 1 }
    case "INCR_NETWORK_ERROR":
      return { ...state, networkErrorCount: state.networkErrorCount + 1 }
    case "SET_PLAYBACK_RATE":
      return { ...state, playbackRate: action.rate }
    case "SET_PROVIDER_INDEX":
      return { ...state, providerIndex: action.index }
    case "SET_FETCHING_PROVIDER":
      return { ...state, isFetchingProvider: action.fetching }
    case "SET_ALL_PROVIDERS":
      return { ...state, allProviders: action.providers }
    case "SET_PROVIDER":
      return { ...state, provider: action.provider }
    case "SET_MOBILE_SKIP_VISIBLE":
      return { ...state, mobileSkipVisible: action.visible }
    default:
      return state
  }
}
```

- [ ] **Step 3: Verify typecheck passes**

Run: `bun run typecheck`
Expected: PASS (no errors from new files)

- [ ] **Step 4: Commit**

```bash
git add src/pages/netflix-player/controller/types.ts src/pages/netflix-player/controller/reducer.ts
git commit -m "feat(player): add PlaybackState types and playbackReducer

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: External Store & usePlayerController

**Files:**
- Create: `src/pages/netflix-player/controller/use-player-controller.ts`

**Interfaces:**
- Consumes: `PlaybackState`, `PlaybackAction`, `playbackReducer`, `createInitialState` from Task 1
- Produces: `usePlayerController(videoRef, containerRef, init) → { state, actions, store }`

- [ ] **Step 1: Create `controller/use-player-controller.ts`**

```ts
// src/pages/netflix-player/controller/use-player-controller.ts
import { useCallback, useMemo, useRef, useSyncExternalStore, type RefObject } from "react"
import type { PlaybackState, PlaybackAction } from "./types"
import { playbackReducer, createInitialState } from "./reducer"
import type { InitialPlaybackState } from "./types"

export interface PlaybackActions {
  play: () => void
  pause: () => void
  togglePlay: () => void
  seek: (t: number) => void
  seekDelta: (delta: number) => void
  setVolume: (v: number) => void
  toggleMute: () => void
  setQuality: (i: number) => void
  setSub: (url: string | null) => void
  setMenu: (open: "settings" | "provider" | "episodes" | null) => void
  setHoverX: (x: number | null) => void
  setDragging: (d: boolean) => void
  setVolSlider: (show: boolean) => void
  showUI: () => void
  retry: () => void
  setPlaybackRate: (rate: number) => void
  toggleFullscreen: () => void
  dispatch: (action: PlaybackAction) => void
}

export interface PlaybackStore {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => PlaybackState
}

export function usePlayerController(
  videoRef: RefObject<HTMLVideoElement | null>,
  containerRef: RefObject<HTMLDivElement | null>,
  init: InitialPlaybackState
) {
  const initialState = useMemo(() => createInitialState(init), [])
  const stateRef = useRef(initialState)
  const listenersRef = useRef(new Set<() => void>())

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener)
    return () => listenersRef.current.delete(listener)
  }, [])

  const getSnapshot = useCallback(() => stateRef.current, [])

  const dispatchInternal = useCallback((action: PlaybackAction) => {
    const nextState = playbackReducer(stateRef.current, action)
    if (nextState !== stateRef.current) {
      stateRef.current = nextState
      listenersRef.current.forEach((l) => l())
    }
  }, [])

  const state = useSyncExternalStore(subscribe, getSnapshot)

  const actions: PlaybackActions = useMemo(
    () => ({
      play: () => {
        const v = videoRef.current
        if (!v) return
        dispatchInternal({ type: "PLAY" })
        void v.play().catch(() => {})
      },
      pause: () => {
        const v = videoRef.current
        if (!v) return
        dispatchInternal({ type: "PAUSE" })
        v.pause()
      },
      togglePlay: () => {
        const v = videoRef.current
        if (!v) return
        if (v.paused) {
          dispatchInternal({ type: "PLAY" })
          void v.play().catch(() => {})
        } else {
          dispatchInternal({ type: "PAUSE" })
          v.pause()
        }
      },
      seek: (t: number) => {
        const v = videoRef.current
        if (!v || !isFinite(t)) return
        v.currentTime = t
        dispatchInternal({ type: "TIMEUPDATE", time: t })
      },
      seekDelta: (delta: number) => {
        const v = videoRef.current
        if (!v) return
        const newTime = Math.max(0, Math.min(v.duration, v.currentTime + delta))
        v.currentTime = newTime
        dispatchInternal({ type: "TIMEUPDATE", time: newTime })
      },
      setVolume: (vol: number) => {
        const v = videoRef.current
        if (!v) return
        v.volume = vol
        v.muted = vol === 0
        dispatchInternal({ type: "VOLUME_CHANGE", volume: vol, muted: vol === 0 })
      },
      toggleMute: () => {
        const v = videoRef.current
        if (!v) return
        v.muted = !v.muted
        dispatchInternal({ type: "VOLUME_CHANGE", volume: v.volume, muted: v.muted })
      },
      setQuality: (i: number) => dispatchInternal({ type: "SET_QUALITY", index: i }),
      setSub: (url: string | null) => dispatchInternal({ type: "SET_SUB", url }),
      setMenu: (open) => dispatchInternal({ type: "SET_MENU", open }),
      setHoverX: (x) => dispatchInternal({ type: "SET_HOVER", x }),
      setDragging: (d) => dispatchInternal({ type: "SET_DRAGGING", dragging: d }),
      setVolSlider: (show) => dispatchInternal({ type: "SET_VOL_SLIDER", show }),
      showUI: () => {
        dispatchInternal({ type: "SHOW_UI", visible: true })
      },
      retry: () => {
        dispatchInternal({ type: "STREAM_ERROR", error: null })
        dispatchInternal({ type: "INCR_NETWORK_ERROR" })
        dispatchInternal({ type: "INCR_RETRY" })
      },
      setPlaybackRate: (rate: number) => {
        const v = videoRef.current
        if (v) v.playbackRate = rate
        dispatchInternal({ type: "SET_PLAYBACK_RATE", rate })
      },
      toggleFullscreen: () => {
        // Handled by useFullscreen hook, dispatch from there
        dispatchInternal({ type: "SET_FULLSCREEN", fullscreen: false, iosNativeFullscreen: false })
      },
      dispatch: dispatchInternal,
    }),
    [videoRef, dispatchInternal]
  )

  const store: PlaybackStore = useMemo(
    () => ({ subscribe, getSnapshot }),
    [subscribe, getSnapshot]
  )

  return { state, actions, store }
}
```

- [ ] **Step 3: Verify typecheck passes**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/pages/netflix-player/controller/use-player-controller.ts
git commit -m "feat(player): add usePlayerController with external store

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: useVideoBindings (Rewrite Video Events)

**Files:**
- Create: `src/pages/netflix-player/hooks/use-video-bindings.ts`

**Interfaces:**
- Consumes: `PlaybackActions.dispatch` from Task 2
- Produces: `useVideoBindings(videoRef, actions, openMenuRef)` — attaches DOM listeners, dispatches to reducer

- [ ] **Step 1: Create `hooks/use-video-bindings.ts`**

```ts
// src/pages/netflix-player/hooks/use-video-bindings.ts
import { useEffect, useRef, type RefObject } from "react"
import type { PlaybackActions } from "../controller/use-player-controller"
import type { StreamError } from "./use-hls-loader"

const MEDIA_ERROR_MESSAGES: Record<number, string> = {
  1: "Media loading aborted",
  2: "Network error while loading media",
  3: "Media decoding failed",
  4: "Media format not supported or source unavailable",
}

interface UseVideoBindingsOpts {
  videoRef: RefObject<HTMLVideoElement | null>
  actions: Pick<PlaybackActions, "dispatch" | "showUI">
  openMenuRef: RefObject<"settings" | "provider" | "episodes" | null>
}

export function useVideoBindings({
  videoRef,
  actions,
  openMenuRef,
}: UseVideoBindingsOpts) {
  const dispatchRef = useRef(actions.dispatch)
  const showUIRef = useRef(actions.showUI)
  const openMenuRefInner = useRef(openMenuRef)

  useEffect(() => {
    dispatchRef.current = actions.dispatch
    showUIRef.current = actions.showUI
    openMenuRefInner.current = openMenuRef
  })

  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    let rafId = 0
    let pauseDebounce: ReturnType<typeof setTimeout> | null = null
    let bufferingDebounce: ReturnType<typeof setTimeout> | null = null

    const handlePlay = () => dispatchRef.current({ type: "PLAY" })
    const handlePause = () => {
      if (pauseDebounce) clearTimeout(pauseDebounce)
      pauseDebounce = setTimeout(() => {
        if (v && v.paused && !v.seeking) {
          dispatchRef.current({ type: "PAUSE" })
        }
      }, 150)
    }
    const handleTimeUpdate = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        dispatchRef.current({ type: "TIMEUPDATE", time: v.currentTime })
      })
    }
    const handleProgress = () => {
      const ranges: { start: number; end: number }[] = []
      for (let i = 0; i < v.buffered.length; i++) {
        ranges.push({ start: v.buffered.start(i), end: v.buffered.end(i) })
      }
      dispatchRef.current({ type: "BUFFERED", ranges })
    }
    const handleDuration = () => {
      if (isFinite(v.duration) && v.duration !== 0) {
        dispatchRef.current({ type: "DURATION", duration: v.duration })
      }
    }
    const handleWaiting = () => {
      if (bufferingDebounce) clearTimeout(bufferingDebounce)
      bufferingDebounce = setTimeout(() => {
        dispatchRef.current({ type: "BUFFERING", buffering: true })
      }, 200)
    }
    const handlePlaying = () => {
      if (bufferingDebounce) clearTimeout(bufferingDebounce)
      dispatchRef.current({ type: "BUFFERING", buffering: false })
      dispatchRef.current({ type: "STREAM_ERROR", error: null })
    }
    const handleVolume = () => {
      dispatchRef.current({
        type: "VOLUME_CHANGE",
        volume: v.volume,
        muted: v.muted,
      })
    }
    const handleError = () => {
      const code = v.error?.code ?? 0
      dispatchRef.current({
        type: "STREAM_ERROR",
        error: {
          type: code === 2 ? "network" : "media",
          message: MEDIA_ERROR_MESSAGES[code] ?? "Video playback failed",
          details: v.error?.message ?? undefined,
        },
      })
    }

    v.addEventListener("play", handlePlay)
    v.addEventListener("pause", handlePause)
    v.addEventListener("timeupdate", handleTimeUpdate)
    v.addEventListener("progress", handleProgress)
    v.addEventListener("durationchange", handleDuration)
    v.addEventListener("waiting", handleWaiting)
    v.addEventListener("playing", handlePlaying)
    v.addEventListener("volumechange", handleVolume)
    v.addEventListener("error", handleError)
    return () => {
      v.removeEventListener("play", handlePlay)
      v.removeEventListener("pause", handlePause)
      v.removeEventListener("timeupdate", handleTimeUpdate)
      v.removeEventListener("progress", handleProgress)
      v.removeEventListener("durationchange", handleDuration)
      v.removeEventListener("waiting", handleWaiting)
      v.removeEventListener("playing", handlePlaying)
      v.removeEventListener("volumechange", handleVolume)
      v.removeEventListener("error", handleError)
      if (rafId) cancelAnimationFrame(rafId)
      if (pauseDebounce) clearTimeout(pauseDebounce)
      if (bufferingDebounce) clearTimeout(bufferingDebounce)
    }
  }, [videoRef])
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/pages/netflix-player/hooks/use-video-bindings.ts
git commit -m "feat(player): add useVideoBindings — DOM events → dispatch

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: useSourceLoader (Combine HLS + DASH)

**Files:**
- Create: `src/pages/netflix-player/hooks/use-source-loader.ts`

**Interfaces:**
- Consumes: `PlaybackActions.dispatch` from Task 2, `HlsPlayerProps` (sources, movieId, etc.)
- Produces: `useSourceLoader({videoRef, hlsRef, actions, sources, selectedQuality, retryKey, movieId, imdbId, season, episode})` — loads source, dispatches STREAM_ERROR/SET_STREAMS

- [ ] **Step 1: Create `hooks/use-source-loader.ts` (combine use-hls-loader + use-dash-loader)**

This hook combines both loaders into one, dispatching to the reducer instead of calling `onError` callbacks. The actual HLS/DASH instantiation logic is copied from the existing loaders (config preserved).

**Note:** Copy the body of `useHlsLoader` and `useDashLoader` from existing files, replacing `onError`/`onNetworkError` callbacks with `actions.dispatch`. Remove `selectedQuality` as a direct prop (it's now in reducer state, read from `state.selectedQuality`).

- [ ] **Step 2: Verify typecheck passes**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/pages/netflix-player/hooks/use-source-loader.ts
git commit -m "feat(player): add useSourceLoader — combines HLS+DASH, dispatches

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: useSubtitleEngine (Rewrite Subtitle Fetch/Parse)

**Files:**
- Create: `src/pages/netflix-player/hooks/use-subtitle-engine.ts`

**Interfaces:**
- Consumes: `PlaybackActions.dispatch` from Task 2
- Produces: `useSubtitleEngine({selectedSub, subOffset, currentTime, actions})` — fetches subtitle, parses VTT/SRT, computes active cues, dispatches SET_CUES/SET_VTT

- [ ] **Step 1: Create `hooks/use-subtitle-engine.ts`**

Rewrite `use-subtitles.ts` to dispatch `SET_CUES` and `SET_VTT` instead of returning state. Also integrate `use-auto-select-subtitle` logic. The `parseCues` and `shiftTimestamps` functions are copied from existing `use-subtitles.ts` (preserved as-is).

- [ ] **Step 2: Verify typecheck passes**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/pages/netflix-player/hooks/use-subtitle-engine.ts
git commit -m "feat(player): add useSubtitleEngine — fetch, parse, dispatch cues

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: useProgressSync (Rewrite Progress Persistence)

**Files:**
- Create: `src/pages/netflix-player/hooks/use-progress-sync.ts`

**Interfaces:**
- Consumes: `PlaybackStore.getSnapshot` from Task 2
- Produces: `useProgressSync({videoRef, mediaType, movieId, store})` — reads from store, writes to localStorage every 5s

- [ ] **Step 1: Create `hooks/use-progress-sync.ts`**

Rewrite `use-progress-persistence.ts` to read `currentTime` and `duration` from `store.getSnapshot()` instead of receiving props. The write-to-localStorage logic is preserved.

- [ ] **Step 2: Verify typecheck passes**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/pages/netflix-player/hooks/use-progress-sync.ts
git commit -m "feat(player): add useProgressSync — persist progress from store

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Selector Helpers

**Files:**
- Create: `src/pages/netflix-player/controller/selectors.ts`

**Interfaces:**
- Consumes: `PlaybackState` from Task 1
- Produces: Selector functions for each component slice

- [ ] **Step 1: Create `controller/selectors.ts`**

```ts
// src/pages/netflix-player/controller/selectors.ts
import type { PlaybackState } from "./types"

// BottomControls — progress bar + timestamps
export const selectProgress = (s: PlaybackState) => ({
  currentTime: s.currentTime,
  duration: s.duration,
  bufferedRanges: s.bufferedRanges,
  playing: s.playing,
  buffering: s.buffering,
})

// SubtitleOverlay — active cues
export const selectSubtitle = (s: PlaybackState) => ({
  currentCues: s.currentCues,
  uiVisible: s.uiVisible,
})

// TopAppBar — open menu
export const selectTopBar = (s: PlaybackState) => ({
  openMenu: s.openMenu,
  provider: s.provider,
  allProviders: s.allProviders,
})

// Controls — play/pause, volume, fullscreen, quality
export const selectControls = (s: PlaybackState) => ({
  playing: s.playing,
  volume: s.volume,
  muted: s.muted,
  fullscreen: s.fullscreen,
  selectedQuality: s.selectedQuality,
  selectedSub: s.selectedSub,
})

// StreamError overlay
export const selectStreamError = (s: PlaybackState) => ({
  streamError: s.streamError,
  networkErrorCount: s.networkErrorCount,
})

// Paused overlay
export const selectPaused = (s: PlaybackState) => ({
  playing: s.playing,
  buffering: s.buffering,
  isFetchingProvider: s.isFetchingProvider,
  openMenu: s.openMenu,
})

// Settings
export const selectSettings = (s: PlaybackState) => ({
  playbackRate: s.playbackRate,
  selectedSub: s.selectedSub,
  subError: s.subError,
})

// Skip indicator
export const selectSkip = (s: PlaybackState) => ({
  skipIndicator: s.skipIndicator,
})

// Source info for TopAppBar
export const selectSourceInfo = (s: PlaybackState) => ({
  provider: s.provider,
  providerIndex: s.providerIndex,
  allProviders: s.allProviders,
})
```

- [ ] **Step 2: Verify typecheck passes**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/pages/netflix-player/controller/selectors.ts
git commit -m "feat(player): add selector helpers for useSyncExternalStore

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Player Shell (New Main Component)

**Files:**
- Create: `src/pages/netflix-player/partials/player-shell.tsx`

**Interfaces:**
- Consumes: All hooks from Tasks 3-6, `usePlayerController` from Task 2, `HlsPlayerProps` from existing types
- Produces: `PlayerShell` component — the new main component replacing `hls-player.tsx`

- [ ] **Step 1: Create `partials/player-shell.tsx`**

This is the new main component. It:
1. Calls `usePlayerController` to get `{state, actions, store}`
2. Wires hooks: `useVideoBindings`, `useSourceLoader`, `useSubtitleEngine`, `useProgressSync`, `useFullscreen`, `useKeyboardControls`, `useWatchpartyRealtime`, `useRemoteVideo`
3. Renders `<video>` + overlays + controls (each subscribing to its own slice)
4. Uses `React.lazy` for settings modal and episodes drawer

**Structure:**
```tsx
function PlayerShell(props: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const openMenuRef = useRef(state.openMenu)

  const { state, actions, store } = usePlayerController(videoRef, containerRef, {
    savedProgress: getWatchProgress(props.mediaType, props.movieId),
    sources: props.sources,
    subtitles: props.subtitles,
    provider: props.provider,
    providerIndex: props.providerIndex,
    allProviders: props.allProviders,
  })

  // Wire hooks
  useVideoBindings({ videoRef, actions, openMenuRef })
  useSourceLoader({ videoRef, hlsRef, actions, ... })
  useSubtitleEngine({ selectedSub: state.selectedSub, subOffset: ..., currentTime: state.currentTime, actions })
  useProgressSync({ videoRef, mediaType: props.mediaType, movieId: props.movieId, store })
  // ... fullscreen, keyboard, watchparty

  return (
    <div ref={containerRef}>
      <video ref={videoRef} poster={props.poster} crossOrigin="anonymous" playsInline>
        {state.vttUrl && <track kind="subtitles" src={state.vttUrl} />}
      </video>
      <SubtitleOverlay store={store} />
      <PausedOverlay store={store} />
      <BufferingOverlay store={store} />
      <StreamErrorOverlay store={store} actions={actions} />
      <SkipIndicator store={store} />
      <TopAppBar store={store} actions={actions} />
      <BottomControls store={store} actions={actions} progressBarRef={progressBarRef} />
      {watchparty && <RoomOverlay {...} />}
      {state.openMenu === "settings" && <LazySettingsModal store={store} actions={actions} />}
      {state.openMenu === "episodes" && <LazyEpisodesDrawer />}
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `bun run typecheck`
Expected: PASS (may have missing component imports at this point — that's expected, next tasks create them)

- [ ] **Step 3: Commit**

```bash
git add src/pages/netflix-player/partials/player-shell.tsx
git commit -m "feat(player): add PlayerShell — new main component

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: UI Partials (Rewrite Presentational Components)

**Files:**
- Create: `src/pages/netflix-player/partials/controls/bottom-controls.tsx`
- Create: `src/pages/netflix-player/partials/overlays/subtitle-overlay.tsx`
- Create: `src/pages/netflix-player/partials/overlays/paused-overlay.tsx`
- Create: `src/pages/netflix-player/partials/overlays/buffering-overlay.tsx`
- Create: `src/pages/netflix-player/partials/overlays/stream-error-overlay.tsx`
- Create: `src/pages/netflix-player/partials/overlays/skip-indicator.tsx`

**Interfaces:**
- Consumes: `PlaybackStore` (for useSyncExternalStoreWithSelector), `PlaybackActions`
- Produces: Pure presentational components that subscribe to slices

- [ ] **Step 1: Rewrite `bottom-controls.tsx` to use useSyncExternalStoreWithSelector**

Each component subscribes to its slice:

```tsx
import { useSyncExternalStoreWithSelector } from "react"

function BottomControls({ store, actions, progressBarRef }) {
  const { currentTime, duration, bufferedRanges, playing, buffering } =
    useSyncExternalStoreWithSelector(store.subscribe, store.getSnapshot, (s) => ({
      currentTime: s.currentTime,
      duration: s.duration,
      bufferedRanges: s.bufferedRanges,
      playing: s.playing,
      buffering: s.buffering,
    }))
  // ... render
}
```

- [ ] **Step 2: Rewrite each overlay component to use useSyncExternalStoreWithSelector**

Same pattern: subscribe to minimal slice, render from slice.

- [ ] **Step 3: Verify typecheck passes**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/pages/netflix-player/partials/
git commit -m "feat(player): rewrite UI partials with useSyncExternalStore selectors

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: Lazy Settings Modal & Episodes Drawer

**Files:**
- Modify: `src/pages/netflix-player/partials/player-shell.tsx` (add React.lazy imports)

**Interfaces:**
- Consumes: Existing `settings-modal.tsx` and `episodes-drawer.tsx` (no changes needed — they already accept props)

- [ ] **Step 1: Add lazy imports in player-shell.tsx**

```tsx
const LazySettingsModal = React.lazy(() => import("./controls/settings-modal"))
const LazyEpisodesDrawer = React.lazy(() => import("./controls/episodes-drawer"))
```

- [ ] **Step 2: Verify typecheck passes**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/pages/netflix-player/partials/player-shell.tsx
git commit -m "feat(player): lazy-load settings modal and episodes drawer

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: Wire Player Entry Point (index.tsx)

**Files:**
- Modify: `src/pages/netflix-player/index.tsx`

**Interfaces:**
- Consumes: `PlayerShell` from Task 8
- Produces: Updated entry point that uses PlayerShell instead of HlsPlayer

- [ ] **Step 1: Replace HlsPlayer import with PlayerShell**

Change `import { HlsPlayer } from "./partials/hls-player"` to `import { PlayerShell } from "./partials/player-shell"`.

Replace `<HlsPlayer ... />` with `<PlayerShell ... />` (same props).

- [ ] **Step 2: Verify typecheck passes**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/pages/netflix-player/index.tsx
git commit -m "feat(player): switch entry point to PlayerShell

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 12: Movie-Detail Migration

**Files:**
- Modify: `src/pages/movie-detail/index.tsx`
- Delete: `src/pages/movie-detail/partials/movie-player.tsx`

**Interfaces:**
- Consumes: None (removes code)
- Produces: Movie-detail no longer uses iframe player

- [ ] **Step 1: Remove MoviePlayer import and showVideo state from movie-detail/index.tsx**

Remove:
- `import { MoviePlayer } from "./partials/movie-player"`
- `const [showVideo, setShowVideo] = useState(false)`
- `postCommand` effect for iframe
- `<MoviePlayer ... />` component usage
- `showVideo` prop passed to `MovieHero` and `MovieBillboard`

- [ ] **Step 2: Remove movie-billboard.tsx showVideo prop**

Update `movie-billboard.tsx` interface to remove `showVideo` prop. Remove `showVideo ? "opacity-0"` conditional (billboard always visible).

- [ ] **Step 3: Delete `movie-player.tsx`**

```bash
git rm src/pages/movie-detail/partials/movie-player.tsx
```

- [ ] **Step 4: Verify typecheck passes**

Run: `bun run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/movie-detail/index.tsx src/pages/movie-detail/partials/movie-billboard.tsx
git commit -m "feat(movie-detail): remove iframe player, use netflix-player instead

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 13: Delete Old hls-player.tsx

**Files:**
- Delete: `src/pages/netflix-player/partials/hls-player.tsx`
- Delete: `src/pages/netflix-player/hooks/use-video-events.ts` (replaced by use-video-bindings)
- Delete: `src/pages/netflix-player/hooks/use-subtitles.ts` (replaced by use-subtitle-engine)
- Delete: `src/pages/netflix-player/hooks/use-progress-persistence.ts` (replaced by use-progress-sync)

**Interfaces:**
- Consumes: None (deletes old code)
- Produces: Clean codebase with no duplicate files

- [ ] **Step 1: Verify no remaining imports of deleted files**

Run: `grep -rn "hls-player\|use-video-events\|use-subtitles\|use-progress-persistence" src/pages/netflix-player/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"`
Expected: Only references in the new files (use-source-loader, use-subtitle-engine, use-progress-sync) — NOT in player-shell or index.

- [ ] **Step 2: Delete old files**

```bash
git rm src/pages/netflix-player/partials/hls-player.tsx
git rm src/pages/netflix-player/hooks/use-video-events.ts
git rm src/pages/netflix-player/hooks/use-subtitles.ts
git rm src/pages/netflix-player/hooks/use-progress-persistence.ts
```

- [ ] **Step 3: Verify typecheck + lint + build passes**

Run: `bun run typecheck && bun run lint && bun run build`
Expected: PASS — no references to deleted files remain

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor(player): remove old monolithic hls-player and replaced hooks

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 14: Final Verification & Cleanup

**Files:**
- Modify: `src/pages/netflix-player/hls-player.types.ts` (if needed — may be consolidated into controller/types.ts)

**Interfaces:**
- Final check: all features work, no regressions

- [ ] **Step 1: Run full verification**

```bash
bun run typecheck && bun run lint && bun run build
```
Expected: All PASS

- [ ] **Step 2: Start dev server and test manually**

```bash
bun run dev
```

Test matrix:
- Play/pause (click, keyboard Space/K)
- Seek (click progress bar, arrow keys, scrub drag)
- Quality switch (settings → quality popover)
- Subtitle (provider + Wyzie external)
- Fullscreen (F key, button)
- Settings modal opens/closes (lazy-loaded)
- Episodes drawer (TV shows, lazy-loaded)
- Watchparty (create room, join via link, sync play/pause/seek, invite copy, peer roster)
- Progress persistence (resume from last position)
- Provider failover (force error → next provider)
- Mobile: touch controls, skip buttons
- Non-watchparty: all controls work normally (no regression)

- [ ] **Step 3: Final commit (if any cleanup was needed)**

```bash
git add -A
git commit -m "chore(player): final cleanup after rewrite

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
