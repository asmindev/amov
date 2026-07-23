import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  SUBTITLE_FONT_OPTIONS,
  SUBTITLE_LINE_HEIGHT_OPTIONS,
} from "./constants"
import type { CustomizationSettingsSectionProps } from "./types"
import { selectedButtonClass, subtitleOffsetLabel } from "./utils"

export function CustomizationSettingsSection({
  subOffset,
  setSubOffset,
  subMargin,
  setSubMargin,
  subSize,
  setSubSize,
  subFont,
  setSubFont,
  subLh,
  setSubLh,
  subBg,
  setSubBg,
  showHeading = true,
  scrollClassName = "settings-scroll flex-1 space-y-6 overflow-y-auto pr-4",
}: CustomizationSettingsSectionProps) {
  return (
    <>
      {showHeading && (
        <h3 className="text-label-md mb-4 font-label-md font-extrabold tracking-wider text-secondary uppercase">
          Customization
        </h3>
      )}

      <div className={scrollClassName}>
        <div>
          <div className="mb-4 flex justify-between text-sm text-gray-400">
            <span>Latency / Sync</span>
            <span>{subtitleOffsetLabel(subOffset ?? 0)}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setSubOffset((prev) => prev - 0.5)}
            >
              -
            </Button>
            <Slider
              min={-5}
              max={5}
              step={0.1}
              value={[subOffset ?? 0]}
              onValueChange={(vals) =>
                setSubOffset(Array.isArray(vals) ? (vals[0] ?? 0) : (vals ?? 0))
              }
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={() => setSubOffset((prev) => prev + 0.5)}
            >
              +
            </Button>
          </div>
        </div>

        <div>
          <div className="mb-4 flex justify-between text-sm text-gray-400">
            <span>Bottom Margin (Posisi)</span>
            <span>{subMargin ?? 40}px</span>
          </div>
          <Slider
            min={0}
            max={200}
            step={5}
            value={[subMargin ?? 40]}
            onValueChange={(vals) =>
              setSubMargin(Array.isArray(vals) ? (vals[0] ?? 40) : (vals ?? 40))
            }
            className="mb-4"
          />
        </div>

        <div>
          <div className="mb-4 flex justify-between text-sm text-gray-400">
            <span>Font Size</span>
            <span>{subSize ?? 16}px</span>
          </div>
          <Slider
            min={12}
            max={48}
            step={2}
            value={[subSize ?? 16]}
            onValueChange={(vals) =>
              setSubSize(Array.isArray(vals) ? (vals[0] ?? 16) : (vals ?? 16))
            }
            className="w-full"
          />
        </div>

        <div>
          <div className="mb-2 text-sm text-gray-400">Font Style</div>
          <div className="flex flex-wrap gap-2">
            {SUBTITLE_FONT_OPTIONS.map((font) => (
              <Button
                key={font.label}
                variant={subFont === font.value ? "default" : "outline"}
                className={`text-sm ${selectedButtonClass(subFont === font.value)}`}
                onClick={() => setSubFont(font.value)}
              >
                {font.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm text-gray-400">Line Height</div>
          <div className="flex flex-wrap gap-2">
            {SUBTITLE_LINE_HEIGHT_OPTIONS.map((lh) => (
              <Button
                key={lh}
                variant={subLh === lh ? "default" : "outline"}
                className={`text-sm ${selectedButtonClass(subLh === lh)}`}
                onClick={() => setSubLh(lh)}
              >
                {lh}x
              </Button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 text-sm text-gray-400">Background Style</div>
          <div className="flex gap-2">
            <Button
              variant={subBg === "rgba(0,0,0,0.75)" ? "default" : "outline"}
              className={`text-sm ${selectedButtonClass(subBg === "rgba(0,0,0,0.75)")}`}
              onClick={() => setSubBg("rgba(0,0,0,0.75)")}
            >
              Classic
            </Button>
            <Button
              variant={subBg === "transparent" ? "default" : "outline"}
              className={`text-sm ${selectedButtonClass(subBg === "transparent")}`}
              onClick={() => setSubBg("transparent")}
            >
              None (Drop Shadow)
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
