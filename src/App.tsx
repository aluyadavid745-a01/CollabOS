import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Lenis from 'lenis'
import Navbar from './components/Navbar/Navbar'
import Hero from './components/Hero/Hero'
import Logos from './components/Logos/Logos'
import Features from './components/Features/Features'
import Dashboard from './components/Dashboard/Dashboard'
import AI from './components/AI/AI'
import Collaboration from './components/Collaboration/Collaboration'
import Stats from './components/Stats/Stats'
import Testimonials from './components/Testimonials/Testimonials'
import Pricing from './components/Pricing/Pricing'
import FAQ from './components/FAQ/FAQ'
import CTA from './components/CTA/CTA'
import Footer from './components/Footer/Footer'

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  return (
    <Router>
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <Logos />
                <Features />
                <Dashboard />
                <AI />
                <Collaboration />
                <Stats />
                <Testimonials />
                <Pricing />
                <FAQ />
                <CTA />
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
