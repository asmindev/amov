# Mobile Navbar Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mobile-only bottom navigation bar (5 tabs) and profile sheet, and reduce the mobile top navbar to just the logo.

**Architecture:** Two new components (`BottomNav`, `ProfileSheet`) under `src/components/layout/`; `Navbar` keeps its desktop layout and hides mobile-crowding elements below `md`; `AppLayout` renders `<BottomNav />`; footer gains mobile bottom padding. Desktop (`md+`) is byte-identical in behavior.

**Tech Stack:** React 19, Tailwind v4, lucide-react, TanStack Router (`Link`, `useLocation`), existing `Dialog` (base-ui), existing `SearchModal` and `AuthModal`, Zustand (`useAuthStore`).

## Global Constraints

- Bottom nav is `md:hidden` (mobile only); desktop navbar unchanged.
- Player route (`/netflix`) must NOT render BottomNav — AppLayout already returns early there; add BottomNav only in the non-player branch.
- Bottom nav: `fixed bottom-0 z-50`, `h-16`, `border-t border-white/5`, `bg-background/95`, `backdrop-blur-md`, `pb-[env(safe-area-inset-bottom)]`.
- 5 tabs exactly: Home (`/`), Discover (`/discover`), Watchlist (`/watchlist`), Search (opens `SearchModal`), Profile (opens ProfileSheet).
- Active state: `/` exact match; others `pathname.startsWith(to)` — same logic as navbar.
- Repo conventions: no semicolons, double quotes, kebab-case, `@/` alias.

---

### Task 1: BottomNav Component

**Files:**
- Create: `src/components/layout/bottom-nav.tsx`

**Interfaces:**
- Consumes: `SearchModal` from `@/components/search/search-modal` (`{ open: boolean; onOpenChange: (open: boolean) => void }`), `useLocation`/`Link` from `@tanstack/react-router`, lucide `Home`, `Compass`, `Bookmark`, `Search`, `User`.
- Produces: `export function BottomNav(): JSX.Element` — the mobile bottom bar; owns its own `SearchModal` instance and its own `ProfileSheet` open state (Task 2 imports it from here or the sheet is rendered here — see Task 2).

- [ ] **Step 1: Write the component**

```tsx
// src/components/layout/bottom-nav.tsx
import { useState } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { Home, Compass, Bookmark, Search, User } from "lucide-react"
import { SearchModal } from "@/components/search/search-modal"
import { ProfileSheet } from "./profile-sheet"

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/watchlist", label: "Watchlist", icon: Bookmark },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to)

  return (
    <>
      <nav className="fixed bottom-0 z-50 w-full border-t border-white/5 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="mx-auto flex h-16 max-w-md items-stretch justify-around">
          {tabs.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                isActive(to) ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground transition-colors"
          >
            <Search className="h-5 w-5" />
            Search
          </button>
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground transition-colors"
          >
            <User className="h-5 w-5" />
            Profile
          </button>
        </div>
      </nav>

      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      <ProfileSheet open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: FAIL — `./profile-sheet` does not exist yet. (Expected failure; Task 2 creates it.)

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/bottom-nav.tsx
git commit -m "feat: mobile bottom navigation bar (5 tabs)"
```

---

### Task 2: ProfileSheet Component

**Files:**
- Create: `src/components/layout/profile-sheet.tsx`

**Interfaces:**
- Consumes: `useAuthStore` (`user`, `role`, `signOut`, `setAuthModalOpen`, `syncEnabled`, `setSyncEnabled`), `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle` from `@/components/ui/dialog`, `loadAllProgress` from `@/hooks/use-watch-progress`, `fetchWatchHistory`/`upsertWatchHistory`/`mergeWatchHistory` from `@/api/watch-history.api`, lucide `Globe`, `Loader2`.
- Produces: `export function ProfileSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }): JSX.Element` — bottom-anchored sheet with auth actions + language toggle.

- [ ] **Step 1: Write the component**

