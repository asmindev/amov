import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  SUBTITLE_FONT_OPTIONS,
  SUBTITLE_LINE_HEIGHT_OPTIONS,
} from "./constants"
import type { CustomizationSettingsSectionProps } from "./types"
import { selectedButtonClass, subtitleOffsetLabel } from "./utils"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-3 block text-xs font-semibold tracking-widest text-secondary/70 uppercase">
      {children}
    </span>
  )
}

function SliderRow({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  value: number
  display: string
  min: number
  max: number
  step: number
  onChange: (val: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="tabular-nums text-sm font-medium text-foreground">
          {display}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(vals) =>
          onChange(Array.isArray(vals) ? (vals[0] ?? value) : (vals ?? value))
        }
      />
    </div>
  )
}

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
        {/* ── Position ─────────────────────────────────────── */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
          <SectionLabel>Position</SectionLabel>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Latency</span>
                <span className="tabular-nums text-sm font-medium text-foreground">
                  {subtitleOffsetLabel(subOffset ?? 0)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 shrink-0 rounded-full text-xs"
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
                    setSubOffset(
                      Array.isArray(vals) ? (vals[0] ?? 0) : (vals ?? 0)
                    )
                  }
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 shrink-0 rounded-full text-xs"
                  onClick={() => setSubOffset((prev) => prev + 0.5)}
                >
                  +
                </Button>
              </div>
            </div>

            <SliderRow
              label="Margin"
              value={subMargin ?? 40}
              display={`${subMargin ?? 40}px`}
              min={0}
              max={200}
              step={5}
              onChange={setSubMargin}
            />
          </div>
        </div>

        {/* ── Text ────────────────────────────────────────── */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
          <SectionLabel>Text</SectionLabel>

          <div className="space-y-5">
            <SliderRow
              label="Font Size"
              value={subSize ?? 16}
              display={`${subSize ?? 16}px`}
              min={12}
              max={48}
              step={2}
              onChange={setSubSize}
            />

            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Font</span>
              <div className="flex flex-wrap gap-2">
                {SUBTITLE_FONT_OPTIONS.map((font) => (
                  <Button
                    key={font.label}
                    variant={subFont === font.value ? "default" : "outline"}
                    className={`text-xs ${selectedButtonClass(subFont === font.value)}`}
                    onClick={() => setSubFont(font.value)}
                  >
                    {font.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Line Height</span>
              <div className="flex gap-2">
                {SUBTITLE_LINE_HEIGHT_OPTIONS.map((lh) => (
                  <Button
                    key={lh}
                    variant={subLh === lh ? "default" : "outline"}
                    className={`min-w-[3rem] text-xs ${selectedButtonClass(subLh === lh)}`}
                    onClick={() => setSubLh(lh)}
                  >
                    {lh}x
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Background ──────────────────────────────────── */}
        <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
          <SectionLabel>Background</SectionLabel>

          <div className="flex gap-2">
            <Button
              variant={subBg === "rgba(0,0,0,0.75)" ? "default" : "outline"}
              className={`flex-1 text-xs ${selectedButtonClass(subBg === "rgba(0,0,0,0.75)")}`}
              onClick={() => setSubBg("rgba(0,0,0,0.75)")}
            >
              Classic
            </Button>
            <Button
              variant={subBg === "transparent" ? "default" : "outline"}
              className={`flex-1 text-xs ${selectedButtonClass(subBg === "transparent")}`}
              onClick={() => setSubBg("transparent")}
            >
              None
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
