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
