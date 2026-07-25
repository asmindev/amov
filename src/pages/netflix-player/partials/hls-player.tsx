import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type MouseEvent,
  type ChangeEvent,
} from "react"
import type { WyzieSubtitleGroup } from "@/api/decryptor.api"
import { fetchWyzieSubtitles } from "@/api/decryptor.api"
import { RefreshCw, AlertTriangle, WifiOff } from "lucide-react"
import { AnimatePresence } from "motion/react"
import { useWatchProgressTracker } from "@/hooks/use-watch-progress"
import { TopAppBar } from "./player-ui/top-app-bar"
import { BottomControls } from "./player-ui/bottom-controls"
import { SettingsModal } from "./player-ui/settings-modal"
import { EpisodesDrawer } from "./player-ui/episodes-drawer"
import { useSubtitles } from "../hooks/use-subtitles"
import { usePlayerSettings } from "../hooks/use-player-settings"
import { useAutoSelectSubtitle } from "../hooks/use-auto-select-subtitle"
import { useVideoEvents } from "../hooks/use-video-events"
import { useFullscreen } from "../hooks/use-fullscreen"
import { useKeyboardControls } from "../hooks/use-keyboard-controls"
import { useHlsLoader } from "../hooks/use-hls-loader"
import { SubtitleOverlay } from "./player-ui/subtitle-overlay"
import { PausedOverlay } from "./player-ui/paused-overlay"
import { SkipIndicator } from "./player-ui/skip-indicator"
import type { HlsPlayerProps } from "../hls-player.types"
import type { StreamError } from "../hooks/use-hls-loader"

// ─── Main Component ───────────────────────────────────────────────────────────

