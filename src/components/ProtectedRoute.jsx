import { Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect, useRef } from 'react'
import { logout, checkInactivity, updateLastActivity } from '../store/slices/authSlice'
import { TOKEN_KEY } from '../store/slices/authSlice'

const ACTIVITY_THROTTLE_MS = 60 * 1000 // update lastActivity at most every 1 min

function ProtectedRoute({ children }) {
  const { isAuthenticated, isReady } = useSelector((state) => state.auth)
  const location = useLocation()
  const dispatch = useDispatch()
  const lastActivityUpdate = useRef(0)

  useEffect(() => {
    dispatch(checkInactivity())
  }, [dispatch])

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(checkInactivity())
    }, 60 * 1000) // check inactivity every 1 min

    const handleActivity = () => {
      const now = Date.now()
      if (now - lastActivityUpdate.current >= ACTIVITY_THROTTLE_MS) {
        lastActivityUpdate.current = now
        dispatch(updateLastActivity())
      }
    }

    window.addEventListener('click', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('mousemove', handleActivity)

    const handleStorageChange = (e) => {
      if (e.key === TOKEN_KEY && e.newValue === null) {
        dispatch(logout())
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [dispatch])

  if (!isReady) {
    return (
      <div className="protected-route-loading" style={{ padding: '2rem', textAlign: 'center' }}>
        Loading…
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
