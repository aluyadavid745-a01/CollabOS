import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Dashboard: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      // Title animation
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

      // Description animation
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

      // Image animation with parallax
      gsap.fromTo(
        imageRef.current,
        { scale: 0.9, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
          scale: 1,
          opacity: 1,
          duration: 1,
          delay: 0.3,
          immediateRender: false,
        }
      )

      gsap.to(imageRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'center center',
          scrub: 1,
        },
        y: -30,
        ease: 'none',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const features = [
    'Unified Team Workspace',
    'Real-time Collaboration',
    'AI-Powered Insights',
    'Advanced Analytics',
  ]

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-32 lg:py-40 px-4 md:px-8 lg:px-16 relative overflow-hidden"
      id="dashboard"
    >
      <div className="absolute inset-0 bg-white" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-slate-700 shadow-sm mb-6"
            >
              <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-sm font-semibold">
                Beautiful Dashboard
              </span>
            </motion.div>

            <h2 ref={titleRef} className="text-title text-slate-950 mb-6">
              See Your Work Like Never Before
            </h2>

            <p ref={descRef} className="text-body text-slate-600 mb-8 leading-relaxed">
              Our intelligent dashboard gives you instant insights into team performance, project
              progress, and upcoming deadlines. Everything you need to make informed decisions at a
              glance.
            </p>

            {/* Feature List */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-700">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: '99.9%', label: 'Uptime SLA' },
                { number: '100K+', label: 'Active Teams' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="p-4 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <p className="text-2xl font-bold text-slate-950">
                    {stat.number}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Dashboard Image */}
          <motion.div
            ref={imageRef}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Dashboard Card */}
            <div className="relative glass-effect rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70 md:p-8">
              {/* Fake dashboard header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="h-2 bg-slate-200 rounded w-1/2" />
              </div>

              {/* Fake dashboard content */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                      className="h-12 rounded-lg border border-slate-200 bg-slate-100"
                    />
                  ))}
                </div>
                <div className="h-16 rounded-lg border border-slate-200 bg-slate-50" />
                <div className="h-24 rounded-lg border border-slate-200 bg-slate-50" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Dashboard
