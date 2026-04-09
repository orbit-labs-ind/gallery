/* global importScripts, firebase */
/**
 * FCM background handler. Config is loaded from `firebase-messaging-config.json`
 * (gitignored). Copy `firebase-messaging-config.example.json` →
 * `firebase-messaging-config.json` and fill values from Firebase Console
 * (same as gallery-frontend `.env` VITE_FIREBASE_*).
 */
importScripts('https://www.gstatic.com/firebasejs/12.11.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.11.0/firebase-messaging-compat.js')

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
      '[firebase-messaging-sw] Missing or invalid config. Add',
      CONFIG_URL,
      '(see firebase-messaging-config.example.json):',
      e
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
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: payload.data || {},
      tag: payload.data?.notificationId || undefined,
      renotify: true,
    }
    return self.registration.showNotification(title, options)
  })
})()
