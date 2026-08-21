import React from 'react'
import {
  Bell,
  Bot,
  CalendarClock,
  CheckSquare,
  FileText,
  Folder,
  HelpCircle,
  Home,
  LogOut,
  MessageSquare,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  User,
  Users,
  X,
} from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Button } from './Common/Button'
import { Field, focusRing, surface } from './DesignSystem'
import { useAuth } from '../context/AuthContext'
import { createDefaultProfile } from '../types/profile'
import { createLocalProject, readLocalProjects, writeLocalProjects } from '../utils/localProjects'
import { createLocalTask, readLocalTasks, writeLocalTasks, type LocalTask } from '../utils/localTasks'
import { readLocalCalendarEvents, readLocalFiles, readLocalMessages, readLocalTeamMembers } from '../utils/localWorkspace'
import { recordLocalActivity } from '../utils/localActivity'
import { syncBeginnerWorkspaceToCloud } from '../utils/beginnerWorkspaceSync'
import { showToast } from '../utils/toast'

type QuickCreateType = 'task' | 'project'

const primaryLinks = [
  { label: 'Home', path: '/home', icon: Home },
  { label: 'My Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Projects', path: '/projects', icon: Folder },
  { label: 'Messages', path: '/messages', icon: MessageSquare },
  { label: 'Team', path: '/team', icon: Users },
  { label: 'Calendar', path: '/calendar', icon: CalendarClock },
  { label: 'Files', path: '/files', icon: FileText },
  { label: 'AI Autopilot', path: '/ai', icon: Bot },
]

const secondaryLinks = [
  { label: 'Help', path: '/help', icon: HelpCircle },
  { label: 'Settings', path: '/settings', icon: Settings },
]

const mobileLinks = [
  { label: 'Home', path: '/home', icon: Home },
  { label: 'Tasks', path: '/tasks', icon: CheckSquare },
  { label: 'Messages', path: '/messages', icon: MessageSquare },
  { label: 'Profile', path: '/profile', icon: User },
]

const inputClass = `min-h-[46px] w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10`

