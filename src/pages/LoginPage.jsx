
import { useState } from 'react'
import { useNavigate } from 'react-router-dom' 
import { useDispatch } from 'react-redux' 
import { login } from '../store/slices/authSlice'
import './SignupPage.css'

function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignIn, setIsSignIn] = useState(true)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault() 

    if (!email.trim()) { 
      alert('Please enter email')
      return
    }

    if (!password.trim()) {
      alert('Please enter password')
      return
    }

    // ✅ Pass email to login action to create JWT token
    dispatch(login({ email: email.trim() }))
    navigate('/dashboard', { replace: true })
  }

  const handleSocialLogin = (provider) => {
    console.log('Login with:', provider)
    
    // For social login, use a demo email (in production, you'd get this from OAuth)
    const demoEmail = `${provider}user@example.com`
    dispatch(login({ email: demoEmail }))
    navigate('/dashboard', { replace: true })
  }

  const toggleSignIn = () => {
    setIsSignIn(!isSignIn)
  }

  const toggleSignUp = () => {
    setIsSignIn(!isSignIn)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="signup-container">
      <div className="signup-left">
        <div className="signup-content">

          <div className="logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M10 5L30 15L25 25L10 30L5 15L10 5Z" fill="#000000" />
            </svg>
            <span className="logo-text">Gallery</span>
          </div>

          <div className="welcome-section">
            <h1>Welcome Back</h1>
            <p className="subtitle">Welcome Back, Please enter Your details</p>
          </div>

          <div className="tab-buttons">
            <button
              className={isSignIn ? 'tab-button active' : 'tab-button'}
              onClick={toggleSignIn}
            >
              Sign In
            </button>
            <button
              className={!isSignIn ? 'tab-button active' : 'tab-button'}
              onClick={toggleSignUp}
            >
              Signup
            </button>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 4H17C17.55 4 18 4.45 18 5V15C18 15.55 17.55 16 17 16H3C2.45 16 2 15.55 2 15V5C2 4.45 2.45 4 3 4Z" stroke="#666" strokeWidth="1.5" />
                    <path d="M2 5L10 11L18 5" stroke="#666" strokeWidth="1.5" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ialirezamp@gmail.com"
                  required
                  autoComplete="email"
                />
                {email.trim() && (
                  <span className="check-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" fill="#10B981" />
                      <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                )}
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15 8V6C15 3.79 13.21 2 11 2H9C6.79 2 5 3.79 5 6V8C3.9 8 3 8.9 3 10V16C3 17.1 3.9 18 5 18H15C16.1 18 17 17.1 17 16V10C17 8.9 16.1 8 15 8ZM7 6C7 4.9 7.9 4 9 4H11C12.1 4 13 4.9 13 6V8H7V6Z" stroke="#666" strokeWidth="1.5" />
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M2 2L18 18M9.58 9.58C9.21 9.95 9 10.45 9 11C9 12.1 9.9 13 11 13C11.55 13 12.05 12.79 12.42 12.42M15 11C15 13.76 12.76 16 10 16C7.24 16 5 13.76 5 11C5 8.24 7.24 6 10 6C12.76 6 15 8.24 15 11Z" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 7C8.34 7 7 8.34 7 10C7 11.66 8.34 13 10 13C11.66 13 13 11.66 13 10C13 8.34 11.66 7 10 7ZM10 4C14 4 17.27 6.61 18 10C17.27 13.39 14 16 10 16C6 16 2.73 13.39 2 10C2.73 6.61 6 4 10 4Z" stroke="#666" strokeWidth="1.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="continue-button">
              Continue
            </button>
          </form>

          <div className="divider">
            <span>Or Continue With</span>
          </div>

          <div className="social-buttons">
            <button
              type="button"
              className="social-button"
              onClick={() => handleSocialLogin('google')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            </button>

            <button
              type="button"
              className="social-button"
              onClick={() => handleSocialLogin('apple')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </button>

            <button
              type="button"
              className="social-button facebook"
              onClick={() => handleSocialLogin('facebook')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>
          </div>

          <p className="footer-text">
            Join the millions of smart inv  stors who trust us to manage their finances. Log in
            to access your personalized dashboard, track your portfolio performance, and
            make informed investment decisions.
          </p>
        </div>
      </div>

      <div className="signup-right">
        <img src="/image.png" alt="sampla image" className="right-side-image" />
      </div>
    </div>
  )
}

export default SignupPage