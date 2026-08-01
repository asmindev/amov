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
