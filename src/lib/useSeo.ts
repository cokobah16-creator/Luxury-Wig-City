import { useEffect } from 'react'

const SITE_NAME = 'Luxury Wig City'
const DEFAULT_TITLE = `${SITE_NAME} — Because Your Hair Is The Crown`
const DEFAULT_DESCRIPTION = 'Premium wigs, vetted vendors, and AI-matched styles built for African beauty.'

interface SeoOptions {
  title?: string
  description?: string
  image?: string | null
  noIndex?: boolean
}

/** Set head metadata for the current route. Restores defaults on unmount. */
export function useSeo({ title, description, image, noIndex }: SeoOptions = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE
    const desc = description ?? DEFAULT_DESCRIPTION

    const prevTitle = document.title
    document.title = fullTitle

    const setMeta = (selector: string, attr: 'name' | 'property', key: string, value: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, key)
        document.head.appendChild(el)
      }
      el.setAttribute('content', value)
      return el
    }

    const prev = {
      desc:        document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.content,
      ogTitle:     document.head.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.content,
      ogDesc:      document.head.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.content,
      ogImage:     document.head.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.content,
      ogUrl:       document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.content,
      twitterTitle:document.head.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.content,
      twitterDesc: document.head.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.content,
      twitterImg:  document.head.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.content
    }

    setMeta('description', 'name', 'description', desc)
    setMeta('og-title', 'property', 'og:title', fullTitle)
    setMeta('og-desc', 'property', 'og:description', desc)
    setMeta('og-url', 'property', 'og:url', window.location.href)
    if (image) setMeta('og-image', 'property', 'og:image', image)
    setMeta('twitter-title', 'name', 'twitter:title', fullTitle)
    setMeta('twitter-desc', 'name', 'twitter:description', desc)
    if (image) setMeta('twitter-image', 'name', 'twitter:image', image)

    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (noIndex) {
      if (!robots) {
        robots = document.createElement('meta')
        robots.setAttribute('name', 'robots')
        document.head.appendChild(robots)
      }
      robots.setAttribute('content', 'noindex, nofollow')
    } else if (robots) {
      robots.remove()
    }

    return () => {
      document.title = prevTitle
      if (prev.desc)         document.head.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', prev.desc)
      if (prev.ogTitle)      document.head.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', prev.ogTitle)
      if (prev.ogDesc)       document.head.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', prev.ogDesc)
      if (prev.ogImage)      document.head.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.setAttribute('content', prev.ogImage)
      if (prev.ogUrl)        document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', prev.ogUrl)
      if (prev.twitterTitle) document.head.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', prev.twitterTitle)
      if (prev.twitterDesc)  document.head.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', prev.twitterDesc)
      if (prev.twitterImg)   document.head.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.setAttribute('content', prev.twitterImg)
    }
  }, [title, description, image, noIndex])
}

/** Inject (and clean up) a JSON-LD structured-data script. Pass a stable key to avoid duplicates. */
export function useJsonLd(key: string, data: Record<string, unknown> | null) {
  const serialized = data ? JSON.stringify(data) : null
  useEffect(() => {
    if (!serialized) return
    const id = `jsonld-${key}`
    let el = document.getElementById(id) as HTMLScriptElement | null
    if (!el) {
      el = document.createElement('script')
      el.type = 'application/ld+json'
      el.id = id
      document.head.appendChild(el)
    }
    el.textContent = serialized
    return () => { el?.remove() }
  }, [key, serialized])
}
