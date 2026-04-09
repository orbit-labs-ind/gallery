import { API_BASE } from '../api/client'

/**
 * WebSocket URL for authenticated notification stream (matches gallery-backend WS_PATH).
 */
export function wsNotificationsUrl(token) {
  const base = API_BASE.replace(/\/$/, '')
  let urlObj
  try {
    urlObj = new URL(base.startsWith('http') ? base : `http://${base}`)
  } catch {
    urlObj = new URL('http://localhost:3001/api')
  }
  const wsProto = urlObj.protocol === 'https:' ? 'wss:' : 'ws:'
  const enc = encodeURIComponent(token)
  return `${wsProto}//${urlObj.host}/api/ws?token=${enc}`
}
