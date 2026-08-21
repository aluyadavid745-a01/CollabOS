import React from 'react'
import { Bot, CalendarClock, CheckCircle2, FileText, Folder, MessageSquare, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import AppShell from '../components/AppShell'
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
  const [pendingAction, setPendingAction] = React.useState<{ title: string; detail: string } | null>(null)
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
      setPendingAction(null)
      setAnswer(`Created "${project.name}" with tasks, a kickoff meeting, a file, and a team update.`)
      return
    }

    if (lower.includes('move') && lower.includes('deadline')) {
      const project = projects[0]
      setPendingAction({
        title: project ? `Move ${project.name} deadline` : 'Move project deadline',
        detail: project ? `I've prepared this change for ${project.name}. Confirm before CollabOS changes a deadline.` : 'Create a project first, then Autopilot can prepare deadline changes.',
      })
      setAnswer("I've prepared this change. Important timeline changes require confirmation.")
      return
    }

    if (lower.includes('delete') || lower.includes('remove permanently')) {
      setPendingAction({
        title: 'Destructive action blocked',
        detail: 'Autopilot will never delete workspace data without an explicit confirmation screen and permission check.',
      })
      setAnswer('This is a destructive request. Review it carefully before taking action.')
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

  const confirmPendingAction = () => {
    if (!pendingAction) return
    recordLocalActivity({ type: 'ai', title: 'AI action confirmed', detail: pendingAction.title, route: '/ai' })
    setAnswer(`${pendingAction.title} confirmed. In production, this action should be checked against workspace permissions server-side.`)
    setPendingAction(null)
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wider text-blue-700">COLLABOS AUTOPILOT</p>
            <h1 className="mt-1 text-3xl font-black sm:text-4xl">Tell CollabOS what needs to happen.</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Autopilot understands your workspace and helps you act: create projects, summarize work, find blockers, and prepare task changes with confirmation.</p>
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
            {pendingAction && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-black text-amber-900">I've prepared this change.</p>
                <h3 className="mt-1 font-black text-slate-950">{pendingAction.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{pendingAction.detail}</p>
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setPendingAction(null)}>Cancel</Button>
                  <Button type="button" size="sm" onClick={confirmPendingAction}>Confirm</Button>
                </div>
              </div>
            )}
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
    </AppShell>
  )
}

export default AiWorkspace
