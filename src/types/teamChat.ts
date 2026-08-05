export type WorkspacePrivacy = 'Public' | 'Private' | 'InviteOnly'
export type PresenceState = 'Online' | 'Away' | 'Busy' | 'Offline' | 'InMeeting' | 'DoNotDisturb'
export type ChannelType = 'Text' | 'Voice' | 'Announcements' | 'Project' | 'Document'

export interface TeamWorkspace {
  id: string
  inviteCode: string
  name: string
  description: string
  category: string
  privacy: WorkspacePrivacy
  theme: string
  defaultLanguage: string
  logoUrl: string
  bannerUrl: string
  encryptionKeyId: string
  createdAt: string
  channels: TeamChannel[]
  members: TeamMember[]
  invites: TeamInvite[]
  notifications: TeamNotification[]
  projects: TeamProject[]
  files: TeamFile[]
}

export interface TeamChannel {
  id: string
  workspaceId: string
  name: string
  type: ChannelType
  description: string
  unread: number
  encrypted: boolean
  createdAt: string
}

export interface TeamMember {
  userId: string
  displayName: string
  email: string
  role: TeamRoleName
  permissions: string[]
  presence: PresenceState
  avatarUrl: string
}

export interface TeamMessage {
  id: string
  workspaceId: string
  channelId: string
  senderUserId: string
  senderName: string
  cipherText: string
  plainText: string
  nonce: string
  keyVersion: string
  parentMessageId?: string
  mentions: string[]
  reactions: string[]
  deliveryStatus: 'scheduled' | 'sending' | 'sent' | 'delivered' | 'read'
  createdAt: string
  editedAt?: string
  scheduledFor?: string
  deleted: boolean
  pinned: boolean
}

export interface TeamInvite {
  id: string
  workspaceId: string
  inviteCode: string
  token: string
  emails: string[]
  expiresAt: string
  maxUses: number
  uses: number
  revoked: boolean
}

export interface TeamNotification {
  id: string
  workspaceId: string
  userId: string
  type: string
  title: string
  body: string
  createdAt: string
  read: boolean
}

export interface TeamProject {
  id: string
  name: string
  status: 'Backlog' | 'In Progress' | 'Review' | 'Done'
  owner: string
  updatedAt: string
}

export interface TeamFile {
  id: string
  name: string
  type: string
  size: string
  uploadedBy: string
  encrypted: boolean
  createdAt: string
}

export type TeamRoleName =
  | 'Owner'
  | 'Admin'
  | 'Moderator'
  | 'Team Lead'
  | 'Product Manager'
  | 'Project Manager'
  | 'Senior Backend Developer'
  | 'Backend Developer'
  | 'Senior Frontend Developer'
  | 'Frontend Developer'
  | 'Mobile Developer'
  | 'DevOps Engineer'
  | 'Security Engineer'
  | 'AI Engineer'
  | 'QA Engineer'
  | 'UI/UX Designer'
  | 'Guest'

export const teamRoles: TeamRoleName[] = [
  'Owner',
  'Admin',
  'Moderator',
  'Team Lead',
  'Product Manager',
  'Project Manager',
  'Senior Backend Developer',
  'Backend Developer',
  'Senior Frontend Developer',
  'Frontend Developer',
  'Mobile Developer',
  'DevOps Engineer',
  'Security Engineer',
  'AI Engineer',
  'QA Engineer',
  'UI/UX Designer',
  'Guest',
]

export const permissionsByRole: Record<TeamRoleName, string[]> = {
  Owner: ['Manage Workspace', 'Manage Members', 'Invite Users', 'Delete Messages', 'Pin Messages', 'Create Channels', 'Manage Meetings', 'Manage Projects', 'Manage AI', 'Manage Files', 'Manage Roles', 'View Analytics'],
  Admin: ['Manage Members', 'Invite Users', 'Delete Messages', 'Pin Messages', 'Create Channels', 'Manage Meetings', 'Manage Projects', 'Manage AI', 'Manage Files', 'Manage Roles', 'View Analytics'],
  Moderator: ['Manage Members', 'Invite Users', 'Delete Messages', 'Pin Messages'],
  'Team Lead': ['Invite Users', 'Create Channels', 'Manage Projects', 'Manage Meetings'],
  'Product Manager': ['Create Channels', 'Manage Projects', 'Manage AI', 'View Analytics'],
  'Project Manager': ['Invite Users', 'Manage Projects', 'Manage Meetings', 'View Analytics'],
  'Senior Backend Developer': ['Create Channels', 'Manage Projects', 'Manage Files'],
  'Backend Developer': ['Manage Projects', 'Manage Files'],
  'Senior Frontend Developer': ['Create Channels', 'Manage Projects', 'Manage Files'],
  'Frontend Developer': ['Manage Projects', 'Manage Files'],
  'Mobile Developer': ['Manage Projects', 'Manage Files'],
  'DevOps Engineer': ['Manage Projects', 'Manage Files', 'View Analytics'],
  'Security Engineer': ['Manage Members', 'Manage Files', 'View Analytics'],
  'AI Engineer': ['Manage AI', 'Manage Projects', 'Manage Files'],
  'QA Engineer': ['Manage Projects', 'Manage Files'],
  'UI/UX Designer': ['Manage Projects', 'Manage Files'],
  Guest: [],
}
