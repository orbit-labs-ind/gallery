import { TOKEN_KEY, validateJWT } from '../store/slices/authSlice'
import { wsNotificationsUrl } from './wsNotificationsUrl'

/** @type {WebSocket | null} */
let ws = null
let refCount = 0
let reconnectAttempt = 0
/** @type {ReturnType<typeof setTimeout> | null} */
let reconnectTimer = null
let intentionalClose = false

/** @type {Set<(data: unknown) => void>} */
const listeners = new Set()

const pendingOutgoing = []

function flushPending() {
  while (pendingOutgoing.length && ws?.readyState === WebSocket.OPEN) {
    const raw = pendingOutgoing.shift()
    try {
      ws.send(raw)
    } catch {
      /* ignore */
    }
  }
}

function connectInternal() {
  intentionalClose = false
  const token = localStorage.getItem(TOKEN_KEY)
  const v = validateJWT(token || '')
  if (!token || !v.valid || v.expired) return

  if (ws?.readyState === WebSocket.OPEN || ws?.readyState === WebSocket.CONNECTING) return

  let socket
  try {
    socket = new WebSocket(wsNotificationsUrl(token))
  } catch {
    return
  }
  ws = socket

  socket.onopen = () => {
    reconnectAttempt = 0
    flushPending()
  }

  socket.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data)
      listeners.forEach((fn) => {
        try {
          fn(data)
        } catch {
          /* ignore */
        }
      })
    } catch {
      /* ignore */
    }
  }

  socket.onclose = () => {
    ws = null
    if (intentionalClose || refCount <= 0) return
    const delay = Math.min(30_000, 2000 + reconnectAttempt * 2000)
    reconnectAttempt += 1
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null
      if (refCount > 0) connectInternal()
    }, delay)
  }

  socket.onerror = () => {
    try {
      socket?.close()
    } catch {
      /* ignore */
    }
  }
}

/**
 * @param {(data: unknown) => void} listener
 * @returns {() => void} unsubscribe
 */
export function subscribeGalleryWs(listener) {
  listeners.add(listener)
  refCount += 1
  connectInternal()
  return () => {
    listeners.delete(listener)
    refCount = Math.max(0, refCount - 1)
    if (refCount === 0) {
      intentionalClose = true
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
      try {
        ws?.close()
      } catch {
        /* ignore */
      }
      ws = null
      pendingOutgoing.length = 0
    }
  }
}

export function sendGalleryWs(obj) {
  const raw = JSON.stringify(obj)
  if (ws?.readyState === WebSocket.OPEN) {
    try {
      ws.send(raw)
    } catch {
      /* ignore */
    }
  } else {
    pendingOutgoing.push(raw)
  }
}

/** Call on logout to drop connection immediately */
export function disconnectGalleryWs() {
  intentionalClose = true
  refCount = 0
  listeners.clear()
  if (reconnectTimer) {
    window.clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  try {
    ws?.close()
  } catch {
    /* ignore */
  }
  ws = null
  pendingOutgoing.length = 0
}
