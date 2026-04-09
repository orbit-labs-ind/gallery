import { showNotification } from '@mantine/notifications'
import { playNotificationChime } from './notificationSound'

const recentIds = new Map()

function shouldDedupe(id) {
  if (!id) return false
  const now = Date.now()
  for (const [k, t] of recentIds) {
    if (now - t > 8000) recentIds.delete(k)
  }
  if (recentIds.has(String(id))) return true
  recentIds.set(String(id), now)
  return false
}

/**
 * Bell + FCM: chime, Mantine toast, optional system notification when permitted.
 * @param {{ id?: string, title: string, body?: string }} n
 */
export function presentIncomingNotification(n) {
  const title = String(n.title || 'PicPoint').slice(0, 200)
  const message = String(n.body || '').slice(0, 500)
  if (n.id && shouldDedupe(n.id)) return

  playNotificationChime()

  showNotification({
    title,
    message: message || ' ',
    position: 'top-center',
    autoClose: 5200,
    withCloseButton: true,
    color: 'teal',
    classNames: { root: 'gallery-in-app-notify' },
  })

  if (
    typeof Notification !== 'undefined' &&
    Notification.permission === 'granted' &&
    typeof document !== 'undefined' &&
    !document.hasFocus()
  ) {
    try {
      new Notification(title, {
        body: message || undefined,
        icon: '/vite.svg',
        tag: n.id ? String(n.id) : undefined,
      })
    } catch {
      /* ignore */
    }
  }
}
