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
  providerSubtitles,
  wyzieGroups,
  isFetchingWyzie,
  onFetchWyzie,
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
}: SettingsModalProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && setOpenMenu(null)}>
      <DialogContent
        showCloseButton={false}
        className="md:min-w-6xl md:h-[80vh] overflow-hidden"
      >
        <DialogHeader className="h-fit border-b border-border px-2 py-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-headline-md pl-2 font-netflix font-black text-foreground uppercase">
              Audio & Subtitles
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

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2 md:p-6">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <SettingsSectionsMobile
              playbackRate={playbackRate}
              setPlaybackRate={setPlaybackRate}
              providerSubtitles={providerSubtitles}
              isFetchingWyzie={isFetchingWyzie}
              onFetchWyzie={onFetchWyzie}
              selectedSub={selectedSub}
              setSelectedSub={setSelectedSub}
              wyzieGroups={wyzieGroups}
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
              providerSubtitles={providerSubtitles}
              isFetchingWyzie={isFetchingWyzie}
              onFetchWyzie={onFetchWyzie}
              selectedSub={selectedSub}
              setSelectedSub={setSelectedSub}
              wyzieGroups={wyzieGroups}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
