import { useEffect, useState } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { SearchModal } from "@/components/search/search-modal"
import { Search, Globe } from "lucide-react"

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/discover", label: "Discover" },
  { to: "/watchlist", label: "Watchlist" },
]

export function Navbar() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

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
    <>
      <nav
        className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
          scrolled || !isTransparentMode
            ? "border-b border-white/5 bg-background/95 backdrop-blur-md"
            : "bg-gradient-to-b from-black/60 to-transparent"
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
                        : scrolled || !isTransparentMode
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
          <div className="flex items-center gap-5">
            <button
              onClick={toggleLanguage}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                scrolled || !isTransparentMode
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase">
                {currentLang === "en-US" ? "EN" : "ID"}
              </span>
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              className={`transition-colors ${
                scrolled || !isTransparentMode
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  )
}
