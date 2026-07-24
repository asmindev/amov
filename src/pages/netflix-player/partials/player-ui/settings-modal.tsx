import { useState } from "react"
import { fetchProviderSubtitlesForMovie } from "./settings-modal/fetch-provider-subtitles.helper"
import { PlaybackQualityRow } from "./settings-modal/playback-quality-row"
import { SettingsSectionsDesktop } from "./settings-modal/settings-sections-desktop"
import { SettingsSectionsMobile } from "./settings-modal/settings-sections-mobile"
import type { SettingsModalProps } from "./settings-modal/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

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
  subFont,
  setSubFont,
  subLh,
  setSubLh,
  subMargin,
  setSubMargin,
  subBg,
  setSubBg,
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
    <Dialog open onOpenChange={(open) => !open && setOpenMenu(null)}>
      <DialogContent
        showCloseButton={false}
        className="h-[80vh] max-w-4xl min-w-9/12 gap-0 overflow-hidden p-0"
      >
        <DialogHeader className="border-b border-border px-2 py-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-headline-md pl-2 font-headline-md font-netflix font-black text-foreground uppercase">
              Audio, Subtitles & Quality
            </DialogTitle>
            <Button
              variant="ghost"
              className="rounded-full p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              onClick={() => setOpenMenu(null)}
            >
              <span className="material-symbols-outlined">close</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
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
      </DialogContent>
    </Dialog>
  )
}
