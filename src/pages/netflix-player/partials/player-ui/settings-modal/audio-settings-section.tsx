import { Button } from "@/components/ui/button"
import { PLAYBACK_RATES } from "./constants"
import type { AudioSettingsSectionProps } from "./types"
import { selectedTextButtonClass } from "./utils"

export function AudioSettingsSection({
  playbackRate,
  setPlaybackRate,
  showHeading = true,
  scrollClassName = "settings-scroll flex-1 space-y-6 overflow-y-auto",
}: AudioSettingsSectionProps) {
  return (
    <>
      {showHeading && (
        <h3 className="text-label-md mb-4 font-label-md font-extrabold tracking-wider text-secondary uppercase">
          Audio & Speed
        </h3>
      )}
      <div className={scrollClassName}>
        <div>
          <div className="mb-2 text-sm text-gray-400">Track</div>
          <Button
            variant="ghost"
            className="group w-full justify-between font-body-md hover:bg-white/5"
          >
            <span className="text-foreground group-hover:text-white">
              English [Original]
            </span>
            <span className="material-symbols-outlined text-primary">
              check
            </span>
          </Button>
        </div>

        <div>
          <div className="mb-2 text-sm text-gray-400">Playback Speed</div>
          <div className="flex flex-wrap gap-2">
            {PLAYBACK_RATES.map((rate) => (
              <Button
                key={rate}
                variant={playbackRate === rate ? "default" : "outline"}
                className={`text-sm ${selectedTextButtonClass(playbackRate === rate)}`}
                onClick={() => setPlaybackRate(rate)}
              >
                {rate}x
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
