import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Shield,
  Rocket,
  Clock,
  Settings,
} from 'lucide-react'
import { GlassmorphicCard } from '../Common/GlassmorphicCard'
import { featureDetails } from '../../data/features'

gsap.registerPlugin(ScrollTrigger)

const Features: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          immediateRender: false,
        }
      )

      gsap.fromTo(
        '.feature-card',
        { y: 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 80%',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
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
      id="features"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-slate-200" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm mb-6"
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="text-sm font-semibold">
              Powerful Features
            </span>
          </motion.div>
          <h2
            ref={titleRef}
            className="text-title text-slate-950 mb-6"
          >
            Everything You Need in One Platform
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            Comprehensive tools designed to help teams communicate, collaborate, and create
            amazing work together.
          </p>
        </div>

        {/* Features Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {featureDetails.map((feature) => {
            const Icon = feature.icon
            return (
              <GlassmorphicCard key={feature.id} className="feature-card group">
                <div className="inline-flex p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-950 mb-3">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                <Link to={`/features/${feature.slug}`} className="mt-4 inline-flex">
                  <motion.span
                    className="flex items-center gap-2 text-slate-700 text-sm font-semibold opacity-100 transition-colors hover:text-slate-950 md:opacity-0 md:group-hover:opacity-100"
                    whileHover={{ x: 5 }}
                  >
                    Learn more →
                  </motion.span>
                </Link>
              </GlassmorphicCard>
            )
          })}
        </div>

        {/* Additional Features Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
          {[
            { icon: Shield, label: 'Enterprise Security', desc: 'SOC 2 Type II certified' },
            { icon: Rocket, label: 'Lightning Fast', desc: '99.9% uptime SLA' },
            { icon: Clock, label: '24/7 Support', desc: 'Always here to help' },
            { icon: Settings, label: 'Fully Customizable', desc: 'Adapt to your workflow' },
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors"
              >
                <Icon className="w-5 h-5 text-slate-600 mb-2" />
                <p className="font-semibold text-slate-950 text-sm mb-1">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Features
