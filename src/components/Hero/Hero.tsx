import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../Common/Button'
import type { AuthMode, AuthUser } from '../../pages/AuthPage'
import { prefetchRoute } from '../../utils/prefetch'

interface HeroProps {
  rememberedUser?: AuthUser | null
  onNavigate: (view: AuthMode | 'home') => void
}

const Hero: React.FC<HeroProps> = ({ rememberedUser, onNavigate }) => {
  const navigate = useNavigate()
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!heroRef.current) return

    const ctx = gsap.context(() => {
      // Title animation
      gsap.from(titleRef.current, {
        duration: 0.8,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
      })

      // Description animation
      gsap.from(descRef.current, {
        duration: 0.8,
        y: 30,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.2,
      })

      // CTA animation
      gsap.from(ctaRef.current, {
        duration: 0.8,
        y: 30,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.4,
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const features = [
    'Real-time Collaboration',
    'AI-Powered Insights',
    'Enterprise Security',
  ]

  return (
    <section
      ref={heroRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 pt-20"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-slate-200" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm mb-8"
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-sm font-semibold">
              Welcome to the Future of Work
            </span>
          </motion.div>

          {/* Main Heading */}
          <h1
            ref={titleRef}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            The Operating System for
            <span className="block text-slate-700">
              Modern Teams
            </span>
          </h1>

          {/* Description */}
          <p
            ref={descRef}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Unified messaging, task management, documents, and video—all in one beautiful
            workspace. Empower your team to collaborate smarter, not harder.
          </p>

          {/* CTA Buttons */}
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              variant="primary"
              size="lg"
              className="group"
              onMouseEnter={() => prefetchRoute(rememberedUser ? 'homeDashboard' : 'auth')}
              onFocus={() => prefetchRoute(rememberedUser ? 'homeDashboard' : 'auth')}
              onClick={() => {
                if (rememberedUser) {
                  navigate('/home')
                  return
                }

                onNavigate('signup')
              }}
            >
              {rememberedUser ? 'Open Workspace' : 'Start Free Trial'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="secondary" size="lg" className="group">
              <PlayCircle className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {features.map((feature, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-950"
              >
                ✓ {feature}
              </span>
            ))}
          </motion.div>

          {/* Hero Image/Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="relative"
          >
            {/* Mock Dashboard */}
            <div className="relative glass-effect rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
              <div className="aspect-video bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center mx-auto mb-4">
                    <PlayCircle className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-slate-500 text-sm">Dashboard Preview</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Hero
