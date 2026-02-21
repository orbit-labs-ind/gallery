import { Navigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { logout, checkTokenExpiry, TOKEN_KEY } from '../store/slices/authSlice'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isReady } = useSelector((state) => state.auth)
  const location = useLocation()
  const dispatch = useDispatch()

  useEffect(() => {
    // Event Lister : Check token expiry every 10 seconds
    const expiryCheckInterval = setInterval(() => {
      dispatch(checkTokenExpiry())
    }, 10000)

    //localStorage changes 
    const handleStorageChange = (e) => {
      if (e.key === TOKEN_KEY && e.newValue === null) {
        console.log('Token removed in another tab - logging out')
        dispatch(logout())
      }
    }

    // EVENT LISTENER 3: Cleanup before page unload (optional)
    const handleBeforeUnload = () => {
      console.log('Page closing - token still in localStorage')
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    console.log(' Event listeners attached:')
    console.log('  - Token expiry checker (every 10s)')
    console.log('  - Storage event (cross-tab sync)')
    console.log('  - Before unload event')

    return () => {
      clearInterval(expiryCheckInterval)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      console.log('🧹 Event listeners cleaned up')
    }
  }, [dispatch])

  useEffect(() => {
    dispatch(checkTokenExpiry())
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