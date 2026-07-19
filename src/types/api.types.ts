import { z } from "zod"

export type ApiResponse<T> = {
  data: T
  status: number
  message?: string
}

export type Paginated<T> = {
  results: T[]
  page: number
  totalPages: number
  totalResults: number
}

export const TmdbPaginatedSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    results: z.array(itemSchema),
    page: z.number(),
    total_pages: z.number(),
    total_results: z.number(),
  })

export const PaginatedSchema = <T extends z.ZodType>(itemSchema: T) =>
  TmdbPaginatedSchema(itemSchema).transform((d) => ({
    results: d.results,
    page: d.page,
    totalPages: d.total_pages,
    totalResults: d.total_results,
  }))
