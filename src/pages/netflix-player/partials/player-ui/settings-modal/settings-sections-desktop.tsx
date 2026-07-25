import { AudioSettingsSection } from "./audio-settings-section"
import { CustomizationSettingsSection } from "./customization-settings-section"
import { SubtitlesSettingsSection } from "./subtitles-settings-section"
import type { SettingsSectionsProps } from "./types"

export function SettingsSectionsDesktop(props: SettingsSectionsProps) {
  return (
    <div className="hidden min-h-0 flex-1 gap-3 overflow-hidden md:flex">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-white/[0.03] p-4">
        <AudioSettingsSection
          playbackRate={props.playbackRate}
          setPlaybackRate={props.setPlaybackRate}
          scrollClassName="settings-scroll flex-1 space-y-5 overflow-y-auto pr-1"
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-white/[0.03] p-4">
        <SubtitlesSettingsSection
          providerSubtitles={props.providerSubtitles}
          isFetchingWyzie={props.isFetchingWyzie}
          onFetchWyzie={props.onFetchWyzie}
          selectedSub={props.selectedSub}
          setSelectedSub={props.setSelectedSub}
          wyzieGroups={props.wyzieGroups}
          subError={props.subError}
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-white/[0.03] p-4">
        <CustomizationSettingsSection
          subOffset={props.subOffset}
          setSubOffset={props.setSubOffset}
          subMargin={props.subMargin}
          setSubMargin={props.setSubMargin}
          subSize={props.subSize}
          setSubSize={props.setSubSize}
          subFont={props.subFont}
          setSubFont={props.setSubFont}
          subLh={props.subLh}
          setSubLh={props.setSubLh}
          subBg={props.subBg}
          setSubBg={props.setSubBg}
          scrollClassName="settings-scroll flex-1 space-y-5 overflow-y-auto pr-1"
        />
      </div>
    </div>
  )
}
