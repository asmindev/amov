import { Skeleton } from "@/components/ui/skeleton"

export function HeroBannerSkeleton() {
  return (
    <div className="relative h-[85vh] w-full">
      <Skeleton className="absolute inset-0" />
      <div className="absolute bottom-0 left-0 w-full space-y-3 px-8 pb-12 md:px-16">
        <Skeleton className="h-14 w-[500px]" />
        <Skeleton className="h-4 w-[600px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>
    </div>
  )
}

export function TrendingSectionSkeleton() {
  return (
    <section className="space-y-4">
      <Skeleton className="h-8 w-[200px]" />
      <div className="flex gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-[180px] flex-shrink-0 space-y-2">
            <Skeleton className="aspect-[2/3] rounded-lg" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </section>
  )
}

export function GenreListSkeleton() {
  return (
    <section className="space-y-4">
      <Skeleton className="h-8 w-[200px]" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
    </section>
  )
}
