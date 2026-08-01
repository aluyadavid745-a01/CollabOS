import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '../Common/Button'
import { useGSAP } from '../../hooks/useAnimations'

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const blobRef = useRef<HTMLDivElement>(null)
  const floatingCardsRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    // Animated gradient blob
    gsap.to(blobRef.current, {
      duration: 8,
      rotate: 360,
      repeat: -1,
      ease: 'none',
    })

    // Title animation
    gsap.from(titleRef.current, {
      duration: 1.2,
      y: 50,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.2,
    })

    // Subtitle animation
    gsap.from(subtitleRef.current, {
      duration: 1,
      y: 30,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.4,
    })

    // CTA animation
    gsap.from(ctaRef.current, {
      duration: 1,
      y: 30,
      opacity: 0,
      ease: 'power3.out',
      delay: 0.6,
    })

    // Floating cards animation
    gsap.from('.floating-card', {
      duration: 1.2,
      scale: 0,
      opacity: 0,
      ease: 'back.out(1.7)',
      stagger: 0.1,
      delay: 0.8,
    })

    // Parallax effect on scroll
    gsap.to(containerRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
      y: -50,
      opacity: 0.8,
    })
  }, [containerRef])

  const floatingElements = [
    {
      id: 1,
      label: 'Team Chat',
      icon: '💬',
      delay: 0,
      position: 'top-20 left-10 md:top-32 md:left-20',
    },
    {
      id: 2,
      label: '24 Tasks',
      icon: '✓',
      delay: 0.1,
      position: 'top-40 right-5 md:top-40 md:right-20',
    },
    {
      id: 3,
      label: '68% Progress',
      icon: '📊',
      delay: 0.2,
      position: 'bottom-40 left-5 md:bottom-40 md:left-10',
    },
    {
      id: 4,
      label: '92% Done',
      icon: '🎯',
      delay: 0.3,
      position: 'bottom-20 right-10 md:bottom-32 md:right-20',
    },
  ]

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen pt-32 pb-20 overflow-hidden flex items-center justify-center"
      id="hero"
    >
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          ref={blobRef}
          className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-primary-600/30 to-indigo-600/30 rounded-full blur-3xl"
        />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-r from-cyan-600/20 to-emerald-600/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-indigo-600/20 to-cyan-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(79, 70, 229, 0.05) 25%, rgba(79, 70, 229, 0.05) 26%, transparent 27%, transparent 74%, rgba(79, 70, 229, 0.05) 75%, rgba(79, 70, 229, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(79, 70, 229, 0.05) 25%, rgba(79, 70, 229, 0.05) 26%, transparent 27%, transparent 74%, rgba(79, 70, 229, 0.05) 75%, rgba(79, 70, 229, 0.05) 76%, transparent 77%, transparent)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 w-full relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/50 bg-indigo-500/10 backdrop-blur-sm"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              AI-Powered Collaboration
            </span>
          </motion.div>

          {/* Main Headline */}
          <h1
            ref={titleRef}
            className="text-hero gradient-text mb-6 leading-tight"
          >
            The Operating System for Modern Teams
          </h1>

          {/* Subheading */}
          <p
            ref={subtitleRef}
            className="text-body max-w-2xl mx-auto mb-12 text-slate-300"
          >
            Everything your team needs—chat, projects, documents, meetings, AI, and more—in one
            intelligent workspace. Trusted by 100K+ teams worldwide.
          </p>

          {/* CTA Buttons */}
          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button variant="primary" size="lg" className="group">
              Start Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="secondary" size="lg" className="group">
              <Play className="w-5 h-5 mr-2" />
              Book Demo
            </Button>
          </div>

          {/* Trusted by section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col items-center gap-4 mb-16"
          >
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-indigo-600 border-2 border-white/20 flex items-center justify-center text-sm font-bold text-white"
                >
                  {i}
                </div>
              ))}
              <span className="text-sm font-semibold text-slate-300 ml-2">+4K</span>
            </div>
            <p className="text-sm text-slate-400">
              Trusted by 100,000+ teams worldwide
            </p>
          </motion.div>
        </div>
      </div>

      {/* Floating Cards */}
      <div ref={floatingCardsRef} className="absolute inset-0 w-full h-full pointer-events-none">
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className={`floating-card absolute ${element.position} glass-effect backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-glow`}
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{
              duration: 6,
              delay: element.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            whileHover={{ scale: 1.1 }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{element.icon}</span>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <p className="text-sm font-semibold text-white">{element.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-slate-400 font-semibold">SCROLL TO EXPLORE</p>
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
