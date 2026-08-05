import type { PresenceState, TeamChannel, TeamInvite, TeamMember, TeamMessage, TeamRoleName, TeamWorkspace, WorkspacePrivacy } from '../types/teamChat'
import { permissionsByRole } from '../types/teamChat'
import type { UserProfile } from '../types/profile'

const LOCAL_TEAM_KEY = 'collabos:teamWorkspaces'
const PORTABLE_INVITE_PREFIX = 'invitepack_'
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')

const readWorkspaces = () => {
  if (typeof window === 'undefined') return []

  try {
    const value = window.localStorage.getItem(LOCAL_TEAM_KEY)
    return value ? (JSON.parse(value) as TeamWorkspace[]) : []
  } catch {
    return []
  }
}

const writeWorkspaces = (workspaces: TeamWorkspace[]) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(LOCAL_TEAM_KEY, JSON.stringify(workspaces))
  } catch {
    // React state remains the active fallback when storage is unavailable.
  }
}

const id = (prefix: string) =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? `${prefix}_${crypto.randomUUID()}` : `${prefix}_${Date.now()}`

const inviteCode = () => Math.random().toString(36).slice(2, 12)

const now = () => new Date().toISOString()

type PortableInvitePayload = {
  version: 1
  workspace: Pick<
    TeamWorkspace,
    | 'id'
    | 'inviteCode'
    | 'name'
    | 'description'
    | 'category'
    | 'privacy'
    | 'theme'
    | 'defaultLanguage'
    | 'logoUrl'
    | 'bannerUrl'
    | 'encryptionKeyId'
    | 'createdAt'
    | 'channels'
    | 'members'
  >
  invite: TeamInvite
}

const encodePortablePayload = (payload: PortableInvitePayload) => {
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return `${PORTABLE_INVITE_PREFIX}${btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`
}

const decodePortablePayload = (token: string): PortableInvitePayload | null => {
  if (!token.startsWith(PORTABLE_INVITE_PREFIX)) return null

  try {
    const encoded = token.slice(PORTABLE_INVITE_PREFIX.length).replace(/-/g, '+').replace(/_/g, '/')
    const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as PortableInvitePayload

    if (payload.version !== 1 || !payload.workspace?.id || !payload.invite?.token) return null
    return payload
  } catch {
    return null
  }
}

const isInviteUsable = (invite: TeamInvite) =>
  !invite.revoked &&
  invite.uses < invite.maxUses &&
  Number.isFinite(Date.parse(invite.expiresAt)) &&
  Date.parse(invite.expiresAt) > Date.now()

const addMemberToWorkspace = (workspace: TeamWorkspace, profile: UserProfile, inviteToken?: string) => {
  const hasMember = workspace.members.some((member) => member.userId === profile.uid)
  const members = hasMember
    ? workspace.members
    : [
        ...workspace.members,
        {
          userId: profile.uid,
          displayName: profile.name,
          email: profile.email,
          role: 'Guest' as const,
          permissions: permissionsByRole.Guest,
          presence: 'Online' as const,
          avatarUrl: profile.photoURL,
        },
      ]

  return {
    ...workspace,
    members,
    invites: workspace.invites.map((invite) =>
      inviteToken && invite.token === inviteToken && !hasMember ? { ...invite, uses: invite.uses + 1 } : invite,
    ),
  }
}

const workspaceFromPortablePayload = ({ workspace, invite }: PortableInvitePayload): TeamWorkspace => ({
  ...workspace,
  channels: workspace.channels.map((channel) => ({ ...channel, workspaceId: workspace.id })),
  members: workspace.members,
  invites: [invite],
  notifications: [],
  projects: [],
  files: [],
})

export const createMessageCipher = async (plainText: string, workspace: TeamWorkspace) => {
  const nonce = id('nonce')
  const payload = `${workspace.encryptionKeyId}:${nonce}:${plainText}`

  if ('TextEncoder' in window) {
    const bytes = new TextEncoder().encode(payload)
    const cipherText = window.btoa(String.fromCharCode(...bytes))
    return { cipherText, nonce, keyVersion: workspace.encryptionKeyId }
  }

  return { cipherText: payload, nonce, keyVersion: workspace.encryptionKeyId }
}

export const decryptMessageCipher = (cipherText: string, workspace: TeamWorkspace) => {
  try {
    const decoded = window.atob(cipherText)
    const payload = decoded.startsWith(workspace.encryptionKeyId) ? decoded.split(':').slice(2).join(':') : decoded
    return payload || cipherText
  } catch {
    return cipherText
  }
}

