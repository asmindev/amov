import { useParams } from "@tanstack/react-router"

export default function MovieDetailPage() {
  const { id } = useParams({ from: "/movie/$id" })

  return (
    <div className="mx-auto max-w-7xl p-6 pt-24">
      <h1 className="font-heading text-2xl font-semibold">Movie Detail</h1>
      <p className="mt-2 text-muted-foreground">Movie ID: {id}</p>
    </div>
  )
}
