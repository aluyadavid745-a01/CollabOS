import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { Button } from '../Common/Button'

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!heroRef.current) return

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
  }, [])

  const features = [
    'Real-time Collaboration',
    'AI-Powered Insights',
    'Enterprise Security',
  ]

  return (
    <section
      ref={heroRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20"
    >
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-indigo-600/30 to-transparent rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-l from-cyan-600/30 to-transparent rounded-full blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-b from-indigo-600/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/50 bg-indigo-500/10 backdrop-blur-sm mb-8"
          >
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Welcome to the Future of Work
            </span>
          </motion.div>

          {/* Main Heading */}
          <h1
            ref={titleRef}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            The Operating System for
            <span className="block bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent animate-gradient">
              Modern Teams
            </span>
          </h1>

          {/* Description */}
          <p
            ref={descRef}
            className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Unified messaging, task management, documents, and video—all in one beautiful
            workspace. Empower your team to collaborate smarter, not harder.
          </p>

          {/* CTA Buttons */}
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button variant="primary" size="lg" className="group">
              Start Free Trial
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
                className="px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-slate-300 hover:border-indigo-500/50 transition-colors"
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
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-cyan-600/30 rounded-2xl blur-3xl" />

            {/* Mock Dashboard */}
            <div className="relative glass-effect backdrop-blur-xl rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-white/5 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center mx-auto mb-4">
                    <PlayCircle className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-slate-400 text-sm">Dashboard Preview</p>
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
