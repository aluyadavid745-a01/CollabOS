import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ArrowRight, CalendarClock, CheckCircle2, Folder, MessageSquare, PlayCircle, Users, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../Common/Button'
import type { AuthMode, AuthUser } from '../../pages/AuthPage'
import { prefetchRoute } from '../../utils/prefetch'
import { trackAnalyticsEvent } from '../../services/analytics'

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

  const features = ['Projects', 'Tasks', 'Messages', 'Files', 'Meetings', 'AI']
  const workspaceNav: Array<{ label: string; icon: LucideIcon }> = [
    { label: 'Home', icon: CheckCircle2 },
    { label: 'My Tasks', icon: CheckCircle2 },
    { label: 'Projects', icon: Folder },
    { label: 'Messages', icon: MessageSquare },
    { label: 'Team', icon: Users },
  ]

  return (
    <section
      ref={heroRef}
      className="flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 pb-12 pt-24"
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
              The operating system for modern teams
            </span>
          </motion.div>

          {/* Main Heading */}
          <h1
            ref={titleRef}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            The operating system for modern teams.
          </h1>

          {/* Description */}
          <p
            ref={descRef}
            className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Projects, tasks, communication, files, meetings, and AI — all connected in one simple workspace.
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

                trackAnalyticsEvent('signup_started', { source: 'hero' })
                onNavigate('signup')
              }}
            >
              {rememberedUser ? 'Open Workspace' : 'Get Started Free'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="group"
              onClick={() => {
                trackAnalyticsEvent('demo_requested', { source: 'hero' })
                document.getElementById('product-demo')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
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
            <div id="product-demo" className="relative rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xl shadow-slate-200/70 md:p-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img src="/lll.png" alt="" className="h-7 w-7 rounded-md object-cover" />
                    <span className="font-black">CollabOS Workspace</span>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Live product flow</span>
                </div>
                <div className="grid gap-4 p-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <aside className="hidden rounded-lg border border-slate-200 bg-white p-3 md:block">
                    {workspaceNav.map(({ label, icon: Icon }) => {
                      return (
                        <div key={label} className={`mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${label === 'Home' ? 'bg-slate-950 text-white' : 'text-slate-600'}`}>
                          <Icon className="h-4 w-4" />
                          {label}
                        </div>
                      )
                    })}
                  </aside>
                  <div className="grid gap-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">Today</p>
                      <h3 className="mt-1 text-xl font-black">Launch workspace checklist</h3>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {[
                          ['Tasks due', '4'],
                          ['Active projects', '2'],
                          ['Messages', '7'],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <p className="text-2xl font-black">{value}</p>
                            <p className="text-xs font-bold text-slate-500">{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <Folder className="h-5 w-5 text-slate-500" />
                        <h4 className="mt-2 font-black">Website redesign</h4>
                        <p className="mt-1 text-sm text-slate-600">8 tasks, 3 owners, deadline Friday</p>
                        <div className="mt-3 h-2 rounded-full bg-slate-100">
                          <div className="h-full w-2/3 rounded-full bg-slate-950" />
                        </div>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <CalendarClock className="h-5 w-5 text-slate-500" />
                        <h4 className="mt-2 font-black">Team check-in</h4>
                        <p className="mt-1 text-sm text-slate-600">Today, 2:00 PM with AI recap</p>
                      </div>
                    </div>
                  </div>
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
