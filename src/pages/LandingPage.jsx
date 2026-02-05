import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Button, Text } from '@mantine/core'

function LandingPage() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  return (
    <div className="landing-page">
      <p>Browse and manage your gallery. Sign in to access your dashboard.</p>
      {isAuthenticated ? (
        <Link to="/dashboard" className="landing-cta">
          Go to Dashboard
        </Link>
      ) : (
        <Link to="/login" className="landing-cta">
          Sign in
        </Link>
      )}
    </div>
  )
}

export default LandingPage
