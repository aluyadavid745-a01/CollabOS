import React from 'react'
import { ArrowLeft, Bot, CalendarClock, CheckCircle2, FileText, Folder, MessageSquare, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import { useAuth } from '../context/AuthContext'
import { createDefaultProfile } from '../types/profile'
import { trackAnalyticsEvent } from '../services/analytics'
import { createAiLaunchPlan } from '../utils/investorDemo'
import { readLocalProjects } from '../utils/localProjects'
import { createLocalTask, readLocalTasks, writeLocalTasks } from '../utils/localTasks'
import { readLocalCalendarEvents, readLocalMessages } from '../utils/localWorkspace'
import { recordLocalActivity } from '../utils/localActivity'
import { syncBeginnerWorkspaceToCloud } from '../utils/beginnerWorkspaceSync'
import { showToast } from '../utils/toast'

const panel = 'rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70'

const AiWorkspace: React.FC = () => {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const activeProfile = profile || createDefaultProfile({ name: 'CollabOS User', email: '' })
  const [prompt, setPrompt] = React.useState('Create a marketing project for our new product.')
  const [answer, setAnswer] = React.useState('Tell CollabOS AI what you want to do in the workspace.')
  const [refreshKey, setRefreshKey] = React.useState(0)

  const projects = React.useMemo(() => {
    void refreshKey
    return readLocalProjects()
  }, [refreshKey])
  const tasks = React.useMemo(() => {
    void refreshKey
    return readLocalTasks()
  }, [refreshKey])
  const messages = React.useMemo(() => {
    void refreshKey
    return readLocalMessages()
  }, [refreshKey])
  const events = React.useMemo(() => {
    void refreshKey
    return readLocalCalendarEvents()
  }, [refreshKey])

  const today = new Date().toISOString().slice(0, 10)
  const openTasks = tasks.filter((task) => !task.done)
  const dueToday = openTasks.filter((task) => task.dueAt <= today)

  const addGeneratedTasks = () => {
    const project = projects[0]
    const generated = ['Design scope', 'Development plan', 'Testing checklist'].map((title, index) =>
      createLocalTask({
        title,
        owner: activeProfile.name,
        priority: index === 0 ? 'High' : 'Medium',
        projectId: project?.id,
      })
    )

    if (!writeLocalTasks([...generated, ...readLocalTasks()])) {
      showToast({ message: "We couldn't save the generated tasks.", type: 'error' })
      return
    }

    recordLocalActivity({ type: 'ai', title: 'AI tasks created', detail: generated.map((task) => task.title).join(', '), route: '/tasks' })
    void syncBeginnerWorkspaceToCloud()
    setRefreshKey((value) => value + 1)
    setAnswer(`Created ${generated.length} tasks${project ? ` for ${project.name}` : ''}: design, development, and testing.`)
  }

  const runPrompt = () => {
    const cleanPrompt = prompt.trim()
    if (!cleanPrompt) {
      showToast({ message: 'Ask CollabOS AI what to do first.', type: 'warning' })
      return
    }

    trackAnalyticsEvent('ai_action_used', { source: 'ai_workspace' })
    const lower = cleanPrompt.toLowerCase()

    if (lower.includes('create') && lower.includes('project')) {
      const project = createAiLaunchPlan(cleanPrompt, activeProfile.name)
      setRefreshKey((value) => value + 1)
      setAnswer(`Created "${project.name}" with tasks, a kickoff meeting, a file, and a team update.`)
      return
    }

    if (lower.includes('add tasks') || lower.includes('design') || lower.includes('development') || lower.includes('testing')) {
      addGeneratedTasks()
      return
    }

    if (lower.includes('finish today') || lower.includes('priorit')) {
      setAnswer(
        dueToday.length
          ? `Focus on ${dueToday.slice(0, 3).map((task) => `"${task.title}"`).join(', ')} today.`
          : openTasks.length
            ? `Nothing is due today. Your next open task is "${openTasks[0].title}".`
            : 'You have no open tasks. Create one task or ask AI to create a project plan.'
      )
      return
    }

    if (lower.includes('summarize')) {
      const latestProject = projects[0]
      setAnswer(
        latestProject
          ? `${latestProject.name}: ${tasks.filter((task) => task.projectId === latestProject.id).length} task(s), ${messages.length} recent message(s), and ${events.length} upcoming calendar item(s).`
          : 'There is no project activity to summarize yet. Create a project first.'
      )
      return
    }

    setAnswer('I can create project plans, add task sets, summarize workspace activity, or list what needs attention today.')
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button type="button" onClick={() => navigate('/home')} className="mb-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg text-sm font-bold text-slate-600 hover:text-slate-950">
              <ArrowLeft className="h-4 w-4" />
              Home
            </button>
            <h1 className="text-3xl font-black sm:text-4xl">AI Workspace Assistant</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Ask AI to operate your workspace, not just chat. It can create project plans, add task sets, and summarize real workspace activity.</p>
          </div>
          <Button type="button" onClick={() => navigate('/projects')} className="gap-2">
            <Folder className="h-4 w-4" />
            Open projects
          </Button>
        </header>

        <section className={`${panel} mb-5 p-5`}>
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-950 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <label className="text-sm font-black uppercase tracking-wider text-slate-500" htmlFor="ai-command">Workspace command</label>
              <textarea
                id="ai-command"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  'Create a marketing project for our new product.',
                  'Add tasks for design, development and testing.',
                  'What do I need to finish today?',
                  'Summarize everything that happened in the latest project this week.',
                ].map((example) => (
                  <button key={example} type="button" onClick={() => setPrompt(example)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white">
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="button" onClick={runPrompt} className="gap-2">
              <Plus className="h-4 w-4" />
              Run command
            </Button>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <article className={`${panel} p-5`}>
            <h2 className="text-xl font-black">AI response</h2>
            <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">{answer}</p>
            <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-500">Actions use the current workspace and local/cloud sync foundations. Production LLM permissions should be enforced server-side.</p>
          </article>

          <article className={`${panel} p-5`}>
            <h2 className="text-xl font-black">Workspace context</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { label: 'Projects', value: projects.length, icon: Folder },
                { label: 'Open tasks', value: openTasks.length, icon: CheckCircle2 },
                { label: 'Messages', value: messages.length, icon: MessageSquare },
                { label: 'Meetings', value: events.length, icon: CalendarClock },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <Icon className="h-5 w-5 text-slate-500" />
                    <p className="mt-3 text-2xl font-black">{item.value}</p>
                    <p className="text-sm font-bold text-slate-600">{item.label}</p>
                  </div>
                )
              })}
            </div>
            <Button type="button" variant="secondary" onClick={() => navigate('/files')} className="mt-4 gap-2">
              <FileText className="h-4 w-4" />
              Open files
            </Button>
          </article>
        </section>
      </div>
    </main>
  )
}

export default AiWorkspace
