import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import Hero from '../components/Hero/Hero'
import Features from '../components/Features/Features'
import Dashboard from '../components/Dashboard/Dashboard'
import Pricing from '../components/Pricing/Pricing'
import Testimonials from '../components/Testimonials/Testimonials'
import CTA from '../components/CTA/CTA'
import Footer from '../components/Footer/Footer'
import Navbar from '../components/Navbar/Navbar'
import type { AuthMode, AuthUser } from './AuthPage'

interface LandingPageProps {
  rememberedUser?: AuthUser | null
  onNavigate: (view: AuthMode | 'home') => void
  onLogout: () => void
  onChangePassword: () => void
  onCustomizeProfile: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({
  rememberedUser,
  onNavigate,
  onLogout,
  onChangePassword,
  onCustomizeProfile,
}) => {
  useEffect(() => {
    const previousScrollBehavior = document.documentElement.style.scrollBehavior

    document.documentElement.style.scrollBehavior = 'smooth'

    return () => {
      document.documentElement.style.scrollBehavior = previousScrollBehavior
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-slate-50 text-slate-950"
    >
      {/* Fixed Navbar */}
      <Navbar
        rememberedUser={rememberedUser}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onChangePassword={onChangePassword}
        onCustomizeProfile={onCustomizeProfile}
      />

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <Hero rememberedUser={rememberedUser} onNavigate={onNavigate} />

        {/* Features Section */}
        <Features />

        {/* Dashboard Section */}
        <Dashboard />

        {/* Pricing Section */}
        <Pricing rememberedUser={rememberedUser} />

        {/* Testimonials Section */}
        <Testimonials />

        {/* CTA Section */}
        <CTA rememberedUser={rememberedUser} onNavigate={onNavigate} />
      </main>

      {/* Footer */}
      <Footer />
    </motion.div>
  )
}

export default LandingPage
