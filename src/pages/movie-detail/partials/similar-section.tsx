import { motion } from "motion/react"
import { MovieCard } from "@/components/movie-card"
import type { Movie } from "@/types/movie.types"

interface SimilarSectionProps {
  similarMovies: Movie[]
}

export function SimilarSection({ similarMovies }: SimilarSectionProps) {
  if (similarMovies.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h2 className="mb-6 font-heading text-2xl font-semibold">
        More Like This
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {similarMovies.map((m) => (
          <MovieCard key={m.id} movie={m} className="w-full" />
        ))}
      </div>
    </motion.section>
  )
}
