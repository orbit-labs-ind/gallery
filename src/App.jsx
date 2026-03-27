import { Routes, Route } from 'react-router-dom'
import LandingLayout from './components/layout/LandingLayout'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LandingPage from './pages/LandingPage/LandingPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import OrganizationsPage from './pages/OrganizationsPage/OrganizationsPage'
import ImgPage from './pages/imgPage'
import './App.css'
import '@mantine/core/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';

const theme = createTheme({
  focusRing: 'never',
});

function App() {
  return (
    <MantineProvider theme={theme}>
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
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
 
          {/* adding imgPage.jsx file router */}
          
          <Route
            path={"images/"}
            element={
              <ProtectedRoute>
                <ImgPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </MantineProvider>
  )
}

export default App
