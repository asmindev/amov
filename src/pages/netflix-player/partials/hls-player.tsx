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
import { useWatchProgressTracker } from "@/hooks/use-watch-progress"
import { TopAppBar } from "./player-ui/top-app-bar"
import { BottomControls } from "./player-ui/bottom-controls"
import { SettingsModal } from "./player-ui/settings-modal"

interface ParsedCue {
  start: number
  end: number
  text: string
}

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
  const [selectedQuality, setSelectedQuality] = useState(0)
  const [localSubtitles, setLocalSubtitles] = useState<StreamSubtitle[]>([])
  const [selectedSub, setSelectedSub] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<"settings" | "provider" | null>(null)
  const openMenuRef = useRef(openMenu)
  useEffect(() => {
    openMenuRef.current = openMenu
  }, [openMenu])
  const [buffering, setBuffering] = useState(false)
  const [hoverX, setHoverX] = useState<number | null>(null)
  const [showVolSlider, setShowVolSlider] = useState(false)
  const [parsedCues, setParsedCues] = useState<ParsedCue[]>([])

  const allSubtitles = [...subtitles, ...localSubtitles]

  // ── Customization State ────────────────────────────────────────────────────
  const [playbackRate, setPlaybackRate] = useState(1)
  const [subSize, setSubSize] = useState(() =>
    parseInt(localStorage.getItem("amov_sub_size") || "24")
  )
  const [subBg, setSubBg] = useState(() => {
    const val = localStorage.getItem("amov_sub_bg")
    if (val === "rgba(0,0,0,0.75)") return "transparent"
    return val || "transparent"
  })
  const [subFont, setSubFont] = useState(() => {
    const val = localStorage.getItem("amov_sub_font")
    if (val === "var(--font-inter), sans-serif")
      return '"Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
    return (
      val || '"Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'
    )
  })
  const [subLh, setSubLh] = useState(() =>
    parseFloat(localStorage.getItem("amov_sub_lh") || "1.2")
  )
  const [subOffset, setSubOffset] = useState(() =>
    parseFloat(localStorage.getItem("amov_sub_offset") || "0")
  )
  const [subMargin, setSubMargin] = useState(() =>
    parseInt(localStorage.getItem("amov_sub_margin") || "40")
  )

  // Persist settings
  useEffect(() => {
    localStorage.setItem("amov_sub_size", subSize.toString())
    localStorage.setItem("amov_sub_bg", subBg)
    localStorage.setItem("amov_sub_font", subFont)
    localStorage.setItem("amov_sub_lh", subLh.toString())
    localStorage.setItem("amov_sub_offset", subOffset.toString())
    localStorage.setItem("amov_sub_margin", subMargin.toString())
  }, [subSize, subBg, subFont, subLh, subOffset, subMargin])

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

    if (Hls.isSupported() && !src.includes(".mp4") && !src.includes("/mp4/")) {
      const hls = new Hls({
        startPosition: savedTs > 30 ? savedTs : -1,
        xhrSetup: (xhr, url) => {
          const proxyUrl = `${DECRYPTOR_URL}/proxy?url=${encodeURIComponent(url)}`
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
      // Native playback (Safari HLS or raw MP4)
      video.src =
        src.includes(".mp4") || src.includes("/mp4/")
          ? src
          : `${DECRYPTOR_URL}/proxy?url=${encodeURIComponent(src)}`

      if (savedTs > 30) {
        video.addEventListener(
          "loadedmetadata",
          () => {
            video.currentTime = savedTs
          },
          { once: true }
        )
      }
      void video.play()
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

  // ── Fullscreen sync ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  // ── UI hide/show ──────────────────────────────────────────────────────────
  const showUI = useCallback(() => {
    setUiVisible(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused && !openMenuRef.current)
        setUiVisible(false)
    }, 3500)
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

  // ── Fullscreen toggle ─────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      void el.requestFullscreen()
    } else {
      void document.exitFullscreen()
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
          v.currentTime = Math.max(0, v.currentTime - 10)
          break
        case "ArrowRight":
        case "KeyL":
          v.currentTime = Math.min(v.duration, v.currentTime + 10)
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
  }, [showUI]) // toggleFullscreen is stable (no deps)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      void v.play()
    } else {
      v.pause()
    }
  }

  const seek = (delta: number) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + delta))
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

  // ── Subtitle Latency Shifter ──────────────────────────────────────────────
  useEffect(() => {
    let isCancelled = false
    async function fetchAndOffsetSub() {
      if (!selectedSub) {
        setParsedCues([])
        return
      }
      try {
        const proxyUrl = `/api/decryptor/proxy?url=${encodeURIComponent(selectedSub!)}`
        const res = await fetch(proxyUrl)
        if (!res.ok) throw new Error("fetch sub error")
        let text = await res.text()

        // Remove BOM if present and normalize newlines
        text = text
          .replace(/^\uFEFF/, "")
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n")

        // Simple VTT/SRT timestamp shifter & comma to dot converter
        const shiftedText = text.replace(
          /(\d{2,}:)?(\d{2}):(\d{2})[.,](\d{3})/g,
          (_match, h, m, s, ms) => {
            const hours = h ? parseInt(h) : 0
            const mins = parseInt(m)
            const secs = parseInt(s)
            const millis = parseInt(ms)
            let totalSeconds = hours * 3600 + mins * 60 + secs + millis / 1000
            totalSeconds += subOffset
            if (totalSeconds < 0) totalSeconds = 0

            const outH = Math.floor(totalSeconds / 3600)
            const outM = Math.floor((totalSeconds % 3600) / 60)
            const outS = Math.floor(totalSeconds % 60)
            const outMs = Math.floor(Math.round((totalSeconds % 1) * 1000))

            const pad = (n: number, len = 2) => String(n).padStart(len, "0")
            if (h || outH > 0) {
              return `${pad(outH)}:${pad(outM)}:${pad(outS)}.${pad(outMs, 3)}`
            } else {
              return `${pad(outM)}:${pad(outS)}.${pad(outMs, 3)}`
            }
          }
        )

        // Ensure it's valid WebVTT (required by browsers for <track>)
        let finalVttText = shiftedText.trim()
        if (!finalVttText.startsWith("WEBVTT")) {
          finalVttText = "WEBVTT\n\n" + finalVttText
        }

        // Parse cues manually
        const blocks = finalVttText.split(/\n\s*\n/)
        const parsed: ParsedCue[] = []

        const parseTimestamp = (ts: string): number => {
          const clean = ts.trim().replace(",", ".")
          const parts = clean.split(":")
          if (parts.length === 3) {
            const h = parseFloat(parts[0])
            const m = parseFloat(parts[1])
            const s = parseFloat(parts[2])
            return h * 3600 + m * 60 + s
          } else if (parts.length === 2) {
            const m = parseFloat(parts[0])
            const s = parseFloat(parts[1])
            return m * 60 + s
          }
          return 0
        }

        for (const block of blocks) {
          const lines = block.trim().split("\n")
          const timingIndex = lines.findIndex((l) => l.includes("-->"))
          if (timingIndex !== -1) {
            const timingLine = lines[timingIndex]
            const [startStr, endStr] = timingLine.split("-->")
            if (startStr && endStr) {
              const start = parseTimestamp(startStr)
              const end = parseTimestamp(endStr.trim().split(/\s+/)[0])
              const rawText = lines.slice(timingIndex + 1).join("\n")
              // Strip HTML tags from subtitle text
              const text = rawText.replace(/<[^>]+>/g, "")
              if (!isNaN(start) && !isNaN(end)) {
                parsed.push({ start, end, text })
              }
            }
          }
        }

        if (isCancelled) return
        setParsedCues(parsed)
      } catch (err) {
        console.error("Subtitle shift error", err)
        if (!isCancelled) {
          setParsedCues([])
        }
      }
    }

    void fetchAndOffsetSub()

    return () => {
      isCancelled = true
    }
  }, [selectedSub, subOffset])

  const progressPct = duration ? (currentTime / duration) * 100 : 0
  const bufferedPct = duration ? (bufferedEnd / duration) * 100 : 0
  const hoverPct = hoverX !== null ? hoverX * 100 : null

  const currentActiveCues = parsedCues.filter(
    (c) => currentTime >= c.start && currentTime <= c.end
  )

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
      />

      {/* ── Custom Subtitle Overlay ── */}
      {currentActiveCues.length > 0 && (
        <div
          className={`pointer-events-none absolute inset-x-0 z-50 flex flex-col items-center transition-all duration-300 ease-out ${
            uiVisible
              ? "translate-y-[-130px] md:translate-y-[-140px]"
              : "translate-y-0"
          }`}
          style={{ bottom: `${subMargin}px` }}
        >
          {currentActiveCues.map((cue, i) => (
            <div
              key={i}
              className="rounded px-4 py-1 text-center"
              style={{
                fontFamily: subFont,
                fontSize: `${subSize}px`,
                lineHeight: subLh,
                backgroundColor: subBg,
                color: "white",
                fontWeight: 900,
                textShadow:
                  "0 0 4px #000, 0 0 4px #000, 0 0 4px #000, 0 0 4px #000, 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
                whiteSpace: "pre-wrap",
              }}
            >
              {cue.text}
            </div>
          ))}
        </div>
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

      {/* ── Big play icon when paused ── */}
      {!playing && !buffering && !isFetchingProvider && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black/40">
            <span
              className="material-symbols-outlined fill"
              style={{ fontSize: "48px" }}
            >
              play_arrow
            </span>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          UI OVERLAY — Cinematic Obsidian
      ════════════════════════════════════════════════════════════ */}
      <div
        className={`pointer-events-none absolute inset-0 z-40 transition-opacity duration-300 ${uiVisible ? "opacity-100" : "opacity-0"}`}
      >
        {/* ── TOP BAR ─────────────────────────────────────────────── */}
        <TopAppBar
          movieId={movieId}
          movieTitle={movieTitle}
          provider={provider}
          providerIndex={providerIndex}
          allProviders={allProviders}
          onProviderChange={onProviderChange}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
        />

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
        />
      </div>
    </div>
  )
}
