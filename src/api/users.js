import { apiFetch, parseJsonResponse } from './client'

export async function patchMyProfile(payload) {
  const res = await apiFetch('/auth/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Could not update profile')
  }
  return data.user
}

/** Multipart upload; multer field name is `file` (same as album cover). */
export async function uploadMyAvatar(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await apiFetch('/users/me/avatar', {
    method: 'POST',
    body: form,
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Could not upload photo')
  }
  return data.user
}

export async function fetchUserProfile(userId) {
  const res = await apiFetch(`/users/${encodeURIComponent(userId)}/profile`)
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Could not load profile')
  }
  return data.profile
}

export async function fetchMyActivity() {
  const res = await apiFetch('/users/me/activity')
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Could not load activity')
  }
  return data
}

export async function softDeleteMyAccount() {
  const res = await apiFetch('/users/me/delete', { method: 'POST' })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Could not deactivate account')
  }
  return data
}
