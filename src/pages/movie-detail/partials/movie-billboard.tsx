import { getBackdropUrl } from "@/helpers/image-url"

interface MovieBillboardProps {
  movie: {
    backdropPath: string | null
    title: string
  }
}

export function MovieBillboard({ movie }: MovieBillboardProps) {
  return (
    <div className="fixed inset-0 z-0 h-[100vh] w-full">
      <img
        src={getBackdropUrl(movie.backdropPath, "original")}
        alt={movie.title}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Gradients to blend background into content */}
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-r from-background/80 via-background/20 to-transparent" />
    </div>
  )
}
