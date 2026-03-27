/**
 * Deterministic visual variant (0–2) from organization id.
 * Maps to theme tokens: --accent, --accent3, --accent2 (see OrganizationsPage.css).
 */
function hashId(id) {
  const s = String(id || '')
  let h = 0
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function getOrgVisualVariant(orgId) {
  return hashId(orgId) % 3
}

export const ORG_ICON_KEYS = [
  'layers',
  'planet',
  'rocket',
  'diamond',
  'flame',
  'shield',
  'star',
  'compass',
]

export function getOrgIconKey(orgId) {
  const h = hashId(`${orgId}x`)
  return ORG_ICON_KEYS[h % ORG_ICON_KEYS.length]
}
