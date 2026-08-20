import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BarChart3, Bot, Briefcase, Building2, CheckCircle2, LineChart, Mail, Map, Target, Users } from 'lucide-react'
import { Button } from '../components/Common/Button'
import { companyLinks, pricingPlans } from '../data/businessModel'

const card = 'rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70'

const InvestorsPage: React.FC = () => {
  const navigate = useNavigate()
  const sections = [
    {
      icon: Target,
      title: 'Problem',
      body: 'Teams rely on Slack, Trello, Notion, Google Drive, Zoom, email, and other tools that do not share one operational source of truth.',
    },
    {
      icon: Building2,
      title: 'Solution',
      body: 'CollabOS brings projects, tasks, communication, files, meetings, calendar, and AI into one simple workspace.',
    },
    {
      icon: Bot,
      title: 'Product',
      body: 'The product already includes workspace dashboard, projects, tasks, messages, team, calendar, files, meetings, profile, and an AI assistant foundation.',
    },
    {
      icon: LineChart,
      title: 'Market',
      body: 'Remote work, SaaS fragmentation, and AI adoption are pushing teams toward simpler systems that consolidate everyday work.',
    },
    {
      icon: Briefcase,
      title: 'Business model',
      body: `Configurable subscriptions from ${pricingPlans[0].name} to Enterprise, with AI usage limits and optional AI credits designed for monetization.`,
    },
    {
      icon: BarChart3,
      title: 'Traction',
      body: 'Pre-revenue / Early Access. CollabOS should publish only verified usage, revenue, retention, and customer data.',
    },
    {
      icon: Users,
      title: 'Competition',
      body: 'CollabOS is a simpler, more connected alternative to fragmented team workflows across Slack, Notion, Asana, ClickUp, and Microsoft Teams categories.',
    },
    {
      icon: Map,
      title: 'Go-to-market',
      body: 'Founder-led sales, product-led growth, startup communities, African technology communities, LinkedIn, referrals, partnerships, and content marketing.',
    },
  ]

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-black">
            <img src="/lll.png" alt="" className="h-8 w-8 rounded-lg object-cover" />
            CollabOS
          </Link>
          <Button type="button" size="sm" onClick={() => navigate('/contact')}>Contact</Button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-wider text-slate-500">Investor overview</p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">CollabOS</h1>
          <p className="mt-5 text-2xl font-black text-slate-800">The operating system for modern teams.</p>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Projects, tasks, communication, files, meetings, and AI connected in one simple workspace for teams that need fewer disconnected tools.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={() => navigate('/get-started')} className="gap-2">
              Try product
              <ArrowRight className="h-4 w-4" />
            </Button>
            <a href={`mailto:${companyLinks.salesEmail}?subject=CollabOS%20investor%20conversation`} className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <Mail className="h-4 w-4" />
              Contact founders
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <article key={section.title} className={card}>
                <Icon className="h-6 w-6 text-slate-500" />
                <h2 className="mt-4 text-xl font-black">{section.title}</h2>
                <p className="mt-3 leading-7 text-slate-600">{section.body}</p>
              </article>
            )
          })}
        </div>

        <section className="mt-6 grid gap-5 lg:grid-cols-3">
          <article className={card}>
            <h2 className="text-xl font-black">Roadmap</h2>
            <ul className="mt-4 space-y-3">
              {['Production analytics and billing', 'Mobile-first workflows', 'AI workspace actions', 'Security hardening', 'Admin controls and audit logs'].map((item) => (
                <li key={item} className="flex gap-3 text-sm font-bold text-slate-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <article className={card}>
            <h2 className="text-xl font-black">Funding use</h2>
            <p className="mt-3 leading-7 text-slate-600">
              Future fundraising can be communicated as raising a specific amount to reach measurable 18-month milestones across product, engineering, customer acquisition, infrastructure, operations, security, and team.
            </p>
          </article>
          <article className={card}>
            <h2 className="text-xl font-black">Team</h2>
            <p className="mt-3 leading-7 text-slate-600">
              Add verified founder and team details here before fundraising materials are shared externally. Do not publish invented biographies or advisors.
            </p>
          </article>
        </section>
      </section>
    </main>
  )
}

export default InvestorsPage
