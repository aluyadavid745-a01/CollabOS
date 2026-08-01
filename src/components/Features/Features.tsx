import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  MessageSquare,
  CheckSquare,
  FileText,
  Video,
  Zap,
  Users,
  Shield,
  Rocket,
  Clock,
  Search,
  Bell,
  Settings,
} from 'lucide-react'
import { GlassmorphicCard } from '../Common/GlassmorphicCard'

gsap.registerPlugin(ScrollTrigger)

const Features: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    gsap.from(titleRef.current, {
      scrollTrigger: {
        trigger: titleRef.current,
        start: 'top 80%',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
    })

    gsap.from('.feature-card', {
      scrollTrigger: {
        trigger: gridRef.current,
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
    })
  }, [])

  const features = [
    {
      id: 1,
      icon: MessageSquare,
      title: 'Instant Messaging',
      description: 'Real-time team communication with threads, reactions, and rich media support',
      color: 'from-blue-600 to-cyan-600',
    },
    {
      id: 2,
      icon: CheckSquare,
      title: 'Task Management',
      description: 'Organize work with smart lists, kanban boards, and automated workflows',
      color: 'from-purple-600 to-pink-600',
    },
    {
      id: 3,
      icon: FileText,
      title: 'Document Collaboration',
      description: 'Create, edit, and share documents with real-time collaboration features',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      id: 4,
      icon: Video,
      title: 'Video Meetings',
      description: 'HD video conferencing with screen sharing and recording capabilities',
      color: 'from-rose-600 to-orange-600',
    },
    {
      id: 5,
      icon: Zap,
      title: 'AI Assistant',
      description: 'Smart AI that summarizes conversations and suggests actionable insights',
      color: 'from-yellow-600 to-amber-600',
    },
    {
      id: 6,
      icon: Users,
      title: 'Team Collaboration',
      description: 'Seamlessly work together with integrated team spaces and workflows',
      color: 'from-indigo-600 to-blue-600',
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-32 lg:py-40 px-4 md:px-8 lg:px-16 relative overflow-hidden"
      id="features"
    >
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-indigo-600/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-cyan-600/10 to-transparent rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/50 bg-indigo-500/10 backdrop-blur-sm mb-6"
          >
            <span className="w-2 h-2 bg-indigo-400 rounded-full" />
            <span className="text-sm font-semibold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </motion.div>
          <h2
            ref={titleRef}
            className="text-title text-white mb-6"
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
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <GlassmorphicCard key={feature.id} className="feature-card group">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
                <motion.div
                  className="mt-4 flex items-center gap-2 text-indigo-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ x: 5 }}
                >
                  Learn more →
                </motion.div>
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
                className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-indigo-500/50 transition-colors"
              >
                <Icon className="w-5 h-5 text-indigo-400 mb-2" />
                <p className="font-semibold text-white text-sm mb-1">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Features
