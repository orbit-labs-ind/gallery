import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { syncAuthFromStorage, isDevForceAuthEnabled, TOKEN_KEY } from '../../store/slices/authSlice'
import { setProfile } from '../../store/slices/currentUserSlice'
import { store } from '../../store/store'
import { fetchCurrentUser } from '../../api/session'
import Header from './Header'
import Footer from './Footer'
import './Layout.css'
import { hideHeaderFooterRoutes } from '../../common/utils'
import { AlbumLibraryProvider } from '../../context/AlbumLibraryContext'
import { useNotificationSocket, GALLERY_NOTIFY_EVENT } from '../../hooks/useNotificationSocket'
import { registerWebPushIfPossible } from '../../lib/registerWebPush'
import { presentIncomingNotification } from '../../utils/inAppNotificationAlert'

function Layout() {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
  const location = useLocation()

  useNotificationSocket(isAuthenticated && !isDevForceAuthEnabled())

  useEffect(() => {
    if (!isAuthenticated || isDevForceAuthEnabled()) return undefined
    const onBell = (e) => {
      const n = e.detail
      if (!n) return
      presentIncomingNotification({
        id: n.id,
        title: n.title,
        body: n.body,
      })
    }
    window.addEventListener(GALLERY_NOTIFY_EVENT, onBell)
    return () => window.removeEventListener(GALLERY_NOTIFY_EVENT, onBell)
  }, [isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || isDevForceAuthEnabled()) return
    fetchCurrentUser()
      .then((d) => {
        if (d?.user) dispatch(setProfile(d.user))
        registerWebPushIfPossible().catch(() => {})
      })
      .catch(() => {
        /* 401 → logout via apiFetch; ignore network */
      })
  }, [isAuthenticated, dispatch])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      dispatch(syncAuthFromStorage())
      const { auth } = store.getState()
      if (!auth.isAuthenticated || isDevForceAuthEnabled()) return
      if (!localStorage.getItem(TOKEN_KEY)) return
      fetchCurrentUser()
        .then((d) => {
          if (d?.user) dispatch(setProfile(d.user))
        })
        .catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [dispatch])

  const hideChrome = hideHeaderFooterRoutes.some((pattern) =>
    pattern.test(window.location.pathname)
  )

  const hideFooter =
    /^\/organizations\/?$/.test(location.pathname) ||
    /^\/dashboard\/?$/.test(location.pathname) ||
    /^\/settings(\/.*)?$/.test(location.pathname) ||
    /^\/profile\/[^/]+\/?$/.test(location.pathname) ||
    /^\/organizations\/[^/]+\/albums\/[^/]+\/?$/.test(location.pathname)

  return (
    <div className="layout">
      <AlbumLibraryProvider>
        <div className="layout-main">
          {!hideChrome ? (
            <div style={{ height: '70px', minHeight: '70px', width: '100%' }}>
              <Header />
            </div>
          ) : null}
          <main className="layout-content">
            <Outlet />
          </main>
          {!hideChrome && !hideFooter ? <Footer /> : null}
        </div>
      </AlbumLibraryProvider>
    </div>
  )
}

export default Layout
