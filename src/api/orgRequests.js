import { apiFetch, parseJsonResponse } from './client'

export async function createOrgCreationRequest(proposedOrgName) {
  const res = await apiFetch('/org-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ proposedOrgName }),
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Request failed')
  }
  return data.request
}

export async function listPendingOrgRequests() {
  const res = await apiFetch('/org-requests/pending')
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Failed to load requests')
  }
  return data.requests || []
}

export async function reviewOrgRequest(requestId, action) {
  const res = await apiFetch(`/org-requests/${requestId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action }),
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Review failed')
  }
  return data.request
}
