import React from 'react'
import { ArrowRight, Bot, CalendarClock, CheckCircle2, FileText, Folder, MessageSquare, Plus, ShieldCheck, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import AppShell from '../components/AppShell'
import { useAuth } from '../context/AuthContext'
import { createDefaultProfile } from '../types/profile'
import { trackAnalyticsEvent } from '../services/analytics'
import { isAiApiConfigured, runAiCommand } from '../services/aiAssistant'
import { listStoredTeamWorkspaces } from '../services/teamChat'
import { buildAiLaunchPlanPreview, createAiLaunchPlan, type AiLaunchPlanPreview } from '../utils/investorDemo'
import { readLocalProjects } from '../utils/localProjects'
import { createLocalTask, readLocalTasks, writeLocalTasks } from '../utils/localTasks'
import { readLocalCalendarEvents, readLocalFiles, readLocalMessages, readLocalTeamMembers } from '../utils/localWorkspace'
import { readLocalActivity, recordLocalActivity } from '../utils/localActivity'
import { syncBeginnerWorkspaceToCloud } from '../utils/beginnerWorkspaceSync'
import { showToast } from '../utils/toast'
import { buildWorkflowInsight, type WorkflowInsight } from '../utils/workflowAssistant'

const panel = 'rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70'

const AiWorkspace: React.FC = () => {
  const navigate = useNavigate()
  const { firebaseUser, profile } = useAuth()
  const activeProfile = profile || createDefaultProfile({ name: 'CollabOS User', email: '' })
  const [prompt, setPrompt] = React.useState('Create a marketing project for our new product.')
  const [answer, setAnswer] = React.useState('Tell CollabOS AI what you want to do in the workspace.')
  const [providerStatus, setProviderStatus] = React.useState(isAiApiConfigured ? 'Backend ready. Sign in to use live AI.' : 'Local workflow mode. Set VITE_API_BASE_URL and OPENAI_API_KEY to enable live AI.')
  const [isRunning, setIsRunning] = React.useState(false)
  const [pendingAction, setPendingAction] = React.useState<{ title: string; detail: string } | null>(null)
  const [pendingPlan, setPendingPlan] = React.useState<AiLaunchPlanPreview | null>(null)
  const [pendingTasks, setPendingTasks] = React.useState<WorkflowInsight['draftTasks']>([])
  const [insight, setInsight] = React.useState<WorkflowInsight | null>(null)
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
  const files = React.useMemo(() => {
    void refreshKey
    return readLocalFiles()
  }, [refreshKey])
  const teamMembers = React.useMemo(() => {
    void refreshKey
    return readLocalTeamMembers()
  }, [refreshKey])
  const activity = React.useMemo(() => {
    void refreshKey
    return readLocalActivity()
  }, [refreshKey])

  const openTasks = tasks.filter((task) => !task.done)

  const workspaceId = React.useMemo(() => {
    void refreshKey
    return listStoredTeamWorkspaces()[0]?.id || `local-${activeProfile.uid || 'workspace'}`
  }, [activeProfile.uid, refreshKey])

  const buildWorkspaceContext = () =>
    JSON.stringify({
      profile: { name: activeProfile.name, email: activeProfile.email },
      projects: projects.slice(0, 8),
      tasks: tasks.slice(0, 20),
      messages: messages.slice(0, 12),
      events: events.slice(0, 12),
      files: files.slice(0, 12),
      teamMembers: teamMembers.slice(0, 12),
      activity: activity.slice(0, 12),
    })

  const requestedToolsForIntent = (nextInsight: WorkflowInsight) => {
    if (nextInsight.intent === 'plan') return ['create_project', 'create_task', 'create_meeting', 'search_workspace']
    if (nextInsight.intent === 'triage') return ['get_project_status', 'get_team_workload', 'search_workspace']
    if (nextInsight.intent === 'summary') return ['get_project_status', 'search_workspace', 'search_files']
    if (nextInsight.intent === 'blockers') return ['update_task', 'assign_task', 'search_workspace']
    if (nextInsight.intent === 'meeting') return ['create_meeting', 'search_workspace']
    if (nextInsight.intent === 'files') return ['search_files', 'search_workspace']
    if (nextInsight.intent === 'team') return ['get_team_workload', 'assign_task']
    return ['search_workspace']
  }

  const addGeneratedTasks = (draftTasks: WorkflowInsight['draftTasks']) => {
    const generated = draftTasks.map((task) =>
      createLocalTask({
        title: task.title,
        owner: task.owner,
        priority: task.priority,
        projectId: task.projectId,
      })
    )

    if (!writeLocalTasks([...generated, ...readLocalTasks()])) {
      showToast({ message: "We couldn't save the generated tasks.", type: 'error' })
      return
    }

    recordLocalActivity({ type: 'ai', title: 'AI tasks created', detail: generated.map((task) => task.title).join(', '), route: '/tasks' })
    void syncBeginnerWorkspaceToCloud()
    setRefreshKey((value) => value + 1)
    setPendingTasks([])
    setAnswer(`Created ${generated.length} reviewed task${generated.length === 1 ? '' : 's'} from the workflow assistant.`)
    showToast({ message: `${generated.length} AI task${generated.length === 1 ? '' : 's'} created`, type: 'success' })
  }

  const runPrompt = async () => {
    const cleanPrompt = prompt.trim()
    if (!cleanPrompt) {
      showToast({ message: 'Ask CollabOS AI what to do first.', type: 'warning' })
      return
    }

    trackAnalyticsEvent('ai_action_used', { source: 'ai_workspace' })
    const lower = cleanPrompt.toLowerCase()
    const nextInsight = buildWorkflowInsight(cleanPrompt, activeProfile.name, {
      projects,
      tasks,
      messages,
      events,
      files,
      teamMembers,
      activity,
    })
    setInsight(nextInsight)
    setPendingAction(null)
    setPendingPlan(null)
    setPendingTasks([])
    setIsRunning(true)

    try {
      if (isAiApiConfigured && firebaseUser) {
        const token = await firebaseUser.getIdToken()
        const response = await runAiCommand({
          prompt: cleanPrompt,
          workspaceId,
          workspaceContext: buildWorkspaceContext(),
          requestedTools: requestedToolsForIntent(nextInsight),
          authToken: token,
        })
        const cleanMessage = response.message.replace(/\n?PROPOSED_ACTION:\s*\{[\s\S]*$/i, '').trim()
        setAnswer(cleanMessage || response.message)
        setProviderStatus(response.status === 'ok' ? `Live AI connected (${response.model || 'configured model'}).` : response.message)

        if (response.proposedAction?.requiresApproval) {
          setPendingAction({
            title: response.proposedAction.toolName.replace(/_/g, ' '),
            detail: response.proposedAction.summary,
          })
        }
      } else if (isAiApiConfigured && !firebaseUser) {
        setProviderStatus('Sign in with Firebase to use the live AI backend. Local workflow mode is active.')
      } else {
        setProviderStatus('Local workflow mode. Set VITE_API_BASE_URL in the app and OPENAI_API_KEY on the API server to enable live AI.')
      }
    } catch (error) {
      setProviderStatus(error instanceof Error ? error.message : 'Live AI request failed. Local workflow mode is active.')
    } finally {
      setIsRunning(false)
    }

    if (lower.includes('create') && lower.includes('project')) {
      const plan = buildAiLaunchPlanPreview(cleanPrompt, activeProfile.name)
      setPendingPlan(plan)
      setAnswer(`I prepared "${plan.projectName}" for review. Approve it before CollabOS creates the project, tasks, kickoff meeting, file, and team update.`)
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

    if (nextInsight.draftTasks.length > 0 && (lower.includes('add tasks') || lower.includes('create tasks') || lower.includes('blocker') || lower.includes('meeting') || lower.includes('file') || lower.includes('team'))) {
      setPendingTasks(nextInsight.draftTasks)
      setAnswer(`${nextInsight.answer} I prepared ${nextInsight.draftTasks.length} task${nextInsight.draftTasks.length === 1 ? '' : 's'} for review before CollabOS writes anything.`)
      return
    }

    if (nextInsight.intent !== 'unknown') {
      setAnswer(nextInsight.answer)
      return
    }

    setAnswer(nextInsight.answer)
  }

  const confirmPendingAction = () => {
    if (!pendingAction) return
    recordLocalActivity({ type: 'ai', title: 'AI action confirmed', detail: pendingAction.title, route: '/ai' })
    setAnswer(`${pendingAction.title} confirmed. In production, this action should be checked against workspace permissions server-side.`)
    setPendingAction(null)
  }

  const approvePlan = () => {
    if (!pendingPlan) return
    const project = createAiLaunchPlan(prompt, activeProfile.name)
    setRefreshKey((value) => value + 1)
    setPendingPlan(null)
    setAnswer(`Created "${project.name}" after your approval. Review the project, tasks, kickoff meeting, file, and team update before assigning work to others.`)
    showToast({ message: `Project plan approved: ${project.name}`, type: 'success' })
  }

  const approvePendingTasks = () => {
    if (!pendingTasks.length) return
    addGeneratedTasks(pendingTasks)
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wider text-blue-700">COLLABOS AUTOPILOT</p>
            <h1 className="mt-1 text-3xl font-black sm:text-4xl">Tell CollabOS what needs to happen.</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Autopilot reads your projects, tasks, messages, calendar, files, team, and activity so it can explain the workflow and prepare changes for approval.</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">{providerStatus}</p>
          </div>
          <Button type="button" onClick={() => navigate('/projects')} className="gap-2">
            <Folder className="h-4 w-4" />
            Open projects
          </Button>
        </header>

        <section className={`${panel} mb-5 p-5`}>
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-700 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <label className="text-sm font-black uppercase tracking-wider text-slate-500" htmlFor="ai-command">Workspace command</label>
              <textarea
                id="ai-command"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  'Create a marketing project for our new product.',
                  'Add tasks for design, development and testing.',
                  'What do I need to finish today?',
                  'Summarize everything that happened in the latest project this week.',
                  'What blockers are slowing us down?',
                  'Prepare a kickoff meeting workflow.',
                ].map((example) => (
                  <button key={example} type="button" onClick={() => setPrompt(example)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700">
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="button" onClick={() => void runPrompt()} disabled={isRunning} className="gap-2">
              <Plus className="h-4 w-4" />
              {isRunning ? 'Thinking...' : 'Run command'}
            </Button>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <article className={`${panel} p-5`}>
            <h2 className="text-xl font-black">AI response</h2>
            <p className="mt-3 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">{answer}</p>
            {insight && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-blue-700">Intent</p>
                  <p className="mt-1 text-sm font-bold capitalize text-slate-950">{insight.intent === 'unknown' ? 'Workflow help' : insight.intent}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500">Workflow reading</p>
                  <p className="mt-1 text-sm font-bold text-slate-950">{insight.title}</p>
                </div>
              </div>
            )}
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
            {pendingPlan && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-black uppercase tracking-wider text-blue-700">Review before execution</p>
                <h3 className="mt-1 text-lg font-black text-slate-950">{pendingPlan.projectName}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{pendingPlan.description}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-blue-100 bg-white p-3">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">Milestones</p>
                    <ul className="mt-2 space-y-1 text-sm font-semibold text-slate-700">
                      {pendingPlan.milestones.map((milestone) => <li key={milestone}>{milestone}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-white p-3">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-500">Tasks</p>
                    <ul className="mt-2 space-y-1 text-sm font-semibold text-slate-700">
                      {pendingPlan.tasks.map((task) => <li key={task.title}>{task.title} - {task.owner}</li>)}
                    </ul>
                  </div>
                </div>
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setPendingPlan(null)}>Cancel</Button>
                  <Button type="button" size="sm" onClick={approvePlan}>Approve and create</Button>
                </div>
              </div>
            )}
            {pendingTasks.length > 0 && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-black uppercase tracking-wider text-blue-700">Review generated tasks</p>
                <div className="mt-3 grid gap-2">
                  {pendingTasks.map((task) => (
                    <div key={`${task.title}-${task.owner}`} className="rounded-lg border border-blue-100 bg-white p-3">
                      <p className="font-bold text-slate-950">{task.title}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{task.owner} - {task.priority}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button type="button" variant="secondary" size="sm" onClick={() => setPendingTasks([])}>Cancel</Button>
                  <Button type="button" size="sm" onClick={approvePendingTasks}>Approve tasks</Button>
                </div>
              </div>
            )}
            {insight && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-500">Next places to act</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {insight.nextSteps.map((step) => (
                    <button key={`${step.label}-${step.route}`} type="button" onClick={() => navigate(step.route)} className="inline-flex min-h-[36px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-700">
                      {step.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ))}
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
                { label: 'Files', value: files.length, icon: FileText },
                { label: 'Team', value: teamMembers.length, icon: Users },
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
            {insight && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-700" />
                  <p className="text-sm font-black text-slate-950">Context used</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {insight.contextUsed.map((item) => (
                    <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600">{item}</span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </section>
      </div>
    </AppShell>
  )
}

export default AiWorkspace
