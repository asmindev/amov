import {
  useState,
  useEffect,
  useRef,
  useCallback,
  lazy,
  Suspense,
  type SetStateAction,
} from "react"
import { AnimatePresence } from "motion/react"
import { useNavigate } from "@tanstack/react-router"
import type { WyzieSubtitleGroup } from "@/api/decryptor.api"
import { fetchWyzieSubtitles } from "@/api/decryptor.api"
import { TopAppBar } from "./player-ui/top-app-bar"
import { BottomControls } from "./player-ui/bottom-controls"
import { usePlayerController } from "../controller/use-player-controller"
import {
  useStoreSelector,
  selectSubtitle,
  selectSkip,
} from "../controller/selectors"
import { useVideoBindings } from "../hooks/use-video-bindings"
import { useSourceLoader } from "../hooks/use-source-loader"
import { useSubtitleEngine } from "../hooks/use-subtitle-engine"
import { useProgressSync } from "../hooks/use-progress-sync"
import { usePlayerSettings } from "../hooks/use-player-settings"
import { useFullscreen } from "../hooks/use-fullscreen"
import { useKeyboardControls } from "../hooks/use-keyboard-controls"
import { useWatchpartyRealtime } from "../watchparty/use-watchparty-realtime"
import { useRemoteVideo } from "../watchparty/use-remote-video"
import { RoomOverlay } from "../watchparty/room-overlay"
import { ProviderConnectingOverlay, BufferingPulse } from "./loading-animations"
import { SubtitleOverlay } from "./player-ui/subtitle-overlay"
import { PausedOverlay } from "./player-ui/paused-overlay"
import { SkipIndicator } from "./player-ui/skip-indicator"
import type { PlayerShellProps } from "../controller/types"
import { getWatchProgress } from "@/hooks/use-watch-progress"

const SettingsModal = lazy(() =>
  import("./player-ui/settings-modal").then((m) => ({
    default: m.SettingsModal,
  }))
)

const EpisodesDrawer = lazy(() =>
  import("./player-ui/episodes-drawer").then((m) => ({
    default: m.EpisodesDrawer,
  }))
)

