import { useEffect, useState } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { SearchModal } from "@/components/search/search-modal"
import { useAuthStore } from "@/stores/auth-store"
import { loadAllProgress } from "@/hooks/use-watch-progress"
import {
  fetchWatchHistory,
  upsertWatchHistory,
  mergeWatchHistory,
} from "@/api/watch-history.api"

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/discover", label: "Discover" },
  { to: "/watchlist", label: "Watchlist" },
]

export function Navbar() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
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
      if (ok) {
        setSyncEnabled(true)
      }
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const isTransparentMode = pathname === "/" || pathname.startsWith("/movie/")

  return (
    <>
      <nav
        className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
          scrolled || !isTransparentMode
            ? "border-b border-white/5 bg-background/95 backdrop-blur-md"
            : "bg-linear-to-b from-black/60 to-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-16">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="font-heading text-2xl font-black tracking-tighter text-primary transition-opacity hover:opacity-90 md:text-3xl"
            >
              AMOV
            </Link>
            <div className="hidden items-center gap-1 md:flex">
              {navLinks.map((link) => {
                const isActive =
                  link.to === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.to)

                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "text-foreground"
                        : scrolled || !isTransparentMode
                          ? "text-muted-foreground hover:text-foreground"
                          : "text-white/70 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
              {role === "admin" && (
                <Link
                  to="/admin"
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    pathname.startsWith("/admin")
                      ? "font-bold text-red-500"
                      : scrolled || !isTransparentMode
                        ? "text-red-400/90 hover:text-red-400"
                        : "text-red-400 hover:text-white"
                  }`}
                >
                  Admin Analytics
                </Link>
              )}
            </div>
          </div>
          <div className="hidden items-center gap-5 md:flex">
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`transition-colors ${
                scrolled || !isTransparentMode
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined !text-[20px]">search</span>
            </button>

            {/* Auth Controls */}
            {user ? (
              <div className="flex items-center gap-2">
                {role === "admin" && (
                  <span className="rounded-md bg-red-600/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-red-500 uppercase ring-1 ring-red-500/30">
                    ADMIN
                  </span>
                )}
                <div
                  title={user.email ?? "User"}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600/90 text-xs font-black text-white uppercase ring-2 ring-white/10"
                >
                  {user.email?.[0] ?? "U"}
                </div>
                <button
                  type="button"
                  onClick={handleSyncToCloud}
                  disabled={syncing}
                  className={`text-xs font-semibold transition-colors ${
                    syncEnabled
                      ? "text-green-400"
                      : scrolled || !isTransparentMode
                        ? "text-muted-foreground hover:text-foreground"
                        : "text-white/70 hover:text-white"
                  }`}
                >
                  {syncing ? "Syncing..." : syncEnabled ? "Synced ✓" : "Sync to Cloud"}
                </button>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className={`text-xs font-semibold transition-colors ${
                    scrolled || !isTransparentMode
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true, "signin")}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-red-500 active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  )
}
