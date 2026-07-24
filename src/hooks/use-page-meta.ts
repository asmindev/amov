import { useEffect } from "react"

interface PageMeta {
  title: string
  description?: string
  image?: string
  url?: string
}

const SITE_NAME = "amov"
const DEFAULT_DESCRIPTION =
  "Stream movies and TV shows for free. Discover trending, top-rated, and popular content."

function getOrCreateMeta(property: string): HTMLMetaElement {
  let el =
    document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`) ||
    document.querySelector<HTMLMetaElement>(`meta[name="${property}"]`)
  if (!el) {
    el = document.createElement("meta")
    if (property.startsWith("og:") || property.startsWith("twitter:")) {
      el.setAttribute("property", property)
    } else {
      el.setAttribute("name", property)
    }
    document.head.appendChild(el)
  }
  return el
}

function setMeta(property: string, content: string) {
  const el = getOrCreateMeta(property)
  el.setAttribute("content", content)
}

export function usePageMeta({ title, description, image, url }: PageMeta) {
  useEffect(() => {
    const prevTitle = document.title
    const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`

    document.title = fullTitle
    setMeta("description", description || DEFAULT_DESCRIPTION)

    const ogTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`
    setMeta("og:title", ogTitle)
    setMeta("og:description", description || DEFAULT_DESCRIPTION)
    setMeta("og:site_name", SITE_NAME)

    if (image) setMeta("og:image", image)
    if (url) setMeta("og:url", url)

    setMeta("twitter:card", "summary_large_image")
    setMeta("twitter:title", ogTitle)
    setMeta("twitter:description", description || DEFAULT_DESCRIPTION)
    if (image) setMeta("twitter:image", image)

    return () => {
      document.title = prevTitle
    }
  }, [title, description, image, url])
}
