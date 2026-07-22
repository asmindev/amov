import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { searchMovies } from "@/api/movies.api"
import { useDebounce } from "@/hooks/use-debounce"
import { getImageUrl } from "@/helpers/image-url"
import { formatYear } from "@/helpers/format-date"
import { Search, Globe, Star, Loader2 } from "lucide-react"
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

  const debouncedQuery = useDebounce(searchQuery, 400)
  const { data: searchResults, isFetching } = useQuery({
    queryKey: ["searchMovies", debouncedQuery],
    queryFn: () => searchMovies(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
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
          ? "border-b border-white/5 bg-background/95 backdrop-blur-md"
          : "bg-gradient-to-b from-black/60 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-16">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="font-heading text-2xl font-black tracking-tighter text-[#e50914] transition-opacity hover:opacity-90 md:text-3xl"
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
            <DialogContent className="overflow-hidden rounded-2xl border-white/10 bg-background/95 p-0 shadow-2xl backdrop-blur-2xl sm:max-w-2xl">
              <DialogHeader className="sr-only">
                <DialogTitle>Search Movies</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSearch}
                className="flex items-center border-b border-white/10 px-4"
              >
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder="Search movies, shows, and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-16 border-0 bg-transparent px-4 text-lg font-medium shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                {isFetching && (
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                )}
              </form>

              <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                {debouncedQuery.length > 0 ? (
                  <div className="flex flex-col p-2">
                    {searchResults?.results &&
                    searchResults.results.length > 0 ? (
                      <>
                        {searchResults.results.slice(0, 6).map((movie) => (
                          <Link
                            key={movie.id}
                            to="/movie/$id"
                            params={{ id: String(movie.id) }}
                            onClick={() => {
                              setIsSearchOpen(false)
                              setSearchQuery("")
                            }}
                            className="group flex items-center gap-4 rounded-xl p-3 transition-colors hover:bg-white/5"
                          >
                            <div className="h-16 w-12 shrink-0 overflow-hidden rounded-md border border-white/5 bg-white/5">
                              {movie.posterPath ? (
                                <img
                                  src={getImageUrl(movie.posterPath, "w92")}
                                  alt={movie.title}
                                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                  <Search className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate text-base font-semibold text-white/90 transition-colors group-hover:text-primary">
                                {movie.title}
                              </h4>
                              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1 text-primary">
                                  <Star className="h-3.5 w-3.5 fill-primary" />
                                  {movie.voteAverage.toFixed(1)}
                                </span>
                                <span>{formatYear(movie.releaseDate)}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                        {searchResults.results.length > 6 && (
                          <button
                            onClick={handleSearch}
                            className="mt-2 w-full rounded-xl p-3 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                          >
                            View all results for "{debouncedQuery}"
                          </button>
                        )}
                      </>
                    ) : !isFetching ? (
                      <div className="py-14 text-center text-muted-foreground">
                        No results found for "{debouncedQuery}"
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-14 text-center text-muted-foreground/50">
                    <Search className="mb-2 h-8 w-8 opacity-20" />
                    <p className="font-medium text-muted-foreground">
                      Type to search
                    </p>
                    <p className="text-sm">Find movies and details instantly</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </nav>
  )
}
