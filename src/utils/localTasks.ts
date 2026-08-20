export interface LocalTask {
  id: string
  title: string
  owner: string
  dueAt: string
  priority: 'Low' | 'Medium' | 'High'
  description: string
  done: boolean
  createdAt: string
}

const LOCAL_TASKS_KEY = 'collabos:beginnerTasks'

export const readLocalTasks = () => {
  if (typeof window === 'undefined') return []

  try {
    const value = window.localStorage.getItem(LOCAL_TASKS_KEY)
    return value ? (JSON.parse(value) as LocalTask[]) : []
  } catch {
    return []
  }
}

export const writeLocalTasks = (tasks: LocalTask[]) => {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(tasks))
    return true
  } catch {
    return false
  }
}

export const createLocalTask = (input: {
  title: string
  owner: string
  dueAt?: string
  priority?: LocalTask['priority']
  description?: string
}) => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
  title: input.title.trim(),
  owner: input.owner.trim() || 'You',
  dueAt: new Date(input.dueAt || Date.now()).toISOString(),
  priority: input.priority || 'Medium',
  description: input.description?.trim() || '',
  done: false,
  createdAt: new Date().toISOString(),
} satisfies LocalTask)
