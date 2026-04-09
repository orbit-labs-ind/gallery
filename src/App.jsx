import { Routes, Route, Navigate } from 'react-router-dom'
import LandingLayout from './components/layout/LandingLayout'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import OrganizationsPage from './pages/OrganizationsPage/OrganizationsPage'
import JoinOrgInvitePage from './pages/OrganizationsPage/JoinOrgInvitePage'
import AlbumPhotosPage from './pages/AlbumPhotos/AlbumPhotosPage'
import JoinAlbumPage from './pages/JoinAlbumPage'
import SharedAlbumsPage from './pages/SharedAlbumsPage'
import SettingsLayout from './pages/Settings/SettingsLayout'
import ProfileSettingsPage from './pages/Settings/ProfileSettingsPage'
import MembershipsSettingsPage from './pages/Settings/MembershipsSettingsPage'
import ActivitySettingsPage from './pages/Settings/ActivitySettingsPage'
import DangerSettingsPage from './pages/Settings/DangerSettingsPage'
import PublicProfilePage from './pages/Profile/PublicProfilePage'
import NotificationsPage from './pages/Notifications/NotificationsPage'
import './App.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { Switch, createTheme, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

const theme = createTheme({
  focusRing: 'never',
  colors: {
    galleryAccent2: [
      '#fffef8',
      '#fff8dc',
      '#fff0b8',
      '#ffe894',
      '#ffe070',
      '#ffd84c',
      '#ffd93d',
      '#e6c336',
      '#ccad2e',
      '#a38a25',
    ],
  },
  components: {
    Switch: Switch.extend({
      defaultProps: {
        color: 'galleryAccent2.6',
      },
      styles: {
        track: {
          border: '1px solid color-mix(in srgb, var(--text) 12%, transparent)',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.22)',
        },
        thumb: {
          border: '1px solid color-mix(in srgb, var(--text) 10%, transparent)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
        },
      },
    }),
  },
})

function App() {
  return (
    <MantineProvider theme={theme}>
      <Notifications position="top-center" zIndex={10000} limit={4} />
      <Routes>
        <Route path="/" element={<LandingLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
        </Route>

        <Route element={<Layout />}>
          <Route
            path="organizations"
            element={
              <ProtectedRoute>
                <OrganizationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="shared-albums"
            element={
              <ProtectedRoute>
                <SharedAlbumsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="join/album/:shareToken"
            element={
              <ProtectedRoute>
                <JoinAlbumPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="join/org-invite"
            element={
              <ProtectedRoute>
                <JoinOrgInvitePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="organizations/:orgId/albums/:albumId"
            element={
              <ProtectedRoute>
                <AlbumPhotosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <SettingsLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfileSettingsPage />} />
            <Route path="memberships" element={<MembershipsSettingsPage />} />
            <Route path="activity" element={<ActivitySettingsPage />} />
            <Route path="danger" element={<DangerSettingsPage />} />
          </Route>
          <Route
            path="profile/:userId"
            element={
              <ProtectedRoute>
                <PublicProfilePage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </MantineProvider>
  )
}

export default App
