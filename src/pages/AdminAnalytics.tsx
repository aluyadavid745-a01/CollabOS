import React from 'react'
import { BarChart3, Bot, CalendarClock, CreditCard, FileText, Folder, MessageSquare, ShieldAlert, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import { useAuth } from '../context/AuthContext'
import { getAdminAnalyticsSnapshot, isAdminEmail } from '../services/analytics'
import { formatNaira } from '../data/businessModel'

const metricCard = 'rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70'

const AdminAnalytics: React.FC = () => {
  const navigate = useNavigate()
  const { firebaseUser } = useAuth()
  const snapshot = React.useMemo(() => getAdminAnalyticsSnapshot(), [])
  const authorized = isAdminEmail(firebaseUser?.email)

  if (!authorized) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-slate-950">
        <section className="max-w-lg rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-10 w-10 text-slate-500" />
          <h1 className="mt-4 text-2xl font-black">Admin access required</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This dashboard is separate from the customer workspace. Add authorized admin emails in
            VITE_COLLABOS_ADMIN_EMAILS to enable access.
          </p>
          <Button type="button" onClick={() => navigate('/home')} className="mt-5">Back to workspace</Button>
        </section>
      </main>
    )
  }

  const metrics = [
    { label: 'Organizations', value: snapshot.organizations, icon: Users },
    { label: 'Projects', value: snapshot.projects, icon: Folder },
    { label: 'Tasks', value: snapshot.tasks, icon: BarChart3 },
    { label: 'Messages', value: snapshot.messages, icon: MessageSquare },
    { label: 'Files', value: snapshot.storageFiles, icon: FileText },
    { label: 'Meetings', value: snapshot.meetings, icon: CalendarClock },
    { label: 'Team members', value: snapshot.teamMembers, icon: Users },
    { label: 'AI actions', value: snapshot.aiUsage, icon: Bot },
  ]

  const pendingMetrics = [
    ['Total users', snapshot.users],
    ['Active users', snapshot.activeUsers],
    ['New users', snapshot.newUsers],
    ['Free accounts', snapshot.freeAccounts],
    ['Paid accounts', snapshot.paidAccounts],
    ['MRR', snapshot.mrr === null ? null : formatNaira(snapshot.mrr)],
    ['ARR', snapshot.arr === null ? null : formatNaira(snapshot.arr)],
    ['Churn', snapshot.churn === null ? null : `${snapshot.churn}%`],
    ['Retention', snapshot.retention === null ? null : `${snapshot.retention}%`],
  ]

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wider text-slate-500">Internal dashboard</p>
            <h1 className="mt-1 text-3xl font-black sm:text-4xl">CollabOS analytics</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Real product metrics from the current workspace and tracked events. Revenue and retention remain empty until billing and production analytics are connected.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => navigate('/home')}>Open workspace</Button>
        </header>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <article key={metric.label} className={metricCard}>
                <Icon className="h-5 w-5 text-slate-500" />
                <p className="mt-4 text-3xl font-black">{metric.value}</p>
                <p className="mt-1 text-sm font-bold text-slate-600">{metric.label}</p>
              </article>
            )
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className={metricCard}>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-slate-500" />
              <h2 className="text-xl font-black">SaaS metrics</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {pendingMetrics.map(([label, value]) => (
                <div key={String(label)} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-600">{label}</p>
                  <p className="mt-2 text-lg font-black">{value ?? 'Not enough data yet'}</p>
                </div>
              ))}
            </div>
          </article>

          <article className={metricCard}>
            <h2 className="text-xl font-black">Recent analytics events</h2>
            {snapshot.events.length === 0 ? (
              <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
                <p className="font-bold">No tracked events yet</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Events such as signup starts, demo requests, workspace creation, first project, first task, and AI usage will appear here after they happen.
                </p>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-slate-200 rounded-lg border border-slate-200">
                {snapshot.events.slice(0, 8).map((event) => (
                  <div key={event.id} className="p-4">
                    <p className="font-bold">{event.name.split('_').join(' ')}</p>
                    <p className="mt-1 text-sm text-slate-500">{new Date(event.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      </div>
    </main>
  )
}

export default AdminAnalytics
