import type {
  PlaybackState,
  PlaybackAction,
  InitialPlaybackState,
} from "./types"

export function createInitialState(init: InitialPlaybackState): PlaybackState {
  return {
    // Core
    playing: false,
    currentTime: init.savedProgress?.timestamp ?? 0,
    duration: init.savedProgress?.duration ?? 0,
    bufferedRanges: [],
    volume: 1,
    muted: false,
    playbackRate: 1,

    // Loading
    buffering: false,
    isFetchingProvider: false,
    streamError: null,
    networkErrorCount: 0,
    retryKey: 0,

    // Quality & source
    selectedQuality: 0,
    providerIndex: init.providerIndex,

    // Subtitles
    selectedSub: null,
    currentCues: [],
    vttUrl: null,
    subError: false,

    // UI
    uiVisible: true,
    mobileSkipVisible: true,
    openMenu: null,
    hoverX: null,
    isDragging: false,
    showVolSlider: false,
    skipIndicator: null,

    // Fullscreen
    fullscreen: false,
    iosNativeFullscreen: false,

    // Source metadata
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
    // Core
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
    case "SET_PLAYBACK_RATE":
      return { ...state, playbackRate: action.rate }

    // Loading
    case "BUFFERING":
      return { ...state, buffering: action.buffering }
    case "SET_FETCHING_PROVIDER":
      return { ...state, isFetchingProvider: action.fetching }
    case "STREAM_ERROR":
      return { ...state, streamError: action.error }
    case "INCR_NETWORK_ERROR":
      return { ...state, networkErrorCount: state.networkErrorCount + 1 }
    case "INCR_RETRY":
      return { ...state, retryKey: state.retryKey + 1 }

    // Quality & source
    case "SET_QUALITY":
      return { ...state, selectedQuality: action.index }
    case "SET_PROVIDER_INDEX":
      return { ...state, providerIndex: action.index }
    case "SET_STREAMS":
      return {
        ...state,
        sources: action.sources,
        subtitles: action.subtitles,
      }
    case "SET_ALL_PROVIDERS":
      return { ...state, allProviders: action.providers }
    case "SET_PROVIDER":
      return { ...state, provider: action.provider }

    // Subtitles
    case "SET_SUB":
      return { ...state, selectedSub: action.url }
    case "SET_CUES":
      return { ...state, currentCues: action.cues }
    case "SET_VTT":
      return { ...state, vttUrl: action.url }
    case "SET_SUB_ERROR":
      return { ...state, subError: action.error }

    // UI
    case "SHOW_UI":
      return { ...state, uiVisible: action.visible }
    case "SET_MOBILE_SKIP_VISIBLE":
      return { ...state, mobileSkipVisible: action.visible }
    case "SET_MENU":
      return { ...state, openMenu: action.open }
    case "SET_HOVER":
      return { ...state, hoverX: action.x }
    case "SET_DRAGGING":
      return { ...state, isDragging: action.dragging }
    case "SET_VOL_SLIDER":
      return { ...state, showVolSlider: action.show }
    case "SKIP_INDICATOR":
      return { ...state, skipIndicator: action.indicator }

    // Fullscreen
    case "SET_FULLSCREEN":
      return {
        ...state,
        fullscreen: action.fullscreen,
        iosNativeFullscreen: action.iosNativeFullscreen,
      }

    default:
      return state
  }
}
