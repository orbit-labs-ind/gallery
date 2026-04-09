import { apiFetch, parseJsonResponse } from './client'

function encKey(photoKey) {
  return encodeURIComponent(photoKey)
}

export async function getPhotoEngagement(orgId, albumId, photoKey) {
  const res = await apiFetch(
    `/organizations/${orgId}/albums/${albumId}/photos/${encKey(photoKey)}/engagement`
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load engagement')
  }
  return data
}

export async function togglePhotoLike(orgId, albumId, photoKey) {
  const res = await apiFetch(
    `/organizations/${orgId}/albums/${albumId}/photos/${encKey(photoKey)}/like`,
    { method: 'POST' }
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Could not update like')
  }
  return data
}

export async function postPhotoComment(orgId, albumId, photoKey, body) {
  const res = await apiFetch(
    `/organizations/${orgId}/albums/${albumId}/photos/${encKey(photoKey)}/comments`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    }
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Could not post comment')
  }
  return data
}

export async function deletePhotoComment(orgId, albumId, photoKey, commentId) {
  const res = await apiFetch(
    `/organizations/${orgId}/albums/${albumId}/photos/${encKey(photoKey)}/comments/${encodeURIComponent(commentId)}`,
    { method: 'DELETE' }
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Could not delete comment')
  }
  return data
}

export async function submitPhotoReport(orgId, albumId, photoKey, message) {
  const res = await apiFetch(
    `/organizations/${orgId}/albums/${albumId}/photos/${encKey(photoKey)}/report`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    }
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Could not send report')
  }
  return data
}
