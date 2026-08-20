import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Bell,
  Bot,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  FileText,
  Folder,
  Globe2,
  HelpCircle,
  Home,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import { useAuth } from '../context/AuthContext'
import { listHomeNotifications, markHomeNotificationRead } from '../services/homeNotifications'
import { createLocalWorkspace, listLocalMessages, listStoredTeamWorkspaces } from '../services/teamChat'
import { createDefaultProfile, type UserProfile } from '../types/profile'
import { showToast } from '../utils/toast'
import { createWebsiteProjectInstant, listCachedWebsiteProjects } from '../utils/websiteBuilderStorage'
import type { HomeNotification, HomeTask } from '../types/home'

type QuickCreateType = 'task' | 'project' | 'channel' | 'team' | 'document' | 'meeting'

interface LocalTask {
  id: string
  title: string
  owner: string
  dueAt: string
  priority: 'Low' | 'Medium' | 'High'
  description: string
  done: boolean
  createdAt: string
}

const LOCAL_TASKS_KEY = 'collabos:beginnerTasks'
const ONBOARDING_KEY = 'collabos:onboardingDismissed'

const panel = 'rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70'
const iconButton = 'grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2'

const readLocalTasks = () => {
  if (typeof window === 'undefined') return []

  try {
    const value = window.localStorage.getItem(LOCAL_TASKS_KEY)
    return value ? (JSON.parse(value) as LocalTask[]) : []
  } catch {
    return []
  }
}

