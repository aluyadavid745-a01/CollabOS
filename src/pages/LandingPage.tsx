import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Check, ChevronDown, Menu, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { AuthMode, AuthUser } from './AuthPage'
import { trackAnalyticsEvent } from '../services/analytics'

interface LandingPageProps {
  rememberedUser?: AuthUser | null
  onNavigate: (view: AuthMode | 'home') => void
  onLogout: () => void
  onChangePassword: () => void
  onCustomizeProfile: () => void
}

type VisualType = 'chat' | 'meeting' | 'project' | 'search' | 'assistant'

const navLinks = [
  { label: 'Product', href: '#product' },
  { label: 'AI', href: '#ai' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Resources', href: '#resources' },
]

const trustCategories = ['Communication', 'Meetings', 'Projects', 'AI', 'Automation', 'Collaboration']
const fragmentedTools = ['Slack', 'Zoom / Meet', 'Trello', 'Notion', 'Drive', 'AI tools', 'Email', 'Task managers']
const lifecycle = ['Communication', 'Meetings', 'Projects', 'Tasks', 'Files', 'AI', 'Automation']

const safetyItems = [
  'Permission-aware AI',
  'Secure tool calling',
  'Approval-based execution',
  'Role-based access',
  'Audit trails',
  'Prompt-injection protection',
  'Data privacy',
  'Human oversight',
]

const featureSections: Array<{
  eyebrow: string
  title: string
  body: string
  bullets: string[]
  visual: VisualType
}> = [
  {
    eyebrow: 'Unified Communication',
    title: 'Chat with context attached.',
    body: 'Team conversations stay connected to the projects, tasks, files, and decisions they influence.',
    bullets: ['Project-linked threads', 'Team channels', 'Decision capture'],
    visual: 'chat',
  },
  {
    eyebrow: 'AI Meetings',
    title: 'Turn meetings into structured work.',
    body: 'CollabOS helps teams move from transcript to summary, decisions, action items, and tasks.',
    bullets: ['Transcript', 'Summary', 'Decisions', 'Action items', 'Tasks'],
    visual: 'meeting',
  },
  {
    eyebrow: 'Smart Projects',
    title: 'A central source of truth for every project.',
    body: 'Track timelines, milestones, owners, files, blockers, and AI insights without scattering context.',
    bullets: ['Timeline', 'Tasks', 'Milestones', 'Progress', 'AI insights'],
    visual: 'project',
  },
  {
    eyebrow: 'Intelligent Search',
    title: 'Find work across the entire workspace.',
    body: 'Search messages, meetings, documents, projects, and tasks with natural language.',
    bullets: ['Projects', 'Messages', 'Meetings', 'Documents', 'Tasks'],
    visual: 'search',
  },
  {
    eyebrow: 'AI Workspace Assistant',
    title: 'Ask questions that move work forward.',
    body: 'Ask what changed, what is blocked, which tasks are overdue, or how to structure a project plan.',
    bullets: ['What changed this week?', "What's blocking the launch?", 'Create a project plan'],
    visual: 'assistant',
  },
]

const comparisonRows = [
  ['Separate applications', 'Unified workspace'],
  ['Fragmented context', 'Shared context'],
  ['Manual task creation', 'AI-powered planning'],
  ['Repetitive workflows', 'Intelligent automation'],
  ['Information silos', 'Connected knowledge'],
  ['AI bolted on', 'AI built into the workflow'],
]

const businessBenefits = [
  ['Reduce context switching', 'Keep conversations, projects, meetings and tasks connected.'],
  ['Automate repetitive work', 'Let AI help with administrative workflows that slow teams down.'],
  ['Improve visibility', "Give teams a shared view of what's happening across the workspace."],
  ['Accelerate execution', 'Move from ideas to owners, timelines, and action faster.'],
  ['Scale collaboration', 'Create a workspace that grows with the organization.'],
]

const useCases = [
  ['Startups', 'Move quickly without building a collection of disconnected tools.'],
  ['Software Teams', 'Connect development planning, meetings, tasks and communication.'],
  ['Agencies', 'Manage multiple clients and projects from one workspace.'],
  ['Remote Teams', 'Keep distributed teams aligned across time zones.'],
  ['Enterprise Teams', 'Improve visibility, governance and collaboration across departments.'],
]

const roadmap = [
  ['Now', ['Unified workspace', 'Projects', 'Communication', 'Meetings', 'AI assistant']],
  ['Next', ['AI Autopilot planned', 'Advanced automation planned', 'Intelligent search upcoming', 'Deeper integrations planned', 'Enterprise controls planned']],
  ['Vision', ['A truly autonomous, permission-aware AI operating system for organizations.']],
] as const

const pricingTiers = [
  ['Free', 'For individuals and small teams.', 'Start Building Free'],
  ['Pro', 'For growing teams that need more collaboration and AI capacity.', 'Get Started'],
  ['Business', 'For organizations requiring advanced collaboration and automation.', 'Talk to Sales'],
  ['Enterprise', 'Custom plans for larger organizations with governance needs.', 'Contact Sales'],
]

const faqItems = [
  ['What is CollabOS?', 'CollabOS is an AI-powered operating system for teams that brings communication, meetings, projects, tasks, files, workflows, and AI automation into one workspace.'],
  ['Who is CollabOS for?', 'CollabOS is built for startups, software teams, agencies, remote teams, and organizations that want one connected workspace for execution.'],
  ['How is CollabOS different from Slack, Trello, or Notion?', 'Those products are strong category tools. CollabOS focuses on connecting the full work lifecycle so conversations, meetings, projects, files, and AI share context.'],
  ['What can CollabOS AI do?', 'CollabOS AI can summarize work, identify blockers, suggest tasks, draft plans, and help turn workspace context into structured action.'],
  ['Can AI take actions?', 'AI actions are designed around review, approval, and human control. High-impact execution should require permission.'],
  ['How does AI permissioning work?', 'The product is being built around workspace roles, permissions, auditability, and approval flows so AI can only use the context and tools it is allowed to access.'],
  ['Is CollabOS suitable for businesses?', 'Yes. The product direction is business-focused, with authentication, workspace permissions, auditability, and enterprise controls in mind.'],
  ['Does CollabOS integrate with other tools?', 'Deeper integrations are part of the planned roadmap. The current product emphasizes a unified native workspace first.'],
  ['How much does CollabOS cost?', 'CollabOS supports Free, Pro, Business, and Enterprise packaging. Public pricing can be finalized as launch packaging is confirmed.'],
  ['How can I get started?', 'Create a free account, build a workspace, add a project, and invite your team when you are ready.'],
]

const assistantPrompts = [
  'What changed this week?',
  "What's blocking the launch?",
  'Summarize our latest client meeting.',
  'Create a project plan.',
  'Which tasks are overdue?',
]

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: 'easeOut' },
}

