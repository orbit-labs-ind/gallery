import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

function LandingPage() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  return (
    <div className="landing-page">
      <h2>Welcome to Gallery</h2>
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
