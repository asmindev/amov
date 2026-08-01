# Player Rewrite Design Spec

## Context

The Netflix player (`hls-player.tsx`) has grown to 883 lines with 22 useState, 13 useCallback, 10 useEffect, and ~90 hook calls per render. The player bundle is 1.45 MB (largest in the app), and the single monolithic component handles all playback logic, UI state, and feature wiring in one file.

Additionally, `movie-detail` still uses an iframe to `player.videasy.net` for playback, while the custom player has better features (subtitle support, quality selection, watchparty, keyboard controls). This rewrite unifies both under a single player codebase.

**Goal:** Rewrite the player with clean controller/UI separation (useReducer + useSyncExternalStore selectors), code-split UI, while maintaining ALL existing features and preserving the working HLS/DASH loader configuration.

**Gaps identified:**
- TV episode sync in watchparty (room doesn't store season/episode) — noted as follow-up, not addressed in this rewrite.

---

## Architecture Overview

**Pattern:** Controller (state + actions) separated from UI (rendering). All playback state in one reducer. External store with `useSyncExternalStore` so only subscribed components re-render. Hooks bind DOM events to dispatch. Partial components are purely presentational.

```
src/pages/netflix-player/
├── controller/
│   ├── types.ts              # PlaybackState, PlaybackAction, PlayerStatus
│   ├── reducer.ts            # playbackReducer(state, action) — pure
│   ├── playback-store.ts     # createExternalStore(dispatch) → { subscribe, getSnapshot }
│   └── use-player-controller.ts  # useReducer + external store, expose {state, actions, store}
├── hooks/                    # bind DOM → dispatch
│   ├── use-video-bindings.ts
│   ├── use-source-loader.ts
│   ├── use-subtitle-engine.ts
│   ├── use-progress-sync.ts
│   ├── use-player-settings.ts
│   ├── use-fullscreen.ts
│   └── use-keyboard-controls.ts
├── watchparty/               # imperative, bypass reducer
│   ├── use-watchparty-realtime.ts
│   ├── use-remote-video.ts
│   └── room-overlay.tsx
├── partials/                 # purely presentational
│   ├── player-shell.tsx
│   ├── controls/bottom-controls.tsx
│   ├── controls/settings-modal.tsx      # lazy
│   ├── controls/quality-popover.tsx
│   ├── overlays/subtitle-overlay.tsx
│   ├── overlays/paused-overlay.tsx
│   ├── overlays/stream-error-overlay.tsx
│   ├── overlays/skip-indicator.tsx
│   ├── overlays/buffering-overlay.tsx
│   ├── top-app-bar.tsx
│   └── episodes-drawer.tsx              # lazy
├── index.tsx                 # compose: usePlayerController + PlayerShell
└── hls-player.types.ts       # HlsPlayerProps
```

**Deleted:** `hls-player.tsx` monolit → replaced by `player-shell.tsx` + `use-player-controller.ts`.

---

## PlaybackState & PlaybackAction

All playback state lives in one object:

```ts
interface PlaybackState {
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
  provider: string
}
```

Key actions:

| Action | Payload | Trigger |
|---|---|---|
| `PLAY` | — | video.play event, togglePlay, keyboard |
| `PAUSE` | — | video.pause event, togglePlay, keyboard |
| `TIMEUPDATE` | `{ time: number }` | video.timeupdate (throttled rAF) |
| `DURATION` | `{ duration }` | video.durationchange |
| `BUFFERED` | `{ ranges }` | video.progress |
| `VOLUME_CHANGE` | `{ volume, muted }` | video.volumechange |
| `BUFFERING` | `{ buffering }` | video.waiting/playing |
| `STREAM_ERROR` | `{ error }` | useSourceLoader |
| `SET_QUALITY` | `{ index }` | QualityPopover |
| `SET_SUB` | `{ url }` | SubtitlesSettings |
| `SET_CUES` | `{ cues }` | useSubtitleEngine |
| `SET_VTT` | `{ url }` | useSubtitleEngine |
| `SET_MENU` | `{ open }` | buttons |
| `SET_HOVER` | `{ x }` | progress bar mousemove |
| `SET_DRAGGING` | `{ dragging }` | pointer events |
| `SHOW_UI` | `{ visible }` | mouse move, menu toggle |
| `SKIP_INDICATOR` | `{ type, id }` | seek |
| `SET_STREAMS` | `{ sources, subtitles, ... }` | useSourceLoader fetch result |
| `SET_FULLSCREEN` | `{ fullscreen, iosNativeFullscreen }` | useFullscreen |
| `INCR_RETRY` | — | handleRetry |
| `SET_PLAYBACK_RATE` | `{ rate }` | SettingsModal |

---

## Hook Wiring

Each hook receives `dispatch` (or `actions` from controller) and `videoRef`. Hooks return functions called by components or other hooks.

### useVideoBindings(videoRef, dispatch)
Attaches native DOM listeners, dispatches to reducer:

- `play` event → `dispatch({type:'PLAY'})`
- `pause` event → `dispatch({type:'PAUSE'})`
- `timeupdate` → `dispatch({type:'TIMEUPDATE', time})` [throttled rAF]
- `progress` → `dispatch({type:'BUFFERED', ranges})` [throttled]
- `durationchange` → `dispatch({type:'DURATION', duration})`
- `waiting` → `dispatch({type:'BUFFERING', buffering:true})`
- `playing` → `dispatch({type:'BUFFERING', buffering:false})`
- `volumechange` → `dispatch({type:'VOLUME_CHANGE', volume, muted})`
- `error` → `dispatch({type:'STREAM_ERROR', error})`

### useSourceLoader(videoRef, dispatch, sources, selectedQuality, retryKey, movieId)
Combines `use-hls-loader` + `use-dash-loader`. Loader config preserved (startPosition, proxy URL, failover). Dispatches `SET_STREAMS`, `STREAM_ERROR`, `SET_QUALITY`.

### useSubtitleEngine(selectedSub, subOffset, currentTime, dispatch)
From `use-subtitles.ts` + `use-auto-select-subtitle`. Fetch, parse VTT/SRT, compute active cues. Dispatches `SET_CUES` (debounced 50ms, only on cue change), `SET_VTT`, `SET_SUB`.

### useWatchpartyRealtime(...)
From current watchparty implementation. Imperative — applies remote play/pause/seek directly to DOM via `remoteAppliedRef`. Does NOT dispatch to reducer. Uses `actions.seek()` for seek broadcast.

### useProgressSync(videoRef, mediaType, movieId, duration, playing, store)
From `use-progress-persistence.ts`. Writes to localStorage every 5s. Reads `currentTime` and `duration` from store via `store.getSnapshot()`.

### useKeyboardControls(videoRef, actions, showUI, toggleFullscreen)
From `use-keyboard-controls.ts`. Space/K → `actions.togglePlay()`, arrows → `actions.seek()`, volume → `actions.setVolume()`, M → `actions.toggleMute()`, F → `actions.toggleFullscreen()`.

---

## Selectors (useSyncExternalStoreWithSelector)

Components subscribe to minimal slices:

```ts
// BottomControls — progress bar + timestamps
const useProgressSlice = (s) => ({ currentTime, duration, bufferedRanges, playing, buffering })

// SubtitleOverlay — active cues
const useSubtitleSlice = (s) => ({ currentCues, uiVisible })

// TopAppBar — open menu
const useTopBarSlice = (s) => ({ openMenu, movieTitle, provider, allProviders })

// Controls — play/pause, volume, fullscreen, quality
const useControlsSlice = (s) => ({ playing, volume, muted, fullscreen, selectedQuality, selectedSub })
```

`timeupdate` ~4x/sec dispatches to reducer → only BottomControls and SubtitleOverlay re-render (they subscribe to `currentTime`). Shell, top bar, and other controls do NOT re-render.

---

## Data Flow

```
DOM events → useVideoBindings → dispatch → reducer → store → selectors → re-render subscribed components

Local actions (togglePlay/seek) → actions.play()/seek() → dispatch + DOM imperatively

Watchparty broadcast → applyRemotePlay/Pause/Seek → DOM imperatively (no dispatch)
  → DOM fires play/pause event → useVideoBindings → dispatch(PLAY/PAUSE)
  → remoteAppliedRef guard → skip broadcastPlay

Selectors → useSyncExternalStore → component re-renders only when slice changes
```

---

## Component Tree

```
PlayerShell
├── <video> (ref, poster, track subtitle)
├── SubtitleOverlay       ← subscribe: currentCues, uiVisible
├── PausedOverlay         ← subscribe: playing, buffering, isFetchingProvider, openMenu
├── BufferingOverlay      ← subscribe: buffering, isFetchingProvider, streamError
├── StreamErrorOverlay    ← subscribe: streamError, networkErrorCount
├── SkipIndicator         ← subscribe: skipIndicator
├── TopAppBar             ← subscribe: openMenu, movieTitle, provider, allProviders
│   └── ProviderDropdown  ← subscribe: providerIndex, allProviders
├── BottomControls        ← subscribe: currentTime, duration, bufferedRanges, playing, volume, muted, fullscreen, selectedQuality
│   ├── ProgressBar       ← subscribe: currentTime, duration, bufferedRanges, hoverX, isDragging
│   ├── PlayPauseButton   ← subscribe: playing
│   ├── VolumeControl     ← subscribe: volume, muted
│   ├── QualityPopover    ← subscribe: selectedQuality, sources
│   └── SettingsButton    ← actions.setMenu
├── LazySettingsModal     ← React.lazy (when openMenu === "settings")
│   ├── AudioSection
│   ├── SubtitlesSection
│   └── CustomizationSection
├── LazyEpisodesDrawer    ← React.lazy (when openMenu === "episodes")
├── RoomOverlay           ← subscribe: peers, status (watchparty only)
└── MobileSkipButtons     ← subscribe: mobileSkipVisible
```

---

## Code-Splitting

- **Bundle awal**: shell + video bindings + progress bar + overlay + controls ringan ≈ ~150 KB
- **Lazy-loaded**: settings modal (~80 KB), episodes drawer (~30 KB), subtitle engine (~20 KB)
- **Tidak ber改变**: use-hls-loader, use-dash-loader, use-subtitles parser, use-progress-persistence, use-watchparty, use-fullscreen — these hooks are called in the shell (not lazy) because they must run immediately on mount

---

## Movie-Detail Migration

- Delete `movie-player.tsx` (iframe Videasy)
- Remove `showVideo` state from `movie-detail/index.tsx`
- Movie-hero "Play" button already navigates to `/$type/$id/netflix`
- Movie-hero "Watchparty" button already navigates to `/$type/$id/netflix?room=`
- Keep `movie-billboard.tsx` but remove `showVideo` prop

---

## Loader Config (Preserved)

HLS config preserved as-is from current implementation:
- `startFragPrefetch: true`
- `startPosition: savedTs > 30 ? savedTs : -1`
- `xhrSetup` proxy URL rewriting (buildProxyUrl)
- Network error failover (3 attempts → next quality → refetch → next provider)
- DASH fallback via `useDashLoader`

No changes to streaming behavior — only structural refactor.

---

## Watchparty Integration (Preserved)

Current watchparty hooks wired into PlayerShell:
- `useWatchpartyRealtime` — channel, broadcast, presence
- `useRemoteVideo` — imperative DOM writes with `remoteAppliedRef` anti-echo
- `RoomOverlay` — invite link, peer roster
- Seek broadcast throttled 250ms + flush on pointer-up
- Self filtered from peer roster
- Retry subscribe 3s on channel error

---

## Implementation Order

1. **Controller** (types, reducer, external store, usePlayerController) — foundation
2. **Hooks** (useVideoBindings, useSourceLoader, useSubtitleEngine, useProgressSync) — rewrite each hook to dispatch
3. **Partials** (playerShell, controls, overlays) — rewrite each as presentational
4. **Compose** (index.tsx, wire everything) — integration
5. **Movie-detail migration** (delete iframe, simplify)
6. **Verification** (typecheck, lint, build, manual test)

---

## Verification

1. `bun run typecheck` — TypeScript strict passes
2. `bun run lint` (src) — eslint passes
3. `bun run build` — tsc + vite build passes
4. **Manual test matrix**:
   - Play/pause (click, keyboard Space/K)
   - Seek (click progress bar, arrow keys, scrub drag)
   - Quality switch
   - Subtitle (provider + Wyzie external)
   - Fullscreen (F key, button)
   - Settings modal opens/closes
   - Episodes drawer (TV)
   - Watchparty (create room, join via link, sync play/pause/seek, invite copy, peer roster)
   - Progress persistence (resume from last position)
   - Provider failover (force error → next provider)
   - Mobile: touch controls, skip buttons
   - Non-watchparty: all controls work normally (no regression)
5. **Movie-detail**: navigate from detail page → player (no more iframe)

---

## Out of Scope (Follow-up)

- TV episode sync in watchparty room (room needs season/episode columns)
- Anti-drift (clock-sync keep-alive seek between peers)
- Chat & emoji reactions
- Host-only controls
- Playback behavior optimization (buffer sizes, startup time) — config preserved as-is
