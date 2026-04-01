/**
 * Mock gallery images with explicit dimensions (as R2/API may provide).
 * Uses picsum.photos with deterministic seeds for stable URLs.
 */

const SEED_DIMENSIONS = [
  { w: 1600, h: 900 },
  { w: 900, h: 1600 },
  { w: 1200, h: 1200 },
  { w: 1920, h: 1080 },
  { w: 1080, h: 1920 },
  { w: 1400, h: 900 },
  { w: 800, h: 1400 },
  { w: 1500, h: 1000 },
  { w: 1000, h: 1500 },
  { w: 1280, h: 720 },
  { w: 720, h: 1280 },
  { w: 1024, h: 1024 },
]

const TOTAL_MOCK = 60

function photoUrl(seed, w, h) {
  return `https://picsum.photos/seed/gallery-${seed}/${w}/${h}`
}

/**
 * @param {number} startIndex — offset into infinite list
 * @param {number} count — batch size
 * @returns {{ id: string, url: string, width: number, height: number }[]}
 */
export function fetchMockPhotoBatch(startIndex, count) {
  const out = []
  const end = Math.min(startIndex + count, TOTAL_MOCK)
  for (let i = startIndex; i < end; i++) {
    const spec = SEED_DIMENSIONS[i % SEED_DIMENSIONS.length]
    out.push({
      id: `mock-${i}`,
      url: photoUrl(i, spec.w, spec.h),
      width: spec.w,
      height: spec.h,
    })
  }
  return out
}

export function mockPhotoTotal() {
  return TOTAL_MOCK
}
