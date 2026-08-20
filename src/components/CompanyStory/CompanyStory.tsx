import React from 'react'
import { Bot, CalendarDays, CheckCircle2, FileText, Folder, MessageSquare, Puzzle, Target, Users } from 'lucide-react'

const toolNames = ['Slack', 'Trello', 'Notion', 'Google Drive', 'Zoom', 'Email', 'Other tools']
const workspaceItems = [
  { label: 'Projects', icon: Folder },
  { label: 'Tasks', icon: CheckCircle2 },
  { label: 'Messages', icon: MessageSquare },
  { label: 'Files', icon: FileText },
  { label: 'Calendar', icon: CalendarDays },
  { label: 'Meetings', icon: Users },
  { label: 'AI', icon: Bot },
]

const CompanyStory: React.FC = () => {
  return (
    <>
      <section id="problem" className="border-t border-slate-200 bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wider text-slate-500">The problem</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">Modern work is fragmented.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Teams switch between separate tools for communication, project management, files, meetings, documents, and AI. Work gets harder to follow because context is scattered.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center gap-3">
                <Puzzle className="h-6 w-6 text-slate-500" />
                <h3 className="text-xl font-black">Before CollabOS</h3>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {toolNames.map((tool) => (
                  <span key={tool} className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm">
                    {tool}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-sm leading-6 text-slate-600">Each tool works, but the workflow does not feel connected.</p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
              <div className="flex items-center gap-3">
                <Target className="h-6 w-6 text-emerald-600" />
                <h3 className="text-xl font-black">With CollabOS</h3>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {workspaceItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <Icon className="h-5 w-5 text-slate-500" />
                      <span className="font-bold">{item.label}</span>
                    </div>
                  )
                })}
              </div>
              <p className="mt-5 text-lg font-black">One team. One workspace. One source of truth.</p>
            </article>
          </div>
        </div>
      </section>

      <section id="ai" className="border-t border-slate-200 bg-slate-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wider text-slate-500">AI workspace assistant</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">AI that operates the workspace, not just a chat box.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              CollabOS AI is designed to help users create projects, add tasks, understand today’s priorities, and summarize workspace activity where permissions allow it.
            </p>
          </div>
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
            {[
              ['Create a marketing project for our new product.', 'Opens project creation with a clear structure.'],
              ['Add tasks for design, development and testing.', 'Creates practical task steps for the project.'],
              ['What do I need to finish today?', 'Summarizes due tasks and the next action.'],
              ['Summarize everything that happened in the website project this week.', 'Prepares a useful activity summary from workspace context.'],
            ].map(([prompt, result]) => (
              <div key={prompt} className="border-b border-slate-200 py-4 last:border-b-0">
                <p className="font-black text-slate-950">"{prompt}"</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{result}</p>
              </div>
            ))}
          </article>
        </div>
      </section>

      <section id="positioning" className="border-t border-slate-200 bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-wider text-slate-500">Why now</p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">Teams want fewer disconnected tools.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Remote and hybrid work, rising SaaS costs, AI adoption, and productivity pressure are making simple connected workspaces more valuable.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {['Remote and hybrid teams', 'SaaS fragmentation', 'AI moving into daily work', 'Need for simpler operations'].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="font-black">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default CompanyStory
