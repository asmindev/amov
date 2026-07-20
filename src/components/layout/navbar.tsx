import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "@tanstack/react-router"
import { Search, Globe } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/discover", label: "Discover" },
  { to: "/watchlist", label: "Watchlist" },
]

export function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isTransparentMode = pathname === "/" || pathname.startsWith("/movie/")

  const currentLang = typeof window !== "undefined" ? localStorage.getItem("app-language") || "en-US" : "en-US"
  const toggleLanguage = () => {
    const nextLang = currentLang === "en-US" ? "id-ID" : "en-US"
    localStorage.setItem("app-language", nextLang)
    window.location.reload()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearchOpen(false)
      navigate({
        to: "/discover",
        search: { query: searchQuery.trim() },
      })
      setSearchQuery("")
    }
  }

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
        scrolled || !isTransparentMode
          ? "bg-background/95 backdrop-blur-md border-b border-white/5"
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
            <span className="uppercase">{currentLang === "en-US" ? "EN" : "ID"}</span>
          </button>
          
          <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <DialogTrigger
              className={`transition-colors ${
                scrolled || !isTransparentMode
                  ? "text-muted-foreground hover:text-foreground"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Search className="h-5 w-5" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl border-white/10 bg-black/95 backdrop-blur-xl p-0 overflow-hidden shadow-2xl">
              <DialogHeader className="sr-only">
                <DialogTitle>Search Movies</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSearch} className="flex items-center px-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder="Search movies, shows, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 px-4 h-16 shadow-none"
                />
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </nav>
  )
}
