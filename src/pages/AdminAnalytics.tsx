import React from 'react'
import { BarChart3, Bot, CalendarClock, CheckCircle2, CreditCard, FileText, Folder, MessageSquare, ShieldAlert, TrendingUp, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Common/Button'
import { useAuth } from '../context/AuthContext'
import { getAdminAnalyticsSnapshot, isAdminEmail } from '../services/analytics'
import { formatNaira } from '../data/businessModel'

const metricCard = 'rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70 transition-colors hover:border-blue-200 hover:bg-blue-50/40'

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
    { label: 'Organizations', value: snapshot.organizations, icon: Users, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Projects', value: snapshot.projects, icon: Folder, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Tasks', value: snapshot.tasks, icon: BarChart3, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Messages', value: snapshot.messages, icon: MessageSquare, tone: 'bg-rose-50 text-rose-700' },
    { label: 'Files', value: snapshot.storageFiles, icon: FileText, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Meetings', value: snapshot.meetings, icon: CalendarClock, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Team members', value: snapshot.teamMembers, icon: Users, tone: 'bg-amber-50 text-amber-700' },
    { label: 'AI actions', value: snapshot.aiUsage, icon: Bot, tone: 'bg-rose-50 text-rose-700' },
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
  const evidenceRows = [
    ['Activation', snapshot.organizations > 0 || snapshot.projects > 0 || snapshot.tasks > 0, 'Workspace, project, and task creation events'],
    ['Engagement', snapshot.messages > 0 || snapshot.meetings > 0 || snapshot.aiUsage > 0, 'Messages, meetings, and AI action usage'],
    ['Monetization', snapshot.mrr !== null || (snapshot.paidAccounts ?? 0) > 0, 'Verified billing and subscription state'],
    ['Retention', snapshot.retention !== null || snapshot.churn !== null, 'Cohort activity and churn history'],
  ]

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-6 text-slate-950 sm:px-6 lg:px-10">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.16),transparent_42%),linear-gradient(180deg,#ffffff_0%,#f7f9fc_82%)]" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-blue-700 shadow-sm">Internal dashboard</p>
            <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">CollabOS analytics</h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              Real product metrics from the current workspace and tracked events. Revenue and retention remain empty until billing and production analytics are connected.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={() => navigate('/home')} className="hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">Open workspace</Button>
        </header>

        <section className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5 shadow-sm shadow-blue-100/60">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-wider text-blue-700">Investor evidence console</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-slate-950">Separate product usage from unverified business claims.</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-950">
                Workspace usage can be shown from local tracked activity. Revenue, retention, churn, and paid-account metrics remain explicit empty states until production billing and analytics are connected.
              </p>
            </div>
            <div className="grid min-w-full gap-3 sm:grid-cols-2 lg:min-w-[420px]">
              {evidenceRows.map(([label, ready, detail]) => (
                <div key={String(label)} className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-slate-950">{label}</p>
                    <CheckCircle2 className={`h-5 w-5 ${ready ? 'text-emerald-600' : 'text-slate-300'}`} />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <article key={metric.label} className={metricCard}>
                <div className={`grid h-10 w-10 place-items-center rounded-lg ${metric.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 font-display text-3xl font-bold">{metric.value}</p>
                <p className="mt-1 text-sm font-bold text-slate-600">{metric.label}</p>
              </article>
            )
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className={metricCard}>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-700">
                <CreditCard className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl font-bold">SaaS metrics</h2>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {pendingMetrics.map(([label, value]) => (
                <div key={String(label)} className="rounded-lg border border-slate-200 bg-[#f7f9fc] p-4">
                  <p className="text-sm font-bold text-slate-600">{label}</p>
                  <p className="mt-2 text-lg font-black">{value ?? 'Not enough data yet'}</p>
                </div>
              ))}
            </div>
          </article>

          <article className={metricCard}>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <TrendingUp className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl font-bold">Recent analytics events</h2>
            </div>
            {snapshot.events.length === 0 ? (
              <div className="mt-5 rounded-lg border border-dashed border-blue-200 bg-blue-50 p-5">
                <p className="font-bold">No tracked events yet</p>
                <p className="mt-2 text-sm leading-6 text-blue-950">
                  Events such as signup starts, demo requests, workspace creation, first project, first task, and AI usage will appear here after they happen.
                </p>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-slate-200 rounded-lg border border-slate-200">
                {snapshot.events.slice(0, 8).map((event) => (
                  <div key={event.id} className="p-4 transition-colors hover:bg-blue-50">
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
