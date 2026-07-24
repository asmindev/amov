import { useState } from "react"
import { Button } from "@/components/ui/button"
import { fetchProviderSubtitlesForMovie } from "./settings-modal/fetch-provider-subtitles.helper"
import { PlaybackQualityRow } from "./settings-modal/playback-quality-row"
import { SettingsSectionsDesktop } from "./settings-modal/settings-sections-desktop"
import { SettingsSectionsMobile } from "./settings-modal/settings-sections-mobile"
import type { SettingsModalProps } from "./settings-modal/types"

export function SettingsModal({
  setOpenMenu,
  playbackRate,
  setPlaybackRate,
  selectedSub,
  setSelectedSub,
  subtitles,
  subError,
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
  const [isFetchingSubtitles, setIsFetchingSubtitles] = useState(false)
  const [selectedProvider, setSelectedProvider] =
    useState<string>("opensubtitles")

  const handleManualOpenSubtitlesFetch = async () => {
    try {
      setIsFetchingSubtitles(true)
      const subs = await fetchProviderSubtitlesForMovie({
        provider: selectedProvider,
        imdbId,
        movieId,
        movieTitle,
        movieYear,
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
      setIsFetchingSubtitles(false)
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
        className="flex h-[80vh] w-[90%] max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-popover/90 p-6 text-popover-foreground shadow-2xl backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-headline-md font-headline-md font-bold text-foreground">
            Audio, Subtitles & Quality
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground"
            onClick={() => setOpenMenu(null)}
          >
            <span className="material-symbols-outlined">close</span>
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <SettingsSectionsMobile
            playbackRate={playbackRate}
            setPlaybackRate={setPlaybackRate}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            isFetchingSubtitles={isFetchingSubtitles}
            onFetchSubtitles={handleManualOpenSubtitlesFetch}
            selectedSub={selectedSub}
            setSelectedSub={setSelectedSub}
            subtitles={subtitles}
            subError={subError}
            subOffset={subOffset}
            setSubOffset={setSubOffset}
            subMargin={subMargin}
            setSubMargin={setSubMargin}
            subSize={subSize}
            setSubSize={setSubSize}
            subFont={subFont}
            setSubFont={setSubFont}
            subLh={subLh}
            setSubLh={setSubLh}
            subBg={subBg}
            setSubBg={setSubBg}
          />

          <SettingsSectionsDesktop
            playbackRate={playbackRate}
            setPlaybackRate={setPlaybackRate}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            isFetchingSubtitles={isFetchingSubtitles}
            onFetchSubtitles={handleManualOpenSubtitlesFetch}
            selectedSub={selectedSub}
            setSelectedSub={setSelectedSub}
            subtitles={subtitles}
            subError={subError}
            subOffset={subOffset}
            setSubOffset={setSubOffset}
            subMargin={subMargin}
            setSubMargin={setSubMargin}
            subSize={subSize}
            setSubSize={setSubSize}
            subFont={subFont}
            setSubFont={setSubFont}
            subLh={subLh}
            setSubLh={setSubLh}
            subBg={subBg}
            setSubBg={setSubBg}
          />
        </div>

        <PlaybackQualityRow
          sources={sources}
          selectedQuality={selectedQuality}
          setSelectedQuality={setSelectedQuality}
        />
      </div>
    </div>
  )
}
