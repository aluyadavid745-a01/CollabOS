import React from 'react'
import { useNavigate } from 'react-router-dom'
import type { AuthMode, AuthUser } from './AuthPage'
import { formatUsd, pricingPlans } from '../data/businessModel'
import { trackAnalyticsEvent } from '../services/analytics'

interface LandingPageProps {
  rememberedUser?: AuthUser | null
  onNavigate: (view: AuthMode | 'home') => void
  onLogout: () => void
  onChangePassword: () => void
  onCustomizeProfile: () => void
}

const features = [
  ['01', 'Instant Messaging', 'Real-time team communication with threads, reactions, and rich media support, attached to the work it belongs to.'],
  ['02', 'Task Management', 'Organize work with smart lists, kanban boards, owners, deadlines, and automated workflows.'],
  ['03', 'Document Collaboration', 'Create, edit, and share documents with real-time collaboration and version history.'],
  ['04', 'Video Meetings', 'HD video conferencing with screen sharing, recording, and AI meeting recaps.'],
  ['05', 'AI Assistant', 'Workspace-native AI that creates projects, adds task sets, and summarizes what happened.'],
  ['06', 'Team Collaboration', 'Integrated team spaces, files, and calendars so context never leaves the workspace.'],
]

const comparisons = [
  ['Slack', 'Strong messaging, but work often lives elsewhere.'],
  ['Notion', 'Flexible documents, but team execution can become manual.'],
  ['Asana', 'Strong project tracking, but communication and files sit outside.'],
  ['ClickUp', 'Broad feature set, but can feel heavy for beginners.'],
  ['Microsoft Teams', 'Enterprise communication, but setup complexity for small teams.'],
]

const aiPrompts = [
  ['Create a marketing project for our new product.', 'Opens project creation with a clear structure.'],
  ['Add tasks for design, development and testing.', 'Creates practical task steps for the project.'],
  ['What do I need to finish today?', 'Summarizes due tasks and the next action.'],
  ['Summarize everything that happened in the website project this week.', 'Prepares a useful activity summary from workspace context.'],
]

const toolStack = ['Slack', 'Trello', 'Notion', 'Google Drive', 'Zoom', 'Email', 'Other tools']
const collabosStack = ['Projects', 'Tasks', 'Messages', 'Files', 'Calendar', 'Meetings', 'AI']

const site = {
  bg: '#171717',
  surface: '#202020',
  foreground: '#f4f4f5',
  muted: '#b4b4ba',
  subtle: '#85858d',
  border: '#3b3b3f',
  primary: '#67c7e8',
  secondary: '#2f2f32',
}