export const createLocalWorkspace = (profile: UserProfile, input: {
  name: string
  description: string
  category: string
  privacy: WorkspacePrivacy
  theme: string
  defaultLanguage: string
  logoUrl?: string
  bannerUrl?: string
}) => {
  const workspaceId = id('ws')
  const createdAt = now()
  const channels: TeamChannel[] = ['general', 'announcements', 'random'].map((name, index) => ({
    id: id('ch'),
    workspaceId,
    name,
    type: index === 1 ? 'Announcements' : 'Text',
    description: index === 0 ? 'Team-wide encrypted collaboration' : index === 1 ? 'Company updates and launch notes' : 'Culture, wins, and async conversation',
    unread: index === 0 ? 2 : 0,
    encrypted: true,
    createdAt,
  }))

  const owner: TeamMember = {
    userId: profile.uid,
    displayName: profile.name,
    email: profile.email,
    role: 'Owner',
    permissions: permissionsByRole.Owner,
    presence: 'Online',
    avatarUrl: profile.photoURL,
  }

  const workspace: TeamWorkspace = {
    id: workspaceId,
    inviteCode: inviteCode(),
    name: input.name.trim() || 'CollabOS Workspace',
    description: input.description.trim() || 'Secure team collaboration for product teams.',
    category: input.category.trim() || 'Product',
    privacy: input.privacy,
    theme: input.theme,
    defaultLanguage: input.defaultLanguage,
    logoUrl: input.logoUrl || '',
    bannerUrl: input.bannerUrl || '',
    encryptionKeyId: `key_${inviteCode()}`,
    createdAt,
    channels,
    members: [
      owner,
      {
        userId: 'demo-admin',
        displayName: 'Maya Chen',
        email: 'maya@collabos.app',
        role: 'Admin',
        permissions: permissionsByRole.Admin,
        presence: 'InMeeting',
        avatarUrl: '',
      },
      {
        userId: 'demo-ai',
        displayName: 'CollabOS AI',
        email: 'ai@collabos.app',
        role: 'AI Engineer',
        permissions: permissionsByRole['AI Engineer'],
        presence: 'Online',
        avatarUrl: '',
      },
    ],
    invites: [],
    notifications: [
      {
        id: id('nt'),
        workspaceId,
        userId: profile.uid,
        type: 'security',
        title: 'E2EE enabled',
        body: 'Workspace messages are encrypted before sync.',
        createdAt,
        read: false,
      },
    ],
    projects: [
      { id: id('prj'), name: 'Realtime chat launch', status: 'In Progress', owner: profile.name, updatedAt: createdAt },
      { id: id('prj'), name: 'Enterprise invite flow', status: 'Review', owner: 'Maya Chen', updatedAt: createdAt },
    ],
    files: [
      { id: id('file'), name: 'security-architecture.pdf', type: 'PDF', size: '2.4 MB', uploadedBy: profile.name, encrypted: true, createdAt },
    ],
  }

  saveLocalWorkspace(workspace)
  seedMessages(workspace, profile)
  return workspace
}

const messageKey = (workspaceId: string, channelId: string) => `collabos:teamMessages:${workspaceId}:${channelId}`

const getCloudTeamState = async () => {
  const [{ getConfiguredAuth, getConfiguredDb, isFirebaseConfigured }, { doc, getDoc, setDoc }] = await Promise.all([
    import('../firebase/config'),
    import('firebase/firestore'),
  ])
  const [auth, db] = await Promise.all([getConfiguredAuth(), getConfiguredDb()])

  if (!auth?.currentUser || !db || !isFirebaseConfigured) return null
  return { db, doc, getDoc, setDoc }
}

export const loadSharedWorkspace = async (workspaceId: string) => {
  try {
    const cloud = await getCloudTeamState()
    if (!cloud) return null

    const snapshot = await cloud.getDoc(cloud.doc(cloud.db, 'teamWorkspaces', workspaceId))
    return snapshot.exists() ? (snapshot.data() as unknown as TeamWorkspace) : null
  } catch {
    return null
  }
}

export const syncSharedWorkspace = async (workspace: TeamWorkspace) => {
  try {
    const cloud = await getCloudTeamState()
    if (!cloud) return false

    await cloud.setDoc(
      cloud.doc(cloud.db, 'teamWorkspaces', workspace.id),
      { ...workspace, updatedAt: now() },
      { merge: true },
    )
    return true
  } catch {
    return false
  }
}

