export type LocalActivityType = 'project' | 'task' | 'message' | 'team' | 'calendar' | 'file' | 'ai'

export interface LocalActivityItem {
  id: string
  type: LocalActivityType
  title: string
  detail: string
  route: string
  createdAt: string
}

const ACTIVITY_KEY = 'collabos:beginnerActivity'

const localId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now())

export const readLocalActivity = () => {
  if (typeof window === 'undefined') return []

  try {
    const value = window.localStorage.getItem(ACTIVITY_KEY)
    return value ? (JSON.parse(value) as LocalActivityItem[]) : []
  } catch {
    return []
  }
}

export const writeLocalActivity = (items: LocalActivityItem[]) => {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(ACTIVITY_KEY, JSON.stringify(items.slice(0, 40)))
    return true
  } catch {
    return false
  }
}

export const recordLocalActivity = (input: Omit<LocalActivityItem, 'id' | 'createdAt'>) => {
  const item: LocalActivityItem = {
    id: localId(),
    createdAt: new Date().toISOString(),
    ...input,
  }

  writeLocalActivity([item, ...readLocalActivity()])
  return item
}
