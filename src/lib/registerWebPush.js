import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging'
import { apiFetch, parseJsonResponse } from '../api/client'
import { presentIncomingNotification } from '../utils/inAppNotificationAlert'

let foregroundListenerAttached = false

function webConfig() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  if (!apiKey) return null
  return {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  }
}

/**
 * Registers FCM web token with API when Firebase env is configured and user grants permission.
 * Safe no-op if unsupported or missing config.
 */
export async function registerWebPushIfPossible() {
  const cfg = webConfig()
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
  if (!cfg?.projectId || !vapidKey) return

  if (typeof window === 'undefined' || !('Notification' in window)) return
  const ok = await isSupported().catch(() => false)
  if (!ok) return

  let perm = Notification.permission
  if (perm === 'default') {
    perm = await Notification.requestPermission()
  }
  if (perm !== 'granted') return

  const app = getApps().length ? getApps()[0] : initializeApp(cfg)
  const messaging = getMessaging(app)

  if (!foregroundListenerAttached) {
    foregroundListenerAttached = true
    onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'PicPoint'
      const body = payload.notification?.body || ''
      const id = payload.data?.notificationId
      presentIncomingNotification({
        id,
        title,
        body,
      })
    })
  }

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')

  let token
  try {
    token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    })
  } catch {
    return
  }
  if (!token) return

  const res = await apiFetch('/users/me/fcm-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, platform: 'web' }),
  })
  await parseJsonResponse(res)
}

export async function unregisterWebPushToken(token) {
  if (!token) return
  const res = await apiFetch('/users/me/fcm-token', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  await parseJsonResponse(res)
}
