export const PROVIDERS = [
  { id: 8, name: "Netflix" },
  { id: 119, name: "Prime Video" },
  { id: 337, name: "Disney+" },
  { id: 384, name: "HBO Max" },
  { id: 15, name: "Hulu" },
  { id: 2, name: "Apple TV" },
]

export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "KR", name: "South Korea" },
  { code: "JP", name: "Japan" },
  { code: "ID", name: "Indonesia" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "IN", name: "India" },
]

export const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "primary_release_date.desc", label: "Newest Releases" },
  { value: "primary_release_date.asc", label: "Oldest Releases" },
  { value: "revenue.desc", label: "Highest Grossing" },
]

export const YEARS = Array.from({ length: 20 }, (_, i) =>
  String(new Date().getFullYear() - i)
)