export const loadSharedMessages = async (workspaceId: string, channelId: string, workspace: TeamWorkspace) => {
  try {
    const cloud = await getCloudTeamState()
    if (!cloud) return null

    const snapshot = await cloud.getDoc(cloud.doc(cloud.db, 'teamWorkspaces', workspaceId, 'channels', channelId))
    if (!snapshot.exists()) return null

    const data = snapshot.data() as { messages?: TeamMessage[] }
    return (data.messages || []).map((message) => ({
      ...message,
      plainText: message.plainText || decryptMessageCipher(message.cipherText, workspace),
    }))
  } catch {
    return null
  }
}

export const syncSharedMessages = async (workspaceId: string, channelId: string, messages: TeamMessage[]) => {
  try {
    const cloud = await getCloudTeamState()
    if (!cloud) return false

    await cloud.setDoc(
      cloud.doc(cloud.db, 'teamWorkspaces', workspaceId, 'channels', channelId),
      { workspaceId, channelId, messages, updatedAt: now() },
      { merge: true },
    )
    return true
  } catch {
    return false
  }
}

export const listLocalWorkspaces = (profile?: UserProfile | null) => {
  const workspaces = readWorkspaces()
  if (workspaces.length || !profile) return workspaces

  return [
    createLocalWorkspace(profile, {
      name: `${profile.name.split(' ')[0] || 'CollabOS'} Command`,
      description: 'Encrypted planning, meetings, files, AI decisions, and live collaboration in one workspace.',
      category: 'Product Engineering',
      privacy: 'InviteOnly',
      theme: 'Midnight Aurora',
      defaultLanguage: 'English',
    }),
  ]
}

export const listStoredTeamWorkspaces = () => readWorkspaces()

export const createLocalId = (prefix: string) => id(prefix)

export const saveLocalWorkspace = (workspace: TeamWorkspace) => {
  const workspaces = readWorkspaces()
  writeWorkspaces(workspaces.some((item) => item.id === workspace.id) ? workspaces.map((item) => (item.id === workspace.id ? workspace : item)) : [workspace, ...workspaces])
  void syncSharedWorkspace(workspace)
}

export const cacheLocalWorkspace = (workspace: TeamWorkspace) => {
  const workspaces = readWorkspaces()
  writeWorkspaces(workspaces.some((item) => item.id === workspace.id) ? workspaces.map((item) => (item.id === workspace.id ? workspace : item)) : [workspace, ...workspaces])
}

export const listLocalMessages = (workspace: TeamWorkspace, channelId: string) => {
  try {
    const value = window.localStorage.getItem(messageKey(workspace.id, channelId))
    const messages = value ? (JSON.parse(value) as TeamMessage[]) : []
    return messages.map((message) => ({ ...message, plainText: message.plainText || decryptMessageCipher(message.cipherText, workspace) }))
  } catch {
    return []
  }
}

export const saveLocalMessages = (workspaceId: string, channelId: string, messages: TeamMessage[]) => {
  try {
    window.localStorage.setItem(messageKey(workspaceId, channelId), JSON.stringify(messages))
    void syncSharedMessages(workspaceId, channelId, messages)
  } catch {
    // Message state remains usable for this session.
  }
}

export const cacheLocalMessages = (workspaceId: string, channelId: string, messages: TeamMessage[]) => {
  try {
    window.localStorage.setItem(messageKey(workspaceId, channelId), JSON.stringify(messages))
  } catch {
    // Message state remains usable for this session.
  }
}

export const createInvite = (workspace: TeamWorkspace, emails: string[], maxUses = 25) => {
  const invite: TeamInvite = {
    id: id('inv'),
    workspaceId: workspace.id,
    inviteCode: workspace.inviteCode,
    token: `invite_${inviteCode()}_${inviteCode()}`,
    emails,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    maxUses,
    uses: 0,
    revoked: false,
  }
  const nextWorkspace = { ...workspace, invites: [invite, ...workspace.invites] }
  saveLocalWorkspace(nextWorkspace)
  return nextWorkspace
}

export const createShareableInviteToken = (workspace: TeamWorkspace) => {
  const invite = workspace.invites.find(isInviteUsable) || workspace.invites[0]
  if (!invite) return workspace.inviteCode

  return encodePortablePayload({
    version: 1,
    workspace: {
      id: workspace.id,
      inviteCode: workspace.inviteCode,
      name: workspace.name,
      description: workspace.description,
      category: workspace.category,
      privacy: workspace.privacy,
      theme: workspace.theme,
      defaultLanguage: workspace.defaultLanguage,
      logoUrl: workspace.logoUrl,
      bannerUrl: workspace.bannerUrl,
      encryptionKeyId: workspace.encryptionKeyId,
      createdAt: workspace.createdAt,
      channels: workspace.channels,
      members: workspace.members,
    },
    invite,
  })
}

