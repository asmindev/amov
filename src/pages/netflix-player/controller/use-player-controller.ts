import {
  useCallback,
  useMemo,
  useRef,
  useSyncExternalStore,
  type RefObject,
} from "react"
import type {
  PlaybackState,
  PlaybackAction,
  InitialPlaybackState,
} from "./types"
import { playbackReducer, createInitialState } from "./reducer"

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
  _containerRef: RefObject<HTMLDivElement | null>,
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
