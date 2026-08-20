import type { HomeNotification } from '../types/home'
import type { UserProfile } from '../types/profile'
import { listStoredTeamWorkspaces } from './teamChat'
import { listCachedWebsiteProjects } from '../utils/websiteBuilderStorage'

const READ_KEY = 'collabos:homeNotifications:read'

const readIds = () => {
  if (typeof window === 'undefined') return new Set<string>()

  try {
    return new Set(JSON.parse(window.localStorage.getItem(READ_KEY) || '[]') as string[])
  } catch {
    return new Set<string>()
  }
}

const writeIds = (ids: Set<string>) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(READ_KEY, JSON.stringify(Array.from(ids)))
  } catch {
    // Read state is best-effort local UI state.
  }
}

const notification = (input: Omit<HomeNotification, 'read'>, read: Set<string>): HomeNotification => ({
  ...input,
  read: read.has(input.id),
})

export const listHomeNotifications = (_profile?: UserProfile | null): HomeNotification[] => {
  void _profile
  const read = readIds()
  const workspaces = listStoredTeamWorkspaces()
  const websites = listCachedWebsiteProjects()

  const items: HomeNotification[] = []

  workspaces.forEach((workspace) => {
    workspace.notifications.forEach((item) => {
      items.push(notification({
        id: `team-${item.id}`,
        type: item.type === 'security' ? 'security' : 'message',
        title: item.title,
        body: item.body,
        source: workspace.name,
        route: '/workspace',
        createdAt: item.createdAt,
        priority: item.type === 'security' ? 'high' : 'normal',
      }, read))
    })

    workspace.invites.slice(0, 2).forEach((invite) => {
      items.push(notification({
        id: `invite-${invite.id}`,
        type: 'invite',
        title: 'Invitation link active',
        body: `${invite.emails.length || 'Reusable'} invite recipient${invite.emails.length === 1 ? '' : 's'} · expires ${new Date(invite.expiresAt).toLocaleDateString()}`,
        source: workspace.name,
        route: '/workspace',
        createdAt: invite.expiresAt,
        priority: 'normal',
      }, read))
    })

    workspace.projects.slice(0, 3).forEach((project) => {
      items.push(notification({
        id: `project-${workspace.id}-${project.id}`,
        type: 'project',
        title: `${project.status}: ${project.name}`,
        body: `${project.owner} updated this workspace project.`,
        source: workspace.name,
        route: '/workspace',
        createdAt: project.updatedAt,
        priority: project.status === 'Review' ? 'high' : 'normal',
      }, read))
    })
  })

  websites.slice(0, 4).forEach((website) => {
    items.push(notification({
      id: `website-${website.id}-${website.status}`,
      type: 'website',
      title: website.status === 'published' ? 'Website published' : 'Website draft updated',
      body: `${website.name} was edited ${new Date(website.updatedAt).toLocaleDateString()}.`,
      source: 'Website Builder',
      route: '/dashboard/websites',
      createdAt: website.updatedAt,
      priority: website.status === 'published' ? 'high' : 'normal',
    }, read))
  })

  return items.sort((a, b) => Number(a.read) - Number(b.read) || b.createdAt.localeCompare(a.createdAt))
}

export const unreadHomeNotificationCount = (profile?: UserProfile | null) =>
  listHomeNotifications(profile).filter((item) => !item.read).length

export const markHomeNotificationRead = (id: string) => {
  const ids = readIds()
  ids.add(id)
  writeIds(ids)
}

export const markAllHomeNotificationsRead = (profile?: UserProfile | null) => {
  const ids = readIds()
  listHomeNotifications(profile).forEach((item) => ids.add(item.id))
  writeIds(ids)
}
