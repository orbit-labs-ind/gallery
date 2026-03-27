import { Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { logout, syncAuthFromStorage, TOKEN_KEY } from '../store/slices/authSlice'

const EXPIRY_CHECK_INTERVAL_MS = 5 * 60 * 1000

function ProtectedRoute({ children }) {
  const { isAuthenticated, isReady } = useSelector((state) => state.auth)
  const location = useLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(syncAuthFromStorage())
  }, [dispatch])

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(syncAuthFromStorage())
    }, EXPIRY_CHECK_INTERVAL_MS)

    const handleStorageChange = (e) => {
      if (e.key === TOKEN_KEY && e.newValue === null) {
        dispatch(logout())
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(interval)
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
