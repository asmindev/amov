import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AudioSettingsSection } from "./audio-settings-section"
import { CustomizationSettingsSection } from "./customization-settings-section"
import { SubtitlesSettingsSection } from "./subtitles-settings-section"
import type { SettingsSectionsProps } from "./types"

export function SettingsSectionsMobile(props: SettingsSectionsProps) {
  return (
    <Tabs
      defaultValue="audio"
      className="flex h-full min-h-0 flex-col md:hidden"
    >
      <TabsList className="mb-4 grid w-full grid-cols-3 bg-white/5">
        <TabsTrigger value="audio">Audio</TabsTrigger>
        <TabsTrigger value="subtitles">Subtitles</TabsTrigger>
        <TabsTrigger value="customization">Customize</TabsTrigger>
      </TabsList>

      <TabsContent
        value="audio"
        className="mt-0 min-h-0 flex-1 overflow-hidden"
      >
        <AudioSettingsSection
          playbackRate={props.playbackRate}
          setPlaybackRate={props.setPlaybackRate}
          showHeading={false}
          scrollClassName="settings-scroll h-full space-y-6 overflow-y-auto pr-1"
        />
      </TabsContent>

      <TabsContent
        value="subtitles"
        className="mt-0 min-h-0 flex-1 overflow-hidden"
      >
        <SubtitlesSettingsSection
          providerSubtitles={props.providerSubtitles}
          isFetchingWyzie={props.isFetchingWyzie}
          onFetchWyzie={props.onFetchWyzie}
          selectedSub={props.selectedSub}
          setSelectedSub={props.setSelectedSub}
          wyzieGroups={props.wyzieGroups}
          subError={props.subError}
          showHeading={false}
        />
      </TabsContent>

      <TabsContent
        value="customization"
        className="mt-0 min-h-0 flex-1 overflow-hidden"
      >
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
          showHeading={false}
          scrollClassName="settings-scroll h-full space-y-6 overflow-y-auto pr-1"
        />
      </TabsContent>
    </Tabs>
  )
}
