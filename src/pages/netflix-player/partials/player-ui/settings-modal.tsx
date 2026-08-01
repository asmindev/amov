import { useState } from "react"
import { motion } from "motion/react"
import type { SettingsModalProps } from "./settings-modal/types"
import { SubtitlesSettingsSection } from "./settings-modal/subtitles-settings-section"
import { CustomizationSettingsSection } from "./settings-modal/customization-settings-section"
import { AudioSettingsSection } from "./settings-modal/audio-settings-section"

type SettingsTab = "subtitles" | "style" | "speed"

export function SettingsModal(props: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("subtitles")

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 250 }}
      className="pointer-events-auto fixed top-0 right-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-white/15 bg-black/75 p-4 text-white shadow-2xl backdrop-blur-xl md:w-96"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
        <h2 className="text-xs font-bold tracking-wider text-white uppercase">
          Audio & Subtitles
        </h2>
        <button
          type="button"
          onClick={() => props.setOpenMenu(null)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <span className="material-symbols-outlined !text-[18px]">close</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="mb-3 flex rounded-lg bg-white/5 p-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("subtitles")}
          className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
            activeTab === "subtitles"
              ? "bg-primary font-bold text-white shadow-sm"
              : "text-white/70 hover:text-white"
          }`}
        >
          Subtitles
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("style")}
          className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
            activeTab === "style"
              ? "bg-primary font-bold text-white shadow-sm"
              : "text-white/70 hover:text-white"
          }`}
        >
          Style & Sync
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("speed")}
          className={`flex-1 rounded-md py-1.5 font-medium transition-colors ${
            activeTab === "speed"
              ? "bg-primary font-bold text-white shadow-sm"
              : "text-white/70 hover:text-white"
          }`}
        >
          Speed
        </button>
      </div>

      {/* Tab Content Area */}
      <div className="settings-scroll flex-1 overflow-y-auto pr-1">
        {activeTab === "subtitles" && (
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
        )}

        {activeTab === "style" && (
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
          />
        )}

        {activeTab === "speed" && (
          <AudioSettingsSection
            playbackRate={props.playbackRate}
            setPlaybackRate={props.setPlaybackRate}
            showHeading={false}
          />
        )}
      </div>
    </motion.div>
  )
}
