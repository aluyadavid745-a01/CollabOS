import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Bell,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  Plus,
  Search,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { Button } from '../components/Common/Button'
import { useAuth } from '../context/AuthContext'
import { listHomeNotifications, markHomeNotificationRead } from '../services/homeNotifications'
import { createLocalWorkspace, listStoredTeamWorkspaces } from '../services/teamChat'
import { createDefaultProfile, type UserProfile } from '../types/profile'
import { createLocalProject, readLocalProjects, writeLocalProjects } from '../utils/localProjects'
import { createLocalTask, readLocalTasks, writeLocalTasks, type LocalTask } from '../utils/localTasks'
import { readLocalCalendarEvents, readLocalFiles, readLocalMessages, readLocalTeamMembers } from '../utils/localWorkspace'
import { readLocalActivity, recordLocalActivity } from '../utils/localActivity'
import { loadSampleWorkspace } from '../utils/investorDemo'
import { loadBeginnerWorkspaceFromCloud, syncBeginnerWorkspaceToCloud } from '../utils/beginnerWorkspaceSync'
import { showToast } from '../utils/toast'
import { trackAnalyticsEvent } from '../services/analytics'
import type { HomeNotification, HomeTask } from '../types/home'

type QuickCreateType = 'task' | 'project' | 'channel' | 'team' | 'document' | 'meeting'

const ONBOARDING_KEY = 'collabos:onboardingDismissed'

const panel = 'rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60'
const iconButton = 'grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2'

const startOfToday = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

const dueToday = (dueAt: string) => new Date(dueAt).getTime() <= startOfToday().getTime() + 86400000

const greeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const getActiveProfile = (profile: UserProfile | null | undefined) =>
  profile || createDefaultProfile({ name: 'CollabOS User', email: '' })