export function HlsPlayer({
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
}: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const pauseDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bufferingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── State ──────────────────────────────────────────────────────────────────
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bufferedEnd, setBufferedEnd] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [uiVisible, setUiVisible] = useState(true)
  const [mobileSkipVisible, setMobileSkipVisible] = useState(true)
  const mobileSkipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [selectedQuality, setSelectedQuality] = useState(0)
  const [selectedSub, setSelectedSub] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<
    "settings" | "provider" | "episodes" | null
  >(null)
  const openMenuRef = useRef(openMenu)
  useEffect(() => {
    openMenuRef.current = openMenu
  }, [openMenu])
  const [buffering, setBuffering] = useState(false)
  const [hoverX, setHoverX] = useState<number | null>(null)
  const [showVolSlider, setShowVolSlider] = useState(false)
  const [skipIndicator, setSkipIndicator] = useState<{
    type: "forward" | "backward"
    id: number
  } | null>(null)
  const [streamError, setStreamError] = useState<StreamError | null>(null)
  const [networkErrorCount, setNetworkErrorCount] = useState(0)

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

  useEffect(() => {
    if (!skipIndicator) return
    const t = setTimeout(() => {
      setSkipIndicator(null)
    }, 600)
    return () => clearTimeout(t)
  }, [skipIndicator])

  // ── Customization ──────────────────────────────────────────────────────────
  const {
    playbackRate,
    setPlaybackRate,
    subSize,
    setSubSize,
    subBg,
    setSubBg,
    subFont,
    setSubFont,
    subLh,
    setSubLh,
    subOffset,
    setSubOffset,
    subMargin,
    setSubMargin,
  } = usePlayerSettings()

  const { currentActiveCues, vttUrl, subError } = useSubtitles(
    selectedSub,
    subOffset,
    currentTime
  )

  // ── Hooks ──────────────────────────────────────────────────────────────────
  useAutoSelectSubtitle(subtitles, selectedSub, setSelectedSub)

  const hasRefetchedRef = useRef(false)
  const failedQualitiesRef = useRef<Set<number>>(new Set())

  useEffect(() => {
    hasRefetchedRef.current = false
    failedQualitiesRef.current.clear()
  }, [providerIndex])

  // ── Auto Failover: Try next CDN mirror/quality -> Refetch -> Next Provider ────
  useEffect(() => {
    if (streamError) {
      failedQualitiesRef.current.add(selectedQuality)

      // 1. Try next available CDN mirror/quality source in current provider
      const nextQual = sources.findIndex(
        (_, idx) => !failedQualitiesRef.current.has(idx)
      )
      if (nextQual !== -1 && nextQual < sources.length) {
        console.warn(
          `Source ${selectedQuality} failed. Auto-switching to CDN mirror ${nextQual}...`
        )
        setStreamError(null)
        setNetworkErrorCount(0)
        setSelectedQuality(nextQual)
        return
      }

      // 2. Refetch fresh signed URLs for current provider if not done yet
      if (!hasRefetchedRef.current && onRefetchCurrentProvider) {
        console.warn(
          "All CDN mirrors failed for provider",
          provider,
          ". Auto-refreshing signed URLs..."
        )
        hasRefetchedRef.current = true
        failedQualitiesRef.current.clear()
        setStreamError(null)
        setNetworkErrorCount(0)
        void onRefetchCurrentProvider()
        return
      }

      // 3. Fallback to next provider
      if (providerIndex < allProviders.length - 1) {
        const timer = setTimeout(() => {
          setStreamError(null)
          setNetworkErrorCount(0)
          onProviderChange(providerIndex + 1)
        }, 300)
        return () => clearTimeout(timer)
      }
    }
  }, [
    streamError,
    selectedQuality,
    sources,
    providerIndex,
    allProviders.length,
    provider,
    onProviderChange,
    onRefetchCurrentProvider,
  ])

  useHlsLoader({
    videoRef,
    hlsRef,
    sources,
    selectedQuality,
    movieId,
    imdbId,
    season,
    episode,
    onError: setStreamError,
    onNetworkError: () => setNetworkErrorCount((c) => c + 1),
  })

  useVideoEvents({
    videoRef,
    onPlay: () => {
      if (pauseDebounceRef.current) clearTimeout(pauseDebounceRef.current)
      setPlaying(true)
    },
    onPause: () => {
      if (pauseDebounceRef.current) clearTimeout(pauseDebounceRef.current)
      pauseDebounceRef.current = setTimeout(() => {
        const v = videoRef.current
        if (v && v.paused && !v.seeking) {
          setPlaying(false)
          setUiVisible(true)
          if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
        }
      }, 500)
    },
    onTimeUpdate: () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        const v = videoRef.current
        if (!v) return
        const t = v.currentTime
        setCurrentTime((prev) => {
          if (Math.abs(t - prev) < 0.1) return prev
          return t
        })
        if (v.buffered.length > 0) {
          const b = v.buffered.end(v.buffered.length - 1)
          setBufferedEnd((prev) => {
            if (Math.abs(b - prev) < 0.5) return prev
            return b
          })
        }
      })
    },
    onDuration: () => {
      const v = videoRef.current
      if (v) setDuration(v.duration)
    },
    onWaiting: () => {
      if (bufferingDebounceRef.current) clearTimeout(bufferingDebounceRef.current)
      bufferingDebounceRef.current = setTimeout(() => {
        setBuffering(true)
      }, 200)
    },
    onPlaying: () => {
      if (bufferingDebounceRef.current) clearTimeout(bufferingDebounceRef.current)
      setBuffering(false)
      setStreamError(null)
      setNetworkErrorCount(0)
    },
    onVolume: () => {
      const v = videoRef.current
      if (v) {
        setVolume(v.volume)
        setMuted(v.muted)
      }
    },
    onError: setStreamError,
  })

  const { fullscreen, iosNativeFullscreen, toggleFullscreen } = useFullscreen(
    containerRef,
    videoRef
  )

  // ── Native track mode sync ──────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const tracks = video.textTracks
    for (let i = 0; i < tracks.length; i++) {
      tracks[i].mode = iosNativeFullscreen ? "showing" : "disabled"
    }
  }, [iosNativeFullscreen, vttUrl])

  // Track progress → localStorage
  useWatchProgressTracker("movie", movieId, true)

  // ── Cleanup RAF on unmount ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (pauseDebounceRef.current) clearTimeout(pauseDebounceRef.current)
      if (bufferingDebounceRef.current) clearTimeout(bufferingDebounceRef.current)
    }
  }, [])

  // ── UI hide/show ──────────────────────────────────────────────────────────
  const showUI = useCallback(() => {
    setUiVisible(true)
    setMobileSkipVisible(true)

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      if (
        videoRef.current &&
        !videoRef.current.paused &&
        !openMenuRef.current
      ) {
        setUiVisible(false)
      }
    }, 3500)

    if (mobileSkipTimerRef.current) clearTimeout(mobileSkipTimerRef.current)
    mobileSkipTimerRef.current = setTimeout(() => {
      setMobileSkipVisible(false)
    }, 2000)
  }, [])

  useEffect(() => {
    if (openMenu !== null) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      setTimeout(() => setUiVisible(true), 0)
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      showUI()
    }
  }, [openMenu, showUI])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const seek = useCallback((delta: number) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta))
    setSkipIndicator({
      type: delta > 0 ? "forward" : "backward",
      id: Date.now(),
    })
  }, [])

  useKeyboardControls({ videoRef, seek, showUI, toggleFullscreen })

  // ── Apply Playback Rate ───────────────────────────────────────────────────
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      void v.play()
    } else {
      v.pause()
    }
  }

  const handleProgressClick = (e: MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current
    const v = videoRef.current
    if (!bar || !v || !duration) return
    const { left, width } = bar.getBoundingClientRect()
    v.currentTime =
      Math.max(0, Math.min(1, (e.clientX - left) / width)) * duration
  }

  const handleProgressHover = (e: MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current
    if (!bar) return
    const { left, width } = bar.getBoundingClientRect()
    setHoverX(Math.max(0, Math.min(1, (e.clientX - left) / width)))
  }

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current
    if (!v) return
    const val = parseFloat(e.target.value)
    v.volume = val
    v.muted = val === 0
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
  }

  const progressPct = duration ? (currentTime / duration) * 100 : 0
  const bufferedPct = duration ? (bufferedEnd / duration) * 100 : 0
  const hoverPct = hoverX !== null ? hoverX * 100 : null

  const handleRetry = useCallback(() => {
    setStreamError(null)
    setNetworkErrorCount(0)
    const v = videoRef.current
    if (v) {
      v.currentTime = 0
      void v.play().catch(() => {})
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="group relative flex h-full w-full items-center justify-center overflow-hidden bg-black"
      onMouseMove={showUI}
      onMouseLeave={() => {
        if (playing && !openMenu) setUiVisible(false)
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
            togglePlay()
            showUI()
          }
        }}
      >
        {vttUrl && (
          <track
            kind="subtitles"
            src={vttUrl}
            srcLang="id"
            label="Custom Subtitles"
            default
            onLoad={(e) => {
              const trackElem = e.currentTarget
              if (trackElem.track) {
                trackElem.track.mode = iosNativeFullscreen
                  ? "showing"
                  : "disabled"
                console.log(
                  "Native track loaded successfully:",
                  trackElem.track.cues?.length,
                  "cues"
                )
              }
            }}
          />
        )}
      </video>

      {/* ── Custom Subtitle Overlay ── */}
      {!iosNativeFullscreen && (
        <SubtitleOverlay
          currentActiveCues={currentActiveCues}
          uiVisible={uiVisible}
          subMargin={subMargin}
          subFont={subFont}
          subSize={subSize}
          subLh={subLh}
          subBg={subBg}
        />
      )}

      {/* ── Fetching overlay ── */}
      {isFetchingProvider && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90">
          <RefreshCw className="mb-4 h-10 w-10 animate-spin text-white opacity-80" />
          <p className="text-base font-medium text-white opacity-80">
            Connecting via{" "}
            <span className="font-bold text-[#E50914]">{provider}</span>…
          </p>
          {providerIndex > 0 && (
            <p className="mt-1 text-sm text-white/40">
              Fallback {providerIndex + 1} / {allProviders.length}
            </p>
          )}
        </div>
      )}

      {/* ── Buffering spinner ── */}
      {buffering && !isFetchingProvider && !streamError && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="h-14 w-14 animate-spin rounded-full border-[3px] border-white/20 border-t-white" />
        </div>
      )}

      {/* ── Stream error overlay ── */}
      {streamError && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 px-6">
          {streamError.type === "network" ? (
            <WifiOff className="mb-4 h-12 w-12 text-red-400" />
          ) : (
            <AlertTriangle className="mb-4 h-12 w-12 text-red-400" />
          )}
          <h3 className="mb-1 text-lg font-bold text-white">
            {streamError.message}
          </h3>
          {streamError.details && (
            <p className="max-w-sm text-center text-sm text-white/50">
              {streamError.details}
            </p>
          )}
          {streamError.type === "network" && networkErrorCount > 0 && (
            <p className="mt-1 text-xs text-white/30">
              Failed attempts: {networkErrorCount}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            {allProviders.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  setStreamError(null)
                  setNetworkErrorCount(0)
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

      {/* ── Paused metadata overlay (Netflix Style) ── */}
      <PausedOverlay
        playing={playing}
        buffering={buffering}
        isFetchingProvider={isFetchingProvider}
        openMenu={openMenu}
        movieTitle={movieTitle}
        movieYear={movieYear}
        voteAverage={voteAverage}
        popularity={popularity}
        movieOverview={movieOverview}
        logoPath={logoPath}
      />

      {/* ── Skip feedback indicator ── */}
      <SkipIndicator skipIndicator={skipIndicator} />

      {/* ════════════════════════════════════════════════════════════
          UI OVERLAY — Cinematic Obsidian
      ════════════════════════════════════════════════════════════ */}
      <div
        className={`pointer-events-none absolute inset-0 z-40 transition-opacity duration-300 ${uiVisible ? "opacity-100" : "opacity-0"}`}
      >
        {/* ── TOP BAR ─────────────────────────────────────────────── */}
        <TopAppBar
          mediaType={mediaType}
          movieId={movieId}
          movieTitle={movieTitle}
          provider={provider}
          providerIndex={providerIndex}
          allProviders={allProviders}
          onProviderChange={onProviderChange}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
        />

        {/* ── Mobile Vertical Center Quick Skip Controls (Left & Right) ── */}
        <div
          className={`pointer-events-auto transition-opacity duration-300 md:hidden ${
            mobileSkipVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              seek(-10)
            }}
            className="fixed top-1/2 left-4 z-40 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all active:scale-90"
            aria-label="Skip backward 10 seconds"
          >
            <span className="material-symbols-outlined !text-[36px]">
              replay_10
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              seek(10)
            }}
            className="fixed top-1/2 right-4 z-40 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all active:scale-90"
            aria-label="Skip forward 10 seconds"
          >
            <span className="material-symbols-outlined !text-[36px]">
              forward_10
            </span>
          </button>
        </div>

        {/* ── SETTINGS MODAL ─────────────────────────────────────────────── */}
        {openMenu === "settings" && (
          <SettingsModal
            setOpenMenu={setOpenMenu}
            playbackRate={playbackRate}
            setPlaybackRate={setPlaybackRate}
            selectedSub={selectedSub}
            setSelectedSub={setSelectedSub}
            providerSubtitles={subtitles}
            wyzieGroups={wyzieGroups}
            isFetchingWyzie={isFetchingWyzie}
            onFetchWyzie={handleFetchWyzie}
            subError={subError}
            subOffset={subOffset}
            setSubOffset={setSubOffset}
            subSize={subSize}
            setSubSize={setSubSize}
            subBg={subBg}
            setSubBg={setSubBg}
            subFont={subFont}
            setSubFont={setSubFont}
            subLh={subLh}
            setSubLh={setSubLh}
            subMargin={subMargin}
            setSubMargin={setSubMargin}
          />
        )}

        {/* ── EPISODES DRAWER OVERLAY ──────────────────────────────────────── */}
        <AnimatePresence>
          {openMenu === "episodes" && mediaType === "tv" && (
            <EpisodesDrawer
              tvId={String(movieId)}
              currentSeason={season}
              currentEpisode={episode}
              seasons={seasons}
              onClose={() => setOpenMenu(null)}
            />
          )}
        </AnimatePresence>

        {/* ── BOTTOM CONTROLS ─────────────────────────────────────── */}
        <BottomControls
          progressBarRef={progressBarRef}
          currentTime={currentTime}
          duration={duration}
          bufferedPct={bufferedPct}
          progressPct={progressPct}
          hoverPct={hoverPct}
          hoverX={hoverX}
          handleProgressHover={handleProgressHover}
          handleProgressClick={handleProgressClick}
          setHoverX={setHoverX}
          playing={playing}
          togglePlay={togglePlay}
          seek={seek}
          showVolSlider={showVolSlider}
          setShowVolSlider={setShowVolSlider}
          muted={muted}
          volume={volume}
          toggleMute={toggleMute}
          handleVolumeChange={handleVolumeChange}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
          selectedSub={selectedSub}
          fullscreen={fullscreen}
          toggleFullscreen={toggleFullscreen}
          mediaType={mediaType}
          sources={sources}
          selectedQuality={selectedQuality}
          setSelectedQuality={setSelectedQuality}
        />
      </div>
    </div>
  )
}
