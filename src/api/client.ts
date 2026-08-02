import { env } from "@/lib/env"

type RequestOptions = {
  method?: string
  headers?: Record<string, string>
  body?: unknown
  params?: Record<string, string>
}

class ApiClient {
  private baseUrl: string
  private token: string

  constructor() {
    this.baseUrl = env.VITE_API_BASE_URL
    this.token = env.VITE_MOVIE_API_TOKEN
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const base = this.baseUrl.endsWith("/") ? this.baseUrl : `${this.baseUrl}/`
    const cleanPath = path.startsWith("/") ? path.slice(1) : path
    const url = new URL(cleanPath, base)

    // If the caller passes an explicit `language` param, respect it (used to
    // fetch the English title via language=en-US). Otherwise use the app locale.
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value)
      })
    }

    if (!url.searchParams.has("language")) {
      const lang =
        typeof window !== "undefined"
          ? localStorage.getItem("app-language") || "en-US"
          : "en-US"
      url.searchParams.set("language", lang)
    }

    return url.toString()
  }

  private async request<T>(
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { method = "GET", headers = {}, body, params } = options

    const url = this.buildUrl(path, params)

    const response = await fetch(url, {
      method,
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${this.token}`,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "Unknown error")
      throw new ApiError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status,
        errorBody
      )
    }

    return response.json()
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(path, { params })
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "POST", body })
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, { method: "PUT", body })
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" })
  }
}

export class ApiError extends Error {
  status: number
  body: string

  constructor(message: string, status: number, body: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

export const apiClient = new ApiClient()
