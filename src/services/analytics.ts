import { listStoredTeamWorkspaces } from './teamChat'
import { readLocalProjects } from '../utils/localProjects'
import { readLocalTasks } from '../utils/localTasks'
import { readLocalCalendarEvents, readLocalFiles, readLocalMessages, readLocalTeamMembers } from '../utils/localWorkspace'

export type AnalyticsEventName =
  | 'website_visited'
  | 'signup_started'
  | 'demo_requested'
  | 'workspace_created'
  | 'first_project_created'
  | 'first_task_created'
  | 'first_teammate_invited'
  | 'first_message_sent'
  | 'ai_action_used'

export interface AnalyticsEvent {
  id: string
  name: AnalyticsEventName
  createdAt: string
  metadata?: Record<string, string | number | boolean>
}

export interface AdminAnalyticsSnapshot {
  users: number | null
  activeUsers: number | null
  newUsers: number | null
  organizations: number
  projects: number
  tasks: number
  messages: number
  storageFiles: number
  meetings: number
  teamMembers: number
  aiUsage: number
  freeAccounts: number | null
  paidAccounts: number | null
  mrr: number | null
  arr: number | null
  churn: number | null
  retention: number | null
  events: AnalyticsEvent[]
}

const ANALYTICS_KEY = 'collabos:analytics-events'

const isBrowser = () => typeof window !== 'undefined'

export function readAnalyticsEvents(): AnalyticsEvent[] {
  if (!isBrowser()) return []

  try {
    const parsed = JSON.parse(window.localStorage.getItem(ANALYTICS_KEY) || '[]') as AnalyticsEvent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function trackAnalyticsEvent(name: AnalyticsEventName, metadata?: AnalyticsEvent['metadata']) {
  if (!isBrowser()) return

  const event: AnalyticsEvent = {
    id: `event-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    createdAt: new Date().toISOString(),
    metadata,
  }
  const events = [event, ...readAnalyticsEvents()].slice(0, 500)
  window.localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events))
}

export function getAdminAnalyticsSnapshot(): AdminAnalyticsSnapshot {
  const events = readAnalyticsEvents()
  const aiUsage = events.filter((event) => event.name === 'ai_action_used').length

  return {
    users: null,
    activeUsers: null,
    newUsers: null,
    organizations: listStoredTeamWorkspaces().length,
    projects: readLocalProjects().length,
    tasks: readLocalTasks().length,
    messages: readLocalMessages().length,
    storageFiles: readLocalFiles().length,
    meetings: readLocalCalendarEvents().length,
    teamMembers: readLocalTeamMembers().length,
    aiUsage,
    freeAccounts: null,
    paidAccounts: null,
    mrr: null,
    arr: null,
    churn: null,
    retention: null,
    events,
  }
}

export function isAdminEmail(email?: string | null) {
  const configured = import.meta.env.VITE_COLLABOS_ADMIN_EMAILS
  if (!email || !configured) return false

  return configured
    .split(',')
    .map((item: string) => item.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase())
}
