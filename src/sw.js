/**
 * PicPoint PWA + Firebase Cloud Messaging (single registration at `/sw.js`).
 * Precache + SPA routing via Workbox; background FCM same as former `firebase-messaging-sw.js`.
 */
import { clientsClaim } from 'workbox-core'
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

importScripts(
  'https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js',
)

self.skipWaiting()
clientsClaim()

cleanupOutdatedCaches()
// Injected by vite-plugin-pwa (injectManifest)
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')))

const CONFIG_URL = '/firebase-messaging-config.json'

;(async function initFirebaseMessaging() {
  let config
  try {
    const res = await fetch(CONFIG_URL, { cache: 'no-store' })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    config = await res.json()
  } catch (e) {
    console.error(
      '[sw] FCM: add',
      CONFIG_URL,
      '(see firebase-messaging-config.example.json):',
      e,
    )
    return
  }

  if (!firebase.apps?.length) {
    firebase.initializeApp(config)
  }

  const messaging = firebase.messaging()

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || 'PicPoint'
    const options = {
      body: payload.notification?.body || '',
      icon: '/pwa-192.png',
      badge: '/pwa-192.png',
      data: payload.data || {},
      tag: payload.data?.notificationId || undefined,
      renotify: true,
    }
    return self.registration.showNotification(title, options)
  })
})()
