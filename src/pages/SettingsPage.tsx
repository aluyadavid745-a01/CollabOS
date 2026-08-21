import React from 'react'
import {
  AlertCircle,
  Bell,
  Bot,
  CheckCircle2,
  CreditCard,
  Database,
  FileClock,
  KeyRound,
  Link,
  Lock,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import { Button } from '../components/Common/Button'
import { EmptyState, PageHeader, Panel, StatusPill } from '../components/DesignSystem'
import { useAuth } from '../context/AuthContext'
import { formatUsd, pricingPlans } from '../data/businessModel'
import { readLocalFiles, readLocalTeamMembers } from '../utils/localWorkspace'
import { readLocalProjects } from '../utils/localProjects'
import { readLocalTasks } from '../utils/localTasks'

const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, firebaseUser } = useAuth()
  const path = location.pathname
  const activeTab = path.includes('/billing')
    ? 'billing'
    : path.includes('/workspace')
      ? 'workspace'
      : path.includes('/integrations')
        ? 'integrations'
        : path.includes('/security')
          ? 'security'
          : 'profile'

  const teamMembers = readLocalTeamMembers()
  const projects = readLocalProjects()
  const tasks = readLocalTasks()
  const files = readLocalFiles()
  const proPlan = pricingPlans.find((plan) => plan.id === 'pro') || pricingPlans[2]

  const tabs = [
    { id: 'profile', label: 'Profile', path: '/settings', icon: Users },
    { id: 'security', label: 'Security', path: '/settings/security', icon: ShieldCheck },
    { id: 'workspace', label: 'Workspace', path: '/settings/workspace', icon: Database },
    { id: 'billing', label: 'Billing', path: '/settings/billing', icon: CreditCard },
    { id: 'integrations', label: 'Integrations', path: '/settings/integrations', icon: Link },
  ]

  return (
    <AppShell>
      <PageHeader
        eyebrow="Settings"
        title={activeTab === 'security' ? 'Security Center' : activeTab === 'billing' ? 'Billing and usage' : activeTab === 'workspace' ? 'Workspace settings' : activeTab === 'integrations' ? 'Integrations' : 'Account settings'}
        description="Manage the parts of CollabOS that control access, trust, billing, workspace permissions, and connected tools."
      />

      <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
        <Panel className="h-fit p-3">
          <nav className="space-y-1" aria-label="Settings sections">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigate(tab.path)}
                  className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-bold transition ${activeTab === tab.id ? 'bg-blue-700 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </Panel>

        {activeTab === 'security' && (
          <div className="space-y-5">
            <Panel className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Your account is protected</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">Email verification and protected routes are active. Add two-factor authentication when the backend provider is connected.</p>
                  </div>
                </div>
                <StatusPill tone={firebaseUser?.emailVerified ? 'success' : 'warning'}>{firebaseUser?.emailVerified ? 'Email verified' : 'Email verification needed'}</StatusPill>
              </div>
            </Panel>
            <div className="grid gap-4 lg:grid-cols-2">
              {[
                { title: 'Password', detail: 'Change password by secure reset email.', icon: KeyRound, action: 'Send reset link', ready: true },
                { title: 'Two-factor authentication', detail: 'Add a second verification step before sensitive changes.', icon: Lock, action: 'Enable 2FA', ready: false },
                { title: 'Active sessions', detail: 'Review where this account is signed in.', icon: Users, action: 'Review sessions', ready: false },
                { title: 'Login history', detail: 'Audit recent sign-ins when backend logs are connected.', icon: FileClock, action: 'View history', ready: false },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <Panel key={item.title} className="p-5">
                    <Icon className="h-5 w-5 text-blue-700" />
                    <h3 className="mt-3 font-black">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.detail}</p>
                    <Button type="button" variant={item.ready ? 'secondary' : 'tertiary'} size="sm" className="mt-4" disabled={!item.ready}>
                      {item.ready ? item.action : `${item.action} soon`}
                    </Button>
                  </Panel>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-5">
            <Panel className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <StatusPill tone="blue">Recommended plan</StatusPill>
                  <h2 className="mt-3 text-2xl font-black">{proPlan.name}</h2>
                  <p className="mt-1 text-slate-600">{proPlan.monthlyPriceUsd === null ? 'Custom pricing' : `${formatUsd(proPlan.monthlyPriceUsd)}/month`} for growing teams.</p>
                </div>
                <Button type="button">Upgrade</Button>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-2xl font-black">{Math.max(teamMembers.length, 1)} / {proPlan.memberLimit}</p>
                  <p className="text-sm font-bold text-slate-600">Team capacity</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-2xl font-black">0 / {proPlan.aiActionsPerMonth?.toLocaleString() || 'Custom'}</p>
                  <p className="text-sm font-bold text-slate-600">AI actions tracked</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-2xl font-black">{files.length} files</p>
                  <p className="text-sm font-bold text-slate-600">Storage records</p>
                </div>
              </div>
            </Panel>
            <EmptyState
              icon={<CreditCard className="h-6 w-6" />}
              title="No invoices yet"
              description="Invoices, payment method changes, upgrades, downgrades, and cancellations will appear here after production billing is connected."
              action={<Button type="button" variant="secondary">Billing preferences</Button>}
            />
          </div>
        )}

        {activeTab === 'workspace' && (
          <div className="space-y-5">
            <Panel className="p-5">
              <h2 className="text-xl font-black">Workspace controls</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Clear ownership and permissions make CollabOS feel predictable for serious teams.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-2xl font-black">{projects.length}</p>
                  <p className="text-sm font-bold text-slate-600">Projects</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-2xl font-black">{tasks.length}</p>
                  <p className="text-sm font-bold text-slate-600">Tasks</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-2xl font-black">{teamMembers.length}</p>
                  <p className="text-sm font-bold text-slate-600">Members</p>
                </div>
              </div>
            </Panel>
            <div className="grid gap-4 lg:grid-cols-2">
              {['Members', 'Roles', 'Permissions', 'Notifications', 'AI controls', 'Audit logs'].map((item) => (
                <Panel key={item} className="p-5">
                  <h3 className="font-black">{item}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Manage {item.toLowerCase()} with clear status, ownership, and review steps.</p>
                  <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={() => item === 'Members' ? navigate('/team') : undefined}>Open</Button>
                </Panel>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="grid gap-4 md:grid-cols-2">
            {['Google Calendar', 'Google Drive', 'Slack', 'Notion', 'GitHub', 'Zoom', 'Microsoft 365'].map((item) => (
              <Panel key={item} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-black">{item}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Prepared connector surface. Production OAuth and admin approval are required before sync.</p>
                  </div>
                  <StatusPill>Not connected</StatusPill>
                </div>
                <Button type="button" variant="secondary" size="sm" className="mt-4" disabled>Connect soon</Button>
              </Panel>
            ))}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-5">
            <Panel className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-xl bg-blue-700 text-xl font-black text-white">{(profile?.name || firebaseUser?.displayName || 'C').slice(0, 1).toUpperCase()}</div>
                  <div>
                    <h2 className="text-xl font-black">{profile?.name || firebaseUser?.displayName || 'CollabOS User'}</h2>
                    <p className="text-sm font-semibold text-slate-600">{profile?.email || firebaseUser?.email || 'No email available'}</p>
                  </div>
                </div>
                <Button type="button" variant="secondary" onClick={() => navigate('/profile/edit')}>Edit profile</Button>
              </div>
            </Panel>
            <Panel className="p-5">
              <h2 className="text-xl font-black">Preferences</h2>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {[
                  { icon: Bell, label: 'Notification preferences', detail: 'Keep important updates visible without overload.' },
                  { icon: Bot, label: 'AI preferences', detail: 'Review what AI can prepare before production permissions are connected.' },
                  { icon: UserPlus, label: 'Invite defaults', detail: 'New members should receive clear roles and onboarding steps.' },
                  { icon: AlertCircle, label: 'Error handling', detail: 'User-facing failures use plain language and recovery actions.' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <Icon className="h-5 w-5 text-blue-700" />
                      <p className="mt-3 font-black">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                    </div>
                  )
                })}
              </div>
            </Panel>
            <Panel className="p-5">
              <div className="flex items-center gap-3 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
                <p className="text-sm font-black">CollabOS uses verified account data and truthful empty states. No fake usage, customers, revenue, or security claims are shown.</p>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </AppShell>
  )
}

export default SettingsPage
