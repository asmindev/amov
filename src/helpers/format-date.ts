export function formatDate(dateString: string): string {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatYear(dateString: string | null | undefined): string {
  if (!dateString) return "N/A"
  return new Date(dateString).getFullYear().toString()
}
