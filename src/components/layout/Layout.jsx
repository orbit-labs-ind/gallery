import { Outlet } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { resetExpiry, checkTokenExpiry } from '../../store/slices/authSlice'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'
import './Layout.css'
import { useMediaQuery } from '@mantine/hooks'

const ACTIVITY_THROTTLE_MS = 30 * 1000
const EXPIRY_CHECK_INTERVAL_MS = 15 * 1000

function Layout() {
  const dispatch = useDispatch()
  const lastActivityRef = useRef(0)
  const isMobile = useMediaQuery('(max-width: 768px)') 

  useEffect(() => {
    const handleActivity = () => {
      const now = Date.now()
      if (now - lastActivityRef.current >= ACTIVITY_THROTTLE_MS) {
        lastActivityRef.current = now
        dispatch(resetExpiry())
      }
    }

    const activityEvents = [
      'mousemove',
      'mouseover',
      'mousedown',
      'click',
      'keydown',
      'scroll',
      'touchstart'
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

  useEffect(() => {
    dispatch(checkTokenExpiry())

    const interval = setInterval(() => {
      dispatch(checkTokenExpiry())
    }, EXPIRY_CHECK_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [dispatch])

  return (
    <div className="layout">
      {!isMobile && <Sidebar />}

      <div className="layout-main">
        <div style={{ height: '80px', minHeight: '80px', width: '100%' }}>
          <Header />
        </div>

        <main className="layout-content">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  )
}

export default Layout