/** FNV-1a-ish hash for stable seeds per photo */
export function hashString(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h) || 1
}

function mulberry32(seed) {
  return function rand() {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle(arr, rand) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function rectsOverlap(a, b, margin) {
  return !(
    a.left + a.w + margin <= b.left ||
    b.left + b.w + margin <= a.left ||
    a.top + a.h + margin <= b.top ||
    b.top + b.h + margin <= a.top
  )
}

const MARGIN = 2.8

/**
 * Non-overlapping placements in percentage of the image stage (top ~6–62% vertical
 * band to stay clear of header/footer feel).
 * @returns {{ comment: object, left: number, top: number, w: number, h: number }[]}
 */
export function computeVisualCommentPlacements(comments, photoKey, maxShow = 4) {
  if (!comments?.length) return []
  const rand = mulberry32(hashString(String(photoKey)))
  const pool = shuffle(comments, rand).slice(0, maxShow)
  const rects = []
  const out = []

  for (const comment of pool) {
    let placed = false
    for (let attempt = 0; attempt < 100; attempt++) {
      const w = 32 + rand() * 14
      const h = 11 + rand() * 9
      const left = 2 + rand() * Math.max(0.5, 96 - w)
      const top = 5 + rand() * Math.max(0.5, 56 - h)
      const rect = { left, top, w, h }
      if (!rects.some((r) => rectsOverlap(rect, r, MARGIN))) {
        rects.push(rect)
        out.push({ comment, left, top, w, h })
        placed = true
        break
      }
    }
    if (!placed) {
      const i = out.length
      const rect = {
        left: 4 + (i % 2) * 22,
        top: 8 + i * 15,
        w: 40,
        h: 13,
      }
      rects.push(rect)
      out.push({ comment, ...rect })
    }
  }
  return out
}

export function displayCommentAuthor(c) {
  const e = c.user?.email
  if (!e) return 'Someone'
  const at = e.indexOf('@')
  return at > 0 ? e.slice(0, at) : e
}
