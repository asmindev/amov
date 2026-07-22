import { motion } from "motion/react"
import { getImageUrl } from "@/helpers/image-url"

interface CastMember {
  id: number
  profilePath: string | null
  name: string
  character: string
}

interface CastSectionProps {
  cast: CastMember[]
}

export function CastSection({ cast }: CastSectionProps) {
  if (cast.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h2 className="mb-6 font-heading text-2xl font-semibold">Cast & Crew</h2>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 md:gap-6 lg:grid-cols-8">
        {cast.map((member) => (
          <div key={member.id} className="group flex flex-col text-left">
            <div className="mb-3 aspect-[2/3] w-full overflow-hidden rounded-none border border-white/10 bg-white/5 transition-transform duration-300 group-hover:scale-105 group-hover:border-white/30">
              <img
                src={getImageUrl(member.profilePath, "w185")}
                alt={member.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    member.name
                  )}&background=111&color=fff&size=200`
                }}
              />
            </div>
            <p className="mb-0.5 line-clamp-1 text-sm leading-tight font-bold text-white">
              {member.name}
            </p>
            <p className="line-clamp-1 text-xs text-white/50">
              {member.character}
            </p>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
