import { Outlet } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { resetExpiry, checkTokenExpiry } from '../../store/slices/authSlice'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'
import './Layout.css'


const ACTIVITY_THROTTLE_MS = 30 * 1000 // 30 seconds

// How often (ms) to check if the token has expired
const EXPIRY_CHECK_INTERVAL_MS = 15 * 1000 // 15 seconds

function Layout() {
  const dispatch = useDispatch()
  const lastActivityRef = useRef(0)// 0 maen no activity yet

  //Activity listeners — reset expiry on user interaction (throttled)
  useEffect(() => {
    const handleActivity = () => {
      const now = Date.now()
      if (now - lastActivityRef.current >= ACTIVITY_THROTTLE_MS) {
        lastActivityRef.current = now
        dispatch(resetExpiry())
      }
    }

    // mouseover included so hovering over buttons/elements resets expiry
    const activityEvents = [
      'mousemove',
      'mouseover', // hover on any element
      'mousedown',
      'click',
      'keydown', 
      'scroll',
      'touchstart'  //toech start mean user using phone
    ]

    activityEvents.forEach(event =>
      window.addEventListener(event, handleActivity, { passive: true })
    )

    return () => {
      activityEvents.forEach(event =>
        window.removeEventListener(event, handleActivity, { passive: true })
      )
    }
  }, [dispatch])

  // Expiry polling — checks every 15 seconds and auto-logouts if token expired
  useEffect(() => {
    // Check immediately in case user was already expired before visiting dashboard
    dispatch(checkTokenExpiry())

    const interval = setInterval(() => {
      dispatch(checkTokenExpiry())
    }, EXPIRY_CHECK_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [dispatch])

  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <Header />
        <main className="layout-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default Layout