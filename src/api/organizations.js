import { apiFetch, parseJsonResponse } from './client'

export async function listOrganizations() {
  const res = await apiFetch('/organizations')
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load organizations')
  }
  return data.organizations || []
}

export async function createOrganization(name) {
  const res = await apiFetch('/organizations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create organization')
  }
  return data.organization
}

export async function getOrganization(orgId) {
  const res = await apiFetch(`/organizations/${orgId}`)
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Organization not found')
  }
  return data.organization
}

export async function updateOrganization(orgId, payload) {
  const res = await apiFetch(`/organizations/${orgId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update organization')
  }
  return data.organization
}

export async function deleteOrganization(orgId) {
  const res = await apiFetch(`/organizations/${orgId}`, { method: 'DELETE' })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete organization')
  }
  return data
}

export async function getOrgMembers(orgId) {
  const res = await apiFetch(`/organizations/${orgId}/members`)
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load members')
  }
  return data
}

export async function removeOrgMember(orgId, userId) {
  const res = await apiFetch(`/organizations/${orgId}/members/${userId}`, {
    method: 'DELETE',
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to remove member')
  }
  return data
}

export async function getOrgAlbumsSummary(orgId) {
  const res = await apiFetch(`/organizations/${orgId}/albums-summary`)
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load albums')
  }
  return data
}

export async function fetchAlbumsForOrg(orgId) {
  const res = await apiFetch(`/organizations/${orgId}/albums`)
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load albums')
  }
  return data
}

export async function createAlbum(orgId, payload) {
  const res = await apiFetch(`/organizations/${orgId}/albums`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create album')
  }
  return data.album
}

export async function getAlbum(orgId, albumId) {
  const res = await apiFetch(`/organizations/${orgId}/albums/${albumId}`)
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load album')
  }
  return data.album
}

export async function updateAlbum(orgId, albumId, payload) {
  const res = await apiFetch(`/organizations/${orgId}/albums/${albumId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update album')
  }
  return data.album
}

export async function deleteAlbum(orgId, albumId) {
  const res = await apiFetch(`/organizations/${orgId}/albums/${albumId}`, {
    method: 'DELETE',
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete album')
  }
  return data
}