```tsx
// src/components/layout/profile-sheet.tsx
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Globe, Loader2 } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { loadAllProgress } from "@/hooks/use-watch-progress"
import {
  fetchWatchHistory,
  upsertWatchHistory,
  mergeWatchHistory,
} from "@/api/watch-history.api"

export function ProfileSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { user, role, signOut, setAuthModalOpen, syncEnabled, setSyncEnabled } =
    useAuthStore()
  const [syncing, setSyncing] = useState(false)

  const handleSyncToCloud = async () => {
    if (syncing || !user) return
    setSyncing(true)
    try {
      const localEntries = Object.values(loadAllProgress())
      const cloudEntries = await fetchWatchHistory(user.id)
      const merged = mergeWatchHistory(localEntries, cloudEntries)
      const ok = await upsertWatchHistory(user.id, merged)
      if (ok) setSyncEnabled(true)
    } finally {
      setSyncing(false)
    }
  }

  const currentLang =
    typeof window !== "undefined"
      ? localStorage.getItem("app-language") || "en-US"
      : "en-US"
  const toggleLanguage = () => {
    const nextLang = currentLang === "en-US" ? "id-ID" : "en-US"
    localStorage.setItem("app-language", nextLang)
    window.location.reload()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-auto right-0 bottom-0 left-0 w-full max-w-none translate-x-0 translate-y-0 rounded-t-2xl rounded-b-none border-x-0 border-b-0 sm:max-w-none">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600/90 text-sm font-black text-white uppercase ring-2 ring-white/10">
                  {user.email?.[0] ?? "U"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {user.email}
                  </p>
                  {role === "admin" && (
                    <span className="rounded-md bg-red-600/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-red-500 uppercase ring-1 ring-red-500/30">
                      ADMIN
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSyncToCloud}
                disabled={syncing}
                className={`flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold transition-colors ${
                  syncEnabled
                    ? "text-green-400"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {syncing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Syncing...
                  </>
                ) : syncEnabled ? (
                  "Synced ✓"
                ) : (
                  "Sync to Cloud"
                )}
              </button>
              {role === "admin" && (
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-white/10"
                >
                  Admin Analytics
                </button>
              )}
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                onOpenChange(false)
                setAuthModalOpen(true, "signin")
              }}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-red-500 active:scale-95"
            >
              Sign In
            </button>
          )}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            <Globe className="h-4 w-4" />
            Language: {currentLang === "en-US" ? "EN" : "ID"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**Note on Admin Analytics link:** it's rendered as a `<button>` that closes the sheet but does not navigate yet — the admin link in navbar is a router `Link to="/admin"`. Replace the button with `Link` from `@tanstack/react-router` (`to="/admin"`, `onClick={() => onOpenChange(false)}`, same classes) — the button stub above is a placeholder to be swapped in the same step; do NOT ship the non-navigating stub.

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: PASS (BottomNav now resolves `./profile-sheet`).

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/profile-sheet.tsx
git commit -m "feat: mobile profile sheet with auth actions and language toggle"
```

---

### Task 3: Navbar Refactor — Hide Mobile Items

**Files:**
- Modify: `src/components/layout/navbar.tsx`

**Interfaces:**
- Consumes: nothing new (removes usage of `handleSyncToCloud`, `toggleLanguage`, search button, nav links, auth controls from the mobile view).
- Produces: same `Navbar` export; mobile (`<md`) shows only the AMOV logo.

- [ ] **Step 1: Hide mobile-crowding elements**

In `src/components/layout/navbar.tsx`:
1. Keep the logo `Link` as-is.
2. Add `hidden md:flex` to the `navLinks` container (currently `hidden items-center gap-1 sm:flex` → change `sm:flex` to `md:flex`; the container already has `hidden`).
3. Add `hidden md:flex` to the right-side controls container (`<div className="flex items-center gap-5">` → `<div className="hidden items-center gap-5 md:flex">`).
4. Remove `toggleLanguage`, `handleSyncToCloud`, and their now-unused imports (`Globe`, `loadAllProgress`, `fetchWatchHistory`, `upsertWatchHistory`, `mergeWatchHistory`) from navbar — they moved to ProfileSheet (Task 2). Also remove the now-unused `syncing` state (`const [syncing, setSyncing] = useState(false)` and its `useState` import if nothing else uses it — `useState` is still needed for `scrolled` and `isSearchOpen`, so keep the import). Keep the `useEffect` scroll handler and the Cmd+K search shortcut (both global, still wanted).

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: PASS — no unused imports (remove any the compiler flags).

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/navbar.tsx
git commit -m "refactor: navbar hides nav links, search, and auth on mobile (logo only)"
```

---

### Task 4: AppLayout + Footer

**Files:**
- Modify: `src/components/layout/app-layout.tsx`
- Modify: `src/components/layout/footer.tsx`

**Interfaces:**
- Consumes: `BottomNav` from Task 1.
- Produces: BottomNav rendered on all non-player pages; footer clears the bottom bar.

- [ ] **Step 1: Render BottomNav in AppLayout**

In `src/components/layout/app-layout.tsx`, non-player branch, after `<Footer />`:

```tsx
import { BottomNav } from "@/components/layout/bottom-nav"
// ...
      <Footer />
      <BottomNav />
      <AuthModal />
```

- [ ] **Step 2: Footer bottom clearance**

In `src/components/layout/footer.tsx`, the inner container is `<div className="relative mx-auto max-w-[1400px] px-6 pt-20 pb-12 md:px-16">` — change `pb-12` to `pb-24 md:pb-12` (bottom nav is 64px + safe area; 96px clears it on mobile, desktop unchanged).

- [ ] **Step 3: Typecheck**

Run: `bun run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/app-layout.tsx src/components/layout/footer.tsx
git commit -m "feat: render bottom nav in layout, clear footer on mobile"
```

---

### Task 5: Manual Verification

**Files:** none (verification only)

- [ ] **Step 1: Typecheck + build**

Run: `bun run typecheck && bun run build`
Expected: clean.

- [ ] **Step 2: Dev server smoke (narrow viewport)**

Run: `bun run dev`, open at mobile width (~390px):
1. Bottom nav visible with 5 tabs; Home active on `/`.
2. Discover / Watchlist tabs navigate and highlight.
3. Search tab opens the search modal; closes.
4. Profile tab opens sheet; guest shows Sign In + language; logged-in shows avatar, email, Sync/Synced, Admin (if admin), Sign Out, language.
5. Language toggle switches and reloads.
6. Resize to `md+`: bottom nav gone, old navbar with all links + search + auth visible.
7. Open a `/netflix` player route: no bottom nav.
8. Scroll to footer on mobile: footer content not hidden behind bottom nav.
9. Cmd+K still opens search on both mobile and desktop.

- [ ] **Step 3: Commit any fixes from smoke test**

```bash
git add -A
git commit -m "fix: mobile navbar verification fixes"
```

(No commit if nothing to fix.)