const SearchDialog = ({ onClose }: { onClose: () => void }) => {
  const navigate = useNavigate()
  const [query, setQuery] = React.useState('')
  const results = React.useMemo(() => {
    const cleanQuery = query.trim().toLowerCase()
    if (!cleanQuery) return []

    const items = [
      ...readLocalProjects().map((item) => ({ type: 'Project', title: item.name, detail: item.description || item.status, path: '/projects' })),
      ...readLocalTasks().map((item) => ({ type: 'Task', title: item.title, detail: `${item.owner} - ${item.priority}`, path: '/tasks' })),
      ...readLocalMessages().map((item) => ({ type: 'Message', title: item.sender, detail: item.text, path: '/messages' })),
      ...readLocalFiles().map((item) => ({ type: 'File', title: item.name, detail: item.type, path: '/files' })),
      ...readLocalTeamMembers().map((item) => ({ type: 'Person', title: item.name, detail: item.role, path: '/team' })),
      ...readLocalCalendarEvents().map((item) => ({ type: 'Meeting', title: item.title, detail: item.date, path: '/calendar' })),
    ]

    return items.filter((item) => `${item.type} ${item.title} ${item.detail}`.toLowerCase().includes(cleanQuery)).slice(0, 8)
  }, [query])

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30 p-3">
      <div className="mx-auto mt-16 max-w-2xl rounded-xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/20">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-h-[52px] min-w-0 flex-1 outline-none"
            placeholder="Search projects, tasks, messages, files, people, meetings"
            aria-label="Search CollabOS"
          />
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close search">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {results.map((item) => (
            <button
              key={`${item.type}-${item.title}-${item.detail}`}
              type="button"
              onClick={() => {
                navigate(item.path)
                onClose()
              }}
              className="w-full rounded-lg border border-slate-200 p-3 text-left transition hover:bg-slate-50"
            >
              <p className="text-xs font-black uppercase tracking-wider text-blue-700">{item.type}</p>
              <p className="mt-1 font-bold text-slate-950">{item.title}</p>
              <p className="mt-1 line-clamp-1 text-sm text-slate-600">{item.detail}</p>
            </button>
          ))}
          {query && !results.length && (
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
              <p className="font-black text-slate-950">No results found</p>
              <p className="mt-1 text-sm text-slate-600">Try a project name, task, teammate, file, or meeting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const QuickCreateDialog = ({ onClose }: { onClose: () => void }) => {
  const { profile } = useAuth()
  const activeProfile = profile || createDefaultProfile({ name: 'CollabOS User', email: '' })
  const [type, setType] = React.useState<QuickCreateType>('task')
  const [title, setTitle] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [owner, setOwner] = React.useState(activeProfile.name)
  const [dueAt, setDueAt] = React.useState('')
  const [priority, setPriority] = React.useState<LocalTask['priority']>('Medium')

  const createItem = () => {
    const cleanTitle = title.trim()
    if (!cleanTitle) {
      showToast({ message: type === 'task' ? 'Add a task name before creating.' : 'Add a project name before creating.', type: 'warning' })
      return
    }

    if (type === 'task') {
      const task = createLocalTask({ title: cleanTitle, description, owner, dueAt: dueAt || undefined, priority })
      if (!writeLocalTasks([task, ...readLocalTasks()])) {
        showToast({ message: "We couldn't save your task. Please try again.", type: 'error' })
        return
      }
      recordLocalActivity({ type: 'task', title: 'Task created', detail: `${task.title} assigned to ${task.owner}`, route: '/tasks' })
      showToast({ message: `Task created successfully: ${task.title}`, type: 'success' })
    } else {
      const project = createLocalProject({ name: cleanTitle, description, members: owner, deadline: dueAt || undefined })
      if (!writeLocalProjects([project, ...readLocalProjects()])) {
        showToast({ message: "We couldn't save your project. Please try again.", type: 'error' })
        return
      }
      recordLocalActivity({ type: 'project', title: 'Project created', detail: project.name, route: '/projects' })
      showToast({ message: `Project created successfully: ${project.name}`, type: 'success' })
    }

    void syncBeginnerWorkspaceToCloud()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/30 p-3 sm:place-items-center">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          createItem()
        }}
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/20"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Quick create</h2>
            <p className="mt-1 text-sm text-slate-600">Create work with clear ownership, status, and next steps.</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Close quick create">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-5 grid grid-cols-2 gap-2">
          {(['task', 'project'] as QuickCreateType[]).map((item) => (
            <button key={item} type="button" onClick={() => setType(item)} className={`min-h-[44px] rounded-lg border px-3 text-sm font-bold capitalize ${type === item ? 'border-blue-700 bg-blue-700 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}>
              {item}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          <Field label={type === 'task' ? 'Task name' : 'Project name'}>
            <input value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} placeholder={type === 'task' ? 'Build homepage' : 'Website launch'} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={type === 'task' ? 'Assignee' : 'Members'}>
              <input value={owner} onChange={(event) => setOwner(event.target.value)} className={inputClass} />
            </Field>
            <Field label={type === 'task' ? 'Due date' : 'Deadline'}>
              <input type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} className={inputClass} />
            </Field>
          </div>
          {type === 'task' && (
            <Field label="Priority">
              <select value={priority} onChange={(event) => setPriority(event.target.value as LocalTask['priority'])} className={inputClass}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </Field>
          )}
          <Field label="Description">
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-700/10" />
          </Field>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit">{type === 'task' ? 'Create Task' : 'Create Project'}</Button>
        </div>
      </form>
    </div>
  )
}

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, firebaseUser } = useAuth()
  const activeProfile = profile || createDefaultProfile({ name: firebaseUser?.displayName || 'CollabOS User', email: firebaseUser?.email || '' })
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [createOpen, setCreateOpen] = React.useState(false)

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${isActive ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'}`

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white px-4 py-5 lg:flex lg:flex-col">
          <button type="button" onClick={() => navigate('/home')} className="mb-6 flex items-center gap-3 rounded-lg px-2 py-2 text-left">
            <img src="/lll.png" alt="" className="h-9 w-9 rounded-lg object-cover" />
            <div>
              <p className="text-xl font-black leading-none">CollabOS</p>
              <p className="mt-1 text-xs font-bold text-slate-500">Operating system for teams</p>
            </div>
          </button>
          <nav className="space-y-1" aria-label="Main navigation">
            {primaryLinks.map((item) => {
              const Icon = item.icon
              return (
                <NavLink key={item.path} to={item.path} className={navClass}>
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
          <nav className="mt-6 border-t border-slate-200 pt-4" aria-label="Support navigation">
            {secondaryLinks.map((item) => {
              const Icon = item.icon
              return (
                <NavLink key={item.path} to={item.path} className={navClass}>
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
          <div className={`${surface} mt-auto p-3`}>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-700 text-sm font-black text-white">{activeProfile.name.slice(0, 1).toUpperCase()}</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{activeProfile.name}</p>
                <p className="truncate text-xs font-bold text-slate-500">Workspace Admin</p>
              </div>
            </div>
            <button type="button" onClick={() => navigate('/settings/workspace')} className={`mt-3 flex min-h-[40px] w-full items-center justify-between rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 hover:bg-slate-50 ${focusRing}`}>
              Workspace
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
            </button>
          </div>
        </aside>

        <section className="min-w-0 flex-1 pb-24 lg:pb-0">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm shadow-slate-200/50 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate('/home')} className="flex items-center gap-2 lg:hidden">
                <img src="/lll.png" alt="" className="h-9 w-9 rounded-lg object-cover" />
                <span className="font-black">CollabOS</span>
              </button>
              <button type="button" onClick={() => setSearchOpen(true)} className={`hidden min-h-[44px] min-w-0 flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 text-left text-sm font-semibold text-slate-500 sm:flex ${focusRing}`}>
                <Search className="h-4 w-4" />
                Search projects, tasks, messages, files, people, meetings
              </button>
              <div className="ml-auto flex items-center gap-2">
                <button type="button" onClick={() => setSearchOpen(true)} className={`grid h-11 w-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 sm:hidden ${focusRing}`} aria-label="Search">
                  <Search className="h-5 w-5" />
                </button>
                <Button type="button" onClick={() => setCreateOpen(true)} className="min-h-[44px] gap-2">
                  <Plus className="h-5 w-5" />
                  <span className="hidden sm:inline">Quick Create</span>
                </Button>
                <button type="button" onClick={() => navigate('/notifications')} className={`grid h-11 w-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 ${focusRing}`} aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => navigate('/help')} className={`hidden h-11 w-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 sm:grid ${focusRing}`} aria-label="Help">
                  <HelpCircle className="h-5 w-5" />
                </button>
                <button type="button" onClick={() => navigate('/profile')} className={`grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white ${focusRing}`} aria-label="Profile">
                  {activeProfile.name.slice(0, 1).toUpperCase()}
                </button>
                <button type="button" onClick={() => navigate('/')} className={`hidden h-11 w-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-950 md:grid ${focusRing}`} aria-label="Log out">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white px-2 pb-2 pt-2 shadow-2xl shadow-slate-900/10 lg:hidden" aria-label="Mobile navigation">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {mobileLinks.slice(0, 2).map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <button key={item.path} type="button" onClick={() => navigate(item.path)} className={`min-h-[54px] rounded-lg text-xs font-black ${active ? 'text-blue-700' : 'text-slate-500'}`}>
                <Icon className="mx-auto mb-1 h-5 w-5" />
                {item.label}
              </button>
            )
          })}
          <button type="button" onClick={() => setCreateOpen(true)} className="mx-auto -mt-5 grid h-14 w-14 place-items-center rounded-full bg-blue-700 text-white shadow-lg shadow-blue-700/25" aria-label="Create">
            <Plus className="h-6 w-6" />
          </button>
          {mobileLinks.slice(2).map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.path
            return (
              <button key={item.path} type="button" onClick={() => navigate(item.path)} className={`min-h-[54px] rounded-lg text-xs font-black ${active ? 'text-blue-700' : 'text-slate-500'}`}>
                <Icon className="mx-auto mb-1 h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>

      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
      {createOpen && <QuickCreateDialog onClose={() => setCreateOpen(false)} />}
    </main>
  )
}

export default AppShell
