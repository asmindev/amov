import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type MouseEvent,
  type ChangeEvent,
} from "react"
import type { StreamSubtitle } from "@/api/decryptor.api"
import { RefreshCw } from "lucide-react"
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
  const [localSubtitles, setLocalSubtitles] = useState<StreamSubtitle[]>([])
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

  useEffect(() => {
    if (!skipIndicator) return
    const t = setTimeout(() => {
      setSkipIndicator(null)
    }, 600)
    return () => clearTimeout(t)
  }, [skipIndicator])

  const allSubtitles = [...subtitles, ...localSubtitles]

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

  const { currentActiveCues, vttUrl } = useSubtitles(
    selectedSub,
    subOffset,
    currentTime
  )

  // ── Hooks ──────────────────────────────────────────────────────────────────
  useAutoSelectSubtitle(subtitles, selectedSub, setSelectedSub)

  useHlsLoader({ videoRef, hlsRef, sources, selectedQuality, movieId })

  useVideoEvents({
    videoRef,
    onPlay: () => setPlaying(true),
    onPause: () => {
      setPlaying(false)
      setUiVisible(true)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    },
    onTimeUpdate: () => {
      const v = videoRef.current
      if (!v) return
      setCurrentTime(v.currentTime)
      if (v.buffered.length > 0)
        setBufferedEnd(v.buffered.end(v.buffered.length - 1))
    },
    onDuration: () => {
      const v = videoRef.current
      if (v) setDuration(v.duration)
    },
    onWaiting: () => setBuffering(true),
    onPlaying: () => setBuffering(false),
    onVolume: () => {
      const v = videoRef.current
      if (v) {
        setVolume(v.volume)
        setMuted(v.muted)
      }
    },
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

  // ── UI hide/show ──────────────────────────────────────────────────────────
  const showUI = useCallback(() => {
    setUiVisible(true)
    setMobileSkipVisible(true)

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused && !openMenuRef.current) {
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
          togglePlay()
          showUI()
        }}
      >
        {vttUrl && (
          <track
            kind="subtitles"
            src={vttUrl}
            srcLang="id"
            label="Indonesian Subtitle"
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
      {buffering && !isFetchingProvider && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="h-14 w-14 animate-spin rounded-full border-[3px] border-white/20 border-t-white" />
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
            mobileSkipVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              seek(-10)
            }}
            className="fixed left-4 top-1/2 z-40 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all active:scale-90"
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
            className="fixed right-4 top-1/2 z-40 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all active:scale-90"
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
            subtitles={allSubtitles}
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
            sources={sources}
            selectedQuality={selectedQuality}
            setSelectedQuality={setSelectedQuality}
            imdbId={imdbId}
            movieId={movieId}
            movieTitle={movieTitle}
            movieYear={movieYear}
            onAddLocalSubtitles={(subs) =>
              setLocalSubtitles((prev) => [...prev, ...subs])
            }
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
        />
      </div>
    </div>
  )
}
