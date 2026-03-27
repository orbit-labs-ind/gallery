import { API_BASE, parseJsonResponse } from './client'

export async function sendOtp(email) {
  const res = await fetch(`${API_BASE}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Could not send code')
  }
  return data
}

export async function verifyOtp(email, code) {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
  const data = await parseJsonResponse(res)
  if (!res.ok) {
    throw new Error(data.error || 'Verification failed')
  }
  return data
}