export function PlayerShell({
  sources,
  subtitles,
  movieId,
  movieTitle,
  movieYear,
  poster,
  provider,
  providerIndex,
  allProviders,
  onProviderChange,
  onRefetchCurrentProvider,
  isFetchingProvider,
  imdbId,
  movieOverview,
  popularity = 0,
  voteAverage = 0,
  logoPath,
  mediaType = "movie",
  season = 1,
  episode = 1,
  seasons = [],
  watchparty,
}: PlayerShellProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mobileSkipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const seekBroadcastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSeekRef = useRef<number | null>(null)

  const savedProgress = getWatchProgress(mediaType, movieId)

  const { state, actions, store } = usePlayerController(
    videoRef,
    containerRef,
    {
      savedProgress,
      sources,
      subtitles,
      provider,
      providerIndex,
      allProviders,
    }
  )

  const openMenuRef = useRef(state.openMenu)
  useEffect(() => {
    openMenuRef.current = state.openMenu
  }, [state.openMenu])

  // ── Wyzie Subtitles ─────────────────────────────────────────────────────────
  const [wyzieGroups, setWyzieGroups] = useState<WyzieSubtitleGroup[]>([])
  const [isFetchingWyzie, setIsFetchingWyzie] = useState(false)

  const handleFetchWyzie = useCallback(async () => {
    if (isFetchingWyzie) return
    setIsFetchingWyzie(true)
    try {
      const groups = await fetchWyzieSubtitles({
        tmdbId: String(movieId),
        imdbId: imdbId || undefined,
        mediaType,
        season: mediaType === "tv" ? season : undefined,
        episode: mediaType === "tv" ? episode : undefined,
      })
      setWyzieGroups(groups)
    } catch (err) {
      console.error("Failed to fetch Wyzie subtitles:", err)
    } finally {
      setIsFetchingWyzie(false)
    }
  }, [movieId, imdbId, mediaType, season, episode, isFetchingWyzie])

  // ── Customization Settings ──────────────────────────────────────────────────
  const playerSettings = usePlayerSettings()

  // ── Watchparty Sync ────────────────────────────────────────────────────────
  const watchpartyEnabled = !!watchparty

  const { applyRemotePlay, applyRemotePause, applyRemoteSeek, remoteAppliedRef } =
    useRemoteVideo({ videoRef })

  const getSnapshotRef = useRef<() => { currentTime: number; playing: boolean }>(() => ({
    currentTime: 0,
    playing: false,
  }))
  getSnapshotRef.current = () => ({
    currentTime: videoRef.current?.currentTime ?? state.currentTime,
    playing: state.playing,
  })

  const handleGetPlaybackSnapshot = useCallback(
    () => getSnapshotRef.current(),
    []
  )

  const handleApplySyncState = useCallback(
    (t: number, remotePlaying: boolean) => {
      applyRemoteSeek(t)
      const v = videoRef.current
      if (remotePlaying) {
        if (v && v.readyState >= 2) {
          void v.play().catch(() => {})
        } else if (v) {
          v.addEventListener(
            "canplay",
            () => {
              void v.play().catch(() => {})
            },
            { once: true }
          )
        }
      } else if (!remotePlaying && v && !v.paused) {
        v.pause()
      }
    },
    [applyRemoteSeek]
  )

  const {
    peers,
    status: watchpartyStatus,
    sendPlay: broadcastPlay,
    sendPause: broadcastPause,
    sendSeek: broadcastSeek,
    requestSync,
    isSynced,
  } = useWatchpartyRealtime({
    roomId: watchparty?.roomId ?? null,
    userId: watchparty?.userId ?? null,
    displayName: watchparty?.displayName,
    enabled: watchpartyEnabled,
    onPlay: applyRemotePlay,
    onPause: applyRemotePause,
    onSeek: applyRemoteSeek,
    getPlaybackSnapshot: handleGetPlaybackSnapshot,
    onSyncState: handleApplySyncState,
  })

  // ── Wire Hooks ─────────────────────────────────────────────────────────────
  useVideoBindings({
    videoRef,
    actions,
    openMenuRef,
    onPlay: () => {
      if (remoteAppliedRef.current) {
        remoteAppliedRef.current = false
      } else if (watchpartyEnabled) {
        broadcastPlay()
      }
    },
    onPause: () => {
      if (remoteAppliedRef.current) {
        remoteAppliedRef.current = false
      } else if (watchpartyEnabled) {
        broadcastPause()
      }
    },
  })

  useSourceLoader({
    videoRef,
    hlsRef,
    actions,
    sources,
    selectedQuality: state.selectedQuality,
    retryKey: state.retryKey,
    mediaType,
    movieId,
    imdbId,
    season,
    episode,
  })

  useSubtitleEngine({
    selectedSub: state.selectedSub,
    subOffset: playerSettings.subOffset,
    currentTime: state.currentTime,
    subtitles,
    actions,
  })

  useProgressSync({ videoRef, mediaType, movieId, store })

  const { fullscreen, iosNativeFullscreen, toggleFullscreen } = useFullscreen(
    containerRef,
    videoRef
  )

  // Sync fullscreen to state
  useEffect(() => {
    actions.dispatch({
      type: "SET_FULLSCREEN",
      fullscreen,
      iosNativeFullscreen,
    })
  }, [fullscreen, iosNativeFullscreen, actions])

  // Throttled seek broadcast for drag scrub
  const broadcastSeekThrottled = useCallback(
    (t: number) => {
      if (!watchpartyEnabled) return
      pendingSeekRef.current = t
      if (seekBroadcastTimerRef.current) return
      seekBroadcastTimerRef.current = setTimeout(() => {
        seekBroadcastTimerRef.current = null
        const next = pendingSeekRef.current
        pendingSeekRef.current = null
        if (next !== null) broadcastSeek(next)
      }, 250)
    },
    [watchpartyEnabled, broadcastSeek]
  )

  const flushPendingSeek = useCallback(() => {
    if (seekBroadcastTimerRef.current) {
      clearTimeout(seekBroadcastTimerRef.current)
      seekBroadcastTimerRef.current = null
    }
    const next = pendingSeekRef.current
    pendingSeekRef.current = null
    if (next !== null) broadcastSeek(next)
  }, [broadcastSeek])

  // ── Auto Failover ──────────────────────────────────────────────────────────
  const hasRefetchedRef = useRef(false)
  const failedQualitiesRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    hasRefetchedRef.current = false
    failedQualitiesRef.current.clear()
    actions.setQuality(0)
  }, [providerIndex, actions])

  useEffect(() => {
    if (state.streamError) {
      failedQualitiesRef.current.add(state.selectedQuality)

      const nextQual = sources.findIndex(
        (_, idx) => !failedQualitiesRef.current.has(idx)
      )
      if (nextQual !== -1 && nextQual < sources.length) {
        actions.dispatch({ type: "STREAM_ERROR", error: null })
        actions.setQuality(nextQual)
        return
      }

      if (!hasRefetchedRef.current && onRefetchCurrentProvider) {
        hasRefetchedRef.current = true
        failedQualitiesRef.current.clear()
        actions.dispatch({ type: "STREAM_ERROR", error: null })
        void onRefetchCurrentProvider()
        return
      }

      if (providerIndex < allProviders.length - 1) {
        const timer = setTimeout(() => {
          actions.dispatch({ type: "STREAM_ERROR", error: null })
          onProviderChange(providerIndex + 1)
        }, 300)
        return () => clearTimeout(timer)
      }
    }
  }, [
    state.streamError,
    state.selectedQuality,
    sources,
    providerIndex,
    allProviders.length,
    onProviderChange,
    onRefetchCurrentProvider,
    actions,
  ])

  // ── UI Hide/Show ──────────────────────────────────────────────────────────
  const showUI = useCallback(() => {
    actions.showUI()
    actions.dispatch({ type: "SET_MOBILE_SKIP_VISIBLE", visible: true })

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      if (
        videoRef.current &&
        !videoRef.current.paused &&
        !openMenuRef.current
      ) {
        actions.dispatch({ type: "SHOW_UI", visible: false })
      }
    }, 3500)

    if (mobileSkipTimerRef.current) clearTimeout(mobileSkipTimerRef.current)
    mobileSkipTimerRef.current = setTimeout(() => {
      actions.dispatch({ type: "SET_MOBILE_SKIP_VISIBLE", visible: false })
    }, 2000)
  }, [actions])

  useEffect(() => {
    if (state.openMenu !== null) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      setTimeout(() => actions.showUI(), 0)
    } else {
      showUI()
    }
  }, [state.openMenu, showUI, actions])

  // ── Seek Handlers ──────────────────────────────────────────────────────────
  const seek = useCallback(
    (delta: number) => {
      actions.seekDelta(delta)
      actions.dispatch({
        type: "SKIP_INDICATOR",
        indicator: { type: delta > 0 ? "forward" : "backward", id: Date.now() },
      })
      if (watchpartyEnabled && videoRef.current) {
        broadcastSeek(videoRef.current.currentTime)
      }
    },
    [actions, watchpartyEnabled, broadcastSeek]
  )

  const seekTo = useCallback(
    (clientX: number) => {
      const bar = progressBarRef.current
      const v = videoRef.current
      if (!bar || !v || !state.duration) return
      const { left, width } = bar.getBoundingClientRect()
      const newTime =
        Math.max(0, Math.min(1, (clientX - left) / width)) * state.duration
      actions.seek(newTime)
      broadcastSeekThrottled(newTime)
    },
    [state.duration, actions, broadcastSeekThrottled]
  )

  useKeyboardControls({ videoRef, seek, showUI, toggleFullscreen })

  // ── Progress Dragging ─────────────────────────────────────────────────────
  const handleProgressPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      actions.setDragging(true)
      actions.showUI()
      seekTo(e.clientX)
    },
    [actions, seekTo]
  )

  useEffect(() => {
    if (!state.isDragging) return
    const onMove = (e: globalThis.PointerEvent) => seekTo(e.clientX)
    const onUp = () => {
      actions.setDragging(false)
      flushPendingSeek()
    }
    document.addEventListener("pointermove", onMove)
    document.addEventListener("pointerup", onUp)
    return () => {
      document.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerup", onUp)
    }
  }, [state.isDragging, seekTo, actions, flushPendingSeek])

  // ── Native Track Mode Sync (iOS Fullscreen) ──────────────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const tracks = video.textTracks
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = iosNativeFullscreen ? "showing" : "disabled"
    }
  }, [iosNativeFullscreen, state.vttUrl])

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      if (mobileSkipTimerRef.current) clearTimeout(mobileSkipTimerRef.current)
      if (seekBroadcastTimerRef.current) clearTimeout(seekBroadcastTimerRef.current)
    }
  }, [])

  // ── Selectors for minimal child renders ─────────────────────────────────────
  const { currentCues, uiVisible } = useStoreSelector(store, selectSubtitle)
  const { skipIndicator } = useStoreSelector(store, selectSkip)

  const navigate = useNavigate()

  const handleStartWatchparty = useCallback(() => {
    const base =
      movieTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 20) || "watch"
    const rand = Math.random().toString(36).slice(2, 7)
    const roomSlug = `${base}-${rand}`

    void navigate({
      to: "/$type/$id/netflix",
      params: { type: mediaType, id: String(movieId) },
      search: { room: roomSlug, season, episode },
    })
  }, [movieTitle, navigate, mediaType, movieId, season, episode])

  const handleSetOpenMenu = useCallback(
    (val: SetStateAction<"settings" | "provider" | "episodes" | null>) => {
      actions.setMenu(typeof val === "function" ? val(state.openMenu) : val)
    },
    [actions, state.openMenu]
  )

  return (
    <div
      ref={containerRef}
      className="group relative flex h-full w-full items-center justify-center overflow-hidden bg-black"
      onMouseMove={showUI}
      onMouseLeave={() => {
        if (state.playing && !state.openMenu) actions.dispatch({ type: "SHOW_UI", visible: false })
      }}
    >
      {/* ── Video ── */}
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        poster={poster}
        crossOrigin="anonymous"
        playsInline
        onClick={() => {
          if (!uiVisible) {
            showUI()
          } else {
            actions.togglePlay()
            showUI()
          }
        }}
      >
        {state.vttUrl && (
          <track
            kind="subtitles"
            src={state.vttUrl}
            srcLang="id"
            label="Custom Subtitles"
            onLoad={(e) => {
              const trackElem = e.currentTarget
              if (trackElem.track) {
                trackElem.track.mode = iosNativeFullscreen
                  ? "showing"
                  : "disabled"
              }
            }}
          />
        )}
      </video>

      {/* ── Custom Subtitle Overlay ── */}
      {!iosNativeFullscreen && (
        <SubtitleOverlay
          currentActiveCues={currentCues}
          uiVisible={uiVisible}
          subMargin={playerSettings.subMargin}
          subFont={playerSettings.subFont}
          subSize={playerSettings.subSize}
          subLh={playerSettings.subLh}
          subBg={playerSettings.subBg}
        />
      )}

      {/* ── Fetching Overlay ── */}
      {isFetchingProvider && (
        <ProviderConnectingOverlay
          provider={provider}
          providerIndex={providerIndex}
          allProviders={allProviders}
        />
      )}

      {/* ── Buffering Pulse ── */}
      {state.buffering && !isFetchingProvider && !state.streamError && (
        <BufferingPulse />
      )}

      {/* ── Stream Error Overlay ── */}
      {state.streamError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 px-6">
          {state.streamError.type === "network" ? (
            <span className="material-symbols-outlined !text-[48px] mb-4 text-red-400">wifi_off</span>
          ) : (
            <span className="material-symbols-outlined !text-[48px] mb-4 text-red-400">warning</span>
          )}
          <h3 className="mb-1 text-lg font-bold text-white">
            {state.streamError.message}
          </h3>
          {state.streamError.details && (
            <p className="max-w-sm text-center text-sm text-white/50">
              {state.streamError.details}
            </p>
          )}
          {state.streamError.type === "network" && state.networkErrorCount > 0 && (
            <p className="mt-1 text-xs text-white/30">
              Failed attempts: {state.networkErrorCount}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={actions.retry}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              <span className="material-symbols-outlined !text-[16px]">refresh</span>
              Retry
            </button>
            {allProviders.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  actions.dispatch({ type: "STREAM_ERROR", error: null })
                  const nextIdx =
                    providerIndex < allProviders.length - 1
                      ? providerIndex + 1
                      : 0
                  onProviderChange(nextIdx)
                }}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500"
              >
                Try another provider
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Paused Overlay ── */}
      <PausedOverlay
        playing={state.playing}
        buffering={state.buffering}
        isFetchingProvider={isFetchingProvider}
        openMenu={state.openMenu}
        movieTitle={movieTitle}
        movieYear={movieYear}
        voteAverage={voteAverage}
        popularity={popularity}
        movieOverview={movieOverview}
        logoPath={logoPath}
      />

      {/* ── Skip Feedback Indicator ── */}
      <SkipIndicator skipIndicator={skipIndicator} />

      {/* ── UI Overlay ── */}
      <div
        className={`pointer-events-none absolute inset-0 z-40 transition-opacity duration-300 ${
          uiVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* ── Top Bar ── */}
        <TopAppBar
          mediaType={mediaType}
          movieId={movieId}
          movieTitle={movieTitle}
          provider={provider}
          providerIndex={providerIndex}
          allProviders={allProviders}
          onProviderChange={onProviderChange}
          openMenu={state.openMenu}
          setOpenMenu={handleSetOpenMenu}
          onStartWatchparty={handleStartWatchparty}
          isWatchpartyActive={watchpartyEnabled}
        />

        {/* ── Mobile Vertical Skip Buttons ── */}
        <div
          className={`pointer-events-auto transition-opacity duration-300 md:hidden ${
            state.mobileSkipVisible
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              seek(-10)
            }}
            className="fixed top-1/2 left-4 z-40 flex p-2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-white backdrop-blur-sm transition-all active:scale-90"
            aria-label="Skip backward 10 seconds"
          >
            <span className="material-symbols-outlined text-[36px]">replay_10</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              seek(10)
            }}
            className="fixed top-1/2 right-4 z-40 flex p-2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-white backdrop-blur-sm transition-all active:scale-90"
            aria-label="Skip forward 10 seconds"
          >
            <span className="material-symbols-outlined text-[36px]">forward_10</span>
          </button>
        </div>

        {/* ── Lazy Settings Modal ── */}
        <Suspense fallback={null}>
          {state.openMenu === "settings" && (
            <SettingsModal
              setOpenMenu={handleSetOpenMenu}
              playbackRate={state.playbackRate}
              setPlaybackRate={actions.setPlaybackRate}
              selectedSub={state.selectedSub}
              setSelectedSub={actions.setSub}
              providerSubtitles={subtitles}
              wyzieGroups={wyzieGroups}
              isFetchingWyzie={isFetchingWyzie}
              onFetchWyzie={handleFetchWyzie}
              subError={state.subError}
              subOffset={playerSettings.subOffset}
              setSubOffset={playerSettings.setSubOffset}
              subSize={playerSettings.subSize}
              setSubSize={playerSettings.setSubSize}
              subBg={playerSettings.subBg}
              setSubBg={playerSettings.setSubBg}
              subFont={playerSettings.subFont}
              setSubFont={playerSettings.setSubFont}
              subLh={playerSettings.subLh}
              setSubLh={playerSettings.setSubLh}
              subMargin={playerSettings.subMargin}
              setSubMargin={playerSettings.setSubMargin}
            />
          )}
        </Suspense>

        {/* ── Lazy Episodes Drawer ── */}
        <Suspense fallback={null}>
          <AnimatePresence>
            {state.openMenu === "episodes" && mediaType === "tv" && (
              <EpisodesDrawer
                tvId={String(movieId)}
                currentSeason={season}
                currentEpisode={episode}
                seasons={seasons}
                onClose={() => actions.setMenu(null)}
              />
            )}
          </AnimatePresence>
        </Suspense>

        {/* ── Bottom Controls ── */}
        <BottomControls
          progressBarRef={progressBarRef}
          currentTime={state.currentTime}
          duration={state.duration}
          bufferedRanges={state.bufferedRanges}
          progressPct={
            state.duration ? (state.currentTime / state.duration) * 100 : 0
          }
          hoverPct={state.hoverX !== null ? state.hoverX * 100 : null}
          hoverX={state.hoverX}
          handleProgressHover={(e) => {
            const bar = progressBarRef.current
            if (!bar) return
            const { left, width } = bar.getBoundingClientRect()
            actions.setHoverX(Math.max(0, Math.min(1, (e.clientX - left) / width)))
          }}
          handleProgressPointerDown={handleProgressPointerDown}
          setHoverX={actions.setHoverX}
          playing={state.playing}
          togglePlay={actions.togglePlay}
          seek={seek}
          showVolSlider={state.showVolSlider}
          setShowVolSlider={actions.setVolSlider}
          muted={state.muted}
          volume={state.volume}
          toggleMute={actions.toggleMute}
          handleVolumeChange={(e) => {
            const val = parseFloat(e.target.value)
            actions.setVolume(val)
          }}
          openMenu={state.openMenu}
          setOpenMenu={handleSetOpenMenu}
          selectedSub={state.selectedSub}
          fullscreen={fullscreen}
          toggleFullscreen={toggleFullscreen}
          mediaType={mediaType}
          sources={sources}
          selectedQuality={state.selectedQuality}
          setSelectedQuality={actions.setQuality}
        />
      </div>

      {/* ── Watchparty Overlay ── */}
      {watchpartyEnabled && watchparty && (
        <RoomOverlay
          peers={peers}
          status={watchpartyStatus}
          roomSlug={watchparty.roomSlug}
          mediaType={mediaType}
          movieId={movieId}
          season={season}
          episode={episode}
          onRequestSync={requestSync}
          isSynced={isSynced}
        />
      )}
    </div>
  )
}