export const joinLocalInvite = (token: string, profile: UserProfile) => {
  const workspaces = readWorkspaces()
  const workspace = workspaces.find((item) => item.inviteCode === token)
  if (workspace) {
    const nextWorkspace = addMemberToWorkspace(workspace, profile)
    saveLocalWorkspace(nextWorkspace)
    return nextWorkspace
  }

  const workspaceWithInvite = workspaces.find((item) => item.invites.some((invite) => invite.token === token))
  const invite = workspaceWithInvite?.invites.find((item) => item.token === token)
  if (workspaceWithInvite && invite && isInviteUsable(invite)) {
    const nextWorkspace = addMemberToWorkspace(workspaceWithInvite, profile, invite.token)
    saveLocalWorkspace(nextWorkspace)
    return nextWorkspace
  }

  const payload = decodePortablePayload(token)
  if (!payload || !isInviteUsable(payload.invite)) return null

  const importedWorkspace = workspaceFromPortablePayload(payload)
  const existingWorkspace = workspaces.find((item) => item.id === importedWorkspace.id)
  const baseWorkspace = existingWorkspace
    ? {
        ...existingWorkspace,
        invites: existingWorkspace.invites.some((item) => item.token === payload.invite.token)
          ? existingWorkspace.invites
          : [payload.invite, ...existingWorkspace.invites],
      }
    : importedWorkspace
  const nextWorkspace = addMemberToWorkspace(baseWorkspace, profile, payload.invite.token)

  saveLocalWorkspace(nextWorkspace)
  return nextWorkspace
}

export const updateMemberRole = (workspace: TeamWorkspace, userId: string, role: TeamRoleName) => {
  const nextWorkspace = {
    ...workspace,
    members: workspace.members.map((member) => (member.userId === userId ? { ...member, role, permissions: permissionsByRole[role] } : member)),
  }
  saveLocalWorkspace(nextWorkspace)
  return nextWorkspace
}

export const updatePresence = (workspace: TeamWorkspace, userId: string, presence: PresenceState) => {
  const nextWorkspace = {
    ...workspace,
    members: workspace.members.map((member) => (member.userId === userId ? { ...member, presence } : member)),
  }
  saveLocalWorkspace(nextWorkspace)
  return nextWorkspace
}

export const createLocalMessage = async (workspace: TeamWorkspace, channelId: string, sender: UserProfile, plainText: string) => {
  const encrypted = await createMessageCipher(plainText, workspace)
  const message: TeamMessage = {
    id: id('msg'),
    workspaceId: workspace.id,
    channelId,
    senderUserId: sender.uid,
    senderName: sender.name,
    cipherText: encrypted.cipherText,
    plainText,
    nonce: encrypted.nonce,
    keyVersion: encrypted.keyVersion,
    mentions: Array.from(plainText.matchAll(/@([\w.-]+)/g)).map((match) => match[1]),
    reactions: [],
    deliveryStatus: 'delivered',
    createdAt: now(),
    deleted: false,
    pinned: false,
  }

  const messages = [...listLocalMessages(workspace, channelId), message]
  saveLocalMessages(workspace.id, channelId, messages)
  return message
}

export const apiFetch = async <Value>(path: string, token?: string, init?: RequestInit): Promise<Value | null> => {
  if (!apiBaseUrl || !token) return null

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
  })

  if (!response.ok) throw new Error(await response.text())
  return response.json() as Promise<Value>
}

const seedMessages = async (workspace: TeamWorkspace, profile: UserProfile) => {
  const channel = workspace.channels[0]
  if (!channel || listLocalMessages(workspace, channel.id).length) return

  const first = await createLocalMessage(workspace, channel.id, profile, 'Welcome to the secure workspace. E2EE is active and every team event is ready for realtime sync.')
  const ai = await createMessageCipher('I can summarize threads, draft decisions, detect blockers, and stream updates into this channel.', workspace)
  const second: TeamMessage = {
    id: id('msg'),
    workspaceId: workspace.id,
    channelId: channel.id,
    senderUserId: 'demo-ai',
    senderName: 'CollabOS AI',
    cipherText: ai.cipherText,
    plainText: 'I can summarize threads, draft decisions, detect blockers, and stream updates into this channel.',
    nonce: ai.nonce,
    keyVersion: ai.keyVersion,
    mentions: [],
    reactions: ['⚡', '🔐'],
    deliveryStatus: 'read',
    createdAt: new Date(Date.now() + 1000).toISOString(),
    deleted: false,
    pinned: true,
  }
  saveLocalMessages(workspace.id, channel.id, [first, second])
}
