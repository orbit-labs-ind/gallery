/**
 * In-app navigation target for a notification (used by header + notifications page).
 * @param {{ type: string, meta?: Record<string, unknown>, organizationId?: string }} n
 * @returns {string | null}
 */
export function notificationTargetPath(n) {
  if (!n || !n.type) return null
  const m = n.meta && typeof n.meta === 'object' ? n.meta : {}
  const orgFromDoc = n.organizationId != null ? String(n.organizationId) : ''
  const oid = m.organizationId != null ? String(m.organizationId) : orgFromDoc
  const albumId = m.albumId != null ? String(m.albumId) : ''
  const photoKey = m.photoKey != null ? String(m.photoKey) : ''

  switch (n.type) {
    case 'album_photo_like':
    case 'album_photo_comment':
    case 'album_photo_report':
      if (oid && albumId && photoKey) {
        return `/organizations/${oid}/albums/${albumId}?photo=${encodeURIComponent(photoKey)}`
      }
      if (oid && albumId) return `/organizations/${oid}/albums/${albumId}`
      return null
    case 'album_join_request':
      if (oid && albumId) {
        return `/dashboard?notifyOrg=${encodeURIComponent(oid)}&openAlbumSettings=${encodeURIComponent(albumId)}`
      }
      return oid ? `/dashboard?notifyOrg=${encodeURIComponent(oid)}` : '/dashboard'
    case 'album_join_approved':
    case 'album_join_rejected':
    case 'album_member_invited':
    case 'album_public_created':
      if (oid && albumId) return `/organizations/${oid}/albums/${albumId}`
      return '/dashboard'
    case 'org_member_added':
    case 'org_member_left':
    case 'org_member_removed':
    case 'org_member_account_deactivated':
      return oid ? `/organizations` : '/organizations'
    case 'org_creation_request':
      return '/organizations'
    case 'org_creation_approved':
    case 'org_creation_rejected':
      return '/organizations'
    default:
      return '/notifications'
  }
}
