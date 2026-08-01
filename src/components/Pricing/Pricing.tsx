import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Check, X } from 'lucide-react'
import { Button } from '../Common/Button'
import { GlassmorphicCard } from '../Common/GlassmorphicCard'

gsap.registerPlugin(ScrollTrigger)

const Pricing: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

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

    gsap.from('.pricing-card', {
      scrollTrigger: {
        trigger: cardsRef.current,
        start: 'top 80%',
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
    })
  }, [])

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '29',
      description: 'Perfect for small teams',
      features: [
        { name: 'Up to 10 team members', included: true },
        { name: 'Basic messaging and chat', included: true },
        { name: 'Task management', included: true },
        { name: 'File storage (10GB)', included: true },
        { name: 'Video meetings (30 min)', included: false },
        { name: 'AI assistant', included: false },
        { name: '24/7 support', included: false },
      ],
      featured: false,
    },
    {
      id: 'pro',
      name: 'Professional',
      price: '79',
      description: 'For growing teams',
      features: [
        { name: 'Up to 100 team members', included: true },
        { name: 'Advanced messaging and chat', included: true },
        { name: 'Advanced task management', included: true },
        { name: 'File storage (1TB)', included: true },
        { name: 'Unlimited video meetings', included: true },
        { name: 'AI assistant with insights', included: true },
        { name: 'Priority support', included: false },
      ],
      featured: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        { name: 'Unlimited team members', included: true },
        { name: 'Everything in Professional', included: true },
        { name: 'Advanced security features', included: true },
        { name: 'Unlimited file storage', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'Dedicated AI assistant', included: true },
        { name: '24/7 dedicated support', included: true },
      ],
      featured: false,
    },
  ]

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-32 lg:py-40 px-4 md:px-8 lg:px-16 relative overflow-hidden"
      id="pricing"
    >
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-600/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-600/10 to-transparent rounded-full blur-3xl" />

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
              Simple Pricing
            </span>
          </motion.div>
          <h2 ref={titleRef} className="text-title text-white mb-6">
            Plans for Every Team
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            Choose the perfect plan for your team. All plans include a 14-day free trial. No credit
            card required.
          </p>
        </div>

        {/* Pricing Toggle (Monthly/Yearly) */}
        <div className="flex justify-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-4 p-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
          >
            <button className="px-6 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold text-sm">
              Monthly
            </button>
            <button className="px-6 py-2 text-slate-400 hover:text-white transition-colors font-semibold text-sm">
              Yearly
              <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Save 20%</span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <motion.div key={plan.id} className="pricing-card h-full">
              <GlassmorphicCard
                className={`flex flex-col h-full relative ${
                  plan.featured ? 'md:scale-105 ring-2 ring-indigo-500' : ''
                }`}
                hover={true}
              >
                {/* Featured badge */}
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                      ${plan.price}
                    </span>
                    {plan.price !== 'Custom' && (
                      <span className="text-slate-400 text-sm ml-2">/month</span>
                    )}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  variant={plan.featured ? 'primary' : 'secondary'}
                  size="md"
                  className="w-full mb-8"
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </Button>

                {/* Features List */}
                <div className="space-y-4 flex-1">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassmorphicCard>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Frequently Asked Questions</h3>
          <p className="text-slate-400 mb-8">Questions about our pricing? Check out our FAQ.</p>
          <Button variant="secondary" size="md">
            View All FAQs
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Pricing
