# Mobile Navbar Redesign — Design Spec

Date: 2026-07-31
Status: Approved
Scope: Mobile-only navigation overhaul. Desktop navbar unchanged.

## Summary

On mobile (`<md`), the current navbar hides all nav links (`hidden sm:flex`), leaving users unable to reach Discover/Watchlist from the top bar, and crowds auth controls (Sync, Sign Out, language, search) into a tiny right cluster. Redesign: a bottom navigation bar with 5 tabs (mobile only), a profile sheet for auth actions, and a minimal top navbar showing only the logo on mobile.

## Goals

- Mobile users can navigate Home / Discover / Watchlist / Search / Profile via a bottom bar.
- Auth actions (sign in/out, sync, language, admin) move out of the cramped top-right cluster into a Profile sheet.
- Desktop (`md+`) experience is untouched.
- Player route (`/netflix`) is untouched (AppLayout already returns early).

## Non-Goals (YAGNI)

- No hamburger menu.
- No desktop changes at all.
- No new dependencies (use existing `Dialog`, `motion`, lucide icons).

## Architecture

### 1. BottomNav — `src/components/layout/bottom-nav.tsx` (new)

- `fixed bottom-0 z-50 md:hidden h-16 border-t border-white/5 bg-background/95 backdrop-blur-md`
- `pb-[env(safe-area-inset-bottom)]` for iOS home indicator.
- 5 tabs, each icon + tiny label:
  | Tab | Icon (lucide) | Action |
  |---|---|---|
  | Home | `Home` | `Link to="/"` |
  | Discover | `Compass` | `Link to="/discover"` |
  | Watchlist | `Bookmark` | `Link to="/watchlist"` |
  | Search | `Search` | opens `SearchModal` |
  | Profile | `User` | opens ProfileSheet |
- Active state: `useLocation()` — `/` exact match, others `pathname.startsWith(to)` (same logic as navbar).
- Active: `text-foreground`, inactive: `text-muted-foreground`.

### 2. ProfileSheet — `src/components/layout/profile-sheet.tsx` (new)

- Bottom-anchored sheet (`md:hidden`), rendered from BottomNav.
- Implementation: reuse the existing `Dialog` from `@/components/ui/dialog` (already used by AuthModal) OR a motion-based bottom sheet — pick during implementation whichever matches the existing visual language best (dialog is `rounded` modal; a motion slide-up matches mobile bottom-nav patterns better; check what `dialog.tsx` supports).
- Contents:
  - **Logged in**: avatar circle (initial letter), email, "Sync to Cloud"/"Synced ✓" button (handler moved from navbar — shared via a small exported function or inline copy, decide during implementation to avoid duplication), admin "Admin Analytics" link if `role === "admin"`, "Sign Out" button.
  - **Guest**: "Sign In" button → `setAuthModalOpen(true, "signin")`.
  - Language toggle EN/ID (moved from navbar).
- All state from `useAuthStore` (same as navbar).

### 3. Navbar refactor — `src/components/layout/navbar.tsx`

- Mobile (`<md`): only the AMOV logo (left). Everything else (`navLinks`, admin link, language button, search button, auth controls) gets `hidden md:flex` / `hidden md:inline-flex` so desktop is unchanged.
- The `SearchModal` stays owned by the navbar for desktop; on mobile it is opened by BottomNav's Search tab. Both render the same modal component — each component mounts its own instance when needed (the modal is cheap; no cross-component state needed).
- `handleSyncToCloud` and `toggleLanguage` move to ProfileSheet (or a shared helper file — decide during implementation; prefer a tiny shared `src/components/layout/navbar-actions.ts` if both need it, else move wholesale).

### 4. AppLayout — `src/components/layout/app-layout.tsx`

- Render `<BottomNav />` inside the non-player layout branch (after `<Footer />` or before — bottom nav is fixed so position in DOM only affects stacking; put it after Footer).
- Player route untouched.

### 5. Footer safe-area

- Footer `pb-12` on mobile is overlapped by the fixed bottom nav (`h-16`). Add `pb-16 md:pb-12` (or `pb-28` if the footer's bottom row needs clearance) to the footer's inner container.

## Error Handling / Edge Cases

- Bottom nav on very small screens (<360px): labels may crowd — use `text-[10px]` labels and `gap` tuned for 5 tabs.
- Active state on nested routes (`/discover/xyz`): `startsWith` handles it.
- Profile sheet on guest: only Sign In + language — no crash on undefined user (guard `user?`).
- Bottom nav + keyboard (Cmd+K): search modal shortcut stays global (already in navbar; keep it).

## Testing

- No test runner in repo; verify via typecheck + manual smoke on narrow viewport:
  1. Home shows bottom nav (mobile width); tabs navigate.
  2. Search tab opens modal.
  3. Profile tab opens sheet; Sign In (guest) / Sync + Sign Out (logged in).
  4. Desktop (`md+`) shows the old navbar with all links; bottom nav hidden.
  5. Player route has no bottom nav.
  6. Footer not covered by bottom nav.
- Typecheck via `bun run typecheck`.

## Files Touched

| File | Action |
|---|---|
| `src/components/layout/bottom-nav.tsx` | new |
| `src/components/layout/profile-sheet.tsx` | new |
| `src/components/layout/navbar.tsx` | modify (hide mobile items, keep desktop) |
| `src/components/layout/app-layout.tsx` | add `<BottomNav />` |
| `src/components/layout/footer.tsx` | add mobile bottom padding |

## Open Questions (resolve during implementation)

- Dialog vs motion bottom-sheet for ProfileSheet (visual match).
- Shared actions file vs wholesale move for sync/language handlers.
