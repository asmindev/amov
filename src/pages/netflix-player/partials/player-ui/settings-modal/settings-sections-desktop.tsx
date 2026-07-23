import { AudioSettingsSection } from "./audio-settings-section"
import { CustomizationSettingsSection } from "./customization-settings-section"
import { SubtitlesSettingsSection } from "./subtitles-settings-section"
import type { SettingsSectionsProps } from "./types"

export function SettingsSectionsDesktop(props: SettingsSectionsProps) {
  return (
    <div className="hidden h-full min-h-0 flex-1 gap-8 overflow-hidden md:flex">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-r border-border pr-4">
        <AudioSettingsSection
          playbackRate={props.playbackRate}
          setPlaybackRate={props.setPlaybackRate}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-r border-border pr-4">
        <SubtitlesSettingsSection
          selectedProvider={props.selectedProvider}
          setSelectedProvider={props.setSelectedProvider}
          isFetchingSubtitles={props.isFetchingSubtitles}
          onFetchSubtitles={props.onFetchSubtitles}
          selectedSub={props.selectedSub}
          setSelectedSub={props.setSelectedSub}
          subtitles={props.subtitles}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
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
        />
      </div>
    </div>
  )
}
