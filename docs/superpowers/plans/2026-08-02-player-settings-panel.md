# Player Settings Panel Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the obstructive full-screen shadcn `Dialog` in `SettingsModal` with a non-blocking, right-side slide-over panel using Motion (`bg-black/75 backdrop-blur-xl border-l border-white/15`) that keeps the video and live subtitles fully visible during configuration.

**Architecture:** A floating right-side panel rendered in an `AnimatePresence` wrapper inside `PlayerShell`. The panel contains 3 tabs: **Subtitles** (Language & Wyzie fetch), **Style & Sync** (Subtitle font size, margin, background, line-height, offset sync), and **Speed** (Playback rate).

**Tech Stack:** React 19, Motion (`motion/react`), Tailwind v4, lucide-react / Material Symbols, Zustand (`usePlayerSettings`, `useStoreSelector`)

## Global Constraints

- No full-screen dark backdrop overlay (`bg-black/80 backdrop-blur-sm` is removed)
- Panel position: `fixed top-0 right-0 h-full w-full max-w-sm md:w-96 z-50` (or inside player container)
- Panel styling: `bg-black/75 backdrop-blur-xl border-l border-white/15 shadow-2xl`
- All subtitle style adjustments (`subSize`, `subOffset`, `subBg`, etc.) must update the live subtitle overlay immediately
- Code conventions: no semicolons, double quotes, trailing commas (ES5), kebab-case filenames, `@/` alias
- Verification: `bun run typecheck`, `bun run lint`, `bun run build`

---

### Task 1: Redesign `SettingsModal` Component Shell

**Files:**
- Modify: `src/pages/netflix-player/partials/player-ui/settings-modal.tsx`
- Modify: `src/pages/netflix-player/partials/player-ui/settings-modal/types.ts`

**Interfaces:**
- Consumes: `SettingsModalProps` from `./types`
- Produces: Right-side slide-over panel with tabbed navigation (`subtitles` | `style` | `speed`)

- [ ] **Step 1: Update `SettingsModal` to use Motion Slide-Over Panel instead of `Dialog`**

```tsx
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
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
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
      <div className="mb-4 flex rounded-lg bg-white/5 p-1 text-xs">
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
```

- [ ] **Step 2: Remove obsolete `settings-sections-desktop.tsx` and `settings-sections-mobile.tsx`**

Delete the separate desktop/mobile split wrappers since the unified tabbed right-side panel works seamlessly on both mobile and desktop.

- [ ] **Step 3: Run typecheck and lint**

Run: `bun run typecheck && bun run lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/pages/netflix-player/partials/player-ui/settings-modal.tsx
git commit -m "feat(player): redesign SettingsModal into a right-side slide-over panel

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Polish Section Components & Verification

**Files:**
- Modify: `src/pages/netflix-player/partials/player-ui/settings-modal/subtitles-settings-section.tsx`
- Modify: `src/pages/netflix-player/partials/player-ui/settings-modal/customization-settings-section.tsx`
- Modify: `src/pages/netflix-player/partials/player-ui/settings-modal/audio-settings-section.tsx`

**Interfaces:**
- Refine styling of inner sections for compact vertical panel layout.

- [ ] **Step 1: Ensure sections render cleanly inside compact panel**

Remove unnecessary height wrappers or fixed margins in `SubtitlesSettingsSection`, `CustomizationSettingsSection`, and `AudioSettingsSection` so they fit inside the compact scrollable tab body.

- [ ] **Step 2: Run typecheck, lint, and build**

Run: `bun run typecheck && bun run lint && bun run build`
Expected: PASS with zero errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/netflix-player/partials/player-ui/settings-modal/
git commit -m "style(player): polish settings section components for side-panel layout

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
