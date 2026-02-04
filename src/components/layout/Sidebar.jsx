import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'

function Sidebar() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)

  return (
    <aside className="layout-sidebar">
      <nav className="sidebar-nav">
        <NavLink to="/" end>
          Home
        </NavLink>
        {isAuthenticated ? (
          <NavLink to="/dashboard">Dashboard</NavLink>
        ) : (
          <NavLink to="/login">Sign in</NavLink>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar
