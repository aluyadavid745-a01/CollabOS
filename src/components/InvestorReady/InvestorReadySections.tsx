import React from 'react'
import { Bot, CalendarClock, CheckCircle2, FileText, Folder, Lock, MessageSquare, ShieldCheck, Users } from 'lucide-react'
import { companyLinks } from '../../data/businessModel'

const card = 'rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70'

const InvestorReadySections: React.FC = () => {
  const fragmentedTools = ['Slack', 'Trello', 'Notion', 'Google Drive', 'Zoom', 'Email', 'Other tools']
  const collabosTools = [
    { label: 'Projects', icon: Folder },
    { label: 'Tasks', icon: CheckCircle2 },
    { label: 'Messages', icon: MessageSquare },
    { label: 'Files', icon: FileText },
    { label: 'Calendar', icon: CalendarClock },
    { label: 'Meetings', icon: Users },
    { label: 'AI', icon: Bot },
  ]
  const comparisons = [
    ['Slack', 'Strong messaging, but work often lives elsewhere.'],
    ['Notion', 'Flexible documents, but team execution can become manual.'],
    ['Asana', 'Strong project tracking, but communication and files often sit outside.'],
    ['ClickUp', 'Broad feature set, but can feel heavy for beginners.'],
    ['Microsoft Teams', 'Enterprise communication, but smaller teams can face setup complexity.'],
  ]
  const trustItems = [
    'Secure authentication foundation',
    'Admin-only analytics route',
    'Environment-variable protected secrets',
    'Privacy, terms, security, help, contact, and status routes',
    'No fake customers, logos, revenue, traction, awards, or testimonials',
  ]

  return (
    <>
      <section className="border-t border-slate-200 bg-white px-4 py-20 md:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-black uppercase tracking-wider text-slate-500">Before CollabOS</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-5xl">Team work is scattered across too many tools</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Communication, tasks, files, meetings, documents, and AI often sit in separate systems. That makes it harder to know what changed, who owns the work, and what happens next.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <article className={card}>
              <h3 className="text-xl font-black">Fragmented workflow</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {fragmentedTools.map((tool) => (
                  <div key={tool} className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                    {tool}
                  </div>
                ))}
              </div>
            </article>

            <article className={card}>
              <h3 className="text-xl font-black">With CollabOS</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {collabosTools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <div key={tool.label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
                      <Icon className="h-4 w-4 text-slate-500" />
                      {tool.label}
                    </div>
                  )
                })}
              </div>
              <p className="mt-5 rounded-lg bg-slate-950 px-4 py-3 text-center text-sm font-black text-white">One team. One workspace. One source of truth.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-4 py-20 md:px-8 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-wider text-slate-500">AI-native workspace</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-5xl">AI that operates the workspace</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              CollabOS AI is designed to create project structures, add useful task sets, summarize priorities, and explain what happened in a project using the workspace data it is allowed to access.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              'Create a marketing project for our new product.',
              'Add tasks for design, development and testing.',
              'What do I need to finish today?',
              'Summarize everything that happened in the website project this week.',
            ].map((prompt) => (
              <div key={prompt} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-bold text-slate-500">Workspace command</p>
                <p className="mt-2 font-black text-slate-950">"{prompt}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-4 py-20 md:px-8 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wider text-slate-500">Competitive positioning</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-5xl">A simpler, more connected alternative to fragmented team workflows</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">CollabOS does not claim to have no competitors. The wedge is a beginner-friendly workspace that connects communication, project execution, files, meetings, and AI.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-5">
            {comparisons.map(([name, body]) => (
              <article key={name} className={card}>
                <h3 className="text-lg font-black">{name}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 px-4 py-20 md:px-8 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <article className={card}>
            <h2 className="text-2xl font-black">Why now?</h2>
            <div className="mt-5 space-y-3">
              {['Remote and hybrid teams need clearer coordination.', 'SaaS fragmentation keeps increasing operating overhead.', 'AI is moving from passive chat toward useful workflow automation.', 'Businesses want fewer disconnected tools and faster onboarding.'].map((item) => (
                <p key={item} className="flex gap-3 text-sm font-bold leading-6 text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  {item}
                </p>
              ))}
            </div>
          </article>
          <article className={card}>
            <h2 className="text-2xl font-black">Trust and readiness</h2>
            <div className="mt-5 space-y-3">
              {trustItems.map((item) => (
                <p key={item} className="flex gap-3 text-sm font-bold leading-6 text-slate-700">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  {item}
                </p>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-sm font-black text-slate-700">
                <Lock className="h-4 w-4" />
                Contact
              </p>
              <p className="mt-2 text-sm text-slate-600">Support: {companyLinks.supportEmail}</p>
              <p className="text-sm text-slate-600">Security: {companyLinks.securityEmail}</p>
            </div>
          </article>
        </div>
      </section>
    </>
  )
}

export default InvestorReadySections
