import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "@/hooks/use-debounce"
import { searchMulti } from "@/api/search.api"
import { queryKeys } from "@/lib/query-keys"

const HISTORY_KEY = "search-history"
const MAX_HISTORY = 5

export function getSearchHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]")
  } catch {
    return []
  }
}

export function addSearchHistory(query: string) {
  const history = getSearchHistory().filter((h) => h !== query)
  history.unshift(query)
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history.slice(0, MAX_HISTORY))
  )
}

export function clearSearchHistory() {
  localStorage.removeItem(HISTORY_KEY)
}

export function useSearch(query: string) {
  const debouncedQuery = useDebounce(query, 400)

  const { data, isFetching, isFetched } = useQuery({
    queryKey: queryKeys.search.query(debouncedQuery),
    queryFn: () => searchMulti(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  })

  return {
    results: data?.results ?? [],
    isFetching,
    isFetched,
    debouncedQuery,
  }
}
