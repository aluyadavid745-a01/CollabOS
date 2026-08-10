import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Star } from 'lucide-react'
import { GlassmorphicCard } from '../Common/GlassmorphicCard'

gsap.registerPlugin(ScrollTrigger)

const Testimonials: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

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
        '.testimonial-card',
        { y: 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          immediateRender: false,
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Product Manager at TechCorp',
      avatar: '👩‍💼',
      company: 'TechCorp',
      rating: 5,
      content:
        'CollabOS has completely transformed how our team works. We\'ve reduced meetings by 40% and increased productivity significantly. The AI assistant is a game-changer.',
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      role: 'CEO at StartupXYZ',
      avatar: '👨‍💼',
      company: 'StartupXYZ',
      rating: 5,
      content:
        'Best investment we\'ve made for our team. The seamless integration between chat, tasks, and documents eliminated our need for multiple tools.',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Team Lead at DesignCo',
      avatar: '👩‍🎨',
      company: 'DesignCo',
      rating: 5,
      content:
        'The real-time collaboration features are incredible. Our remote team feels more connected than ever. This is the future of work.',
    },
    {
      id: 4,
      name: 'David Kim',
      role: 'Engineering Manager at DataFlow',
      avatar: '👨‍💻',
      company: 'DataFlow',
      rating: 5,
      content:
        'Switching to CollabOS was the best decision. Better performance, more features, and superior customer support. Highly recommended!',
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-32 lg:py-40 px-4 md:px-8 lg:px-16 relative overflow-hidden"
      id="testimonials"
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
              Success Stories
            </span>
          </motion.div>
          <h2 ref={titleRef} className="text-title text-slate-950 mb-6">
            Loved by Teams Worldwide
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            See what industry leaders have to say about CollabOS and how it\'s transforming their
            workflows.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {testimonials.map((testimonial) => (
            <GlassmorphicCard key={testimonial.id} className="testimonial-card flex flex-col" hover={true}>
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-slate-600 mb-6 flex-1 text-sm leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xl flex-shrink-0">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-slate-950">{testimonial.name}</p>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </GlassmorphicCard>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-12 border-t border-slate-200"
        >
          {[
            { number: '100K+', label: 'Happy Teams' },
            { number: '4.9/5', label: 'Average Rating' },
            { number: '99.9%', label: 'Uptime' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-bold text-slate-950 mb-2">
                {stat.number}
              </p>
              <p className="text-slate-500 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials
