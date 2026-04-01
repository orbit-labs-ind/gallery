/**
 * Map intrinsic image dimensions to CSS grid spans on a 4-column bento grid.
 * Wider images get horizontal emphasis; taller images get vertical emphasis.
 *
 * @param {number} width
 * @param {number} height
 * @param {number} index — used to inject occasional large tiles for rhythm
 * @returns {{ col: number, row: number }}
 */
export function getBentoSpan(width, height, index) {
  const w = Number(width) || 1
  const h = Number(height) || 1
  const r = w / h

  // Periodic “hero” square block (like brand tiles in reference layouts)
  if (index % 11 === 6) {
    return { col: 2, row: 2 }
  }

  if (r >= 1.45) {
    return { col: 2, row: 1 }
  }
  if (r <= 0.72) {
    return { col: 1, row: 2 }
  }
  if (r >= 1.15) {
    return { col: 2, row: 1 }
  }

  return { col: 1, row: 1 }
}
