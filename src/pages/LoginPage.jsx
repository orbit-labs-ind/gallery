import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { login } from '../store/slices/authSlice'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/dashboard'

  const handleSubmit = (e) => {
    e.preventDefault()
    // No backend: accept any non-empty input for demo
    if (email.trim() && password) {
      dispatch(login())
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="login-page">
      <h2>Sign in</h2>
      <p className="login-hint">No backend — enter any email and password to continue.</p>
      <form onSubmit={handleSubmit} className="login-form">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </label>
        <button type="submit">Sign in</button>
      </form>
    </div>
  )
}

export default LoginPage
