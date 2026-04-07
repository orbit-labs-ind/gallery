import { apiFetch, parseJsonResponse } from './client'

/** Dedupe concurrent GETs (React Strict Mode dev remount). */
const getAlbumInflight = new Map()

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

export async function getAlbumCreateMemberCandidates(orgId) {
  const res = await apiFetch(
    `/organizations/${orgId}/album-create-member-candidates`
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load organization members')
  }
  return data.members || []
}

export async function uploadAlbumCover(orgId, albumId, file) {
  const body = new FormData()
  body.append('file', file)
  const res = await apiFetch(
    `/organizations/${orgId}/albums/${albumId}/cover`,
    { method: 'POST', body }
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Cover upload failed')
  }
  return data.album
}

export async function getAlbum(orgId, albumId) {
  const path = `/organizations/${orgId}/albums/${albumId}`
  const hit = getAlbumInflight.get(path)
  if (hit) return hit

  const promise = (async () => {
    const res = await apiFetch(path)
    const data = await parseJsonResponse(res)
    if (!res.ok) {
      throw new Error(data.error || 'Failed to load album')
    }
    return data.album
  })().finally(() => {
    getAlbumInflight.delete(path)
  })

  getAlbumInflight.set(path, promise)
  return promise
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

export async function previewAlbumShare(shareToken) {
  const res = await apiFetch('/organizations/album-share/preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shareToken }),
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Album not found')
  }
  return data
}

export async function requestAlbumJoin(shareToken) {
  const res = await apiFetch('/organizations/album-share/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shareToken }),
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Could not send request')
  }
  return data
}

export async function listMyJoinedAlbums() {
  const res = await apiFetch('/organizations/me/joined-albums')
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load shared albums')
  }
  return data.albums || []
}

export async function inviteOrgMember(orgId, payload) {
  const res = await apiFetch(`/organizations/${orgId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    const err = new Error(data.error || 'Failed to invite member')
    err.code = data.code
    err.status = res.status
    throw err
  }
  if (data.pendingEmailInvite) {
    return {
      pendingEmailInvite: true,
      email: data.email,
      message: data.message,
    }
  }
  return data.member
}

export async function listPendingOrgInvites() {
  const res = await apiFetch('/organizations/me/pending-org-invites')
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load invitations')
  }
  return data.invites || []
}

export async function acceptOrgInvite(inviteId) {
  const res = await apiFetch(
    `/organizations/me/pending-org-invites/${inviteId}/accept`,
    { method: 'POST' }
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Could not accept invitation')
  }
  return data
}

export async function declineOrgInvite(inviteId) {
  const res = await apiFetch(
    `/organizations/me/pending-org-invites/${inviteId}/decline`,
    { method: 'POST' }
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Could not decline invitation')
  }
  return data
}

export async function acceptOrgInviteByToken(token) {
  const res = await apiFetch('/organizations/me/pending-org-invites/accept-by-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Could not accept invitation')
  }
  return data
}

export async function updateOrgMember(orgId, userId, payload) {
  const res = await apiFetch(`/organizations/${orgId}/members/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update member')
  }
  return data.member
}

export async function getAlbumJoinRequests(orgId, albumId) {
  const res = await apiFetch(
    `/organizations/${orgId}/albums/${albumId}/join-requests`
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load requests')
  }
  return data.requests || []
}

export async function approveAlbumJoinRequest(orgId, albumId, requestId) {
  const res = await apiFetch(
    `/organizations/${orgId}/albums/${albumId}/join-requests/${requestId}/approve`,
    { method: 'POST' }
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to approve')
  }
  return data
}

export async function rejectAlbumJoinRequest(orgId, albumId, requestId) {
  const res = await apiFetch(
    `/organizations/${orgId}/albums/${albumId}/join-requests/${requestId}/reject`,
    { method: 'POST' }
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to reject')
  }
  return data
}

export async function patchAlbumMember(orgId, albumId, userId, payload) {
  const res = await apiFetch(
    `/organizations/${orgId}/albums/${albumId}/members/${userId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update album member')
  }
  return data.member
}

export async function removeAlbumMember(orgId, albumId, userId) {
  const res = await apiFetch(
    `/organizations/${orgId}/albums/${albumId}/members/${userId}`,
    { method: 'DELETE' }
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to remove from album')
  }
  return data
}

export async function getAlbumInviteCandidates(orgId, albumId) {
  const res = await apiFetch(
    `/organizations/${orgId}/albums/${albumId}/invite-candidates`
  )
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load invite list')
  }
  return data.members || []
}

export async function getAlbumMembers(orgId, albumId) {
  const res = await apiFetch(`/organizations/${orgId}/albums/${albumId}/members`)
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load album members')
  }
  return data.members || []
}

export async function addAlbumMembers(orgId, albumId, userIds) {
  const res = await apiFetch(`/organizations/${orgId}/albums/${albumId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userIds }),
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to add members')
  }
  return data
}
