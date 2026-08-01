# Player Settings Panel Redesign Spec

## Context

The current `SettingsModal` (`settings-modal.tsx`) uses shadcn `Dialog` which overlays the entire screen with a heavy black backdrop blur (`fixed inset-0 bg-black/80 backdrop-blur-sm`) and an 80vh container (`md:min-w-6xl md:h-[80vh]`). This obstructs ~90% of the video player, preventing users from viewing the video or seeing real-time caption adjustments (font size, margin, color, sync offset) while configuring settings.

**Goal:** Replace the full-screen dialog with a non-blocking, compact Right Side Slide-over Panel (`bg-black/75 backdrop-blur-xl border-l border-white/10`) that allows full visibility of the video player and subtitle overlay.

---

## Architecture & Layout

### 1. Component Structure
- Delete shadcn `Dialog` dependency from `settings-modal.tsx`.
- Implement a floating slide-over panel anchored to the right side of the video container (`absolute top-0 right-0 h-full w-full max-w-sm md:w-96 z-50 pointer-events-auto`).
- Use Motion (`motion/react`) for smooth slide-in (`initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}`).

### 2. Tab Navigation Structure
Inside the panel, organize options into 3 clean tabs:

1. **Subtitles (Bahasa & Sumber)**
   - Search bar for subtitle languages.
   - Subtitle "Off" toggle.
   - Provider Subtitles list.
   - Wyzie External Subtitles (Fetch External button + expandable language groups).

2. **Style & Sync (Kustomisasi)**
   - Subtitle Offset Sync (`-5s` to `+5s` stepper / slider).
   - Font Size (`14px` - `36px`).
   - Bottom Margin (`10px` - `120px`).
   - Font Family (Netflix Sans, DM Sans, Outfit, Monospace, Casual).
   - Line Height (`1.0` - `2.0`).
   - Background Style (Transparent, Black Box, Semi-transparent, Outline).

3. **Speed (Audio & Kecepatan)**
   - Playback rate options (`0.5x`, `0.75x`, `1.0x (Normal)`, `1.25x`, `1.5x`, `2.0x`).

---

## UI Specs & Transparency

- **Panel Container**: `bg-black/75 backdrop-blur-xl border-l border-white/15 shadow-2xl`
- **Header**: Compact header with Title "Audio & Subtitles" and Close `(X)` button.
- **Tab Bar**: Horizontal pill tab bar (`Subtitles | Style | Speed`).
- **No Backdrop Overlay**: The area outside the side panel remains 100% click-through / transparent to the video player. User can click outside or press Escape/Close button to close the panel.

---

## Files Changed / Created

- **Modify**: `src/pages/netflix-player/partials/player-ui/settings-modal.tsx` (replace Dialog with Motion side panel & tabbed layout)
- **Modify**: `src/pages/netflix-player/partials/player-ui/settings-modal/subtitles-settings-section.tsx`
- **Modify**: `src/pages/netflix-player/partials/player-ui/settings-modal/customization-settings-section.tsx`
- **Modify**: `src/pages/netflix-player/partials/player-ui/settings-modal/audio-settings-section.tsx`
- **Clean up**: Remove unneeded modal wrappers (`settings-sections-desktop.tsx`, `settings-sections-mobile.tsx` if merged).

---

## Verification

1. `bun run typecheck` — 0 TypeScript errors.
2. `bun run lint` — 0 ESLint errors.
3. `bun run build` — Vite build success (settings-modal lazy chunk compiled).
4. **Behavioral**:
   - Opening settings displays the right-side panel without dimming the video.
   - Changing subtitle size, offset, or background immediately updates the live subtitle overlay on the video.
   - Video remains visible and playing behind/beside the panel.
