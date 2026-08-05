import React from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bell,
  Bot,
  CalendarClock,
  CheckCircle2,
  FileText,
  Globe2,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import { useAuth } from '../context/AuthContext'
import { listHomeNotifications, markHomeNotificationRead } from '../services/homeNotifications'
import { listLocalMessages, listLocalWorkspaces } from '../services/teamChat'
import { listCachedWebsiteProjects } from '../utils/websiteBuilderStorage'
import type { HomeNotification, HomeTask } from '../types/home'

const panel = 'rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60'

const notificationTone: Record<HomeNotification['type'], string> = {
  message: 'bg-cyan-100 text-cyan-700',
  mention: 'bg-fuchsia-100 text-fuchsia-700',
  meeting: 'bg-violet-100 text-violet-700',
  project: 'bg-amber-100 text-amber-700',
  website: 'bg-emerald-100 text-emerald-700',
  invite: 'bg-indigo-100 text-indigo-700',
  security: 'bg-rose-100 text-rose-700',
  ai: 'bg-slate-900 text-white',
}

const HomeDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [query, setQuery] = React.useState('')
  const [refreshKey, setRefreshKey] = React.useState(0)
  const workspaces = React.useMemo(() => {
    void refreshKey
    return listLocalWorkspaces(profile)
  }, [profile, refreshKey])
  const websites = React.useMemo(() => {
    void refreshKey
    return listCachedWebsiteProjects()
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
      .slice(0, 4)
  }, [activeWorkspace, refreshKey])

  const tasks: HomeTask[] = React.useMemo(() => {
    const teamTasks = workspaces.flatMap((workspace) =>
      workspace.projects.map((project, index) => ({
        id: `${workspace.id}-${project.id}`,
        title: project.name,
        owner: project.owner,
        status: project.status,
        dueAt: new Date(Date.now() + (index + 1) * 86400000).toISOString(),
        route: '/workspace',
      }))
    )

    const websiteTasks = websites.slice(0, 2).map((website, index) => ({
      id: `site-${website.id}`,
      title: website.status === 'published' ? `Review analytics for ${website.name}` : `Finish draft for ${website.name}`,
      owner: profile?.name || 'You',
      status: website.status === 'published' ? 'Review' as const : 'In Progress' as const,
      dueAt: new Date(Date.now() + (index + 2) * 86400000).toISOString(),
      route: '/dashboard/websites',
    }))

    return [...teamTasks, ...websiteTasks].slice(0, 6)
  }, [profile?.name, websites, workspaces])

  const filteredNotifications = notifications.filter((item) => {
    const haystack = `${item.title} ${item.body} ${item.source}`.toLowerCase()
    return haystack.includes(query.toLowerCase())
  })
  const unreadCount = notifications.filter((item) => !item.read).length
  const publishedCount = websites.filter((website) => website.status === 'published').length
  const memberCount = workspaces.reduce((total, workspace) => total + workspace.members.length, 0)

  const openNotification = (notification: HomeNotification) => {
    markHomeNotificationRead(notification.id)
    setRefreshKey((value) => value + 1)
    navigate(notification.route)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 md:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-indigo-600">
              <LayoutDashboard className="h-4 w-4" />
              Unified home
            </p>
            <h1 className="mt-2 text-4xl font-black">Welcome back, {profile?.name?.split(' ')[0] || 'there'}</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Messages, meetings, websites, tasks, invites, and AI updates from across CollabOS.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate('/notifications')}>
              <Bell className="mr-2 h-4 w-4" />
              {unreadCount} unread
            </Button>
            <Button type="button" onClick={() => navigate('/workspace')}>
              Open workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Unread', value: unreadCount, icon: Bell, detail: 'mentions and alerts', tone: 'from-indigo-600 to-cyan-600' },
            { label: 'Workspaces', value: workspaces.length, icon: MessageSquare, detail: `${memberCount} connected members`, tone: 'from-slate-900 to-indigo-900' },
            { label: 'Published sites', value: publishedCount, icon: Globe2, detail: `${websites.length} total projects`, tone: 'from-emerald-600 to-teal-600' },
            { label: 'Open tasks', value: tasks.filter((task) => task.status !== 'Done').length, icon: CheckCircle2, detail: 'across workspace and sites', tone: 'from-amber-600 to-rose-600' },
          ].map((card, index) => {
            const Icon = card.icon
            return (
              <motion.article key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className={`overflow-hidden rounded-2xl bg-gradient-to-br ${card.tone} p-5 text-white shadow-xl shadow-slate-300/70`}>
                <div className="flex items-center justify-between">
                  <Icon className="h-6 w-6 text-white/85" />
                  <span className="rounded-full bg-white/15 px-2 py-1 text-xs font-black uppercase tracking-wider">Live</span>
                </div>
                <p className="mt-5 text-3xl font-black">{card.value}</p>
                <p className="mt-1 font-bold">{card.label}</p>
                <p className="mt-1 text-sm text-white/70">{card.detail}</p>
              </motion.article>
            )
          })}
        </section>

        <section className="mb-6 grid gap-6 xl:grid-cols-[1fr_380px]">
          <article className={`${panel} overflow-hidden`}>
            <div className="border-b border-slate-200 p-5">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <p className="text-sm font-black uppercase tracking-wider text-indigo-600">AI command brief</p>
                  <h2 className="mt-1 text-2xl font-black">Today’s operating picture</h2>
                </div>
                <Button type="button" size="sm" onClick={() => navigate('/workspace')}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Ask AI
                </Button>
              </div>
            </div>
            <div className="grid gap-0 lg:grid-cols-[1fr_300px]">
              <div className="p-5">
                <div className="mb-4 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
                  <Bot className="mt-1 h-5 w-5 text-indigo-600" />
                  <p className="text-sm leading-6 text-slate-700">
                    {unreadCount} updates need attention. {tasks.filter((task) => task.status === 'Review').length} item{tasks.filter((task) => task.status === 'Review').length === 1 ? '' : 's'} are in review, and {publishedCount} website{publishedCount === 1 ? '' : 's'} are live. The fastest next move is to clear mentions, then review active launch tasks.
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    ['Secure chat', '/workspace', MessageSquare],
                    ['Meetings', '/meetings', Video],
                    ['Websites', '/dashboard/websites', Globe2],
                  ].map(([label, route, Icon]) => {
                    const Component = Icon as React.ComponentType<{ className?: string }>
                    return (
                      <button key={String(label)} type="button" onClick={() => navigate(String(route))} className="rounded-xl border border-slate-200 p-4 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50">
                        <Component className="h-5 w-5 text-indigo-600" />
                        <span className="mt-3 block font-black">{String(label)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="border-t border-slate-200 bg-slate-950 p-5 text-white lg:border-l lg:border-t-0">
                <p className="text-sm font-black uppercase tracking-wider text-cyan-200">Security posture</p>
                <div className="mt-4 space-y-3">
                  {[
                    ['E2EE workspace messages', ShieldCheck],
                    ['SignalR realtime channel ready', Radio],
                    ['Profile saved locally first', Lock],
                    ['Invite links monitored', Users],
                  ].map(([label, Icon]) => {
                    const Component = Icon as React.ComponentType<{ className?: string }>
                    return (
                      <div key={String(label)} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                        <Component className="h-4 w-4 text-cyan-300" />
                        <span className="text-sm font-bold">{String(label)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </article>

          <article className={`${panel} p-5`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wider text-indigo-600">Notification center</p>
                <h2 className="text-xl font-black">Priority inbox</h2>
              </div>
              <button type="button" onClick={() => navigate('/notifications')} className="text-sm font-bold text-indigo-600 hover:text-indigo-800">
                View all
              </button>
            </div>
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 text-sm outline-none" placeholder="Search updates" />
            </div>
            <div className="space-y-3">
              {filteredNotifications.slice(0, 6).map((item) => (
                <button key={item.id} type="button" onClick={() => openNotification(item)} className={`w-full rounded-xl border p-3 text-left transition-colors ${item.read ? 'border-slate-200 bg-white hover:bg-slate-50' : 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-black capitalize ${notificationTone[item.type]}`}>{item.type}</span>
                    {!item.read && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
                  </div>
                  <p className="mt-2 font-black">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{item.body}</p>
                  <p className="mt-2 text-xs font-bold text-slate-400">{item.source}</p>
                </button>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <article className={`${panel} p-5`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">Recent messages</h2>
              <MessageSquare className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="space-y-3">
              {recentMessages.map((message) => (
                <button key={message.id} type="button" onClick={() => navigate('/workspace')} className="w-full rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50">
                  <p className="text-xs font-black uppercase tracking-wider text-indigo-600">#{message.channelName}</p>
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-700">{message.plainText}</p>
                  <p className="mt-2 text-xs font-bold text-slate-400">{message.senderName}</p>
                </button>
              ))}
            </div>
          </article>

          <article className={`${panel} p-5`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">Execution board</h2>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="space-y-3">
              {tasks.map((task) => (
                <button key={task.id} type="button" onClick={() => navigate(task.route)} className="w-full rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold">{task.title}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{task.status}</span>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-400">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {task.owner} · due {new Date(task.dueAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </article>

          <article className={`${panel} p-5`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">Websites & files</h2>
              <FileText className="h-5 w-5 text-cyan-600" />
            </div>
            <div className="space-y-3">
              {websites.slice(0, 4).map((website) => (
                <button key={website.id} type="button" onClick={() => navigate('/dashboard/websites')} className="w-full rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold">{website.name}</p>
                    <span className={`rounded-full px-2 py-1 text-xs font-bold ${website.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{website.status}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{website.description}</p>
                </button>
              ))}
              {!websites.length && (
                <button type="button" onClick={() => navigate('/dashboard/websites')} className="w-full rounded-xl border border-dashed border-slate-300 p-5 text-left text-sm font-bold text-slate-500">
                  Create your first website
                </button>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  )
}

export default HomeDashboard
