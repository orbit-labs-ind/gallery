import { apiFetch } from './client'
import { TOKEN_KEY } from '../store/slices/authSlice'

/** In-flight dedupe (React Strict Mode double-mount shares one request). */
const inflight = new Map()

/** Short-lived blob cache: same URL + token → same bytes (avoids 2nd network after first completes). */
const blobCache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000
const CACHE_MAX = 120

function cacheKey(url) {
  const token =
    typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) || '' : ''
  return `${url}\0${token}`
}

function cacheGet(key) {
  const e = blobCache.get(key)
  if (!e) return null
  if (Date.now() > e.expires) {
    blobCache.delete(key)
    return null
  }
  blobCache.delete(key)
  blobCache.set(key, e)
  return e.blob
}

function cacheSet(key, blob) {
  if (blobCache.has(key)) blobCache.delete(key)
  blobCache.set(key, { blob, expires: Date.now() + CACHE_TTL_MS })
  while (blobCache.size > CACHE_MAX) {
    const first = blobCache.keys().next().value
    blobCache.delete(first)
  }
}

/**
 * Fetch authenticated album image bytes with deduplication and caching.
 * Survives React 18 Strict Mode (dev) remounts without doubling traffic.
 */
export async function fetchAuthenticatedImageBlob(url) {
  const key = cacheKey(url)

  const cached = cacheGet(key)
  if (cached) return cached

  let p = inflight.get(key)
  if (p) return p

  p = (async () => {
    const res = await apiFetch(url)
    const ct = (res.headers.get('content-type') || '').toLowerCase()
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    if (!ct.startsWith('image/')) {
      await res.text()
      throw new Error('Not an image response')
    }
    const blob = await res.blob()
    if (!blob.size) {
      throw new Error('Empty image')
    }
    cacheSet(key, blob)
    return blob
  })().finally(() => {
    inflight.delete(key)
  })

  inflight.set(key, p)
  return p
}
