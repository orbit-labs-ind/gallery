import { useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'

function DashboardPage() {
  const dispatch = useDispatch()

  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>
      <p>You are signed in. This is your protected dashboard.</p>
      <button type="button" onClick={() => dispatch(logout())} className="dashboard-logout">
        Sign out
      </button>
    </div>
  )
}

export default DashboardPage
