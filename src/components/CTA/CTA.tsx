import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Zap } from 'lucide-react'
import { Button } from '../Common/Button'
import type { AuthMode, AuthUser } from '../../pages/AuthPage'
import { prefetchRoute } from '../../utils/prefetch'
import { trackAnalyticsEvent } from '../../services/analytics'

gsap.registerPlugin(ScrollTrigger)

interface CTAProps {
  rememberedUser?: AuthUser | null
  onNavigate: (view: AuthMode | 'home') => void
}

const CTA: React.FC<CTAProps> = ({ rememberedUser, onNavigate }) => {
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          immediateRender: false,
        }
      )

      gsap.fromTo(
        descRef.current,
        { y: 20, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.2,
          immediateRender: false,
        }
      )

      gsap.fromTo(
        ctaRef.current,
        { y: 20, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 0.4,
          immediateRender: false,
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-32 lg:py-40 px-4 md:px-8 lg:px-16 relative overflow-hidden"
      id="cta"
    >
      <div className="absolute inset-0 bg-white" />

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-slate-700 shadow-sm mb-6"
        >
          <Zap className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-semibold">
            Ready to try CollabOS?
          </span>
        </motion.div>

        {/* Main Headline */}
        <h2
          ref={titleRef}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-950 mb-6 leading-tight"
        >
          Start with one workspace
          <span className="block text-slate-700">
            and bring the work together
          </span>
        </h2>

        {/* Description */}
        <p
          ref={descRef}
          className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto"
        >
          Create a workspace, invite your team, create a project, assign a task, and see the value in minutes.
        </p>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
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

              trackAnalyticsEvent('signup_started', { source: 'cta' })
              onNavigate('signup')
            }}
          >
            {rememberedUser ? 'Open Workspace' : 'Get Started Free'}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              trackAnalyticsEvent('demo_requested', { source: 'cta' })
              window.location.href = 'mailto:sales@collabos.dev?subject=CollabOS%20demo%20request'
            }}
          >
            Schedule a Demo
          </Button>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex flex-col sm:flex-row justify-center items-center gap-8 text-sm text-slate-500"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure authentication foundations</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Privacy and terms routes ready</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Real metrics only</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default CTA
