import { apiFetch, parseJsonResponse } from './client'

/** Dedupe concurrent list calls (e.g. React Strict Mode dev double effect). */
const listInflight = new Map()

export async function listAlbumPhotos(orgId, albumId, offset = 0, limit = 12) {
  const q = new URLSearchParams({
    offset: String(offset),
    limit: String(limit),
  })
  const path = `/organizations/${orgId}/albums/${albumId}/photos?${q.toString()}`
  const inflightKey = path

  const existing = listInflight.get(inflightKey)
  if (existing) return existing

  const promise = (async () => {
    const res = await apiFetch(path)
    const data = await parseJsonResponse(res)
    if (!res.ok) {
      throw new Error(data.error || 'Failed to load photos')
    }
    return data
  })().finally(() => {
    listInflight.delete(inflightKey)
  })

  listInflight.set(inflightKey, promise)
  return promise
}

/** Upload via API (no direct browser → R2; avoids R2 CORS on localhost). */
export async function uploadAlbumPhotoFile(orgId, albumId, file, width, height) {
  const form = new FormData()
  form.append('file', file)
  form.append('width', String(width))
  form.append('height', String(height))
  const res = await apiFetch(
    `/organizations/${orgId}/albums/${albumId}/photos/upload`,
    { method: 'POST', body: form }
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Upload failed')
  }
  return data
}

export async function presignAlbumPhotoUpload(orgId, albumId, contentType) {
  const res = await apiFetch(
    `/organizations/${orgId}/albums/${albumId}/photos/presigned-upload`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType }),
    }
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Could not start upload')
  }
  return data
}

export async function completeAlbumPhoto(orgId, albumId, body) {
  const res = await apiFetch(`/organizations/${orgId}/albums/${albumId}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Could not save photo')
  }
  return data
}
