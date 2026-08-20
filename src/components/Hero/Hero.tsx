import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import {
  ArrowRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  FileText,
  Folder,
  MessageSquare,
  PlayCircle,
  Search,
  Users,
  type LucideIcon,
} from 'lucide-react'
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
      gsap.from(titleRef.current, {
        duration: 0.8,
        y: 36,
        opacity: 0,
        ease: 'power3.out',
      })

      gsap.from(descRef.current, {
        duration: 0.8,
        y: 24,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.15,
      })

      gsap.from(ctaRef.current, {
        duration: 0.8,
        y: 22,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.3,
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  const workspaceNav: Array<{ label: string; icon: LucideIcon; active?: boolean }> = [
    { label: 'Home', icon: CheckCircle2, active: true },
    { label: 'My Tasks', icon: CheckCircle2 },
    { label: 'Projects', icon: Folder },
    { label: 'Messages', icon: MessageSquare },
    { label: 'Team', icon: Users },
    { label: 'Files', icon: FileText },
    { label: 'AI', icon: Bot },
  ]

  const metrics = [
    ['Today', '4 tasks'],
    ['Projects', '2 active'],
    ['Meetings', '1 next'],
  ]

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen items-center overflow-hidden border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_58%,#eef2f7_100%)] pb-16 pt-28"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_50%_0%,rgba(15,23,42,0.08),transparent_58%)]" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 md:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:px-16">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 shadow-sm"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-black">AI-powered work, in one workspace</span>
          </motion.div>

          <h1
            ref={titleRef}
            className="max-w-4xl text-5xl font-black leading-[0.95] text-slate-950 sm:text-6xl lg:text-7xl"
          >
            The operating system for modern teams.
          </h1>

          <p
            ref={descRef}
            className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl"
          >
            Projects, tasks, communication, files, meetings, and AI - all connected in one simple workspace.
          </p>

          <div
            ref={ctaRef}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button
              variant="primary"
              size="lg"
              className="min-h-[52px] gap-2 rounded-xl px-6 shadow-lg shadow-slate-950/15"
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
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="min-h-[52px] gap-2 rounded-xl px-6"
              onClick={() => {
                trackAnalyticsEvent('demo_requested', { source: 'hero' })
                document.getElementById('product-demo')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <PlayCircle className="h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          <div className="mt-9 grid max-w-xl grid-cols-3 gap-3">
            {metrics.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white/85 p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          id="product-demo"
          initial={{ opacity: 0, scale: 0.97, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.55 }}
          className="relative"
        >
          <div className="rounded-[1.4rem] border border-slate-300/70 bg-white p-2 shadow-2xl shadow-slate-300/70">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src="/lll.png" alt="" className="h-8 w-8 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-black text-slate-950">CollabOS</p>
                    <p className="text-xs font-bold text-slate-500">Workspace command center</p>
                  </div>
                </div>
                <div className="flex min-h-[40px] min-w-[210px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                  <Search className="h-4 w-4" />
                  Search work, files, people
                </div>
              </div>

              <div className="grid min-h-[560px] lg:grid-cols-[220px_1fr]">
                <aside className="hidden border-r border-slate-200 bg-white p-4 lg:block">
                  <button type="button" className="mb-5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white">
                    <ArrowRight className="h-4 w-4" />
                    Create
                  </button>
                  <nav className="space-y-1">
                    {workspaceNav.map(({ label, icon: Icon, active }) => (
                      <div key={label} className={`flex min-h-[42px] items-center gap-3 rounded-xl px-3 text-sm font-bold ${active ? 'bg-slate-950 text-white' : 'text-slate-600'}`}>
                        <Icon className="h-4 w-4" />
                        {label}
                      </div>
                    ))}
                  </nav>
                </aside>

                <div className="min-w-0 p-4 sm:p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-500">Today</p>
                      <h2 className="mt-1 text-2xl font-black text-slate-950">Launch workspace</h2>
                    </div>
                    <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">AI ready</span>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-slate-950">Website redesign</p>
                          <p className="mt-1 text-xs font-bold text-slate-500">3 owners, deadline Friday</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">67%</span>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-slate-100">
                        <div className="h-full w-2/3 rounded-full bg-slate-950" />
                      </div>
                      <div className="mt-4 space-y-3">
                        {['Finalize homepage copy', 'Ship pricing page', 'Review onboarding'].map((task, index) => (
                          <div key={task} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className={`h-4 w-4 ${index === 0 ? 'text-emerald-600' : 'text-slate-300'}`} />
                              <span className="text-sm font-bold text-slate-700">{task}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-400">{index === 0 ? 'Done' : 'Today'}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="grid gap-4">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white">
                            <Bot className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-black text-slate-950">AI command</p>
                            <p className="text-xs font-bold text-slate-500">Create launch tasks</p>
                          </div>
                        </div>
                        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700">
                          "Add design, development, and testing tasks for this project."
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <MessageSquare className="h-5 w-5 text-slate-500" />
                          <p className="mt-3 text-2xl font-black">7</p>
                          <p className="text-xs font-bold text-slate-500">Updates</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <CalendarClock className="h-5 w-5 text-slate-500" />
                          <p className="mt-3 text-2xl font-black">2 PM</p>
                          <p className="text-xs font-bold text-slate-500">Next meeting</p>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