const writeLocalTasks = (tasks: LocalTask[]) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(tasks))
  } catch {
    showToast({ message: "We couldn't save your task. Please try again.", type: 'error' })
  }
}

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
      const nextTask: LocalTask = {
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
        title: cleanName,
        owner: owner.trim() || profile.name,
        dueAt: new Date(dueAt).toISOString(),
        priority,
        description: description.trim(),
        done: false,
        createdAt: new Date().toISOString(),
      }
      writeLocalTasks([nextTask, ...readLocalTasks()])
      showToast({ message: 'Task created successfully', type: 'success' })
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
      onCreated()
      onClose()
      return
    }

    if (type === 'project' || type === 'document') {
      const project = createWebsiteProjectInstant(profile.uid)
      showToast({ message: type === 'project' ? 'Project created' : 'Document created', type: 'success' })
      onCreated()
      navigate(type === 'project' ? `/builder/${project.id}` : '/dashboard/websites')
      return
    }

    showToast({ message: type === 'meeting' ? 'Meeting setup opened' : 'Channel setup opened', type: 'success' })
    navigate(type === 'meeting' ? '/meetings' : '/workspace')
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
  const { profile } = useAuth()
  const activeProfile = React.useMemo(() => getActiveProfile(profile), [profile])
  const [query, setQuery] = React.useState('')
  const [refreshKey, setRefreshKey] = React.useState(0)
  const [createType, setCreateType] = React.useState<QuickCreateType | null>(null)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [isHelpOpen, setIsHelpOpen] = React.useState(false)
  const [aiPrompt, setAiPrompt] = React.useState('What do I need to finish today?')
  const [aiAnswer, setAiAnswer] = React.useState('')
  const [onboardingDismissed, setOnboardingDismissed] = React.useState(() => typeof window !== 'undefined' && window.localStorage.getItem(ONBOARDING_KEY) === '1')

  const workspaces = React.useMemo(() => {
    void refreshKey
    return listStoredTeamWorkspaces()
  }, [refreshKey])
  const websites = React.useMemo(() => {
    void refreshKey
    return listCachedWebsiteProjects()
  }, [refreshKey])
  const localTasks = React.useMemo(() => {
    void refreshKey
    return readLocalTasks()
  }, [refreshKey])
  const notifications = React.useMemo(() => {
    void refreshKey
    return listHomeNotifications(profile)
  }, [profile, refreshKey])
  const activeWorkspace = workspaces[0]
  const recentMessages = React.useMemo(() => {
    void refreshKey
    if (!activeWorkspace) return []
    return activeWorkspace.channels
      .flatMap((channel) =>
        listLocalMessages(activeWorkspace, channel.id).map((message) => ({
          ...message,
          channelName: channel.name,
        }))
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 3)
  }, [activeWorkspace, refreshKey])

  const workspaceTasks: HomeTask[] = React.useMemo(() => workspaces.flatMap((workspace) =>
    workspace.projects.map((project, index) => ({
      id: `${workspace.id}-${project.id}`,
      title: project.name,
      owner: project.owner,
      status: project.status,
      dueAt: new Date(Date.now() + (index + 1) * 86400000).toISOString(),
      route: '/workspace',
    }))
  ), [workspaces])

  const taskCards = [
    ...localTasks.map((task) => ({
      id: task.id,
      title: task.title,
      owner: task.owner,
      status: task.done ? 'Done' : task.priority === 'High' ? 'Review' : 'In Progress',
      dueAt: task.dueAt,
      route: '/home',
    } satisfies HomeTask)),
    ...workspaceTasks,
  ].slice(0, 6)

  const todayTasks = taskCards.filter((task) => task.status !== 'Done' && dueToday(task.dueAt))
  const nextTask = todayTasks[0] || taskCards.find((task) => task.status !== 'Done')
  const upcomingMeetings = notifications.filter((item) => item.type === 'meeting').length

  const onboardingItems = [
    { label: 'Create your team space', done: workspaces.length > 0, action: () => openCreate('team') },
    { label: 'Invite your team', done: Boolean(activeWorkspace?.invites.length), action: () => navigate('/workspace') },
    { label: 'Create your first project', done: websites.length > 0 || workspaceTasks.length > 0, action: () => openCreate('project') },
    { label: 'Create your first task', done: localTasks.length > 0 || workspaceTasks.length > 0, action: () => openCreate('task') },
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
    const prompt = aiPrompt.toLowerCase()
    if (prompt.includes('create') && prompt.includes('project')) {
      openCreate('project')
      setAiAnswer('I opened project creation. Add the project name, team members, and deadline, then create it.')
      return
    }
    if (prompt.includes('task')) {
      openCreate('task')
      setAiAnswer('I opened task creation with the simplest fields first: name, owner, due date, priority, and description.')
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
    writeLocalTasks(updated)
    setRefreshKey((value) => value + 1)
    showToast({ message: 'Task completed', type: 'success' })
  }

  const primaryLinks = [
    { label: 'Home', icon: Home, route: '/home', active: true },
    { label: 'My Tasks', icon: CheckSquare, route: '/home' },
    { label: 'Projects', icon: Folder, route: '/dashboard/websites' },
    { label: 'Messages', icon: MessageSquare, route: '/workspace' },
    { label: 'Team', icon: Users, route: '/workspace' },
    { label: 'Calendar', icon: CalendarClock, route: '/meetings' },
    { label: 'Files', icon: FileText, route: '/dashboard/websites' },
  ]

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white px-4 py-5 lg:block">
          <button type="button" onClick={() => navigate('/home')} className="mb-6 flex items-center gap-3 rounded-xl px-2 py-2 text-left">
            <img src="/lll.png" alt="" className="h-9 w-9 rounded-lg object-cover" />
            <span className="text-xl font-black">CollabOS</span>
          </button>
          <nav className="space-y-1" aria-label="Main navigation">
            {primaryLinks.map((item) => {
              const Icon = item.icon
              return (
                <button key={item.label} type="button" onClick={() => navigate(item.route)} className={`flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${item.active ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'}`}>
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              )
            })}
          </nav>
          <div className="mt-6 border-t border-slate-200 pt-4">
            {[
              { label: 'Settings', icon: Settings, route: '/profile/edit' },
              { label: 'Help', icon: HelpCircle, route: 'help' },
              { label: 'Integrations', icon: Globe2, route: '/dashboard/websites' },
              { label: 'Advanced features', icon: Sparkles, route: '/gift-cards' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <button key={item.label} type="button" onClick={() => item.route === 'help' ? setIsHelpOpen(true) : navigate(item.route)} className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-8">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black sm:text-4xl">{greeting()}, {activeProfile.name.split(' ')[0] || 'there'}</h1>
              <p className="mt-2 text-slate-600">Here is what is happening today.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => navigate('/notifications')} className={iconButton} aria-label="Notifications" title="See updates from your team">
                <Bell className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => setIsHelpOpen(true)} className={iconButton} aria-label="Help" title="Search help and tutorials">
                <HelpCircle className="h-5 w-5" />
              </button>
              <div className="relative">
                <Button type="button" onClick={() => openCreate('task')} className="min-h-[44px] gap-2">
                  <Plus className="h-5 w-5" />
                  Create
                </Button>
              </div>
            </div>
          </header>

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

          <section className="mb-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
            <article className={`${panel} p-5`}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-wider text-slate-500">Your next task</p>
                  <h2 className="mt-1 text-2xl font-black">{nextTask?.title || 'Create your first task'}</h2>
                  <p className="mt-2 text-slate-600">
                    {nextTask ? `${nextTask.owner} is responsible. Due ${new Date(nextTask.dueAt).toLocaleDateString()}.` : 'Tasks help everyone know what to do next.'}
                  </p>
                </div>
                <Button type="button" onClick={() => nextTask ? navigate(nextTask.route) : openCreate('task')} className="min-h-[44px] gap-2">
                  {nextTask ? 'Open task' : 'Create your first task'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </article>

            <article className={`${panel} p-5`}>
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-950 text-white">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-black">Ask CollabOS AI</h2>
                  <p className="mt-1 text-sm text-slate-600">Ask for your priorities or tell it to create a task or project.</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <input value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10" aria-label="Ask CollabOS AI" />
                <Button type="button" onClick={askAi}>Ask</Button>
              </div>
              {aiAnswer && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">{aiAnswer}</p>}
            </article>
          </section>

          <section className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              { label: 'Tasks due today', value: todayTasks.length, action: () => openCreate('task') },
              { label: 'Active projects', value: workspaceTasks.length + websites.length, action: () => navigate('/dashboard/websites') },
              { label: 'New messages', value: recentMessages.length, action: () => navigate('/workspace') },
              { label: 'Upcoming meetings', value: upcomingMeetings, action: () => navigate('/meetings') },
              { label: 'Recent team activity', value: notifications.length, action: () => navigate('/notifications') },
            ].map((item) => (
              <button key={item.label} type="button" onClick={item.action} className={`${panel} min-h-[110px] p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md`}>
                <p className="text-3xl font-black">{item.value}</p>
                <p className="mt-2 text-sm font-bold text-slate-600">{item.label}</p>
              </button>
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-3">
            <article className={`${panel} p-5`}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black">My Tasks</h2>
                <button type="button" onClick={() => openCreate('task')} className={iconButton} aria-label="Create task" title="Create a task">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                {taskCards.length ? taskCards.map((task) => (
                  <div key={task.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <button type="button" onClick={() => navigate(task.route)} className="text-left font-bold hover:text-slate-700">{task.title}</button>
                      {localTasks.some((item) => item.id === task.id) && (
                        <button type="button" onClick={() => dismissTask(task.id)} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-emerald-100 hover:text-emerald-700">Done</button>
                      )}
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-500">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {task.owner} - due {new Date(task.dueAt).toLocaleDateString()}
                    </p>
                  </div>
                )) : (
                  <div className="rounded-lg border border-dashed border-slate-300 p-5">
                    <h3 className="font-black">No tasks yet</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Tasks help you track who is doing what and when it is due.</p>
                    <Button type="button" size="sm" onClick={() => openCreate('task')} className="mt-4 gap-2"><Plus className="h-4 w-4" />Create your first task</Button>
                  </div>
                )}
              </div>
            </article>

            <article className={`${panel} p-5`}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black">Projects</h2>
                <button type="button" onClick={() => openCreate('project')} className={iconButton} aria-label="Create project" title="Create a project">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-3">
                {[...workspaceTasks.slice(0, 2), ...websites.slice(0, 2).map((website) => ({
                  id: website.id,
                  title: website.name,
                  owner: activeProfile.name,
                  status: website.status === 'published' ? 'Done' : 'In Progress',
                  dueAt: website.updatedAt,
                  route: '/dashboard/websites',
                } satisfies HomeTask))].slice(0, 4).map((project) => (
                  <button key={project.id} type="button" onClick={() => navigate(project.route)} className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:bg-slate-50">
                    <p className="font-bold">{project.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{project.status}</p>
                  </button>
                ))}
                {!workspaceTasks.length && !websites.length && (
                  <div className="rounded-lg border border-dashed border-slate-300 p-5">
                    <h3 className="font-black">No projects yet</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Projects help you organize work like a website redesign, marketing campaign, mobile app, or company launch.</p>
                    <Button type="button" size="sm" onClick={() => openCreate('project')} className="mt-4 gap-2"><Plus className="h-4 w-4" />Create your first project</Button>
                  </div>
                )}
              </div>
            </article>

            <article className={`${panel} p-5`}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black">Messages and Updates</h2>
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
                    <Button type="button" size="sm" variant="secondary" onClick={() => navigate('/workspace')} className="mt-4">Open messages</Button>
                  </div>
                )}
              </div>
            </article>
          </section>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-2 pb-2 pt-2 shadow-2xl shadow-slate-900/10 lg:hidden" aria-label="Mobile navigation">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {[
            { label: 'Home', icon: Home, action: () => navigate('/home') },
            { label: 'Tasks', icon: CheckSquare, action: () => openCreate('task') },
            { label: 'Create', icon: Plus, action: () => openCreate('task'), primary: true },
            { label: 'Messages', icon: MessageSquare, action: () => navigate('/workspace') },
            { label: 'Profile', icon: Users, action: () => navigate('/profile') },
          ].map((item) => {
            const Icon = item.icon
            return (
              <button key={item.label} type="button" onClick={item.action} className={`flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold ${item.primary ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`} aria-label={item.label}>
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>

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
    </main>
  )
}

export default HomeDashboard
