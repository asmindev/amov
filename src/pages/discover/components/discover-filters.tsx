import { motion, AnimatePresence } from "motion/react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  SlidersHorizontal,
  X,
  Calendar,
  Globe,
  Tv,
  ArrowUpDown,
  Clapperboard,
  ChevronDown,
} from "lucide-react"
import { PROVIDERS, COUNTRIES, SORT_OPTIONS, YEARS } from "../constants"
import type { Genre } from "@/types/movie.types"

type DiscoverFiltersProps = {
  genres: Genre[]
  selectedGenres: number[]
  selectedYear: string
  selectedProviders: number[]
  selectedCountry: string
  selectedSortBy: string
  selectedType: "all" | "movie" | "tv"
  updateFilters: (newFilters: {
    genres?: number[]
    year?: string
    providers?: number[]
    country?: string
    sortBy?: string
    type?: "all" | "movie" | "tv"
  }) => void
}

const activeCount = (filters: DiscoverFiltersProps) =>
  (filters.selectedGenres.length > 0 ? 1 : 0) +
  (filters.selectedYear ? 1 : 0) +
  (filters.selectedProviders.length > 0 ? 1 : 0) +
  (filters.selectedCountry ? 1 : 0) +
  (filters.selectedSortBy !== "popularity.desc" ? 1 : 0) +
  (filters.selectedType !== "all" ? 1 : 0)

// Reusable filter pill wrapper
function FilterPill({
  isActive,
  children,
}: {
  label?: string
  icon?: React.ReactNode
  isActive?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      {isActive && (
        <span className="absolute -top-1 -right-1 z-10 flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
      )}
      {children}
    </div>
  )
}