const QuickCreateModal = ({
  initialType,
  profile,
  onClose,
  onCreated,
}: {
  initialType: QuickCreateType
  profile: UserProfile
  onClose: () => void
  onCreated: () => void
}) => {
  const navigate = useNavigate()
  const [type, setType] = React.useState<QuickCreateType>(initialType)
  const [name, setName] = React.useState(type === 'task' ? 'Review project plan' : type === 'team' ? `${profile.name.split(' ')[0] || 'My'} team space` : 'Website redesign')
  const [owner, setOwner] = React.useState(profile.name)
  const [dueAt, setDueAt] = React.useState(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10))
  const [priority, setPriority] = React.useState<LocalTask['priority']>('Medium')
  const [description, setDescription] = React.useState('')
  const [showMore, setShowMore] = React.useState(false)

  React.useEffect(() => {
    setName(type === 'task' ? 'Review project plan' : type === 'team' ? `${profile.name.split(' ')[0] || 'My'} team space` : type === 'meeting' ? 'Team check-in' : 'Website redesign')
  }, [profile.name, type])

  const createItem = () => {
    const cleanName = name.trim()
    if (!cleanName) {
      showToast({ message: 'Add a name before creating.', type: 'warning' })
      return
    }

    if (type === 'task') {
      const nextTask = createLocalTask({
        title: cleanName,
        owner: owner.trim() || profile.name,
        dueAt,
        priority,
        description,
      })
      if (!writeLocalTasks([nextTask, ...readLocalTasks()])) {
        showToast({ message: "We couldn't save your task. Please try again.", type: 'error' })
        return
      }
      showToast({ message: 'Task created successfully', type: 'success' })
      recordLocalActivity({ type: 'task', title: 'Task created', detail: nextTask.title, route: '/tasks' })
      trackAnalyticsEvent('first_task_created', { source: 'quick_create' })
      void syncBeginnerWorkspaceToCloud()
      onCreated()
      onClose()
      return
    }

    if (type === 'team') {
      createLocalWorkspace(profile, {
        name: cleanName,
        description: description.trim() || 'This is where you and your team will work together.',
        category: 'Team',
        privacy: 'InviteOnly',
        theme: 'Light',
        defaultLanguage: 'English',
      })
      showToast({ message: 'Team space created', type: 'success' })
      recordLocalActivity({ type: 'team', title: 'Team space created', detail: cleanName, route: '/team' })
      trackAnalyticsEvent('workspace_created', { source: 'quick_create' })
      void syncBeginnerWorkspaceToCloud()
      onCreated()
      onClose()
      return
    }

    if (type === 'project') {
      const project = createLocalProject({
        name: cleanName,
        description,
        members: owner,
        deadline: dueAt,
      })
      if (!writeLocalProjects([project, ...readLocalProjects()])) {
        showToast({ message: "We couldn't save your project. Please try again.", type: 'error' })
        return
      }
      showToast({ message: 'Project created', type: 'success' })
      recordLocalActivity({ type: 'project', title: 'Project created', detail: project.name, route: '/projects' })
      trackAnalyticsEvent('first_project_created', { source: 'quick_create' })
      void syncBeginnerWorkspaceToCloud()
      onCreated()
      navigate('/projects')
      return
    }

    if (type === 'document') {
      showToast({ message: 'Document setup opened', type: 'success' })
      navigate('/files')
      return
    }

    showToast({ message: type === 'meeting' ? 'Meeting setup opened' : 'Channel setup opened', type: 'success' })
    navigate(type === 'meeting' ? '/calendar' : '/messages')
  }

  const title = type === 'task' ? 'Create a task' : type === 'team' ? 'Create your team space' : type === 'meeting' ? 'Create a meeting' : type === 'channel' ? 'Create a channel' : type === 'document' ? 'Create a document' : 'Create a project'

  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/30 px-3 py-3 sm:place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.form
        onSubmit={(event) => {
          event.preventDefault()
          createItem()
        }}
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 text-slate-950 shadow-2xl shadow-slate-900/20"
        initial={{ y: 20, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 20, scale: 0.98 }}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">Keep it simple now. You can add more details later.</p>
          </div>
          <button type="button" onClick={onClose} className={iconButton} aria-label="Close create window">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2">
          {[
            ['task', 'Task'],
            ['project', 'Project'],
            ['team', 'Team'],
            ['document', 'Document'],
            ['meeting', 'Meeting'],
            ['channel', 'Channel'],
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setType(value as QuickCreateType)} className={`min-h-[44px] rounded-lg border px-3 py-2 text-sm font-bold transition ${type === value ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
              {label}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="text-sm font-bold text-slate-700">{type === 'team' ? 'Team space name' : type === 'task' ? 'Task name' : 'Name'}</span>
          <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" />
        </label>

        {type === 'task' && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Person responsible</span>
              <input value={owner} onChange={(event) => setOwner(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Due date</span>
              <input type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-bold text-slate-700">Priority</span>
              <select value={priority} onChange={(event) => setPriority(event.target.value as LocalTask['priority'])} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
          </div>
        )}

        {type === 'project' && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Team members</span>
              <input value={owner} onChange={(event) => setOwner(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" placeholder="Sarah, David, Alex" />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Deadline</span>
              <input type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" />
            </label>
          </div>
        )}

        <button type="button" onClick={() => setShowMore((current) => !current)} className="mt-4 flex min-h-[44px] items-center gap-2 text-sm font-bold text-slate-700">
          <ChevronDown className={`h-4 w-4 transition ${showMore ? 'rotate-180' : ''}`} />
          More options
        </button>

        {showMore && (
          <label className="mt-2 block">
            <span className="text-sm font-bold text-slate-700">Description</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" />
          </label>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{type === 'task' ? 'Create Task' : type === 'project' ? 'Create Project' : 'Create'}</Button>
        </div>
      </motion.form>
    </motion.div>
  )
}

const HomeDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { firebaseUser, profile } = useAuth()
  const activeProfile = React.useMemo(() => getActiveProfile(profile), [profile])
  const [query, setQuery] = React.useState('')
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [createType, setCreateType] = React.useState<QuickCreateType | null>(null)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isHelpOpen, setIsHelpOpen] = React.useState(false)
  const [aiPrompt, setAiPrompt] = React.useState('What do I need to finish today?')
  const [aiAnswer, setAiAnswer] = React.useState('')
  const [newTaskTitle, setNewTaskTitle] = React.useState('')
  const [onboardingDismissed, setOnboardingDismissed] = React.useState(() => typeof window !== 'undefined' && window.localStorage.getItem(ONBOARDING_KEY) === '1')

  React.useEffect(() => {
    if (!firebaseUser) return

    let cancelled = false
    const loadCloudState = async () => {
      const loaded = await loadBeginnerWorkspaceFromCloud()
      if (!cancelled && loaded) setRefreshKey((value) => value + 1)
    }

    void loadCloudState()
    return () => {
      cancelled = true
    }
  }, [firebaseUser])

  const workspaces = React.useMemo(() => {
    void refreshKey
    return listStoredTeamWorkspaces()
  }, [refreshKey])
  const projects = React.useMemo(() => {
    void refreshKey
    return readLocalProjects()
  }, [refreshKey])
  const teamMembers = React.useMemo(() => {
    void refreshKey
    return readLocalTeamMembers()
  }, [refreshKey])
  const calendarEvents = React.useMemo(() => {
    void refreshKey
    return readLocalCalendarEvents()
  }, [refreshKey])
  const files = React.useMemo(() => {
    void refreshKey
    return readLocalFiles()
  }, [refreshKey])
  const activity = React.useMemo(() => {
    void refreshKey
    return readLocalActivity()
  }, [refreshKey])
  const localTasks = React.useMemo(() => {
    void refreshKey
    return readLocalTasks()
  }, [refreshKey])
  const notifications = React.useMemo(() => {
    void refreshKey
    return listHomeNotifications(profile)
  }, [profile, refreshKey])
  const recentMessages = React.useMemo(() => {
    void refreshKey
    return readLocalMessages()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 3)
  }, [refreshKey])

  const taskCards = [
    ...localTasks.map((task) => ({
      id: task.id,
      title: task.title,
      owner: task.owner,
      status: task.done ? 'Done' : task.priority === 'High' ? 'Review' : 'In Progress',
      dueAt: task.dueAt,
      route: '/home',
    } satisfies HomeTask)),
  ].slice(0, 6)

  const todayTasks = taskCards.filter((task) => task.status !== 'Done' && dueToday(task.dueAt))
  const nextTask = todayTasks[0] || taskCards.find((task) => task.status !== 'Done')
  const upcomingMeetings = calendarEvents.length

  const onboardingItems = [
    { label: 'Create your team space', done: workspaces.length > 0, action: () => openCreate('team') },
    { label: 'Invite your team', done: teamMembers.length > 0, action: () => navigate('/team') },
    { label: 'Create your first project', done: projects.length > 0, action: () => navigate('/projects') },
    { label: 'Create your first task', done: localTasks.length > 0, action: () => openCreate('task') },
  ]
  const completedOnboarding = onboardingItems.filter((item) => item.done).length
  const onboardingProgress = Math.round((completedOnboarding / onboardingItems.length) * 100)

  const filteredNotifications = notifications.filter((item) => {
    const haystack = `${item.title} ${item.body} ${item.source}`.toLowerCase()
    return haystack.includes(query.toLowerCase())
  })

  function openCreate(type: QuickCreateType) {
    setCreateType(type)
    setIsCreateOpen(true)
  }

  const closeOnboarding = () => {
    setOnboardingDismissed(true)
    window.localStorage.setItem(ONBOARDING_KEY, '1')
    showToast({ message: 'Onboarding saved for later', type: 'success' })
  }

  const openNotification = (notification: HomeNotification) => {
    markHomeNotificationRead(notification.id)
    setRefreshKey((value) => value + 1)
    navigate(notification.route)
  }

  const askAi = () => {
    trackAnalyticsEvent('ai_action_used', { source: 'home_dashboard' })
    const prompt = aiPrompt.toLowerCase()
    if (prompt.includes('create') && prompt.includes('project')) {
      openCreate('project')
      setAiAnswer('I opened project creation. Add the project name, people involved, and deadline, then create it.')
      return
    }
    if (prompt.includes('message')) {
      navigate('/messages')
      setAiAnswer('I opened Messages so you can send a clear team update.')
      return
    }
    if (prompt.includes('team') || prompt.includes('invite')) {
      navigate('/team')
      setAiAnswer('I opened Team so you can add or invite people.')
      return
    }
    if (prompt.includes('meeting') || prompt.includes('calendar')) {
      navigate('/calendar')
      setAiAnswer('I opened Calendar so you can schedule a meeting.')
      return
    }
    if (prompt.includes('file') || prompt.includes('document')) {
      navigate('/files')
      setAiAnswer('I opened Files so you can save important documents.')
      return
    }
    if (prompt.includes('task')) {
      navigate('/tasks')
      setAiAnswer('I opened My Tasks so you can add tasks for later like a simple to-do list.')
      return
    }
    setAiAnswer(
      nextTask
        ? `Start with "${nextTask.title}". It is assigned to ${nextTask.owner} and is due ${new Date(nextTask.dueAt).toLocaleDateString()}.`
        : 'You are clear today. A good next step is to create your first task or invite your team.'
    )
  }

  const dismissTask = (taskId: string) => {
    const updated = readLocalTasks().map((task) => task.id === taskId ? { ...task, done: true } : task)
    if (!writeLocalTasks(updated)) {
      showToast({ message: "We couldn't save your task. Please try again.", type: 'error' })
      return
    }
    setRefreshKey((value) => value + 1)
    showToast({ message: 'Task completed', type: 'success' })
    recordLocalActivity({ type: 'task', title: 'Task completed', detail: updated.find((task) => task.id === taskId)?.title || 'Task', route: '/tasks' })
    void syncBeginnerWorkspaceToCloud()
  }

  const addTodoTask = () => {
    const title = newTaskTitle.trim()
    if (!title) {
      showToast({ message: 'Type a task first.', type: 'warning' })
      return
    }

    const task = createLocalTask({
      title,
      owner: activeProfile.name,
    })

    if (!writeLocalTasks([task, ...readLocalTasks()])) {
      showToast({ message: "We couldn't save your task. Please try again.", type: 'error' })
      return
    }
    setNewTaskTitle('')
    setRefreshKey((value) => value + 1)
    showToast({ message: 'Task added', type: 'success' })
    recordLocalActivity({ type: 'task', title: 'Task added', detail: task.title, route: '/tasks' })
    trackAnalyticsEvent('first_task_created', { source: 'dashboard_todo' })
    void syncBeginnerWorkspaceToCloud()
  }

  const loadDemo = () => {
    const project = loadSampleWorkspace(activeProfile.name)
    setRefreshKey((value) => value + 1)
    showToast({ message: `${project.name} loaded`, type: 'success' })
    void syncBeginnerWorkspaceToCloud()
  }

  const activeProjects = projects.filter((project) => project.status !== 'Done')
  const completedTasks = localTasks.filter((task) => task.done).length
  const taskCompletion = localTasks.length ? Math.round((completedTasks / localTasks.length) * 100) : 0
  const statCards = [
    { label: 'Open tasks', value: localTasks.filter((task) => !task.done).length, detail: `${todayTasks.length} due today`, icon: CheckCircle2, route: '/tasks' },
    { label: 'Your focus', value: `${taskCompletion}%`, detail: localTasks.length ? `${completedTasks} of ${localTasks.length} complete` : 'No tasks yet', icon: CalendarClock, route: '/tasks' },
    { label: 'Team activity', value: activity.length, detail: `${teamMembers.length} teammates`, icon: Bell, route: '/notifications' },
    { label: 'Next milestone', value: activeProjects.length, detail: projects.length ? 'Active projects' : 'Create a project', icon: ArrowRight, route: '/projects' },
  ]
  const projectPulse = activeProjects.slice(0, 3).map((project, index) => {
    const linkedTasks = localTasks.filter((task) => task.projectId === project.id)
    const progress = linkedTasks.length
      ? Math.round((linkedTasks.filter((task) => task.done).length / linkedTasks.length) * 100)
      : project.status === 'Done'
        ? 100
        : [78, 54, 32][index] || 20
    return { ...project, progress, color: ['bg-rose-400', 'bg-blue-500', 'bg-violet-400'][index] || 'bg-emerald-400' }
  })

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px]">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mb-2 text-sm font-medium text-blue-700">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <h1 className="text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">{greeting()}, {activeProfile.name.split(' ')[0] || 'there'}<span className="text-blue-700">.</span></h1>
              <p className="mt-2 text-sm text-slate-500">Here&apos;s what&apos;s moving across your workspace.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setIsHelpOpen(true)} className={iconButton} aria-label="Help" title="Search help and tutorials">
                <HelpCircle className="h-5 w-5" />
              </button>
              <Button type="button" onClick={() => openCreate('task')} className="min-h-[40px] gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium">
                <Plus className="h-4 w-4" />
                New task
              </Button>
              <Button type="button" variant="secondary" onClick={loadDemo} className="min-h-[40px] rounded-lg px-3 text-sm">
                Load Sample Workspace
              </Button>
            </div>
          </header>

          <section className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((item) => {
              const Icon = item.icon
              return (
                <button key={item.label} type="button" onClick={() => navigate(item.route)} className={`${panel} p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">{item.label}</span>
                    <Icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tracking-tight">{item.value}</span>
                    <span className="text-xs text-slate-500">{item.detail}</span>
                  </div>
                </button>
              )
            })}
          </section>

          {!onboardingDismissed && (
            <section className={`${panel} mb-5 overflow-hidden`}>
              <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-wider text-slate-500">Welcome to CollabOS</p>
                  <h2 className="mt-1 text-2xl font-black">Let's get your workspace ready.</h2>
                  <p className="mt-2 text-slate-600">This will only take a few minutes, and you can skip it anytime.</p>
                </div>
                <div className="min-w-[220px]">
                  <p className="text-sm font-bold text-slate-700">{completedOnboarding} of 4 completed - {onboardingProgress}%</p>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-slate-950 transition-all duration-500" style={{ width: `${onboardingProgress}%` }} />
                  </div>
                </div>
              </div>
              <div className="grid border-t border-slate-200 md:grid-cols-4">
                {onboardingItems.map((item) => (
                  <button key={item.label} type="button" onClick={item.action} className="flex min-h-[72px] items-center gap-3 border-b border-slate-200 px-5 py-4 text-left transition hover:bg-slate-50 md:border-b-0 md:border-r md:last:border-r-0">
                    <CheckCircle2 className={`h-5 w-5 ${item.done ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span className="text-sm font-bold">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-end border-t border-slate-200 px-5 py-3">
                <button type="button" onClick={closeOnboarding} className="min-h-[44px] text-sm font-bold text-slate-600 hover:text-slate-950">Skip for now</button>
              </div>
            </section>
          )}

          <section className="mb-5 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
            <article className={`${panel} p-5`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Your work</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">{nextTask?.title || 'Create your first task'}</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {nextTask ? `${nextTask.owner} is responsible. Due ${new Date(nextTask.dueAt).toLocaleDateString()}.` : 'Tasks help everyone know what to do next.'}
                  </p>
                </div>
                <Button type="button" onClick={() => navigate('/tasks')} className="min-h-[40px] gap-2 rounded-lg bg-slate-950 px-4 text-sm font-medium">
                  {nextTask ? 'Open task' : 'Create your first task'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </article>

            <article className={`${panel} p-5`}>
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold tracking-tight">AI Insights</h2>
                  <p className="mt-1 text-xs text-slate-500">Ask for priorities, blockers, summaries, or workspace actions.</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <input value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" aria-label="Ask CollabOS AI" />
                <Button type="button" onClick={askAi}>Ask</Button>
              </div>
              {aiAnswer && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">{aiAnswer}</p>}
              <button type="button" onClick={() => navigate('/ai')} className="mt-3 text-sm font-bold text-slate-700 hover:text-slate-950">
                Open AI workspace assistant
              </button>
            </article>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.7fr_0.9fr]">
            <article className={`${panel} overflow-hidden`}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="px-5 pt-5 text-lg font-semibold tracking-tight">Your work</h2>
                  <p className="mt-1 px-5 text-sm text-slate-500">Tasks that need your attention.</p>
                </div>
                <button type="button" onClick={() => navigate('/tasks')} className={`${iconButton} mr-5 mt-5`} aria-label="Open My Tasks" title="Open My Tasks">
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
              <div className="mx-5 mb-4 flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                <input
                  value={newTaskTitle}
                  onChange={(event) => setNewTaskTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addTodoTask()
                    }
                  }}
                  className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-transparent bg-white px-3 text-sm font-semibold outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10"
                  placeholder="Add a task for later, like Call Sarah"
                  aria-label="Add a task"
                />
                <Button type="button" onClick={addTodoTask} className="min-h-[44px] shrink-0 gap-2">
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              <div className="hidden grid-cols-[minmax(0,1.8fr)_1fr_130px_100px] gap-4 border-y border-slate-200 bg-slate-50/80 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 md:grid">
                <span>Task</span>
                <span>Status</span>
                <span>Due</span>
                <span>Priority</span>
              </div>
              <div>
                {taskCards.length ? taskCards.map((task) => (
                  <div key={task.id} className="grid gap-3 border-b border-slate-200 px-4 py-4 last:border-0 md:grid-cols-[minmax(0,1.8fr)_1fr_130px_100px] md:items-center md:gap-4 md:px-5">
                    <div className="flex min-w-0 items-start gap-3">
                      <button type="button" onClick={() => dismissTask(task.id)} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${task.status === 'Done' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 hover:border-slate-950'}`} aria-label={`Mark ${task.title} complete`}>
                        {task.status === 'Done' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                      <button type="button" onClick={() => navigate(task.route)} className={`min-w-0 text-left text-sm font-medium hover:text-slate-700 ${task.status === 'Done' ? 'text-slate-500 line-through' : 'text-slate-950'}`}>{task.title}</button>
                    </div>
                    <div><span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${task.status === 'Review' ? 'bg-violet-50 text-violet-700' : task.status === 'Done' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{task.status}</span></div>
                    <p className="text-xs text-slate-500">{new Date(task.dueAt).toLocaleDateString()}</p>
                    <p className="text-xs font-medium text-slate-500">{localTasks.find((item) => item.id === task.id)?.priority || 'Medium'}</p>
                  </div>
                )) : (
                  <div className="m-5 rounded-lg border border-dashed border-slate-300 p-5">
                    <h3 className="font-black">No tasks yet</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Type your first to-do above, then press Add.</p>
                  </div>
                )}
              </div>
            </article>

            <article className={`${panel} p-5`}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold tracking-tight">Project pulse</h2>
                <button type="button" onClick={() => openCreate('project')} className={iconButton} aria-label="Create project" title="Create a project">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                {projectPulse.map((project) => (
                  <button key={project.id} type="button" onClick={() => navigate('/projects')} className="w-full text-left">
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="font-medium">{project.name}</span>
                      <span className="text-slate-500">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${project.color}`} style={{ width: `${project.progress}%` }} />
                    </div>
                  </button>
                ))}
                {!projects.length && (
                  <div className="rounded-lg border border-dashed border-slate-300 p-5">
                    <h3 className="font-black">No projects yet</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Projects help you organize work like a website redesign, marketing campaign, mobile app, or company launch.</p>
                    <Button type="button" size="sm" onClick={() => navigate('/projects')} className="mt-4 gap-2"><Plus className="h-4 w-4" />Create your first project</Button>
                  </div>
                )}
              </div>
            </article>

            <article className={`${panel} p-5`}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold tracking-tight">Important Messages</h2>
                <button type="button" onClick={() => navigate('/notifications')} className="text-sm font-bold text-slate-700 hover:text-slate-950">View all</button>
              </div>
              <div className="mb-4 flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-200 px-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 text-sm outline-none" placeholder="Search updates" aria-label="Search updates" />
              </div>
              <div className="space-y-3">
                {filteredNotifications.slice(0, 3).map((item) => (
                  <button key={item.id} type="button" onClick={() => openNotification(item)} className={`w-full rounded-lg border p-3 text-left transition ${item.read ? 'border-slate-200 bg-white hover:bg-slate-50' : 'border-slate-950 bg-slate-50'}`}>
                    <p className="font-bold">{item.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{item.body}</p>
                  </button>
                ))}
                {!filteredNotifications.length && (
                  <div className="rounded-lg border border-dashed border-slate-300 p-5">
                    <h3 className="font-black">No messages yet</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Messages are where your team shares updates and decisions.</p>
                    <Button type="button" size="sm" variant="secondary" onClick={() => navigate('/messages')} className="mt-4">Open messages</Button>
                  </div>
                )}
              </div>
            </article>
          </section>

          <section className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <article className={`${panel} p-5`}>
              <div className="mb-4">
                <h2 className="font-semibold tracking-tight">Workspace totals</h2>
                <p className="mt-1 text-xs text-slate-500">Live counts from your saved workspace.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Messages', value: recentMessages.length, route: '/messages' },
                  { label: 'Meetings', value: upcomingMeetings, route: '/calendar' },
                  { label: 'Files', value: files.length, route: '/files' },
                ].map((item) => (
                  <button key={item.label} type="button" onClick={() => navigate(item.route)} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-left hover:bg-white">
                    <p className="text-2xl font-semibold">{item.value}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">{item.label}</p>
                  </button>
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-slate-900 bg-slate-950 p-5 text-white shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold tracking-tight">Team activity</h2>
                  <p className="mt-1 text-xs text-white/55">Real updates from your workspace.</p>
                </div>
                <Button type="button" variant="secondary" size="sm" onClick={loadDemo} className="border-white/10 bg-white/10 text-white hover:bg-white/15">Load sample</Button>
              </div>
              <div className="space-y-4">
                {activity.slice(0, 4).map((item) => (
                  <button key={item.id} type="button" onClick={() => navigate(item.route)} className="flex w-full items-center gap-3 text-left">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[9px] font-semibold">{item.type.slice(0, 2).toUpperCase()}</span>
                    <span className="min-w-0 flex-1 text-xs">
                      <strong>{item.title}</strong>
                      <span className="ml-1 text-white/50">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="mt-1 block truncate text-white/65">{item.detail}</span>
                    </span>
                  </button>
                ))}
                {!activity.length && (
                  <div className="rounded-lg border border-white/10 p-5">
                    <h3 className="font-semibold">No activity yet</h3>
                    <p className="mt-2 text-sm leading-6 text-white/60">Create a task, project, message, meeting, file, or team member and it will appear here.</p>
                  </div>
                )}
              </div>
            </article>
          </section>
      </div>

      <AnimatePresence>
        {isCreateOpen && createType && (
          <QuickCreateModal
            initialType={createType}
            profile={activeProfile}
            onClose={() => setIsCreateOpen(false)}
            onCreated={() => setRefreshKey((value) => value + 1)}
          />
        )}
        {isHelpOpen && (
          <motion.div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/30 px-3 py-3 sm:place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/20" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }}>
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black">Help</h2>
                  <p className="mt-1 text-sm text-slate-600">Find answers or ask for help.</p>
                </div>
                <button type="button" onClick={() => setIsHelpOpen(false)} className={iconButton} aria-label="Close help">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {['Search Help', 'Quick Tutorial', 'Getting Started', 'Ask CollabOS AI', 'Contact Support'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    if (item === 'Ask CollabOS AI') {
                      setIsHelpOpen(false)
                      return
                    }
                    if (item === 'Getting Started') {
                      window.localStorage.removeItem(ONBOARDING_KEY)
                      setOnboardingDismissed(false)
                      setIsHelpOpen(false)
                      showToast({ message: 'Getting started checklist restored', type: 'success' })
                      return
                    }
                    showToast({ message: `${item} opened`, type: 'info' })
                  }}
                  className="flex min-h-[48px] w-full items-center justify-between rounded-lg px-3 text-left font-bold text-slate-700 hover:bg-slate-50"
                >
                  {item}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}

export default HomeDashboard
