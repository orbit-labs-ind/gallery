import { apiFetch, parseJsonResponse } from './client'

export async function listNotifications(limit = 40, scope = 'active') {
  const q = new URLSearchParams({ limit: String(limit), scope })
  const res = await apiFetch(`/notifications?${q}`)
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

export async function archiveNotification(id) {
  const res = await apiFetch(`/notifications/${id}/archive`, { method: 'PATCH' })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to archive')
  }
  return data
}

export async function archiveAllNotifications() {
  const res = await apiFetch('/notifications/archive-all', { method: 'PATCH' })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to archive all')
  }
  return data
}

export async function unarchiveNotification(id) {
  const res = await apiFetch(`/notifications/${id}/unarchive`, { method: 'PATCH' })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to unarchive')
  }
  return data
}
