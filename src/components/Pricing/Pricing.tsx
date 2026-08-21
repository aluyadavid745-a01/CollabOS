import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '../Common/Button'
import { GlassmorphicCard } from '../Common/GlassmorphicCard'
import type { AuthUser } from '../../pages/AuthPage'
import { prefetchRoute } from '../../utils/prefetch'
import { aiCreditAddOn, formatUsd, pricingPlans } from '../../data/businessModel'

gsap.registerPlugin(ScrollTrigger)

interface PricingProps {
  rememberedUser?: AuthUser | null
}

const Pricing: React.FC<PricingProps> = ({ rememberedUser }) => {
  const navigate = useNavigate()
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly')
  const [showAllFaqs, setShowAllFaqs] = React.useState(false)

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
        '.pricing-card',
        { y: 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          immediateRender: false,
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handlePlanAction = (price: number | null) => {
    if (rememberedUser) {
      navigate('/home')
      return
    }

    if (price === null) {
      window.location.href = 'mailto:sales@collabos.dev?subject=CollabOS%20Enterprise%20Plan'
      return
    }

    navigate('/get-started')
  }

  const faqs = [
    {
      question: 'Is there a free trial?',
      answer: 'The Free plan lets teams start without a sales call. Paid trial rules can be configured before launch.',
    },
    {
      question: 'Can I switch between monthly and yearly billing?',
      answer: 'Yes. Plan pricing is configuration-driven so monthly, yearly, and future launch pricing can be changed without redesigning the page.',
    },
    {
      question: 'What happens when I add more teammates?',
      answer: 'Each plan has a clear team limit. The exact limits live in pricing configuration so they can change as the business model is refined.',
    },
    {
      question: 'Do plans include video meetings and AI?',
      answer: 'Every plan includes a defined AI action allowance. Additional AI credits are designed as an optional paid add-on.',
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes. You can cancel your plan whenever you need. Your workspace data remains available according to your account settings.',
    },
    {
      question: 'Who should use Enterprise?',
      answer: 'Enterprise is for larger organizations that need custom security review, procurement, rollout support, and usage limits.',
    },
  ]

  const visibleFaqs = showAllFaqs ? faqs : faqs.slice(0, 3)

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-32 lg:py-40 px-4 md:px-8 lg:px-16 relative overflow-hidden"
      id="pricing"
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
              Simple Pricing
            </span>
          </motion.div>
          <h2 ref={titleRef} className="text-title text-slate-950 mb-6">
            Plans for Every Team
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            Choose the perfect plan for your team. All plans include a 14-day free trial. No credit
            card required. Prices are launch configuration and can be changed as the business model is finalized.
          </p>
        </div>

        {/* Pricing Toggle (Monthly/Yearly) */}
        <div className="flex justify-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-4 p-2 rounded-full border border-slate-200 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-slate-950 text-white'
                  : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-slate-950 text-white'
                  : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              Yearly
              <span className="ml-2 rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">Save 20%</span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
          {pricingPlans.map((plan) => {
            const price = billingCycle === 'yearly' ? plan.yearlyPriceUsd : plan.monthlyPriceUsd
            const monthlyEquivalent =
              billingCycle === 'yearly' && plan.yearlyPriceUsd ? Math.round(plan.yearlyPriceUsd / 12) : null
            const monthlyTotal = plan.monthlyPriceUsd ? plan.monthlyPriceUsd * 12 : null
            const yearlySavings = monthlyTotal && plan.yearlyPriceUsd ? monthlyTotal - plan.yearlyPriceUsd : null

            return (
              <motion.div key={plan.id} className="pricing-card h-full">
                <GlassmorphicCard
                  className={`flex flex-col h-full relative ${
                    plan.featured ? 'md:scale-105 ring-2 ring-slate-950' : ''
                  }`}
                  hover={true}
                >
                {/* Featured badge */}
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-slate-950 text-white text-xs font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-950 mb-2">{plan.name}</h3>
                  <p className="text-slate-500 text-sm">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-slate-950">
                      {price === null ? 'Custom' : formatUsd(price)}
                    </span>
                    {price !== null && (
                      <span className="text-slate-500 text-sm ml-2">
                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  {billingCycle === 'yearly' && monthlyEquivalent && yearlySavings && (
                    <p className="mt-2 text-sm font-semibold text-green-400">
                      {formatUsd(monthlyEquivalent)}/month equivalent. Save {formatUsd(yearlySavings)}/year.
                    </p>
                  )}
                  {billingCycle === 'monthly' && plan.monthlyPriceUsd !== null && plan.monthlyPriceUsd > 0 && (
                    <p className="mt-2 text-sm text-slate-500">Switch to yearly for launch savings.</p>
                  )}
                  <p className="mt-3 text-sm font-bold text-slate-700">{plan.aiActionsPerMonth === null ? 'Custom AI usage' : `${plan.aiActionsPerMonth.toLocaleString()} AI actions/month`}</p>
                </div>

                {/* CTA Button */}
                <Button
                  variant={plan.featured ? 'primary' : 'secondary'}
                  size="md"
                  className="w-full mb-8"
                  onMouseEnter={() => prefetchRoute(rememberedUser ? 'homeDashboard' : 'auth')}
                  onFocus={() => prefetchRoute(rememberedUser ? 'homeDashboard' : 'auth')}
                  onClick={() => handlePlanAction(price)}
                >
                  {rememberedUser
                    ? 'Open Workspace'
                    : price === null
                      ? 'Contact Sales'
                      : 'Get Started'}
                </Button>

                {/* Features List */}
                <div className="space-y-4 flex-1">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </GlassmorphicCard>
            </motion.div>
            )
          })}
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <h3 className="text-xl font-black">{aiCreditAddOn.label}</h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {aiCreditAddOn.description} Usage limits are stored in configuration so they can be adjusted without major code changes.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-950 mb-4">Frequently Asked Questions</h3>
          <p className="text-slate-500 mb-8">Answers to the questions teams usually ask before choosing a plan.</p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-4">
            {visibleFaqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="text-base font-bold text-slate-950">{faq.question}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="gap-2"
              onClick={() => setShowAllFaqs((current) => !current)}
            >
              {showAllFaqs ? 'Show Less FAQs' : 'View All FAQs'}
              <ChevronDown className={`h-4 w-4 transition-transform ${showAllFaqs ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Pricing
