import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { InfoSidebar } from "./info-sidebar"

interface DetailsSectionProps {
  movie: {
    tagline: string | null
    genres: { id: number; name: string }[]
    status: string
    releaseDate?: string
    originalLanguage: string
    budget: number
    revenue: number
  }
}

export function DetailsSection({ movie }: DetailsSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid grid-cols-1 gap-12 md:grid-cols-3"
    >
      <div className="space-y-8 md:col-span-2">
        {movie.tagline && (
          <div>
            <h3 className="mb-2 text-sm font-semibold tracking-wider text-white/50 uppercase">
              Tagline
            </h3>
            <p className="text-xl text-white/90 italic">
              &ldquo;{movie.tagline}&rdquo;
            </p>
          </div>
        )}

        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-wider text-white/50 uppercase">
            Genres
          </h3>
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((g) => (
              <Badge
                key={g.id}
                variant="secondary"
                className="rounded-none border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/90 hover:bg-white/10"
              >
                {g.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <InfoSidebar
          status={movie.status}
          releaseDate={movie.releaseDate}
          originalLanguage={movie.originalLanguage}
          budget={movie.budget}
          revenue={movie.revenue}
        />
      </div>
    </motion.section>
  )
}
