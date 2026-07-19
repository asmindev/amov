import type { Genre } from "@/types/movie.types"

type GenreListProps = {
  genres: Genre[]
}

export function GenreList({ genres }: GenreListProps) {
  if (genres.length === 0) return null

  return (
    <section className="space-y-4">
      <h2 className="font-heading text-2xl font-semibold">Browse by Genre</h2>
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <button
            key={genre.id}
            className="rounded-full border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {genre.name}
          </button>
        ))}
      </div>
    </section>
  )
}
