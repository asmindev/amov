import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type MouseEvent,
  type ChangeEvent,
} from "react"
import Hls from "hls.js"
import type { StreamSource, StreamSubtitle } from "@/api/decryptor.api"
import type { DecryptorProvider } from "@/lib/config"
import { DECRYPTOR_PROVIDERS, DECRYPTOR_URL } from "@/lib/config"
import { RefreshCw } from "lucide-react"
import { AnimatePresence } from "motion/react"
import { useWatchProgressTracker } from "@/hooks/use-watch-progress"
import type { TvSeason } from "@/types/movie.types"
import { TopAppBar } from "./player-ui/top-app-bar"
import { BottomControls } from "./player-ui/bottom-controls"
import { SettingsModal } from "./player-ui/settings-modal"
import { EpisodesDrawer } from "./player-ui/episodes-drawer"
import { useSubtitles } from "../hooks/use-subtitles"
import { usePlayerSettings } from "../hooks/use-player-settings"
import { SubtitleOverlay } from "./player-ui/subtitle-overlay"
import { PausedOverlay } from "./player-ui/paused-overlay"
import { SkipIndicator } from "./player-ui/skip-indicator"

interface HlsPlayerProps {
  sources: StreamSource[]
  subtitles: StreamSubtitle[]
  movieId: number
  movieTitle: string
  movieYear: string
  poster?: string
  provider: DecryptorProvider
  providerIndex: number
  allProviders: typeof DECRYPTOR_PROVIDERS
  onProviderChange: (index: number) => void
  isFetchingProvider: boolean
  imdbId?: string
  movieOverview?: string
  popularity?: number
  voteAverage?: number
  logoPath?: string | null
  mediaType?: "movie" | "tv"
  season?: number
  episode?: number
  seasons?: TvSeason[]
}

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
  const hlsRef = useRef<Hls | null>(null)
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
  const [fullscreen, setFullscreen] = useState(false)
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

  // Auto-select Indonesian subtitle when available; otherwise let the user choose.
  useEffect(() => {
    if (subtitles.length > 0 && selectedSub === null) {
      const defaultSub = subtitles.find(
        (s) =>
          s.lang === "id" ||
          s.lang === "ind" ||
          s.lang === "in" ||
          (s.language || "").toLowerCase().includes("indonesi")
      )
      if (defaultSub) {
        setSelectedSub(defaultSub.url)
      }
    }
  }, [subtitles, selectedSub])

  // ── Customization State ────────────────────────────────────────────────────
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

  // Track progress → localStorage
  useWatchProgressTracker("movie", movieId, true)

  // ── HLS Load ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video || sources.length === 0) return
    const src = sources[selectedQuality]?.url
    if (!src) return

    const savedTs = (() => {
      try {
        const raw = localStorage.getItem("amov_watch_progress")
        if (!raw) return 0
        const all = JSON.parse(raw) as Record<string, { timestamp: number }>
        return all[`movie_${movieId}`]?.timestamp ?? 0
      } catch {
        return 0
      }
    })()

    hlsRef.current?.destroy()
    hlsRef.current = null

    const isHls = src.includes(".m3u8") || src.includes("/hls/")
    if (Hls.isSupported() && isHls) {
      let currentRemoteBase = ""
      if (src.startsWith("http://") || src.startsWith("https://")) {
        currentRemoteBase = src.substring(0, src.lastIndexOf("/") + 1)
      }

      const hls = new Hls({
        startPosition: savedTs > 30 ? savedTs : -1,
        xhrSetup: (xhr, url) => {
          let targetUrl = url
          const localHost = window.location.host
          const isLocal =
            url.includes(localHost) ||
            url.includes("/api/decryptor") ||
            (!url.startsWith("http://") && !url.startsWith("https://"))

          if (isLocal && currentRemoteBase) {
            // Fix: hls.js resolved relative segment against local proxy URL. Reconstruct original CDN URL!
            const relativePath = url
              .replace(/^https?:\/\/[^\/]+/, "")
              .replace(/^\/api\/decryptor\//, "")
              .replace(/^\//, "")
            targetUrl = new URL(relativePath, currentRemoteBase).toString()
          } else if (!isLocal) {
            currentRemoteBase = url.substring(0, url.lastIndexOf("/") + 1)
          }

          const proxyUrl = `${DECRYPTOR_URL}/proxy?url=${encodeURIComponent(targetUrl)}`
          xhr.open("GET", proxyUrl, true)
        },
      })
      hls.loadSource(src)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        void video.play()
      })
      hlsRef.current = hls
    } else {
      // Stream raw MP4 or fallback video via proxy to prevent CORS, 403, and 429 errors
      const proxiedUrl = src.startsWith("http")
        ? `${DECRYPTOR_URL}/proxy?url=${encodeURIComponent(src)}`
        : src

      video.src = proxiedUrl

      if (savedTs > 30) {
        video.addEventListener(
          "loadedmetadata",
          () => {
            video.currentTime = savedTs
          },
          { once: true }
        )
      }
      void video.play().catch(() => {
        // Autoplay policy or user gesture catch
      })
    }
    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [sources, selectedQuality, movieId])

  // ── Video events ──────────────────────────────────────────────────────────
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onPlay = () => setPlaying(true)
    const onPause = () => {
      setPlaying(false)
      setUiVisible(true)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
    const onTimeUpdate = () => {
      setCurrentTime(v.currentTime)
      if (v.buffered.length > 0)
        setBufferedEnd(v.buffered.end(v.buffered.length - 1))
    }
    const onDuration = () => setDuration(v.duration)
    const onWaiting = () => setBuffering(true)
    const onPlaying = () => setBuffering(false)
    const onVolume = () => {
      setVolume(v.volume)
      setMuted(v.muted)
    }

    v.addEventListener("play", onPlay)
    v.addEventListener("pause", onPause)
    v.addEventListener("timeupdate", onTimeUpdate)
    v.addEventListener("durationchange", onDuration)
    v.addEventListener("waiting", onWaiting)
    v.addEventListener("playing", onPlaying)
    v.addEventListener("volumechange", onVolume)
    return () => {
      v.removeEventListener("play", onPlay)
      v.removeEventListener("pause", onPause)
      v.removeEventListener("timeupdate", onTimeUpdate)
      v.removeEventListener("durationchange", onDuration)
      v.removeEventListener("waiting", onWaiting)
      v.removeEventListener("playing", onPlaying)
      v.removeEventListener("volumechange", onVolume)
    }
  }, [])

  // ── Fullscreen sync & Native TextTrack Mode Sync ────────────────────────
  useEffect(() => {
    const v = videoRef.current

    const syncTrackMode = (isNativeFs: boolean) => {
      if (!v || !v.textTracks || v.textTracks.length === 0) return
      const track = v.textTracks[0]
      if (track) {
        // Disable native track rendering in web mode so only Custom Netflix SubtitleOverlay is shown,
        // enable "showing" on iOS Native Fullscreen on iPhone
        track.mode = isNativeFs ? "showing" : "disabled"
      }
    }

    const handler = () => {
      const isFs =
        !!document.fullscreenElement ||
        !!(document as unknown as { webkitFullscreenElement?: Element })
          .webkitFullscreenElement
      setFullscreen(isFs)
      syncTrackMode(false)
    }

    document.addEventListener("fullscreenchange", handler)
    document.addEventListener("webkitfullscreenchange", handler)

    const onWebkitBeginFs = () => {
      setFullscreen(true)
      syncTrackMode(true)
    }
    const onWebkitEndFs = () => {
      setFullscreen(false)
      syncTrackMode(false)
    }

    if (v) {
      v.addEventListener("webkitbeginfullscreen", onWebkitBeginFs)
      v.addEventListener("webkitendfullscreen", onWebkitEndFs)
      // Initial track mode setup
      syncTrackMode(false)
    }

    return () => {
      document.removeEventListener("fullscreenchange", handler)
      document.removeEventListener("webkitfullscreenchange", handler)
      if (v) {
        v.removeEventListener("webkitbeginfullscreen", onWebkitBeginFs)
        v.removeEventListener("webkitendfullscreen", onWebkitEndFs)
      }
    }
  }, [vttUrl])

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

  // Keep UI visible when menu is open
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

  // ── Fullscreen toggle ─────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    const el = containerRef.current
    const v = videoRef.current

    // 1. Standard W3C Fullscreen (Chrome, Firefox, Safari Desktop, iPadOS)
    if (el && typeof el.requestFullscreen === "function") {
      if (!document.fullscreenElement) {
        void el.requestFullscreen()
      } else {
        void document.exitFullscreen()
      }
    }
    // 2. iOS Safari iPhone Native Video Presentation Mode
    else if (
      v &&
      "webkitEnterFullscreen" in v &&
      typeof (v as unknown as { webkitEnterFullscreen: () => void })
        .webkitEnterFullscreen === "function"
    ) {
      const iosVideo = v as unknown as {
        webkitEnterFullscreen: () => void
        webkitExitFullscreen: () => void
        webkitDisplayingFullscreen?: boolean
      }
      if (iosVideo.webkitDisplayingFullscreen) {
        iosVideo.webkitExitFullscreen?.()
      } else {
        iosVideo.webkitEnterFullscreen()
      }
    }
  }

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return
      const v = videoRef.current
      if (!v) return
      showUI()
      switch (e.code) {
        case "Space":
        case "KeyK":
          e.preventDefault()
          if (v.paused) {
            void v.play()
          } else {
            v.pause()
          }
          break
        case "ArrowLeft":
        case "KeyJ":
          seek(-10)
          break
        case "ArrowRight":
        case "KeyL":
          seek(10)
          break
        case "ArrowUp":
          v.volume = Math.min(1, v.volume + 0.1)
          break
        case "ArrowDown":
          v.volume = Math.max(0, v.volume - 0.1)
          break
        case "KeyM":
          v.muted = !v.muted
          break
        case "KeyF":
          toggleFullscreen()
          break
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [showUI, seek]) // toggleFullscreen is stable (no deps)

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

  // ── Apply Playback Rate ───────────────────────────────────────────────────
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate
    }
  }, [playbackRate])

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
            default
          />
        )}
      </video>

      {/* ── Custom Subtitle Overlay ── */}
      <SubtitleOverlay
        currentActiveCues={currentActiveCues}
        uiVisible={uiVisible}
        subMargin={subMargin}
        subFont={subFont}
        subSize={subSize}
        subLh={subLh}
        subBg={subBg}
      />

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
