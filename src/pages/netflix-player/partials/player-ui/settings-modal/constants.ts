export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

export const SUBTITLE_FONT_OPTIONS = [
  {
    label: "Netflix",
    value: '"Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  { label: "Inter", value: "var(--font-inter), sans-serif" },
  { label: "Outfit", value: "var(--font-outfit), sans-serif" },
  { label: "Monospace", value: "monospace" },
  { label: "Serif", value: "serif" },
] as const

export const SUBTITLE_LINE_HEIGHT_OPTIONS = [1.0, 1.2, 1.5, 2.0] as const
