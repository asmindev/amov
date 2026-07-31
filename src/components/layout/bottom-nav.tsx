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
