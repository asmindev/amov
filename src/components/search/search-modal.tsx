import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandSeparator,
  CommandItem,
} from "@/components/ui/command"
import { SearchResults } from "./search-results"
import { SearchItem } from "./search-item"
import {
  useSearch,
  getSearchHistory,
  clearSearchHistory,
} from "./use-search"
import { useTrendingSearches } from "./use-trending-searches"
import { History, TrendingUp, Trash2, Loader2 } from "lucide-react"

interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")

  const { results, isFetching, debouncedQuery } = useSearch(query)
  const { data: trendingData } = useTrendingSearches()

  const trending = trendingData?.results ?? []

  const handleOpenChange = (open: boolean) => {
    if (!open) setQuery("")
    onOpenChange(open)
  }

  const handleViewAll = () => {
    if (query.trim()) {
      navigate({ to: "/discover", search: { query: query.trim() } })
      onOpenChange(false)
    }
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleOpenChange}
      className="sm:max-w-2xl top-[12%]"
    >
      <Command shouldFilter={false} className="rounded-xl">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search movies, shows, and more..."
        />

        <CommandList className="max-h-[70vh]">
          {query.length === 0 ? (
            <>
              {trending.length > 0 && (
                <CommandGroup
                  heading={
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      Trending
                    </span>
                  }
                >
                  {trending.slice(0, 6).map((item) => (
                    <SearchItem
                      key={`trending-${item.id}`}
                      item={item}
                      showRating
                      onSelect={() => setQuery(item.title)}
                    />
                  ))}
                </CommandGroup>
              )}

              <SearchHistory onSelect={(h) => setQuery(h)} />
            </>
          ) : debouncedQuery.length === 0 ? null : isFetching ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <SearchResults
              results={results}
              query={debouncedQuery}
              onClose={() => onOpenChange(false)}
              onViewAll={handleViewAll}
            />
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

function SearchHistory({
  onSelect,
}: {
  onSelect: (query: string) => void
}) {
  const [history, setHistory] = useState<string[]>(getSearchHistory)

  if (history.length === 0) return null

  return (
    <>
      <CommandSeparator />
      <CommandGroup
        heading={
          <span className="flex items-center gap-2">
            <History className="h-3.5 w-3.5 text-muted-foreground" />
            Recent searches
          </span>
        }
      >
        {history.map((h) => (
          <CommandItem
            key={h}
            value={h}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-white/70 aria-selected:bg-white/5"
            onSelect={() => onSelect(h)}
          >
            <History className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{h}</span>
          </CommandItem>
        ))}
        <CommandItem
          value="clear-history"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground aria-selected:bg-white/5"
          onSelect={() => {
            clearSearchHistory()
            setHistory([])
          }}
        >
          <Trash2 className="h-3 w-3" />
          Clear history
        </CommandItem>
      </CommandGroup>
    </>
  )
}
