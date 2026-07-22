import { useNavigate } from "@tanstack/react-router"
import { CommandItem, CommandEmpty } from "@/components/ui/command"
import { SearchItem } from "./search-item"
import type { Movie } from "@/types/movie.types"
import { addSearchHistory } from "./use-search"

interface SearchResultsProps {
  results: Movie[]
  query: string
  onClose: () => void
  onViewAll: () => void
}

export function SearchResults({
  results,
  query,
  onClose,
  onViewAll,
}: SearchResultsProps) {
  const navigate = useNavigate()

  if (results.length === 0) {
    return (
      <CommandEmpty className="py-12 text-center text-muted-foreground">
        <p className="font-medium">No results for "{query}"</p>
        <p className="mt-1 text-sm">Try a different search term</p>
      </CommandEmpty>
    )
  }

  return (
    <div>
      {results.slice(0, 10).map((item) => (
        <SearchItem
          key={`${item.mediaType}-${item.id}`}
          item={item}
          onSelect={() => {
            addSearchHistory(item.title)
            if (item.mediaType === "tv") {
              navigate({
                to: "/discover",
                search: { query: item.title },
              })
            } else {
              navigate({
                to: "/movie/$id",
                params: { id: String(item.id) },
              })
            }
            onClose()
          }}
        />
      ))}

      <CommandItem
        value={`view-all-${query}`}
        className="mt-1 flex items-center justify-center rounded-lg py-3 text-sm font-medium text-primary aria-selected:bg-primary/10"
        onSelect={() => {
          addSearchHistory(query)
          onViewAll()
        }}
      >
        View all results for "{query}"
      </CommandItem>
    </div>
  )
}
