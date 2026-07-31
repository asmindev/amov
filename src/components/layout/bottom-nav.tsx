import { useState } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { SearchModal } from "@/components/search/search-modal"
import { ProfileSheet } from "./profile-sheet"

const tabs = [
  { to: "/", label: "Home", icon: "home" },
  { to: "/discover", label: "Discover", icon: "explore" },
  { to: "/watchlist", label: "Watchlist", icon: "bookmark" },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const isActive = (to: string) =>
    to === "/" ? pathname === "/" : pathname.startsWith(to)

  const iconClass = (active: boolean) =>
    `material-symbols-outlined text-[24px] leading-none ${
      active ? "fill" : ""
    }`

  return (
    <>
      <nav className="fixed bottom-0 z-50 w-full border-t border-white/5 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
        <div className="mx-auto flex h-16 max-w-md items-stretch justify-around">
          {tabs.map(({ to, label, icon }) => {
            const active = isActive(to)
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <span className={iconClass(active)}>{icon}</span>
                {label}
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground transition-colors"
          >
            <span className={iconClass(false)}>search</span>
            Search
          </button>
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground transition-colors"
          >
            <span className={iconClass(false)}>person</span>
            Profile
          </button>
        </div>
      </nav>

      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      <ProfileSheet open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </>
  )
}
