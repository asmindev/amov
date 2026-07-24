import type {
  Dispatch,
  SetStateAction,
  MouseEvent,
  ChangeEvent,
  RefObject,
} from "react"
import { fmtTime } from "@/helpers/time"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

export interface BottomControlsProps {
  progressBarRef: RefObject<HTMLDivElement | null>
  currentTime: number
  duration: number
  bufferedPct: number
  progressPct: number
  hoverPct: number | null
  hoverX: number | null
  handleProgressHover: (e: MouseEvent<HTMLDivElement>) => void
  handleProgressClick: (e: MouseEvent<HTMLDivElement>) => void
  setHoverX: (val: number | null) => void
  playing: boolean
  togglePlay: () => void
  seek: (delta: number) => void
  showVolSlider: boolean
  setShowVolSlider: (val: boolean) => void
  muted: boolean
  volume: number
  toggleMute: () => void
  handleVolumeChange: (e: ChangeEvent<HTMLInputElement>) => void
  openMenu: string | null
  setOpenMenu: Dispatch<SetStateAction<"settings" | "provider" | "episodes" | null>>
  selectedSub: string | null
  fullscreen: boolean
  toggleFullscreen: () => void
  mediaType?: "movie" | "tv"
}

export function BottomControls({
  progressBarRef,
  currentTime,
  duration,
  bufferedPct,
  progressPct,
  hoverPct,
  hoverX,
  handleProgressHover,
  handleProgressClick,
  setHoverX,
  playing,
  togglePlay,
  seek,
  showVolSlider,
  setShowVolSlider,
  muted,
  volume,
  toggleMute,
  handleVolumeChange,
  openMenu,
  setOpenMenu,
  selectedSub,
  fullscreen,
  toggleFullscreen,
  mediaType = "movie",
}: BottomControlsProps) {
  return (
    <div
      className="pointer-events-auto fixed bottom-0 left-0 z-50 flex w-full flex-col gap-4 bg-linear-to-t from-black/90 via-black/60 to-transparent px-edge-margin-mobile pt-6 pb-4 backdrop-blur-md md:px-edge-margin-desktop"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Progress Bar */}
      <div
        className="progress-container group relative flex h-8 w-full items-center gap-4"
        onMouseMove={handleProgressHover}
        onMouseLeave={() => setHoverX(null)}
      >
        <span className="text-label-sm w-14 text-right font-label-sm text-on-surface-variant tabular-nums">
          {fmtTime(currentTime)}
        </span>

        <div
          ref={progressBarRef}
          className="relative flex h-1 flex-1 cursor-pointer items-center overflow-visible rounded-full bg-[#333333] transition-all duration-200 group-hover:h-1.5"
          onClick={handleProgressClick}
        >
          {/* Buffered */}
          <div
            className="pointer-events-none absolute top-0 left-0 h-full rounded-full bg-white/20 transition-all duration-200"
            style={{ width: `${bufferedPct}%` }}
          />
          {/* Played */}
          <div
            className="pointer-events-none absolute top-0 left-0 h-full rounded-full bg-primary-container"
            style={{ width: `${progressPct}%` }}
          />
          {/* Hover Ghost */}
          {hoverPct !== null && (
            <div
              className="pointer-events-none absolute top-0 left-0 h-full rounded-full bg-white/30"
              style={{ width: `${hoverPct}%` }}
            />
          )}
          {/* Scrubber thumb */}
          <div
            className="pointer-events-none absolute top-1/2 -ml-2 h-4 w-4 -translate-y-1/2 scale-0 rounded-full bg-white shadow-md transition-transform duration-200 group-hover:scale-100"
            style={{ left: `${progressPct}%` }}
          />
          {/* Hover tooltip */}
          {hoverX !== null && duration > 0 && (
            <div
              className="text-label-sm pointer-events-none absolute -top-10 -translate-x-1/2 rounded bg-[#222222] px-2 py-1 font-label-sm whitespace-nowrap text-[#e2e2e2] shadow-lg"
              style={{ left: `${hoverX * 100}%` }}
            >
              {fmtTime(hoverX * duration)}
            </div>
          )}
        </div>

        <span className="text-label-sm w-16 font-label-sm text-on-surface-variant tabular-nums">
          -{fmtTime(duration - currentTime)}
        </span>
      </div>

      {/* Controls Row */}
      <div className="flex w-full items-center justify-between">
        {/* Left Controls */}
        <div className="flex items-center gap-control-gap">
          <Button
            variant="ghost"
            size="icon"
            className="group/btn relative h-12 w-12 scale-95 rounded-full text-on-surface hover:bg-white/10 hover:text-white focus:outline-none active:scale-90"
            onClick={togglePlay}
          >
            <span
              className={`material-symbols-outlined ${playing ? "" : "fill"}`}
              style={{ fontSize: "46px" }}
            >
              {playing ? "pause" : "play_arrow"}
            </span>
            <span className="text-label-sm pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-[#222222] px-2 py-1 font-label-sm whitespace-nowrap text-[#e2e2e2] opacity-0 transition-opacity group-hover/btn:opacity-100">
              {playing ? "Pause" : "Play"}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="group/btn relative hidden h-10 w-10 scale-95 rounded-full text-on-surface-variant hover:bg-white/10 hover:text-white active:scale-90 md:flex"
            onClick={() => seek(-10)}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "36px" }}
            >
              replay_10
            </span>
            <span className="text-label-sm pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-[#222222] px-2 py-1 font-label-sm whitespace-nowrap text-[#e2e2e2] opacity-0 transition-opacity group-hover/btn:opacity-100">
              Back 10s
            </span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="group/btn relative hidden h-10 w-10 scale-95 rounded-full text-on-surface-variant hover:bg-white/10 hover:text-white active:scale-90 md:flex"
            onClick={() => seek(10)}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "36px" }}
            >
              forward_10
            </span>
            <span className="text-label-sm pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-[#222222] px-2 py-1 font-label-sm whitespace-nowrap text-[#e2e2e2] opacity-0 transition-opacity group-hover/btn:opacity-100">
              Forward 10s
            </span>
          </Button>

          {/* Volume */}
          <div
            className="group/btn relative flex items-center gap-2"
            onMouseEnter={() => setShowVolSlider(true)}
            onMouseLeave={() => setShowVolSlider(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 scale-95 rounded-full text-on-surface-variant hover:bg-white/10 hover:text-white active:scale-90"
              onClick={toggleMute}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "36px" }}
              >
                {muted || volume === 0
                  ? "volume_off"
                  : volume < 0.5
                    ? "volume_down"
                    : "volume_up"}
              </span>
            </Button>
            <div
              className={`flex h-8 items-center overflow-hidden transition-all duration-300 ${showVolSlider ? "w-24" : "w-0"}`}
            >
              <Slider
                min={0}
                max={1}
                step={0.02}
                value={[muted ? 0 : volume]}
                onValueChange={(vals) => {
                  const val = Array.isArray(vals) ? vals[0] : vals
                  handleVolumeChange({
                    target: { value: val.toString() },
                  } as unknown as ChangeEvent<HTMLInputElement>)
                }}
                className="ml-2 w-20 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-control-gap">
          {/* Episodes Button (Only for TV Shows) */}
          {mediaType === "tv" && (
            <Button
              variant="ghost"
              size="icon"
              className={`group/btn relative flex h-10 w-10 scale-95 flex-col items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 active:scale-90 ${
                openMenu === "episodes"
                  ? "text-primary"
                  : "text-secondary hover:text-white"
              }`}
              onClick={(e) => {
                e.stopPropagation()
                setOpenMenu(openMenu === "episodes" ? null : "episodes")
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "32px" }}
              >
                video_library
              </span>
              <span className="text-label-sm pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-[#222222] px-2 py-1 font-label-sm whitespace-nowrap text-[#e2e2e2] opacity-0 transition-opacity group-hover/btn:opacity-100">
                Episodes
              </span>
              {openMenu === "episodes" && (
                <span className="absolute -bottom-2 h-1 w-1 rounded-full bg-primary"></span>
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className={`group/btn relative flex h-10 w-10 scale-95 flex-col items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 active:scale-90 ${openMenu === "settings" || selectedSub ? "text-on-surface" : "text-secondary hover:text-white"}`}
            onClick={(e) => {
              e.stopPropagation()
              setOpenMenu(openMenu === "settings" ? null : "settings")
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "36px" }}
            >
              settings
            </span>
            <span className="text-label-sm pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-[#222222] px-2 py-1 font-label-sm whitespace-nowrap text-[#e2e2e2] opacity-0 transition-opacity group-hover/btn:opacity-100">
              Settings
            </span>
            {(openMenu === "settings" || selectedSub) && (
              <span className="absolute -bottom-2 h-1 w-1 rounded-full bg-primary-container"></span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="group/btn relative ml-4 flex h-10 w-10 scale-95 flex-col items-center justify-center rounded-full text-secondary transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-90"
            onClick={toggleFullscreen}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "36px" }}
            >
              {fullscreen ? "fullscreen_exit" : "fullscreen"}
            </span>
            <span className="text-label-sm pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-[#222222] px-2 py-1 font-label-sm whitespace-nowrap text-[#e2e2e2] opacity-0 transition-opacity group-hover/btn:opacity-100">
              {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
