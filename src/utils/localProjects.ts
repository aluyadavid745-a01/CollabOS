export type LocalProjectStatus = 'Planning' | 'Active' | 'Done'

export interface LocalProject {
  id: string
  name: string
  description: string
  members: string[]
  deadline: string
  status: LocalProjectStatus
  createdAt: string
  updatedAt: string
}

const LOCAL_PROJECTS_KEY = 'collabos:beginnerProjects'

export const readLocalProjects = () => {
  if (typeof window === 'undefined') return []

  try {
    const value = window.localStorage.getItem(LOCAL_PROJECTS_KEY)
    return value ? (JSON.parse(value) as LocalProject[]) : []
  } catch {
    return []
  }
}

export const writeLocalProjects = (projects: LocalProject[]) => {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(projects))
    return true
  } catch {
    return false
  }
}

export const createLocalProject = (input: {
  name: string
  description?: string
  members?: string
  deadline?: string
  status?: LocalProjectStatus
}) => {
  const now = new Date().toISOString()

  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
    name: input.name.trim(),
    description: input.description?.trim() || '',
    members: (input.members || '')
      .split(',')
      .map((member) => member.trim())
      .filter(Boolean),
    deadline: input.deadline ? new Date(input.deadline).toISOString() : '',
    status: input.status || 'Planning',
    createdAt: now,
    updatedAt: now,
  } satisfies LocalProject
}
