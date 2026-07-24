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
import { useSearch, getSearchHistory, clearSearchHistory } from "./use-search"
import { useTrendingSearches } from "./use-trending-searches"
import { History, TrendingUp, Trash2 } from "lucide-react"

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
      className="top-[12%] sm:max-w-2xl"
    >
      <Command
        shouldFilter={false}
        className="rounded-xl [&_[data-slot=command-input-wrapper]:focus-within_[data-slot=input-group-addon]>svg]:[stroke-width:2.5] [&_[data-slot=command-input-wrapper]:focus-within_[data-slot=input-group-addon]>svg]:!text-destructive [&_[data-slot=input-group-addon]]:pl-2 [&_[data-slot=input-group]]:h-14!"
      >
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
                  {trending.slice(0, 4).map((item) => (
                    <SearchItem
                      key={`trending-${item.id}`}
                      item={item}
                      showRating
                      onSelect={() => {
                        navigate({
                          to: "/$type/$id",
                          params: {
                            type: item.mediaType || "movie",
                            id: String(item.id),
                          },
                        })
                        onOpenChange(false)
                      }}
                    />
                  ))}
                </CommandGroup>
              )}

              <SearchHistory onSelect={(h) => setQuery(h)} />
            </>
          ) : debouncedQuery.length === 0 ? null : isFetching ? (
            <SearchLoadingState />
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

function SearchLoadingState() {
  return (
    <div className="space-y-2 py-2">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-3 rounded-lg px-2 py-3"
        >
          <div className="h-12 w-8 shrink-0 rounded-md bg-white/10" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-3/4 rounded bg-white/10" />
            <div className="h-2 w-1/2 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

function SearchHistory({ onSelect }: { onSelect: (query: string) => void }) {
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