const LandingPage: React.FC<LandingPageProps> = ({ rememberedUser, onNavigate }) => {
  const navigate = useNavigate()

  const openSignup = (source: string) => {
    if (rememberedUser) {
      navigate('/home')
      return
    }

    trackAnalyticsEvent('signup_started', { source })
    onNavigate('signup')
  }

  const openDemo = (source: string) => {
    trackAnalyticsEvent('demo_requested', { source })
    document.getElementById('product-demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className="min-h-screen overflow-x-hidden text-[var(--site-foreground)]"
      style={{
        '--site-bg': site.bg,
        '--site-surface': site.surface,
        '--site-foreground': site.foreground,
        '--site-muted': site.muted,
        '--site-subtle': site.subtle,
        '--site-border': site.border,
        '--site-primary': site.primary,
        '--site-secondary': site.secondary,
        background: site.bg,
        fontFamily: '"Instrument Sans", ui-sans-serif, system-ui, sans-serif',
      } as React.CSSProperties}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .collab-site-mono { font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace; }
        .collab-grid-bg {
          background-image:
            linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(circle at 50% 18%, black 0%, transparent 68%);
        }
      `}</style>

      <nav className="sticky top-0 z-50 border-b border-[var(--site-border)] bg-[rgba(23,23,23,0.8)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <a href="/" className="text-xl font-bold tracking-tight text-[var(--site-primary)]">CollabOS</a>
            <div className="hidden gap-6 text-sm font-medium text-[var(--site-muted)] md:flex">
              <a href="#features" className="transition-colors hover:text-[var(--site-foreground)]">Features</a>
              <a href="#pricing" className="transition-colors hover:text-[var(--site-foreground)]">Pricing</a>
              <a href="#security" className="transition-colors hover:text-[var(--site-foreground)]">Security</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => rememberedUser ? navigate('/home') : onNavigate('signin')} className="text-sm font-medium text-[var(--site-muted)] transition-colors hover:text-[var(--site-foreground)]">
              Sign In
            </button>
            <button type="button" onClick={() => openSignup('site_nav')} className="rounded-full bg-[var(--site-foreground)] px-4 py-2 text-sm font-bold text-[var(--site-bg)] transition-colors hover:bg-[var(--site-primary)]">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative overflow-hidden pb-32 pt-24">
          <div className="collab-grid-bg absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div>
                <div className="collab-site-mono mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--site-border)] bg-[var(--site-surface)] px-3 py-1 text-xs text-[var(--site-primary)]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--site-primary)] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--site-primary)]" />
                  </span>
                  AI-powered work, in one workspace
                </div>
                <h1 className="mb-8 text-6xl font-bold leading-[0.9] tracking-tighter md:text-7xl">
                  The operating <br />system for <span className="text-[var(--site-primary)]">modern teams.</span>
                </h1>
                <p className="mb-10 max-w-lg text-lg leading-relaxed text-[var(--site-muted)]">
                  Projects, tasks, communication, files, meetings, and AI - all connected in one simple workspace, instead of scattered across seven tools.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button type="button" onClick={() => openSignup('site_hero')} className="rounded-xl bg-[var(--site-primary)] px-8 py-4 text-lg font-bold text-[var(--site-bg)] transition-transform hover:scale-105">
                    Get Started Free
                  </button>
                  <button type="button" onClick={() => openDemo('site_hero')} className="rounded-xl border border-[var(--site-border)] bg-[var(--site-surface)] px-8 py-4 text-lg font-bold transition-colors hover:bg-[var(--site-secondary)]">
                    Watch Demo
                  </button>
                </div>
              </div>

              <div id="product-demo" className="relative">
                <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] p-4 shadow-2xl shadow-black/45">
                  <img src="/dashboard-cockpit.jpg" alt="CollabOS workspace showing projects, kanban tasks, and team chat" width="1200" height="912" className="w-full rounded-lg outline outline-1 -outline-offset-1 outline-white/5" />
                </div>
                <div className="absolute -bottom-6 -left-6 hidden w-64 rounded-xl border border-[var(--site-border)] bg-[var(--site-bg)] p-4 shadow-xl shadow-black/35 sm:block">
                  <div className="collab-site-mono mb-2 text-xs text-[var(--site-primary)]">/ai create-launch-tasks</div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--site-secondary)]">
                    <div className="h-full w-2/3 bg-[var(--site-primary)]" />
                  </div>
                  <div className="mt-2 text-[10px] text-[var(--site-subtle)]">Adding design, development, and testing tasks...</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--site-border)] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 max-w-2xl">
              <span className="collab-site-mono text-xs uppercase tracking-[0.2em] text-[var(--site-subtle)]">The problem</span>
              <h2 className="mb-4 mt-4 text-3xl font-bold">Modern work is fragmented.</h2>
              <p className="text-[var(--site-muted)]">Teams switch between separate tools for communication, project management, files, meetings, documents, and AI. Work gets harder to follow because context is scattered.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--site-border)] p-8">
                <div className="collab-site-mono mb-6 text-xs uppercase tracking-widest text-[var(--site-subtle)]">Before CollabOS</div>
                <div className="flex flex-wrap gap-3">
                  {toolStack.map((tool) => <span key={tool} className="rounded-lg border border-dashed border-[var(--site-border)] px-4 py-2 text-sm text-[var(--site-subtle)]">{tool}</span>)}
                </div>
                <p className="mt-8 text-sm text-[var(--site-subtle)]">Each tool works, but the workflow does not feel connected.</p>
              </div>
              <div className="rounded-2xl border border-[rgba(103,199,232,0.4)] bg-[rgba(103,199,232,0.06)] p-8">
                <div className="collab-site-mono mb-6 text-xs uppercase tracking-widest text-[var(--site-primary)]">With CollabOS</div>
                <div className="flex flex-wrap gap-3">
                  {collabosStack.map((tool) => <span key={tool} className="rounded-lg border border-[rgba(103,199,232,0.3)] bg-[var(--site-bg)] px-4 py-2 text-sm text-[var(--site-foreground)]">{tool}</span>)}
                </div>
                <p className="mt-8 text-sm text-[var(--site-muted)]">One team. One workspace. One source of truth.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-[var(--site-border)] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16">
              <h2 className="mb-4 text-3xl font-bold">Engineered for focus.</h2>
              <p className="text-[var(--site-subtle)]">A team should know where the work lives, who owns it, and what happens next.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map(([number, title, body]) => (
                <div key={title} className="rounded-2xl border border-[var(--site-border)] bg-[rgba(32,32,32,0.5)] p-8 transition-colors hover:border-[rgba(103,199,232,0.5)]">
                  <div className="collab-site-mono mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[rgba(103,199,232,0.1)] text-xl font-bold text-[var(--site-primary)]">{number}</div>
                  <h3 className="mb-3 text-xl font-bold">{title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--site-muted)]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--site-border)] bg-[rgba(32,32,32,0.3)] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 max-w-2xl">
              <span className="collab-site-mono text-xs uppercase tracking-[0.2em] text-[var(--site-subtle)]">AI-native workspace</span>
              <h2 className="mb-4 mt-4 text-3xl font-bold">AI that operates the workspace, not just a chat box.</h2>
              <p className="text-[var(--site-muted)]">CollabOS AI creates project structures, adds useful task sets, summarizes priorities, and explains what happened using only the workspace data it is allowed to access.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {aiPrompts.map(([prompt, body]) => (
                <div key={prompt} className="rounded-xl border border-[var(--site-border)] bg-[var(--site-bg)] p-6">
                  <div className="collab-site-mono text-sm text-[var(--site-primary)]">&gt; {prompt}</div>
                  <p className="mt-3 text-sm text-[var(--site-muted)]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--site-border)] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 max-w-2xl">
              <span className="collab-site-mono text-xs uppercase tracking-[0.2em] text-[var(--site-subtle)]">Competitive positioning</span>
              <h2 className="mb-4 mt-4 text-3xl font-bold">A simpler, more connected alternative.</h2>
              <p className="text-[var(--site-muted)]">CollabOS does not claim to have no competitors. The wedge is a beginner-friendly workspace that connects communication, project execution, files, meetings, and AI.</p>
            </div>
            <div className="divide-y divide-[var(--site-border)] border-y border-[var(--site-border)]">
              {comparisons.map(([name, body]) => (
                <div key={name} className="flex flex-col gap-2 py-5 md:flex-row md:items-baseline md:gap-8">
                  <span className="collab-site-mono w-40 shrink-0 text-sm uppercase tracking-widest text-[var(--site-primary)]">{name}</span>
                  <span className="text-sm text-[var(--site-muted)]">{body}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="border-t border-[var(--site-border)] bg-[rgba(32,32,32,0.3)] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold">Transparent scale.</h2>
              <p className="text-[var(--site-subtle)]">From individuals to global organizations. Prices are launch configuration.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {pricingPlans.map((plan) => (
                <div key={plan.id} className={`relative flex flex-col rounded-xl p-6 ${plan.featured ? 'border-2 border-[var(--site-primary)] bg-[rgba(103,199,232,0.06)]' : 'border border-[var(--site-border)]'}`}>
                  {plan.featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-[var(--site-primary)] px-2 py-0.5 text-[10px] font-bold text-[var(--site-bg)]">POPULAR</span>}
                  <span className={`collab-site-mono mb-4 text-xs uppercase ${plan.featured ? 'text-[var(--site-primary)]' : 'text-[var(--site-subtle)]'}`}>{plan.name}</span>
                  <div className="mb-6 text-3xl font-bold">{plan.monthlyPriceUsd === null ? 'Custom' : formatUsd(plan.monthlyPriceUsd)}</div>
                  <ul className="mb-8 flex-grow space-y-3 text-xs text-[var(--site-muted)]">
                    <li>{plan.memberLimit ? `Up to ${plan.memberLimit} members` : 'Custom team limits'}</li>
                    <li>{plan.id === 'free' ? '3 projects' : 'Unlimited projects'}</li>
                    <li>{plan.storageGb ? `${plan.storageGb} GB storage` : 'Custom data controls'}</li>
                    <li className="text-[var(--site-primary)]">{plan.aiActionsPerMonth ? `${plan.aiActionsPerMonth.toLocaleString()} AI actions/month` : 'Custom AI usage'}</li>
                  </ul>
                  <button type="button" onClick={() => plan.monthlyPriceUsd === null ? window.location.href = 'mailto:sales@collabos.dev?subject=CollabOS%20Enterprise%20Plan' : openSignup(`site_pricing_${plan.id}`)} className={`w-full rounded-lg py-2 text-center text-xs font-bold ${plan.featured ? 'bg-[var(--site-primary)] text-[var(--site-bg)]' : 'border border-[var(--site-border)] hover:bg-[var(--site-secondary)]'}`}>
                    {plan.monthlyPriceUsd === null ? 'Contact Sales' : 'Get Started'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="border-t border-[var(--site-border)] py-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <span className="collab-site-mono text-xs uppercase tracking-[0.2em] text-[var(--site-subtle)]">Customer proof</span>
            <h2 className="mb-6 mt-4 text-3xl font-bold">Testimonials publish only when verified.</h2>
            <p className="text-[var(--site-muted)]">CollabOS will not show fake logos, fake ratings, fake growth, or invented customer quotes. Approved testimonials include a real person, company, job title, permission to publish, and a specific workflow result.</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {['Early access', 'Real data only', 'Verified proof'].map((item) => (
                <div key={item} className="collab-site-mono rounded-xl border border-[var(--site-border)] bg-[rgba(32,32,32,0.5)] py-4 text-xs uppercase tracking-widest text-[var(--site-subtle)]">{item}</div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--site-border)] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="rounded-3xl border border-[var(--site-border)] bg-[var(--site-surface)] p-12 text-center">
              <h2 className="mb-4 text-4xl font-bold tracking-tight">Start with one workspace.</h2>
              <p className="mx-auto mb-10 max-w-xl text-[var(--site-muted)]">Create a workspace, invite your team, create a project, assign a task, and see the value in minutes.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <button type="button" onClick={() => openSignup('site_cta')} className="rounded-xl bg-[var(--site-primary)] px-8 py-4 font-bold text-[var(--site-bg)] transition-transform hover:scale-105">
                  Get Started Free
                </button>
                <button type="button" onClick={() => window.location.href = 'mailto:sales@collabos.dev?subject=CollabOS%20demo%20request'} className="rounded-xl border border-[var(--site-border)] px-8 py-4 font-bold hover:bg-[var(--site-secondary)]">
                  Schedule a Demo
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--site-border)] py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 md:flex-row">
          <div className="text-xl font-bold text-[var(--site-primary)]">CollabOS</div>
          <div className="collab-site-mono flex flex-wrap justify-center gap-8 text-xs text-[var(--site-subtle)]">
            <a href="mailto:support@collabos.dev" className="hover:text-[var(--site-foreground)]">Support</a>
            <a href="mailto:security@collabos.dev" className="hover:text-[var(--site-foreground)]">Contact</a>
            <a href="#security" className="hover:text-[var(--site-foreground)]">Security</a>
            <a href="#pricing" className="hover:text-[var(--site-foreground)]">Pricing</a>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-[var(--site-subtle)]">© 2026 CollabOS Systems Inc.</div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
