import { useDispatch, useSelector } from 'react-redux'
import { logout, resetExpiry } from '../store/slices/authSlice'
import { TOKEN_KEY, validateJWT } from '../store/slices/authSlice'
import { Flex, Text } from '@mantine/core'
import { IoHome } from 'react-icons/io5'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function DashboardPage() {
  const dispatch = useDispatch()
  const { email } = useSelector((state) => state.auth)
  const [timeRemaining, setTimeRemaining] = useState(null)

  //  Reset expiry when user navigates to dashboard (requirement #2)
  useEffect(() => {
    dispatch(resetExpiry())
    console.log(' Dashboard mounted — expiry reset')
  }, [dispatch])

  // Calculate remaining time by reading exp directly from JWT inside gallery_token
  useEffect(() => {
    const updateTimer = () => {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        setTimeRemaining(null)
        return
      }

      const validation = validateJWT(token)
      if (!validation.valid) {
        setTimeRemaining(null)
        return
      }

      // Parse exp from JWT payload (exp is in seconds)
      const parts = token.split('.')
      let base64Payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      while (base64Payload.length % 4) base64Payload += '='
      const payload = JSON.parse(atob(base64Payload))

      const now = Date.now()
      const expiry = payload.exp * 1000 // convert seconds → ms
      const remaining = expiry - now

      if (remaining <= 0) {
        setTimeRemaining('Expired')
      } else {
        const seconds = Math.floor(remaining / 1000)
        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60
        setTimeRemaining(`${minutes}:${secs.toString().padStart(2, '0')}`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div className='dashboard-page'>
      <h2>Dashboard</h2>

      {/* Display user email */}
      <div style={{
        background: '#f0f0f0',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1rem',
        border: '2px solid #4CAF50'
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          <strong>Logged in as:</strong>
        </p>
        <p style={{ margin: '0.5rem 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>
          📧 {email || 'No email found'}
        </p>
      </div>

      {/* Token expiry timer — reads from gallery_token JWT */}
      {timeRemaining && (
        <div style={{
          background: timeRemaining === 'Expired' ? '#ffebee' : '#e3f2fd',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: timeRemaining === 'Expired' ? '2px solid #f44336' : '2px solid #2196F3'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            <strong>Token expires in:</strong>
          </p>
          <p style={{
            margin: '0.5rem 0 0 0',
            fontSize: '24px',
            fontWeight: 'bold',
            color: timeRemaining === 'Expired' ? '#f44336' : '#2196F3'
          }}>
            ⏱ {timeRemaining}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '12px', color: '#666' }}>
            (resets on activity — idles out after 2 minutes)
          </p>
        </div>
      )}

      <p>You are signed in. This is your protected dashboard.</p>

      {/* Logout button */}
      <button
        type='button'
        onClick={handleLogout}
        className='dashboard-logout'
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '16px',
          cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
         Sign out
      </button>

      <Link to={'/'}>
        <Flex
          align={'center'}
          px={8}
          py={6}
          bg={'#00000070'}
          gap={4}
          maw={'fit-content'}
          bdrs={6}
          mt={12}
          style={{ cursor: 'pointer' }}
        >
          <IoHome style={{ color: 'white' }} />
          <Text c='white'>Home</Text>
        </Flex>
      </Link>

      {/* Developer info */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#f5f5f5',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#666'
      }}>
        <p><strong>JWT Auth Info:</strong></p>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>Token stored in localStorage as <code>gallery_token</code></li>
          <li>Expiry stored inside <code>gallery_token</code> JWT (no separate key)</li>
          <li>Auto-logout after 2 minutes of inactivity</li>
          <li>Expiry resets on mouse/click/scroll/keypress activity</li>
          <li>Expiry resets when navigating to dashboard</li>
          <li>Cross-tab logout sync enabled</li>
        </ul>
        <p style={{ marginTop: '0.5rem', fontSize: '11px', fontStyle: 'italic' }}>
           Tip: Stay active on the page and the timer keeps resetting. Go idle for 2 mins and you'll be logged out!
        </p>
      </div>
    </div>
  )
}

export default DashboardPage