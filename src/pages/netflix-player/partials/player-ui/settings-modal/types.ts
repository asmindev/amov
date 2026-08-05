import type { StreamSubtitle, WyzieSubtitleGroup } from "@/api/decryptor.api"
import type { Dispatch, SetStateAction } from "react"

export interface SettingsModalProps {
  setOpenMenu: (val: "settings" | "provider" | null) => void
  playbackRate: number
  setPlaybackRate: (val: number) => void
  selectedSub: string | null
  setSelectedSub: (val: string | null) => void
  providerSubtitles: StreamSubtitle[]
  wyzieGroups: WyzieSubtitleGroup[]
  isFetchingWyzie: boolean
  onFetchWyzie: () => void
  isFetchingSubsource: boolean
  onFetchSubsource: () => void
  subError: boolean
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
}

export interface AudioSettingsSectionProps {
  playbackRate: number
  setPlaybackRate: (val: number) => void
  showHeading?: boolean
  scrollClassName?: string
}

export interface SubtitlesSettingsSectionProps {
  providerSubtitles: StreamSubtitle[]
  isFetchingWyzie: boolean
  onFetchWyzie: () => void
  isFetchingSubsource: boolean
  onFetchSubsource: () => void
  selectedSub: string | null
  setSelectedSub: (val: string | null) => void
  wyzieGroups: WyzieSubtitleGroup[]
  subError: boolean
  showHeading?: boolean
}

export interface CustomizationSettingsSectionProps {
  subOffset: number
  setSubOffset: Dispatch<SetStateAction<number>>
  subMargin: number
  setSubMargin: (val: number) => void
  subSize: number
  setSubSize: (val: number) => void
  subFont: string
  setSubFont: (val: string) => void
  subLh: number
  setSubLh: (val: number) => void
  subBg: string
  setSubBg: (val: string) => void
  showHeading?: boolean
  scrollClassName?: string
}

export interface SettingsSectionsProps
  extends
    AudioSettingsSectionProps,
    SubtitlesSettingsSectionProps,
    CustomizationSettingsSectionProps {}
