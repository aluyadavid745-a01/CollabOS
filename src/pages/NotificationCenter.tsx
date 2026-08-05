import React from 'react'
import { ArrowLeft, Bell, CheckCheck, Filter, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import { useAuth } from '../context/AuthContext'
import { listHomeNotifications, markAllHomeNotificationsRead, markHomeNotificationRead } from '../services/homeNotifications'
import type { HomeNotification, HomeNotificationType } from '../types/home'

const filters: Array<HomeNotificationType | 'all' | 'unread'> = ['all', 'unread', 'message', 'meeting', 'project', 'website', 'invite', 'security', 'ai']

const tone: Record<HomeNotificationType, string> = {
  message: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  mention: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
  meeting: 'border-violet-200 bg-violet-50 text-violet-700',
  project: 'border-amber-200 bg-amber-50 text-amber-700',
  website: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  invite: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  security: 'border-rose-200 bg-rose-50 text-rose-700',
  ai: 'border-slate-300 bg-slate-950 text-white',
}

const NotificationCenter: React.FC = () => {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [activeFilter, setActiveFilter] = React.useState<HomeNotificationType | 'all' | 'unread'>('all')
  const [query, setQuery] = React.useState('')
  const [refreshKey, setRefreshKey] = React.useState(0)
  const notifications = React.useMemo(() => {
    void refreshKey
    return listHomeNotifications(profile)
  }, [profile, refreshKey])

  const filtered = notifications.filter((item) => {
    const matchesFilter = activeFilter === 'all' || (activeFilter === 'unread' ? !item.read : item.type === activeFilter)
    const matchesQuery = `${item.title} ${item.body} ${item.source}`.toLowerCase().includes(query.toLowerCase())
    return matchesFilter && matchesQuery
  })

  const openNotification = (notification: HomeNotification) => {
    markHomeNotificationRead(notification.id)
    setRefreshKey((value) => value + 1)
    navigate(notification.route)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 md:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <button type="button" onClick={() => navigate('/home')} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </button>
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-indigo-600">
              <Bell className="h-4 w-4" />
              Notification center
            </p>
            <h1 className="mt-2 text-4xl font-black">All workspace updates</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Mentions, projects, websites, meetings, invites, security events, and AI summaries in one inbox.</p>
          </div>
          <Button
            type="button"
            onClick={() => {
              markAllHomeNotificationsRead(profile)
              setRefreshKey((value) => value + 1)
            }}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 outline-none" placeholder="Search notifications" />
            </div>
            <div className="flex items-center gap-2 overflow-auto">
              <Filter className="h-4 w-4 shrink-0 text-slate-400" />
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full px-3 py-2 text-sm font-bold capitalize transition-colors ${activeFilter === filter ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-3">
          {filtered.map((item) => (
            <article key={item.id} className={`rounded-2xl border bg-white p-4 shadow-sm transition-colors ${item.read ? 'border-slate-200' : 'border-indigo-200 ring-2 ring-indigo-100'}`}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-black capitalize ${tone[item.type]}`}>{item.type}</span>
                    <span className="text-xs font-bold text-slate-400">{item.source}</span>
                    {!item.read && <span className="rounded-full bg-indigo-600 px-2 py-1 text-xs font-black text-white">Unread</span>}
                  </div>
                  <h2 className="text-lg font-black">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.body}</p>
                  <p className="mt-2 text-xs font-bold text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {!item.read && (
                    <button
                      type="button"
                      onClick={() => {
                        markHomeNotificationRead(item.id)
                        setRefreshKey((value) => value + 1)
                      }}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Mark read
                    </button>
                  )}
                  <Button type="button" size="sm" onClick={() => openNotification(item)}>
                    Open
                  </Button>
                </div>
              </div>
            </article>
          ))}
          {!filtered.length && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm font-bold text-slate-500">
              No notifications match this view.
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default NotificationCenter
