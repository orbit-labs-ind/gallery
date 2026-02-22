import { useEffect } from 'react'
import LandingHero from './components/LandingHero'
import FeatureStrip from './components/FeatureStrip'
import HowItWorksSection from './components/HowItWorksSection'
import CalloutSection from './components/CalloutSection'
import FinalCtaSection from './components/FinalCtaSection'
import LandingFooter from './components/LandingFooter'
import './LandingPage.css'

export default function LandingPage() {
  useEffect(() => {
    document.body.classList.add('lp-active')
    return () => document.body.classList.remove('lp-active')
  }, [])

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
