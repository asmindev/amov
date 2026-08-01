import { useCallback, useRef, useSyncExternalStore } from "react"
import type { PlaybackState } from "./types"
import type { PlaybackStore } from "./use-player-controller"

function shallowEqual<T>(objA: T, objB: T): boolean {
  if (Object.is(objA, objB)) return true
  if (
    typeof objA !== "object" ||
    objA === null ||
    typeof objB !== "object" ||
    objB === null
  ) {
    return false
  }
  const keysA = Object.keys(objA) as (keyof T)[]
  const keysB = Object.keys(objB) as (keyof T)[]
  if (keysA.length !== keysB.length) return false
  for (let i = 0; i < keysA.length; i++) {
    const k = keysA[i]
    if (
      !Object.prototype.hasOwnProperty.call(objB, k) ||
      !Object.is(objA[k], objB[k])
    ) {
      return false
    }
  }
  return true
}

export function useStoreSelector<T>(
  store: PlaybackStore,
  selector: (s: PlaybackState) => T
): T {
  const lastSelectedRef = useRef<T | undefined>(undefined)
  const lastStateRef = useRef<PlaybackState | undefined>(undefined)

  const getSnapshot = useCallback(() => {
    const currentState = store.getSnapshot()
    if (
      currentState === lastStateRef.current &&
      lastSelectedRef.current !== undefined
    ) {
      return lastSelectedRef.current
    }
    const nextSelected = selector(currentState)
    if (
      lastSelectedRef.current !== undefined &&
      shallowEqual(lastSelectedRef.current, nextSelected)
    ) {
      return lastSelectedRef.current
    }
    lastStateRef.current = currentState
    lastSelectedRef.current = nextSelected
    return nextSelected
  }, [store, selector])

  return useSyncExternalStore(store.subscribe, getSnapshot)
}

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
