import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import './Layout.css'
import './LandingLayout.css'

function LandingLayout() {
  return (
    <div className="landing-layout">
      <Header />
      <main className="landing-layout-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default LandingLayout
