import { apiFetch, parseJsonResponse } from './client'

export async function listNotifications(limit = 40) {
  const res = await apiFetch(`/notifications?limit=${limit}`)
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load notifications')
  }
  return data.notifications || []
}

export async function markNotificationRead(id) {
  const res = await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update notification')
  }
  return data
}
