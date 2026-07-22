import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchDecryptedSources } from "@/api/decryptor.api"
import type { DecryptorResult } from "@/api/decryptor.api"
import { DECRYPTOR_PROVIDERS } from "@/lib/config"
import type { DecryptorProvider } from "@/lib/config"
import { queryKeys } from "@/lib/query-keys"

interface UseSourcesParams {
  tmdbId: string
  title: string
  year: string
  mediaType: "movie" | "tv"
  imdbId?: string
  season?: number
  episode?: number
}

interface UseSourcesReturn {
  data: DecryptorResult | undefined
  isPending: boolean
  isError: boolean
  error: Error | null
  provider: DecryptorProvider
  providerIndex: number
  setProviderIndex: (index: number) => void
  allProviders: typeof DECRYPTOR_PROVIDERS
}

export function useSources(params: UseSourcesParams): UseSourcesReturn {
  const [providerIndex, setProviderIndex] = useState(0)
  const provider = DECRYPTOR_PROVIDERS[providerIndex]

  const enabled = !!params.tmdbId && !!params.title

  const queryKey = [
    ...queryKeys.decryptor.sources(params.tmdbId, provider),
    params.season,
    params.episode,
  ]

  const query = useQuery({
    queryKey,
    queryFn: () =>
      fetchDecryptedSources({
        ...params,
        provider,
      }),
    retry: false, // Manual fallback via providerIndex
    enabled,
  })

  // Auto-fallback: if current provider errors, try next
  useEffect(() => {
    if (query.isError && providerIndex < DECRYPTOR_PROVIDERS.length - 1) {
      const timer = setTimeout(() => {
        setProviderIndex((i) => i + 1)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [query.isError, providerIndex])

  return {
    data: query.data,
    // isFetching = true only when actively loading, not when disabled
    isPending: enabled && query.isFetching,
    isError: query.isError && providerIndex === DECRYPTOR_PROVIDERS.length - 1,
    error: query.error,
    provider,
    providerIndex,
    setProviderIndex,
    allProviders: DECRYPTOR_PROVIDERS,
  }
}