export function DiscoverFilters({
  genres,
  selectedGenres,
  selectedYear,
  selectedProviders,
  selectedCountry,
  selectedSortBy,
  selectedType,
  updateFilters,
}: DiscoverFiltersProps) {
  const totalActive = activeCount({
    genres,
    selectedGenres,
    selectedYear,
    selectedProviders,
    selectedCountry,
    selectedSortBy,
    selectedType,
    updateFilters,
  })
  const hasFilters = totalActive > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="mb-10 space-y-4"
    >
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Section label */}
        <div className="flex items-center gap-2 pr-1 text-sm font-medium text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          <AnimatePresence>
            {hasFilters && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Badge className="h-5 min-w-5 px-1.5 text-[10px]">
                  {totalActive}
                </Badge>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* Type select */}
        <FilterPill
          label="Type"
          icon={<Clapperboard className="h-3.5 w-3.5" />}
          isActive={selectedType !== "all"}
        >
          <Select
            value={selectedType}
            onValueChange={(val: "all" | "movie" | "tv" | null) =>
              updateFilters({
                type: val || "all",
                // Reset genres if switching types since genre lists are completely different
                genres: [],
              })
            }
          >
            <SelectTrigger className="h-8 gap-1.5 rounded-md border-white/10 bg-white/5 px-3 text-xs font-medium transition-all hover:bg-white/10 data-[state=open]:bg-white/10">
              {selectedType === "tv" ? (
                <Tv className="h-3.5 w-3.5 shrink-0 opacity-70" />
              ) : (
                <Clapperboard className="h-3.5 w-3.5 shrink-0 opacity-70" />
              )}
              <SelectValue placeholder="Type">
                {selectedType === "tv"
                  ? "TV Series"
                  : selectedType === "movie"
                    ? "Movie"
                    : "Type: All"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="start">
              <SelectGroup>
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="movie">Movies</SelectItem>
                <SelectItem value="tv">TV Series</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </FilterPill>

        {/* Genre multi-select */}
        <FilterPill
          label="Genres"
          icon={<Clapperboard className="h-3.5 w-3.5" />}
          isActive={selectedGenres.length > 0}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-md border-white/10 bg-white/5 px-3 text-xs font-medium transition-all hover:bg-white/10 data-[state=open]:border-white/20 data-[state=open]:bg-white/10"
                >
                  <Clapperboard className="h-3.5 w-3.5 opacity-70" />
                  Genres
                  {selectedGenres.length > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-primary text-[10px] font-bold text-primary-foreground">
                      {selectedGenres.length}
                    </span>
                  )}
                  <ChevronDown className="h-3 w-3 opacity-40" />
                </Button>
              }
            />
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Select Genres
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="scrollbar-hide max-h-[280px] overflow-y-auto">
                  {genres.map((genre) => (
                    <DropdownMenuCheckboxItem
                      key={genre.id}
                      checked={selectedGenres.includes(genre.id)}
                      onCheckedChange={(checked) => {
                        const newGenres = checked
                          ? [...selectedGenres, genre.id]
                          : selectedGenres.filter((id) => id !== genre.id)
                        updateFilters({ genres: newGenres })
                      }}
                    >
                      {genre.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </FilterPill>

        {/* Year */}
        <FilterPill
          label="Year"
          icon={<Calendar className="h-3.5 w-3.5" />}
          isActive={!!selectedYear}
        >
          <Select
            value={selectedYear}
            onValueChange={(val: string | null) =>
              updateFilters({ year: val === "all" || !val ? "" : val })
            }
          >
            <SelectTrigger className="h-8 gap-1.5 rounded-md border-white/10 bg-white/5 px-3 text-xs font-medium transition-all hover:bg-white/10 data-[state=open]:bg-white/10">
              <Calendar className="h-3.5 w-3.5 shrink-0 opacity-70" />
              <SelectValue placeholder="Year">
                {!selectedYear || selectedYear === "all"
                  ? "Year"
                  : selectedYear}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]" align="start">
              <SelectGroup>
                <SelectItem value="all">All Years</SelectItem>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FilterPill>

        {/* Country */}
        <FilterPill
          label="Country"
          icon={<Globe className="h-3.5 w-3.5" />}
          isActive={!!selectedCountry}
        >
          <Select
            value={selectedCountry}
            onValueChange={(val: string | null) =>
              updateFilters({ country: val === "all" || !val ? "" : val })
            }
          >
            <SelectTrigger className="h-8 gap-1.5 rounded-md border-white/10 bg-white/5 px-3 text-xs font-medium transition-all hover:bg-white/10 data-[state=open]:bg-white/10">
              <Globe className="h-3.5 w-3.5 shrink-0 opacity-70" />
              <SelectValue placeholder="Country">
                {!selectedCountry || selectedCountry === "all"
                  ? "Country"
                  : COUNTRIES.find((c) => c.code === selectedCountry)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]" align="start">
              <SelectGroup>
                <SelectItem value="all">All Countries</SelectItem>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FilterPill>

        {/* Providers */}
        <FilterPill
          label="Providers"
          icon={<Tv className="h-3.5 w-3.5" />}
          isActive={selectedProviders.length > 0}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-md border-white/10 bg-white/5 px-3 text-xs font-medium transition-all hover:bg-white/10 data-[state=open]:border-white/20 data-[state=open]:bg-white/10"
                >
                  <Tv className="h-3.5 w-3.5 opacity-70" />
                  Streaming
                  {selectedProviders.length > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-primary text-[10px] font-bold text-primary-foreground">
                      {selectedProviders.length}
                    </span>
                  )}
                  <ChevronDown className="h-3 w-3 opacity-40" />
                </Button>
              }
            />
            <DropdownMenuContent className="w-52" align="start">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Streaming Providers
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="scrollbar-hide max-h-[280px] overflow-y-auto">
                  {PROVIDERS.map((provider) => (
                    <DropdownMenuCheckboxItem
                      key={provider.id}
                      checked={selectedProviders.includes(provider.id)}
                      onCheckedChange={(checked) => {
                        const newProviders = checked
                          ? [...selectedProviders, provider.id]
                          : selectedProviders.filter((id) => id !== provider.id)
                        updateFilters({ providers: newProviders })
                      }}
                    >
                      {provider.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </FilterPill>

        {/* Sort — pushed to far right */}
        <div className="ml-auto">
          <Select
            value={selectedSortBy}
            onValueChange={(val: string | null) =>
              updateFilters({ sortBy: val || "popularity.desc" })
            }
          >
            <SelectTrigger className="h-8 gap-1.5 rounded-md border-white/10 bg-white/5 px-3 text-xs font-medium transition-all hover:bg-white/10 data-[state=open]:bg-white/10">
              <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
              <SelectValue placeholder="Sort By">
                {SORT_OPTIONS.find((opt) => opt.value === selectedSortBy)
                  ?.label ?? "Most Popular"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filter chips */}
      <AnimatePresence>
        {hasFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Active:</span>

              <AnimatePresence mode="popLayout">
                {selectedGenres.map((id) => {
                  const genre = genres.find((g) => g.id === id)
                  if (!genre) return null
                  return (
                    <motion.button
                      key={`genre-${id}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      onClick={() =>
                        updateFilters({
                          genres: selectedGenres.filter((g) => g !== id),
                        })
                      }
                      className="flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary ring-1 ring-primary/30 transition-colors hover:bg-primary/25"
                    >
                      {genre.name}
                      <X className="h-3 w-3" />
                    </motion.button>
                  )
                })}

                {selectedYear && (
                  <motion.button
                    key="year-chip"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={() => updateFilters({ year: "" })}
                    className="flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary ring-1 ring-primary/30 transition-colors hover:bg-primary/25"
                  >
                    {selectedYear}
                    <X className="h-3 w-3" />
                  </motion.button>
                )}

                {selectedCountry && (
                  <motion.button
                    key="country-chip"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={() => updateFilters({ country: "" })}
                    className="flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary ring-1 ring-primary/30 transition-colors hover:bg-primary/25"
                  >
                    {COUNTRIES.find((c) => c.code === selectedCountry)?.name}
                    <X className="h-3 w-3" />
                  </motion.button>
                )}

                {selectedProviders.map((id) => {
                  const provider = PROVIDERS.find((p) => p.id === id)
                  if (!provider) return null
                  return (
                    <motion.button
                      key={`provider-${id}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                      onClick={() =>
                        updateFilters({
                          providers: selectedProviders.filter((p) => p !== id),
                        })
                      }
                      className="flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary ring-1 ring-primary/30 transition-colors hover:bg-primary/25"
                    >
                      {provider.name}
                      <X className="h-3 w-3" />
                    </motion.button>
                  )
                })}

                {selectedType !== "all" && (
                  <motion.button
                    key="type-chip"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={() => updateFilters({ type: "all", genres: [] })}
                    className="flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary ring-1 ring-primary/30 transition-colors hover:bg-primary/25"
                  >
                    {selectedType === "tv" ? "TV Series" : "Movie"}
                    <X className="h-3 w-3" />
                  </motion.button>
                )}

                {selectedSortBy !== "popularity.desc" && (
                  <motion.button
                    key="sort-chip"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    onClick={() => updateFilters({ sortBy: "popularity.desc" })}
                    className="flex items-center gap-1 rounded-md bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary ring-1 ring-primary/30 transition-colors hover:bg-primary/25"
                  >
                    {
                      SORT_OPTIONS.find((o) => o.value === selectedSortBy)
                        ?.label
                    }
                    <X className="h-3 w-3" />
                  </motion.button>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateFilters({
                    genres: [],
                    year: "",
                    providers: [],
                    country: "",
                    sortBy: "popularity.desc",
                    type: "all",
                  })
                }
                className="h-7 gap-1 rounded-md px-2.5 text-[11px] text-muted-foreground hover:text-white"
              >
                <X className="h-3 w-3" />
                Clear all
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
