import type { ParsedCue } from "../../hooks/use-subtitles"

interface SubtitleOverlayProps {
  currentActiveCues: ParsedCue[]
  uiVisible: boolean
  subMargin: number
  subFont: string
  subSize: number
  subLh: number
  subBg: string
}

export function SubtitleOverlay({
  currentActiveCues,
  uiVisible,
  subMargin,
  subFont,
  subSize,
  subLh,
  subBg,
}: SubtitleOverlayProps) {
  if (currentActiveCues.length === 0) return null

  return (
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
  )
}
