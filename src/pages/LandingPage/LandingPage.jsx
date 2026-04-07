import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LandingHero from './components/LandingHero'
import FeatureStrip from './components/FeatureStrip'
import HowItWorksSection from './components/HowItWorksSection'
import CalloutSection from './components/CalloutSection'
import FinalCtaSection from './components/FinalCtaSection'
import LandingFooter from './components/LandingFooter'
import './LandingPage.css'

export default function LandingPage() {
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)

  useEffect(() => {
    document.body.classList.add('lp-active')
    return () => document.body.classList.remove('lp-active')
  }, [])

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="lp">
      <LandingHero />
      <FeatureStrip />
      <HowItWorksSection />
      <CalloutSection />
      <FinalCtaSection />
      <LandingFooter />
    </div>
  )
}
