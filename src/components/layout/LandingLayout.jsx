import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import './Layout.css'
import './LandingLayout.css'

function LandingLayout() {
  const { pathname } = useLocation()
  const isLandingIndex = pathname === '/'

  return (
    <div className={`landing-layout ${isLandingIndex ? 'landing-layout--dark' : ''}`}>
      <div style={{ height: '80px', minHeight: '80px', width: '100%', position: 'sticky', top: 0, zIndex: 100 }}>
        <Header />
      </div>
      <main
        className={`landing-layout-content ${isLandingIndex ? 'landing-layout-content--full' : ''}`}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default LandingLayout
