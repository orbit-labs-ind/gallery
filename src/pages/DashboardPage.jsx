
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { Button, Flex, Text } from '@mantine/core'
import { IoHome } from 'react-icons/io5'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { LAST_ACTIVITY_KEY, INACTIVITY_MS } from '../store/slices/authSlice'

function formatTimeLeft(ms) {
  if (ms <= 0) return 'Expired (logout soon)'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
  if (minutes > 0) return `${minutes}m ${secs}s`
  return `${secs}s`
}

function DashboardPage() {
  const dispatch = useDispatch()
  const { email } = useSelector((state) => state.auth)
  const [timeRemaining, setTimeRemaining] = useState(null)

  useEffect(() => {
    const updateTimer = () => {
      const lastStr = localStorage.getItem(LAST_ACTIVITY_KEY)
      if (!lastStr) {
        setTimeRemaining(null)
        return
      }
      const last = parseInt(lastStr, 10)
      const expiryAt = last + INACTIVITY_MS
      const remaining = expiryAt - Date.now()
      setTimeRemaining(formatTimeLeft(remaining))
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

      {/* Inactivity session timer */}
      {timeRemaining && (
        <div style={{
          background: timeRemaining.startsWith('Expired') ? '#ffebee' : '#e3f2fd',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: timeRemaining.startsWith('Expired') ? '2px solid #f44336' : '2px solid #2196F3'
        }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            <strong>Session (1 day inactivity):</strong>
          </p>
          <p style={{
            margin: '0.5rem 0 0 0',
            fontSize: '24px',
            fontWeight: 'bold',
            color: timeRemaining.startsWith('Expired') ? '#f44336' : '#2196F3'
          }}>
            {timeRemaining}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '12px', color: '#666' }}>
            Logs out after 1 day with no activity. Activity (clicks, keys, movement) resets the timer.
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
        🚪 Sign out
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
        <p><strong>Session info</strong></p>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
          <li>Token stored in localStorage; renewed on each API call (sliding 1 day)</li>
          <li>Session ends after 1 day of no activity (clicks, keys, mouse)</li>
          <li>Cross-tab logout sync enabled</li>
        </ul>
      </div>
    </div>
  )
}

export default DashboardPage