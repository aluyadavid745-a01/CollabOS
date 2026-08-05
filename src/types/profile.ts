import type { AuthUser } from '../pages/AuthPage'

export type ProfileStatus = 'online' | 'offline'
export type ProjectStatus = 'Active' | 'Completed'

export interface SocialLinks {
  github?: string
  linkedin?: string
  twitter?: string
  instagram?: string
  website?: string
}

export interface ProfileProject {
  id: string
  name: string
  description: string
  role: string
  technologies: string[]
  link: string
  status: ProjectStatus
  imageURL?: string
}

export interface ProfileActivity {
  id: string
  type: 'project' | 'team' | 'comment' | 'file' | 'collaboration'
  label: string
  detail: string
  createdAt: string
}

export interface PrivacySettings {
  showEmail: boolean
  showOnlineStatus: boolean
  allowMessages: boolean
  allowCollaborationRequests: boolean
}

export interface UserProfile {
  uid: string
  name: string
  username: string
  email: string
  photoURL: string
  coverURL: string
  bio: string
  location: string
  website: string
  skills: string[]
  interests: string[]
  socials: SocialLinks
  projects: ProfileProject[]
  activity: ProfileActivity[]
  privacy: PrivacySettings
  status: ProfileStatus
  createdAt: string
  updatedAt: string
}

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 24)

export const defaultCoverURL =
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1600&q=80'

export const createDefaultProfile = (
  user?: Partial<AuthUser> & { uid?: string; photoURL?: string }
): UserProfile => {
  const name = user?.name || (user?.email ? user.email.split('@')[0] : 'CollabOS User')
  const email = user?.email || ''
  const username = slugify(name) || 'collabosuser'
  const now = new Date().toISOString()

  return {
    uid: user?.uid || 'local-user',
    name,
    username,
    email,
    photoURL: user?.photoURL || '',
    coverURL: defaultCoverURL,
    bio: '',
    location: '',
    website: '',
    skills: [],
    interests: [],
    socials: {
      github: '',
      linkedin: '',
      twitter: '',
      instagram: '',
      website: '',
    },
    projects: [],
    activity: [],
    privacy: {
      showEmail: true,
      showOnlineStatus: true,
      allowMessages: true,
      allowCollaborationRequests: true,
    },
    status: 'online',
    createdAt: now,
    updatedAt: now,
  }
}

export const isLegacyGenericProfile = (profile: Partial<UserProfile>) =>
  profile.name === 'David Aluya' ||
  profile.username === 'davidcodes' ||
  profile.email === 'david@collabos.dev' ||
  profile.bio === 'Full-stack developer building products and collaborating with developers.' ||
  profile.socials?.github === 'https://github.com/davidcodes'

export const resetLegacyGenericProfile = (
  savedProfile: Partial<UserProfile>,
  user: Partial<AuthUser> & { uid?: string; photoURL?: string }
) => {
  const cleanProfile = createDefaultProfile(user)

  return {
    ...cleanProfile,
    createdAt: savedProfile.createdAt || cleanProfile.createdAt,
  }
}
