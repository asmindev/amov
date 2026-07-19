import { useEffect, useState } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { Search } from "lucide-react"

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Search" },
  { to: "/watchlist", label: "Watchlist" },
]

export function Navbar() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isHome = pathname === "/"

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
        scrolled || !isHome
          ? "bg-background/95 backdrop-blur-md"
          : "bg-gradient-to-b from-black/60 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-16">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-heading text-2xl font-bold text-primary">
            AMOV
          </Link>
          <div className="hidden items-center gap-1 sm:flex">
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
                      : scrolled || !isHome
                        ? "text-muted-foreground hover:text-foreground"
                        : "text-white/70 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
        <Link
          to="/search"
          className={`transition-colors ${
            scrolled || !isHome
              ? "text-muted-foreground hover:text-foreground"
              : "text-white/70 hover:text-white"
          }`}
        >
          <Search className="h-5 w-5" />
        </Link>
      </div>
    </nav>
  )
}
