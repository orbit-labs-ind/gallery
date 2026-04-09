import { useEffect } from 'react'
import { subscribeGalleryWs, sendGalleryWs } from '../utils/galleryWebSocket'

export const GALLERY_ENGAGEMENT_EVENT = 'gallery-engagement-refresh'

/**
 * Subscribe to live likes/comments for an album (same WebSocket as notifications).
 */
export function useAlbumEngagementChannel(orgId, albumId, enabled = true) {
  useEffect(() => {
    if (!enabled || !orgId || !albumId) return undefined
    const channel = `album:${orgId}:${albumId}`

    const unsub = subscribeGalleryWs((data) => {
      if (!data || data.event !== 'engagement_refresh') return
      window.dispatchEvent(new CustomEvent(GALLERY_ENGAGEMENT_EVENT, { detail: data }))
    })

    sendGalleryWs({ type: 'subscribe', channel })

    return () => {
      sendGalleryWs({ type: 'unsubscribe', channel })
      unsub()
    }
  }, [orgId, albumId, enabled])
}
