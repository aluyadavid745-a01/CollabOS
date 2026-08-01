import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'

const Logos: React.FC = () => {
  const logos = [
    'Acme Corp',
    'Visionary',
    'PULSE',
    'Cloudbit',
    'Hexa',
    'Radius',
  ]

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    gsap.from(containerRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
    })
  }, [])

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-slate-900/50 to-slate-950/50 border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-slate-400 text-sm font-semibold mb-12 uppercase tracking-wide">
          Trusted by Innovative Teams
        </p>

        <div
          ref={containerRef}
          className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
        >
          {logos.map((logo, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.1 }}
              className="text-slate-500 hover:text-indigo-400 font-semibold transition-colors text-lg"
            >
              {logo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Logos
