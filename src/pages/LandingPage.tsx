import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Hero from '../components/Hero/Hero'
import Features from '../components/Features/Features'
import Dashboard from '../components/Dashboard/Dashboard'
import Pricing from '../components/Pricing/Pricing'
import Testimonials from '../components/Testimonials/Testimonials'
import CTA from '../components/CTA/CTA'
import Footer from '../components/Footer/Footer'
import Navbar from '../components/Navbar/Navbar'

gsap.registerPlugin(ScrollTrigger)

const LandingPage: React.FC = () => {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth'

    // Initialize ScrollTrigger
    ScrollTrigger.refresh()

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white"
    >
      {/* Fixed Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <Hero />

        {/* Features Section */}
        <Features />

        {/* Dashboard Section */}
        <Dashboard />

        {/* Pricing Section */}
        <Pricing />

        {/* Testimonials Section */}
        <Testimonials />

        {/* CTA Section */}
        <CTA />
      </main>

      {/* Footer */}
      <Footer />
    </motion.div>
  )
}

export default LandingPage
