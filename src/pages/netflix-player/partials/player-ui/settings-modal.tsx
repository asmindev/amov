import type { StreamSource, StreamSubtitle } from "@/api/decryptor.api"
import { useState } from "react"
import type { Dispatch, SetStateAction } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface SettingsModalProps {
  setOpenMenu: (val: "settings" | "provider" | null) => void
  playbackRate: number
  setPlaybackRate: (val: number) => void
  selectedSub: string | null
  setSelectedSub: (val: string | null) => void
  subtitles: StreamSubtitle[]
  subOffset: number
  setSubOffset: Dispatch<SetStateAction<number>>
  subSize: number
  setSubSize: (val: number) => void
  subBg: string
  setSubBg: (val: string) => void
  subFont: string
  setSubFont: (val: string) => void
  subLh: number
  setSubLh: (val: number) => void
  subMargin: number
  setSubMargin: (val: number) => void
  sources: StreamSource[]
  selectedQuality: number
  setSelectedQuality: (q: number) => void
  imdbId?: string
  movieId: number
  movieTitle: string
  movieYear: string
  onAddLocalSubtitles?: (subs: StreamSubtitle[]) => void
}

export function SettingsModal({
  setOpenMenu,
  playbackRate,
  setPlaybackRate,
  selectedSub,
  setSelectedSub,
  subtitles,
  subOffset,
  setSubOffset,
  subSize,
  setSubSize,
  subBg,
  setSubBg,
  subFont,
  setSubFont,
  subLh,
  setSubLh,
  subMargin,
  setSubMargin,
  sources,
  selectedQuality,
  setSelectedQuality,
  imdbId,
  movieId,
  movieTitle,
  movieYear,
  onAddLocalSubtitles,
}: SettingsModalProps) {
  const [isFetchingOs, setIsFetchingOs] = useState(false)
  const [selectedProvider, setSelectedProvider] =
    useState<string>("opensubtitles")

  const handleManualOpenSubtitlesFetch = async () => {
    if (selectedProvider === "opensubtitles" && !imdbId) {
      alert(
        "IMDB ID tidak tersedia untuk film ini. OpenSubtitles membutuhkan IMDB ID."
      )
      return
    }

    try {
      setIsFetchingOs(true)
      const { fetchProviderSubtitles } = await import("@/api/decryptor.api")
      const subs = await fetchProviderSubtitles(selectedProvider, {
        tmdbId: movieId.toString(),
        title: movieTitle,
        year: movieYear,
        mediaType: "movie",
        imdbId: imdbId || undefined,
      })

      if (subs.length === 0) {
        alert(
          `Tidak ada subtitle tambahan yang ditemukan di ${selectedProvider.toUpperCase()}.`
        )
      } else {
        onAddLocalSubtitles?.(subs)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      alert(
        msg || `Gagal mengambil subtitle dari ${selectedProvider.toUpperCase()}`
      )
    } finally {
      setIsFetchingOs(false)
    }
  }
  return (
    <div
      className="pointer-events-auto absolute inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        e.stopPropagation()
        setOpenMenu(null)
      }}
    >
      <div
        className="flex max-h-[80vh] w-[90%] max-w-4xl flex-col rounded-xl border border-white/10 bg-[#1A1A1A]/90 p-6 shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between border-b border-[#333333] pb-4">
          <h2 className="text-headline-md font-headline-md font-bold text-on-surface">
            Audio, Subtitles & Quality
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-on-surface-variant hover:bg-white/10 hover:text-on-surface"
            onClick={() => setOpenMenu(null)}
          >
            <span className="material-symbols-outlined">close</span>
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-hidden md:flex-row">
          {/* Audio & Settings Column */}
          <div className="flex flex-1 flex-col overflow-hidden border-r border-[#333333] pr-4">
            <h3 className="text-label-md mb-4 font-label-md font-extrabold tracking-wider text-secondary uppercase">
              Audio & Speed
            </h3>
            <div className="settings-scroll flex-1 space-y-6 overflow-y-auto">
              <div>
                <div className="mb-2 text-sm text-gray-400">Track</div>
                <Button
                  variant="ghost"
                  className="group w-full justify-between font-body-md hover:bg-white/5"
                >
                  <span className="text-on-surface group-hover:text-white">
                    English [Original]
                  </span>
                  <span className="material-symbols-outlined text-primary-container">
                    check
                  </span>
                </Button>
              </div>
              <div>
                <div className="mb-2 text-sm text-gray-400">Playback Speed</div>
                <div className="flex flex-wrap gap-2">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <Button
                      key={rate}
                      variant={playbackRate === rate ? "default" : "outline"}
                      className={`text-sm ${playbackRate === rate ? "border border-primary-container bg-primary-container/10 text-primary-container hover:bg-primary-container/20" : "border-outline text-on-surface-variant hover:text-white"}`}
                      onClick={() => setPlaybackRate(rate)}
                    >
                      {rate}x
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Subtitles Column */}
          <div className="flex flex-1 flex-col overflow-hidden border-r border-[#333333] pr-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-label-md font-label-md font-extrabold tracking-wider text-secondary uppercase">
                Subtitles
              </h3>
            </div>

            <div className="mb-4 flex gap-2">
              <Select
                value={selectedProvider}
                onValueChange={(value) =>
                  setSelectedProvider(value ?? "opensubtitles")
                }
              >
                <SelectTrigger className="h-8 flex-1 border-outline bg-white/5 text-xs">
                  <SelectValue placeholder="Pilih Sumber" />
                </SelectTrigger>
                <SelectContent className="z-[70]">
                  <SelectItem value="opensubtitles">OpenSubtitles</SelectItem>
                  <SelectItem value="yoru">Yoru</SelectItem>
                  <SelectItem value="neon">Neon</SelectItem>
                  <SelectItem value="cypher">Cypher</SelectItem>
                  <SelectItem value="breach">Breach</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                className="h-8 border-primary-container px-3 text-xs text-primary-container hover:bg-primary-container/20"
                onClick={handleManualOpenSubtitlesFetch}
                disabled={isFetchingOs}
              >
                {isFetchingOs ? (
                  <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
                ) : (
                  <span className="material-symbols-outlined mr-1 text-[14px]">
                    download
                  </span>
                )}
                Fetch
              </Button>
            </div>

            <div className="settings-scroll flex-1 space-y-1 overflow-y-auto">
              <Button
                variant="ghost"
                className={`group w-full justify-between font-body-md ${!selectedSub ? "bg-white/5" : "hover:bg-white/5"}`}
                onClick={() => setSelectedSub(null)}
              >
                <span
                  className={`group-hover:text-white ${!selectedSub ? "text-on-surface" : "text-on-surface-variant"}`}
                >
                  Off
                </span>
                {!selectedSub && (
                  <span className="material-symbols-outlined text-primary-container">
                    check
                  </span>
                )}
              </Button>
              {subtitles.map((sub) => (
                <Button
                  key={sub.url}
                  variant="ghost"
                  className={`group w-full justify-between font-body-md ${selectedSub === sub.url ? "bg-white/5" : "hover:bg-white/5"}`}
                  onClick={() => setSelectedSub(sub.url)}
                >
                  <span
                    className={`group-hover:text-white ${selectedSub === sub.url ? "text-on-surface" : "text-on-surface-variant"}`}
                  >
                    {sub.lang}
                  </span>
                  {selectedSub === sub.url && (
                    <span className="material-symbols-outlined text-primary-container">
                      check
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Customization Column */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <h3 className="text-label-md mb-4 font-label-md font-extrabold tracking-wider text-secondary uppercase">
              Customization
            </h3>
            <div className="settings-scroll flex-1 space-y-6 overflow-y-auto pr-4">
              <div>
                <div className="mb-4 flex justify-between text-sm text-gray-400">
                  <span>Latency / Sync</span>
                  <span>
                    {(subOffset ?? 0) > 0
                      ? `+${(subOffset ?? 0).toFixed(1)}s`
                      : `${(subOffset ?? 0).toFixed(1)}s`}
                  </span>
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
                      setSubOffset(
                        Array.isArray(vals) ? (vals[0] ?? 0) : (vals ?? 0)
                      )
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
                    setSubMargin(
                      Array.isArray(vals) ? (vals[0] ?? 40) : (vals ?? 40)
                    )
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
                    setSubSize(
                      Array.isArray(vals) ? (vals[0] ?? 16) : (vals ?? 16)
                    )
                  }
                  className="w-full"
                />
              </div>
              <div>
                <div className="mb-2 text-sm text-gray-400">Font Style</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      label: "Netflix",
                      value:
                        '"Netflix Sans", "Helvetica Neue", Helvetica, Arial, sans-serif',
                    },
                    { label: "Inter", value: "var(--font-inter), sans-serif" },
                    {
                      label: "Outfit",
                      value: "var(--font-outfit), sans-serif",
                    },
                    { label: "Monospace", value: "monospace" },
                    { label: "Serif", value: "serif" },
                  ].map((font) => (
                    <Button
                      key={font.label}
                      variant={subFont === font.value ? "default" : "outline"}
                      className={`text-sm ${subFont === font.value ? "border border-primary-container bg-primary-container/10 text-primary-container hover:bg-primary-container/20" : "border-outline text-gray-300"}`}
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
                  {[1.0, 1.2, 1.5, 2.0].map((lh) => (
                    <Button
                      key={lh}
                      variant={subLh === lh ? "default" : "outline"}
                      className={`text-sm ${subLh === lh ? "border border-primary-container bg-primary-container/10 text-primary-container hover:bg-primary-container/20" : "border-outline text-gray-300"}`}
                      onClick={() => setSubLh(lh)}
                    >
                      {lh}x
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm text-gray-400">
                  Background Style
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={
                      subBg === "rgba(0,0,0,0.75)" ? "default" : "outline"
                    }
                    className={`text-sm ${subBg === "rgba(0,0,0,0.75)" ? "border border-primary-container bg-primary-container/10 text-primary-container hover:bg-primary-container/20" : "border-outline text-gray-300"}`}
                    onClick={() => setSubBg("rgba(0,0,0,0.75)")}
                  >
                    Classic
                  </Button>
                  <Button
                    variant={subBg === "transparent" ? "default" : "outline"}
                    className={`text-sm ${subBg === "transparent" ? "border border-primary-container bg-primary-container/10 text-primary-container hover:bg-primary-container/20" : "border-outline text-gray-300"}`}
                    onClick={() => setSubBg("transparent")}
                  >
                    None (Drop Shadow)
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Playback Quality Row */}
        <div className="mt-8 border-t border-[#333333] pt-6">
          <h3 className="text-label-md mb-4 font-label-md tracking-wider text-secondary uppercase">
            Playback Quality
          </h3>
          <div className="scrollbar-hide flex flex-wrap gap-4 overflow-x-auto pb-2">
            {sources.map((src, i) => (
              <Button
                key={src.url}
                variant={i === selectedQuality ? "default" : "outline"}
                className={`text-label-md rounded-full font-label-md whitespace-nowrap ${
                  i === selectedQuality
                    ? "border border-primary-container bg-primary-container/10 text-primary-container hover:bg-primary-container/20"
                    : "border-outline text-on-surface-variant hover:border-white hover:text-white"
                }`}
                onClick={() => setSelectedQuality(i)}
              >
                {src.quality} {i === 0 && "(Best)"}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
