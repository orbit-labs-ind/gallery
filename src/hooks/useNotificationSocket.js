import { useEffect } from 'react'
import { subscribeGalleryWs } from '../utils/galleryWebSocket'

const EVENT_NAME = 'gallery-notify'

/**
 * Shared WebSocket: forwards server `notification` events to the window.
 */
export function useNotificationSocket(enabled) {
  useEffect(() => {
    if (!enabled) return undefined
    return subscribeGalleryWs((data) => {
      if (data?.event === 'notification' && data.notification) {
        window.dispatchEvent(
          new CustomEvent(EVENT_NAME, { detail: data.notification })
        )
      }
    })
  }, [enabled])
}

export { EVENT_NAME as GALLERY_NOTIFY_EVENT }
