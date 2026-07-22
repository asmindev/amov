import { useState, useEffect } from "react"

export interface ParsedCue {
  start: number
  end: number
  text: string
}

export function useSubtitles(
  selectedSub: string | null,
  subOffset: number,
  currentTime: number
) {
  const [parsedCues, setParsedCues] = useState<ParsedCue[]>([])

  useEffect(() => {
    let isCancelled = false
    async function fetchAndOffsetSub() {
      if (!selectedSub) {
        setParsedCues([])
        return
      }
      try {
        const proxyUrl = `/api/decryptor/proxy?url=${encodeURIComponent(selectedSub)}`
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

  const currentActiveCues = parsedCues.filter(
    (c) => currentTime >= c.start && currentTime <= c.end
  )

  return currentActiveCues
}
