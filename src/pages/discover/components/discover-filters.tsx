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
import { Filter, ChevronDown } from "lucide-react"
import { PROVIDERS, COUNTRIES, SORT_OPTIONS, YEARS } from "../constants"
import type { Genre } from "@/types/movie.types"

type DiscoverFiltersProps = {
  genres: Genre[]
  selectedGenres: number[]
  selectedYear: string
  selectedProviders: number[]
  selectedCountry: string
  selectedSortBy: string
  updateFilters: (newFilters: {
    genres?: number[]
    year?: string
    providers?: number[]
    country?: string
    sortBy?: string
  }) => void
}

export function DiscoverFilters({
  genres,
  selectedGenres,
  selectedYear,
  selectedProviders,
  selectedCountry,
  selectedSortBy,
  updateFilters,
}: DiscoverFiltersProps) {
  return (
    <div className="mb-10 flex flex-wrap items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className="gap-2 bg-white/5 border-white/10 hover:bg-white/10"
            >
              <Filter className="h-4 w-4" />
              Genres
              {selectedGenres.length > 0 && (
                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {selectedGenres.length}
                </span>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          }
        />
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Select Genres</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
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

      <Select
        value={selectedYear}
        onValueChange={(val: string | null) =>
          updateFilters({ year: val === "all" || !val ? "" : val })
        }
      >
        <SelectTrigger className="w-[150px] bg-white/5 border-white/10 hover:bg-white/10">
          <SelectValue placeholder="Release Year">
            {selectedYear === "all" || !selectedYear ? "All Years" : selectedYear}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
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

      <Select
        value={selectedCountry}
        onValueChange={(val: string | null) =>
          updateFilters({ country: val === "all" || !val ? "" : val })
        }
      >
        <SelectTrigger className="w-[180px] bg-white/5 border-white/10 hover:bg-white/10">
          <SelectValue placeholder="Country">
            {selectedCountry === "all" || !selectedCountry
              ? "All Countries"
              : COUNTRIES.find((c) => c.code === selectedCountry)?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
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

      <Select
        value={selectedSortBy}
        onValueChange={(val: string | null) =>
          updateFilters({ sortBy: val || "popularity.desc" })
        }
      >
        <SelectTrigger className="w-[200px] bg-white/5 border-white/10 hover:bg-white/10">
          <SelectValue placeholder="Sort By">
            {SORT_OPTIONS.find((opt) => opt.value === selectedSortBy)?.label ||
              "Most Popular"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectGroup>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className="gap-2 bg-white/5 border-white/10 hover:bg-white/10"
            >
              Providers
              {selectedProviders.length > 0 && (
                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {selectedProviders.length}
                </span>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          }
        />
        <DropdownMenuContent className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Streaming Providers</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
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

      {(selectedGenres.length > 0 ||
        selectedYear ||
        selectedProviders.length > 0 ||
        selectedCountry ||
        selectedSortBy !== "popularity.desc") && (
        <Button
          variant="ghost"
          onClick={() => {
            updateFilters({
              genres: [],
              year: "",
              providers: [],
              country: "",
              sortBy: "popularity.desc",
            })
          }}
          className="text-muted-foreground hover:text-white"
        >
          Clear Filters
        </Button>
      )}
    </div>
  )
}
