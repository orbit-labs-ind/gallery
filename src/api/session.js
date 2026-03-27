import { apiFetch, parseJsonResponse } from './client'

export async function fetchCurrentUser() {
  const res = await apiFetch('/auth/me')
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Not authenticated')
  }
  return data
}