const SectionHeader = ({
  eyebrow,
  title,
  body,
  align = 'left',
}: {
  eyebrow?: string
  title: string
  body?: string
  align?: 'left' | 'center'
}) => (
  <motion.div
    {...fadeUp}
    className={`${align === 'center' ? 'mx-auto text-center' : ''} max-w-3xl`}
  >
    {eyebrow && <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-blue-700">{eyebrow}</p>}
    <h2 className="font-display text-3xl font-bold leading-tight text-slate-950 md:text-5xl">{title}</h2>
    {body && <p className="mt-5 text-base leading-8 text-slate-600 md:text-lg">{body}</p>}
  </motion.div>
)

const ProductDashboard = () => {
  const floatingCards = [
    { label: 'AI Summary Generated', className: 'left-2 top-10 md:-left-12 md:top-20' },
    { label: '3 Tasks Created', className: 'right-2 top-24 md:-right-10 md:top-32' },
    { label: 'Project Updated', className: 'bottom-28 left-4 md:-left-8' },
    { label: 'Meeting Action Items Detected', className: 'bottom-14 right-4 md:-right-12' },
    { label: '2 Approvals Waiting', className: 'left-1/2 top-1 -translate-x-1/2' },
  ]

  return (
    <motion.div {...fadeUp} id="product-demo" className="relative mx-auto mt-14 max-w-7xl px-4 sm:px-6">
      <div className="absolute inset-x-8 -top-8 h-32 rounded-full bg-blue-200/30 blur-3xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-200/80">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <div className="flex gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-300" />
            <span className="h-3 w-3 rounded-full bg-amber-300" />
            <span className="h-3 w-3 rounded-full bg-emerald-300" />
          </div>
          <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-medium text-slate-500 sm:block">
            workspace.collabos.app / atlas-launch
          </div>
          <div className="h-7 w-7 rounded-full bg-slate-900" />
        </div>
        <div className="grid min-h-[640px] bg-white lg:grid-cols-[230px_minmax(0,1fr)_300px]">
          <aside className="hidden border-r border-slate-200 bg-slate-50 p-5 lg:block">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
              <h3 className="mt-2 font-display text-lg font-bold text-slate-950">Northstar Labs</h3>
            </div>
            {['Projects', 'Team conversations', 'AI assistant', 'Tasks', 'Calendar', 'Meetings', 'Files', 'Notifications'].map((item, index) => (
              <div
                key={item}
                className={`mb-2 flex items-center justify-between rounded-lg px-3 py-2.5 text-sm ${
                  index === 0 ? 'bg-slate-950 font-semibold text-white' : 'text-slate-600'
                }`}
              >
                <span>{item}</span>
                {item === 'Notifications' && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">7</span>}
              </div>
            ))}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold text-slate-400">Team members</p>
              <div className="mt-4 flex -space-x-2">
                {['AD', 'MK', 'SO', 'JT', 'RN'].map((item) => (
                  <span key={item} className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-slate-900 text-[10px] font-bold text-white">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          <section className="min-w-0 p-4 sm:p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Project command center</p>
                <h3 className="mt-2 font-display text-2xl font-bold text-slate-950">Atlas product launch</h3>
                <p className="mt-1 text-sm text-slate-500">Launch workspace for product, engineering, design, and GTM.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold text-slate-500">Project progress</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className="h-full rounded-full bg-blue-600"
                      initial={{ width: '20%' }}
                      whileInView={{ width: '72%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2 }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-950">72%</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-950">Tasks</h4>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">On track</span>
                </div>
                {[
                  ['Finalize onboarding flow', 'Maya', 'Design approval', 'In review'],
                  ['Complete billing webhook', 'Ade', 'Backend integration', 'Blocked'],
                  ['Publish launch page', 'Jon', 'Marketing campaign', 'In progress'],
                  ['Run QA regression', 'Rina', 'QA testing', 'Ready'],
                ].map(([task, owner, project, status]) => (
                  <div key={task} className="grid grid-cols-[minmax(0,1fr)_64px_92px] gap-3 border-t border-slate-100 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{task}</p>
                      <p className="truncate text-xs text-slate-500">{project}</p>
                    </div>
                    <span className="text-slate-500">{owner}</span>
                    <span className={`text-xs font-bold ${status === 'Blocked' ? 'text-rose-600' : 'text-slate-500'}`}>{status}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-950">AI assistant</h4>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
                <div className="rounded-xl bg-white p-4 text-sm text-slate-600 shadow-sm">
                  <p className="font-mono text-xs text-blue-700">&gt; What changed across Atlas?</p>
                  <div className="mt-4 space-y-3">
                    <p><strong className="text-slate-950">Summary:</strong> 4 tasks moved, 1 blocker appeared, and the launch timeline still holds if API review closes today.</p>
                    <div className="rounded-lg bg-blue-50 p-3 text-blue-900">Suggested action: assign backend support to billing webhook.</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-white p-3">
                    <p className="font-bold text-slate-950">Calendar</p>
                    <p className="mt-1 text-slate-500">Demo review at 2:00 PM</p>
                  </div>
                  <div className="rounded-xl bg-white p-3">
                    <p className="font-bold text-slate-950">Files</p>
                    <p className="mt-1 text-slate-500">Launch brief v3 attached</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 xl:col-span-2">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Team conversation</p>
                    <p className="mt-3 text-sm text-slate-700">"Can we confirm API availability before the launch demo?"</p>
                  </div>
                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Meetings</p>
                    <p className="mt-3 text-sm text-slate-700">Client review recap ready with 5 action items.</p>
                  </div>
                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Notifications</p>
                    <p className="mt-3 text-sm text-slate-700">2 approvals waiting from product and design.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="hidden border-l border-slate-200 bg-slate-50 p-5 lg:block">
            <h4 className="mb-4 font-semibold text-slate-950">Today</h4>
            {['Launch sync', 'Design approval', 'API review'].map((item, index) => (
              <div key={item} className="mb-3 rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-950">{item}</p>
                <p className="mt-1 text-xs text-slate-500">{index + 1}:00 PM · Atlas team</p>
              </div>
            ))}
            <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">AI insight</p>
              <p className="mt-3 text-sm leading-6 text-blue-950">The main risk is backend integration. Assign a reviewer before the next client check-in.</p>
            </div>
          </aside>
        </div>
      </div>

      {floatingCards.map((card, index) => (
        <motion.div
          key={card.label}
          className={`absolute hidden rounded-xl border border-slate-200 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-800 shadow-xl shadow-slate-200/70 md:block ${card.className}`}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 * index, duration: 0.45 }}
        >
          {card.label}
        </motion.div>
      ))}
    </motion.div>
  )
}

const FeatureVisual = ({ type }: { type: VisualType }) => {
  if (type === 'chat') {
    return (
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {['Maya: Design approval is ready.', 'Ade: API review needs one more test.', 'CollabOS AI: I can create follow-up tasks for both items.'].map((line) => (
          <div key={line} className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{line}</div>
        ))}
      </div>
    )
  }

  if (type === 'meeting') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {['Meeting transcript', 'Summary', 'Decisions', 'Action items', 'Tasks'].map((item, index) => (
          <div key={item} className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{index + 1}</span>
            <span className="text-sm font-semibold text-slate-800">{item}</span>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'project') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {['Research', 'Design', 'Engineering', 'QA', 'Launch'].map((item, index) => (
          <div key={item} className="mb-4 last:mb-0">
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-semibold text-slate-800">{item}</span>
              <span className="text-slate-500">{index < 2 ? 'Done' : index === 2 ? 'Active' : 'Next'}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(26, 95 - index * 17)}%` }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'search') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="rounded-xl border border-slate-200 px-4 py-3 font-mono text-xs text-slate-600">Show me everything related to the Atlas launch.</div>
        {['Project: Atlas product launch', 'Message: API availability risk', 'Meeting: Client review recap', 'Document: Launch brief v3', 'Task: Run QA regression'].map((item) => (
          <div key={item} className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-800">{item}</div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {assistantPrompts.map((prompt) => (
        <div key={prompt} className="mb-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-700 last:mb-0">{prompt}</div>
      ))}
    </div>
  )
}

const LandingPage: React.FC<LandingPageProps> = ({ rememberedUser, onNavigate }) => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [activeUseCase, setActiveUseCase] = React.useState(0)
  const [demoStarted, setDemoStarted] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const openSignup = (source: string) => {
    if (rememberedUser) {
      navigate('/home')
      return
    }

    trackAnalyticsEvent('signup_started', { source })
    onNavigate('signup')
  }

  const bookDemo = (source: string) => {
    trackAnalyticsEvent('demo_requested', { source })
    window.location.href = 'mailto:sales@collabos.dev?subject=CollabOS%20demo%20request'
  }

  const jumpTo = (href: string) => {
    setIsMenuOpen(false)
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f9fc] text-slate-950">
      <nav className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled ? 'border-b border-slate-200 bg-white/95 py-3 shadow-sm' : 'bg-white/80 py-5'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="/" className="font-display text-xl font-bold tracking-normal text-slate-950" aria-label="CollabOS home">CollabOS</a>
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <button key={link.label} type="button" onClick={() => jumpTo(link.href)} className="text-sm font-semibold text-slate-600 transition-colors hover:text-slate-950">
                {link.label}
              </button>
            ))}
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <button type="button" onClick={() => (rememberedUser ? navigate('/home') : onNavigate('signin'))} className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950">
              Sign In
            </button>
            <button type="button" onClick={() => openSignup('site_nav')} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-700">
              Get Started
            </button>
          </div>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 md:hidden" onClick={() => setIsMenuOpen((current) => !current)} aria-label="Toggle navigation" aria-expanded={isMenuOpen}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              {navLinks.map((link) => (
                <button key={link.label} type="button" onClick={() => jumpTo(link.href)} className="rounded-lg px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  {link.label}
                </button>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => (rememberedUser ? navigate('/home') : onNavigate('signin'))} className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">
                  Sign In
                </button>
                <button type="button" onClick={() => openSignup('site_mobile_nav')} className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main>
        <section className="relative pt-32 sm:pt-36">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.16),transparent_36%),linear-gradient(180deg,#ffffff_0%,#f7f9fc_72%)]" />
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
            <motion.div {...fadeUp}>
              <div className="mx-auto mb-6 inline-flex rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700 shadow-sm">
                The AI operating system for work
              </div>
              <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
                One intelligent workspace for your entire team.
              </h1>
              <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-slate-600 md:text-xl">
                CollabOS brings communication, meetings, projects, tasks, files, and AI automation into one intelligent workspace so teams can spend less time managing work and more time getting it done.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                <button type="button" onClick={() => openSignup('site_hero')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-300/70 transition-all hover:-translate-y-0.5 hover:bg-blue-700">
                  Start Building Free <ArrowRight className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => bookDemo('site_hero')} className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300">
                  Book a Demo
                </button>
              </div>
              <p className="mt-5 text-sm font-medium text-slate-500">No credit card required · Built for modern teams</p>
            </motion.div>
          </div>
          <ProductDashboard />
        </section>

        <section className="border-y border-slate-200 bg-white py-10">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6">
            <p className="font-display text-xl font-bold text-slate-950">Built for the way modern teams work.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm font-semibold text-slate-500">
              {trustCategories.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
              <SectionHeader title="Your work shouldn't live in 10 different apps." body="Teams constantly switch between applications, lose context, duplicate information, and spend valuable time managing work instead of doing it." />
              <motion.div {...fadeUp} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {fragmentedTools.map((tool) => (
                    <div key={tool} className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-sm font-semibold text-slate-600">{tool}</div>
                  ))}
                </div>
                <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-6">
                  <p className="font-display text-2xl font-bold text-slate-950">Fragmented tools create fragmented work.</p>
                  <p className="mt-3 text-sm leading-6 text-blue-950">CollabOS brings the workspace back together with shared context across the full lifecycle.</p>
                </div>
              </motion.div>
            </div>
            <motion.h2 {...fadeUp} className="mt-16 text-center font-display text-4xl font-bold text-slate-950">Meet CollabOS.</motion.h2>
          </div>
        </section>

        <section id="product" className="border-y border-slate-200 bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeader align="center" title="Everything your team needs. One intelligent workspace." body="CollabOS connects the entire work lifecycle instead of simply putting multiple tools behind one interface." />
            <motion.div {...fadeUp} className="mx-auto mt-14 max-w-4xl rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="grid gap-4 md:grid-cols-7">
                {lifecycle.map((item, index) => (
                  <div key={item} className="relative rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                    <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">{index + 1}</div>
                    <p className="mt-3 text-sm font-bold text-slate-800">{item}</p>
                    {index < lifecycle.length - 1 && <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-slate-300 md:block" />}
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-white p-5 text-center text-sm font-semibold text-slate-600">
                Every component shares context, so work can move from message to meeting to project to task without losing the thread.
              </div>
            </motion.div>
          </div>
        </section>

        <section id="ai" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <SectionHeader title="Your AI teammate understands the work." body="CollabOS AI understands your projects, conversations, meetings, tasks, and documents, then helps your team turn information into action." />
              <motion.div {...fadeUp} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/70">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="font-mono text-sm text-blue-700">&gt; What are the biggest blockers across Project Atlas?</p>
                </div>
                <div className="mt-4 rounded-2xl bg-slate-50 p-5">
                  <p className="font-display text-xl font-bold text-slate-950">3 blockers detected</p>
                  <ol className="mt-4 space-y-3 text-sm text-slate-700">
                    <li>1. API integration is delayed</li>
                    <li>2. Design approval is pending</li>
                    <li>3. QA resources are unavailable</li>
                  </ol>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  {['Create tasks', 'Assign owners', 'Notify team', 'Update project'].map((item) => (
                    <div key={item} className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-3 text-center text-xs font-bold text-blue-800">{item}</div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeader eyebrow="CollabOS Autopilot" title="From conversation to execution." body="CollabOS can transform team conversations into structured work. AI acts with permission, not without control." />
            <motion.div {...fadeUp} className="mt-12 grid gap-4 md:grid-cols-4">
              {['Meeting', 'AI understands the conversation', 'Summary generated', 'Action items detected', 'Tasks created', 'Team members assigned', 'Project updated', 'Human approval when required'].map((item, index) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <span className="text-xs font-bold text-blue-700">0{index + 1}</span>
                  <p className="mt-3 min-h-[48px] font-semibold text-slate-800">{item}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeader align="center" title="Powerful AI. Human-controlled execution." body="Built with enterprise security and permission controls in mind, without claiming certifications or guarantees that have not been obtained." />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {safetyItems.map((item) => (
                <motion.div key={item} {...fadeUp} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <Check className="h-5 w-5 text-blue-700" />
                  <p className="mt-4 font-semibold text-slate-900">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeader title="Product depth, shown clearly." body="CollabOS is designed as a working product surface, not only a promise about AI." />
            <div className="mt-14 space-y-10">
              {featureSections.map((section, index) => (
                <motion.div key={section.eyebrow} {...fadeUp} className={`grid items-center gap-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:grid-cols-2 md:p-8 ${index % 2 ? 'md:[&>*:first-child]:order-2' : ''}`}>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">{section.eyebrow}</p>
                    <h3 className="mt-3 font-display text-3xl font-bold text-slate-950">{section.title}</h3>
                    <p className="mt-4 leading-7 text-slate-600">{section.body}</p>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {section.bullets.map((item) => <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">{item}</span>)}
                    </div>
                  </div>
                  <FeatureVisual type={section.visual} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <SectionHeader align="center" title="Tell CollabOS what you want to accomplish." />
            <motion.div {...fadeUp} className="mt-12 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70">
              <button type="button" onClick={() => setDemoStarted(true)} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left text-sm text-slate-500 transition-colors hover:bg-white">
                <span>Create a launch plan for our new fintech product.</span>
                <span className="rounded-lg bg-slate-950 px-4 py-2 text-xs font-bold text-white">Generate</span>
              </button>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {['Project created', 'Timeline created', 'Team assignments suggested'].map((item, index) => (
                  <motion.div key={item} animate={demoStarted ? { opacity: 1, y: 0 } : { opacity: index === 0 ? 1 : 0.45, y: index === 0 ? 0 : 8 }} transition={{ delay: demoStarted ? index * 0.18 : 0, duration: 0.35 }} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <p className="font-bold text-slate-950">{item}</p>
                    <p className="mt-2 text-sm text-slate-500">{index === 0 ? 'Fintech Product Launch' : index === 1 ? 'Milestones created' : 'Owners recommended for review'}</p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="font-display text-xl font-bold text-slate-950">Fintech Product Launch</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {['Market research', 'Product design', 'Landing page', 'Backend integration', 'QA testing', 'Marketing campaign'].map((task) => (
                    <div key={task} className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-950">{task}</div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeader align="center" title="More than collaboration. An operating system for work." />
            <motion.div {...fadeUp} className="mt-12 overflow-hidden rounded-3xl border border-slate-200">
              <div className="grid bg-slate-50 font-bold text-slate-950 md:grid-cols-3">
                <div className="p-5">Traditional tools</div>
                <div className="hidden p-5 md:block" />
                <div className="p-5">CollabOS</div>
              </div>
              {comparisonRows.map(([traditional, collabos]) => (
                <div key={traditional} className="grid border-t border-slate-200 bg-white md:grid-cols-3">
                  <div className="p-5 text-slate-600">{traditional}</div>
                  <div className="hidden place-items-center border-x border-slate-100 p-5 text-slate-300 md:grid"><ArrowRight className="h-5 w-5" /></div>
                  <div className="p-5 font-semibold text-slate-950">{collabos}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeader title="Less tool switching. More execution." body="A decision-maker should see the business value immediately: less operational drag, better visibility, and faster movement from idea to action." />
            <div className="mt-12 grid gap-4 md:grid-cols-5">
              {businessBenefits.map(([title, body]) => (
                <motion.div key={title} {...fadeUp} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-display text-lg font-bold text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="solutions" className="border-y border-slate-200 bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeader title="Built for ambitious teams." body="Different teams arrive with different workflows. CollabOS gives each one a connected operating layer." />
            <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="flex gap-2 overflow-x-auto lg:flex-col">
                {useCases.map(([label], index) => (
                  <button key={label} type="button" onClick={() => setActiveUseCase(index)} className={`min-w-max rounded-lg px-4 py-3 text-left text-sm font-bold transition-colors ${activeUseCase === index ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}>
                    {label}
                  </button>
                ))}
              </div>
              <motion.div key={activeUseCase} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200 bg-slate-50 p-8">
                <p className="font-display text-3xl font-bold text-slate-950">{useCases[activeUseCase][0]}</p>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{useCases[activeUseCase][1]}</p>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="resources" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <SectionHeader title="Building the future of work." body="Roadmap language is intentionally labeled so upcoming capabilities are not presented as already shipped." />
                <div className="mt-10 space-y-4">
                  {roadmap.map(([phase, items]) => (
                    <div key={phase} className="rounded-2xl border border-slate-200 bg-white p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">{phase}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {items.map((item) => <span key={item} className="rounded-full bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600">{item}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <SectionHeader title="A massive shift is happening in how teams work." body="The opportunity is driven by SaaS consolidation, AI-native productivity, remote and hybrid collaboration, enterprise workflow automation, AI agents, and unified workspaces." />
                <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm leading-7 text-slate-600">CollabOS is positioned for a world where teams expect their workspace to understand context, suggest action, and coordinate execution. No market-size figures are shown here because unsupported TAM, revenue, customer, funding, or usage claims do not belong on an investor-ready site.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="border-y border-slate-200 bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeader align="center" title="A business model designed to scale." body="Packaging is clear without publishing invented pricing." />
            <div className="mt-12 grid gap-4 md:grid-cols-4">
              {pricingTiers.map(([name, body, cta]) => (
                <motion.div key={name} {...fadeUp} className="flex min-h-[260px] flex-col rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="font-display text-2xl font-bold text-slate-950">{name}</h3>
                  <p className="mt-4 flex-1 text-sm leading-6 text-slate-600">{body}</p>
                  <button type="button" onClick={() => (name === 'Free' || name === 'Pro' ? openSignup(`site_pricing_${name.toLowerCase()}`) : bookDemo(`site_pricing_${name.toLowerCase()}`))} className="mt-8 rounded-lg bg-white px-4 py-3 text-sm font-bold text-slate-950 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-950 hover:text-white">
                    {cta}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeader align="center" title="We're building the operating system for modern work." body="CollabOS exists because modern teams have more tools than ever, but less shared context. The company vision is to make the workspace itself intelligent enough to help teams coordinate, decide, and execute with human control." />
            <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-700">Built for ambitious teams.</p>
              <p className="mt-4 leading-8 text-slate-600">No fake testimonials are displayed. Public customer proof should be added only when a real customer, role, company, testimonial, and permission to publish are verified.</p>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <SectionHeader title="Enterprise-ready by design." />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {['Authentication', 'Role-based permissions', 'Secure APIs', 'Data controls', 'Workspace permissions', 'Auditability', 'AI approval workflows', 'Enterprise controls planned'].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <Check className="h-5 w-5 text-blue-700" />
                  <p className="mt-4 font-semibold text-slate-900">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <SectionHeader align="center" title="FAQ" />
            <div className="mt-10 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white">
              {faqItems.map(([question, answer]) => (
                <details key={question} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold text-slate-950">
                    {question}
                    <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 leading-7 text-slate-600">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-6xl rounded-[32px] border border-blue-100 bg-white px-6 py-16 text-center shadow-2xl shadow-slate-200/80 md:px-12">
            <h2 className="font-display text-4xl font-bold text-slate-950 md:text-6xl">Work shouldn't feel fragmented.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">Bring your team's work together and let AI help turn ideas into execution.</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => openSignup('site_final_cta')} className="rounded-lg bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-blue-700">
                Start Building Free
              </button>
              <button type="button" onClick={() => bookDemo('site_final_cta')} className="rounded-lg border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50">
                Book a Demo
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1.2fr_repeat(4,1fr)]">
            <div>
              <p className="font-display text-xl font-bold text-slate-950">CollabOS</p>
              <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">The AI operating system for modern work.</p>
            </div>
            {[
              ['Product', ['Features', 'AI', 'Autopilot', 'Integrations', 'Pricing']],
              ['Solutions', ['Startups', 'Software Teams', 'Agencies', 'Remote Teams', 'Enterprise']],
              ['Company', ['About', 'Careers', 'Contact', 'Security']],
              ['Resources', ['Documentation', 'Blog', 'Help Center', 'Changelog']],
            ].map(([heading, links]) => (
              <div key={heading as string}>
                <p className="font-bold text-slate-950">{heading as string}</p>
                <div className="mt-4 space-y-3">
                  {(links as string[]).map((link) => (
                    <button
                      key={link}
                      type="button"
                      onClick={() => {
                        const normalized = link.toLowerCase().replace(/\s+/g, '-')
                        if (normalized === 'pricing') jumpTo('#pricing')
                        else if (normalized === 'ai' || normalized === 'autopilot') jumpTo('#ai')
                        else if (['startups', 'software-teams', 'agencies', 'remote-teams', 'enterprise'].includes(normalized)) jumpTo('#solutions')
                        else if (normalized === 'contact' || normalized === 'careers') bookDemo(`footer_${normalized}`)
                        else if (normalized === 'documentation' || normalized === 'blog' || normalized === 'help-center' || normalized === 'changelog') jumpTo('#resources')
                        else jumpTo('#product')
                      }}
                      className="block text-left text-sm text-slate-500 transition-colors hover:text-slate-950"
                    >
                      {link}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">© 2026 CollabOS. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
