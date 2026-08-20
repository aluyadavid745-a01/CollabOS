import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '../components/Common/Button'
import { companyLinks } from '../data/businessModel'

const sections: Record<string, { eyebrow: string; title: string; body: string; items: string[] }> = {
  '/product': {
    eyebrow: 'Product',
    title: 'One workspace for team execution',
    body: 'CollabOS connects projects, tasks, messages, files, meetings, calendar, and AI so teams can understand what is happening and what to do next.',
    items: ['Dashboard for today’s priorities', 'Projects with tasks and deadlines', 'Team messages and files', 'Meetings, notes, and AI summaries'],
  },
  '/features': {
    eyebrow: 'Features',
    title: 'Simple tools that work together',
    body: 'Every feature is designed around the same outcome: helping a team coordinate work without jumping between disconnected tools.',
    items: ['My Tasks', 'Projects', 'Messages', 'Team spaces', 'Calendar', 'Files', 'AI workspace assistant'],
  },
  '/solutions': {
    eyebrow: 'Solutions',
    title: 'Built for teams that need fewer moving parts',
    body: 'CollabOS is best suited for small businesses, startups, agencies, operators, and growing teams that need practical coordination software.',
    items: ['Startup teams', 'Small businesses', 'Agencies', 'Remote and hybrid teams'],
  },
  '/customers': {
    eyebrow: 'Customers',
    title: 'Customer proof will be published only when verified',
    body: 'CollabOS does not publish fake logos, testimonials, awards, or customer metrics. Verified customer stories can be added when real users approve them.',
    items: ['Verified person', 'Verified company', 'Job title', 'Specific result'],
  },
  '/about': {
    eyebrow: 'Company',
    title: 'CollabOS is building the operating system for modern teams',
    body: 'The company is focused on simple, AI-powered collaboration software for teams that want one source of truth for work.',
    items: ['Simple onboarding', 'Product-led growth', 'Revenue-ready plans', 'Investor-ready operating metrics'],
  },
  '/security': {
    eyebrow: 'Security',
    title: 'Security foundations for serious teams',
    body: 'CollabOS is being structured around secure authentication, role-aware access, input validation, protected secrets, audit logging foundations, and safer file access.',
    items: ['Firebase authentication', 'Environment variable protection', 'Admin-only analytics route', 'Backend verification required for production payments'],
  },
  '/help': {
    eyebrow: 'Help',
    title: 'Support that helps beginners move quickly',
    body: 'The product is designed to explain each page naturally with clear empty states, quick create actions, and simple next steps.',
    items: ['Create a team', 'Invite teammates', 'Create a project', 'Create and assign a task'],
  },
  '/contact': {
    eyebrow: 'Contact',
    title: 'Talk to CollabOS',
    body: 'Use the appropriate email for product support, sales, or security questions.',
    items: [`Support: ${companyLinks.supportEmail}`, `Sales: ${companyLinks.salesEmail}`, `Security: ${companyLinks.securityEmail}`],
  },
  '/status': {
    eyebrow: 'Status',
    title: 'Status page placeholder',
    body: 'A public status provider can be connected before launch. Until then, operational incidents should not be invented or hidden.',
    items: ['Application status', 'API status', 'Meeting status', 'File storage status'],
  },
  '/privacy': {
    eyebrow: 'Legal',
    title: 'Privacy policy placeholder',
    body: 'A complete privacy policy should be reviewed before commercial launch. This page exists so the product has a durable route for customer trust materials.',
    items: ['Data collected', 'Purpose of processing', 'Retention', 'Contact for privacy requests'],
  },
  '/terms': {
    eyebrow: 'Legal',
    title: 'Terms of service placeholder',
    body: 'A complete terms of service document should be reviewed before paid subscriptions are launched.',
    items: ['Acceptable use', 'Subscription terms', 'Data ownership', 'Service limitations'],
  },
}

const CompanyPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const content = sections[location.pathname] || sections['/product']

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-black">
            <img src="/lll.png" alt="" className="h-8 w-8 rounded-lg object-cover" />
            CollabOS
          </Link>
          <Button type="button" size="sm" onClick={() => navigate('/get-started')}>Get Started Free</Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24">
        <div>
          <p className="text-sm font-black uppercase tracking-wider text-slate-500">{content.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">{content.title}</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">{content.body}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={() => navigate('/get-started')} className="gap-2">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate('/investors')}>Investor page</Button>
          </div>
        </div>
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
          <ShieldCheck className="h-8 w-8 text-emerald-600" />
          <h2 className="mt-4 text-2xl font-black">What this page covers</h2>
          <div className="mt-5 grid gap-3">
            {content.items.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p className="font-bold text-slate-700">{item}</p>
              </div>
            ))}
          </div>
          {location.pathname === '/contact' && (
            <a href={`mailto:${companyLinks.supportEmail}`} className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50">
              <Mail className="h-4 w-4" />
              Email support
            </a>
          )}
        </article>
      </section>
    </main>
  )
}

export default CompanyPage
