import { useNavigate } from "@tanstack/react-router"
import { CommandEmpty } from "@/components/ui/command"
import { SearchItem } from "./search-item"
import type { Movie } from "@/types/movie.types"
import { addSearchHistory } from "./use-search"

interface SearchResultsProps {
  results: Movie[]
  query: string
  onClose: () => void
}

export function SearchResults({
  results,
  query,
  onClose,
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
            navigate({
              to: "/$type/$id",
              params: {
                type: item.mediaType || "movie",
                id: String(item.id),
              },
            })
            onClose()
          }}
        />
      ))}
    </div>
  )
}
