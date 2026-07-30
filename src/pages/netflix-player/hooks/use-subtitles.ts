import { useState, useEffect, useRef, useMemo } from "react"

export interface ParsedCue {
  start: number
  end: number
  text: string
}

const TIMESTAMP_RE = /(\d{1,2}:)?(\d{2}):(\d{2})[.,](\d{3})/
const HTML_TAG_RE = /<[^>]+>/g
const COMMA_DOT_RE = /(\d{2}:\d{2}:\d{2}),(\d{3})/g
const COMMA_MMSS_RE = /(\d{2}:\d{2}),(\d{3})/g
const TIMESTAMP_SHIFT_RE = /(\d{1,2}:)?(\d{2}):(\d{2})[.,](\d{3})/g

function parseTimestamp(ts: string): number {
  const clean = ts.trim().replace(",", ".")
  const match = clean.match(TIMESTAMP_RE)
  if (!match) return NaN
  const hours = match[1] ? parseFloat(match[1]) : 0
  const mins = parseFloat(match[2])
  const secs = parseFloat(match[3])
  const millis = parseFloat(match[4])
  return hours * 3600 + mins * 60 + secs + millis / 1000
}

/**
 * Line-based VTT/SRT parser that handles all formats:
 * - SRT with or without blank lines between cues
 * - SRT with or without cue numbers
 * - Standard VTT
 * - Mixed formats
 */
function parseCues(text: string): ParsedCue[] {
  const lines = text.split("\n")
  const cues: ParsedCue[] = []

  let i = 0
  // Skip WEBVTT header if present
  if (lines[0]?.trim().startsWith("WEBVTT")) {
    i = 1
    // Skip until first blank line after header
    while (i < lines.length && lines[i].trim() !== "") i++
    i++
  }

  while (i < lines.length) {
    // Skip blank lines
    while (i < lines.length && lines[i].trim() === "") i++
    if (i >= lines.length) break

    // Look for a timing line containing "-->"
    let timingIndex = -1
    let scan = i
    // Search ahead up to 3 lines for the timing line (SRT may have a cue number first)
    while (scan < Math.min(i + 4, lines.length)) {
      if (lines[scan].includes("-->")) {
        timingIndex = scan
        break
      }
      scan++
    }

    if (timingIndex === -1) {
      i++
      continue
    }

    const timingLine = lines[timingIndex]
    const arrowSplit = timingLine.split("-->")
    if (arrowSplit.length < 2) {
      i = timingIndex + 1
      continue
    }

    const startStr = arrowSplit[0]
    const endPart = arrowSplit[1].trim().split(/[\s\t]+/)[0]
    const start = parseTimestamp(startStr)
    const end = parseTimestamp(endPart)

    if (isNaN(start) || isNaN(end)) {
      i = timingIndex + 1
      continue
    }

    // Collect text lines after the timing line until next blank line or next timing line
    i = timingIndex + 1
    const textLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].includes("-->")
    ) {
      textLines.push(lines[i])
      i++
    }

    const text = textLines
      .join("\n")
      .replace(HTML_TAG_RE, "")
      .trim()
    if (text) {
      cues.push({ start, end, text })
    }
  }

  return cues
}

/**
 * Apply time offset to VTT/SRT timestamps in-place text.
 * Handles both comma and dot decimal separators.
 */
function shiftTimestamps(text: string, offset: number): string {
  // Always normalize timestamps (convert commas to dots for WebVTT compatibility)
  const normalized = text
    .replace(COMMA_DOT_RE, "$1.$2")
    .replace(COMMA_MMSS_RE, "$1.$2")
  if (offset === 0) return normalized
  return normalized.replace(
    TIMESTAMP_SHIFT_RE,
    (_match, h, m, s, ms) => {
      const hours = h ? parseFloat(h) : 0
      const mins = parseInt(m)
      const secs = parseInt(s)
      const millis = parseInt(ms)
      let totalSeconds = hours * 3600 + mins * 60 + secs + millis / 1000
      totalSeconds += offset
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
}

export function useSubtitles(
  selectedSub: string | null,
  subOffset: number,
  currentTime: number
) {
  const [parsedCues, setParsedCues] = useState<ParsedCue[]>([])
  const [vttUrl, setVttUrl] = useState<string | null>(null)
  const [subError, setSubError] = useState(false)
  const blobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    let isCancelled = false

    async function fetchAndParse() {
      if (!selectedSub) {
        setParsedCues([])
        setVttUrl(null)
        setSubError(false)
        return
      }
      setSubError(false)
      try {
        const res = await fetch(selectedSub)
        if (!res.ok) throw new Error("fetch sub error")
        let text = await res.text()

        text = text
          .replace(/^\uFEFF/, "")
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n")

        const shiftedText = shiftTimestamps(text, subOffset)

        let finalVttText = shiftedText.trim()
        if (!finalVttText.startsWith("WEBVTT")) {
          finalVttText = "WEBVTT\n\n" + finalVttText
        }

        // Generate Blob URL for native <track>
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
        const blob = new Blob([finalVttText], { type: "text/vtt" })
        const url = URL.createObjectURL(blob)
        blobUrlRef.current = url

        if (isCancelled) {
          URL.revokeObjectURL(url)
          return
        }

        // Parse cues using robust line-based parser
        const parsed = parseCues(finalVttText)

        setVttUrl(url)
        setParsedCues(parsed)
      } catch (err) {
        console.error("Subtitle parse error", err)
        if (!isCancelled) {
          setSubError(true)
          setParsedCues([])
          setVttUrl(null)
        }
      }
    }

    void fetchAndParse()

    return () => {
      isCancelled = true
      // Clear vttUrl state BEFORE revoking so the last render sees null, not a dead URL
      setVttUrl(null)
      setParsedCues([])
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [selectedSub, subOffset])

  const currentActiveCues = useMemo(() => {
    if (parsedCues.length === 0) return []
    // Binary search for first cue whose end >= currentTime
    let lo = 0
    let hi = parsedCues.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (parsedCues[mid].end < currentTime) lo = mid + 1
      else hi = mid
    }
    const result: ParsedCue[] = []
    for (let i = lo; i < parsedCues.length; i++) {
      const c = parsedCues[i]
      if (c.start > currentTime) break
      if (currentTime >= c.start && currentTime <= c.end) result.push(c)
    }
    return result
  }, [parsedCues, currentTime])

  return { currentActiveCues, vttUrl, subError }
}
