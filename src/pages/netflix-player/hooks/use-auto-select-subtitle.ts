import type { StreamSubtitle } from "@/api/decryptor.api"
import { useEffect } from "react"

export function useAutoSelectSubtitle(
  subtitles: StreamSubtitle[],
  selectedSub: string | null,
  setSelectedSub: (url: string | null) => void
) {
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
  }, [subtitles, selectedSub, setSelectedSub])
}
