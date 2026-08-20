export interface LocalMessage {
  id: string
  text: string
  sender: string
  projectId?: string
  createdAt: string
}

export interface LocalTeamMember {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
}

export interface LocalCalendarEvent {
  id: string
  title: string
  date: string
  time: string
  notes: string
  projectId?: string
  createdAt: string
}

export interface LocalFileRecord {
  id: string
  name: string
  type: string
  owner: string
  projectId?: string
  createdAt: string
}

const MESSAGES_KEY = 'collabos:beginnerMessages'
const TEAM_KEY = 'collabos:beginnerTeamMembers'
const CALENDAR_KEY = 'collabos:beginnerCalendar'
const FILES_KEY = 'collabos:beginnerFiles'

const readList = <Value>(key: string) => {
  if (typeof window === 'undefined') return []

  try {
    const value = window.localStorage.getItem(key)
    return value ? (JSON.parse(value) as Value[]) : []
  } catch {
    return []
  }
}

const writeList = <Value>(key: string, values: Value[]) => {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(key, JSON.stringify(values))
    return true
  } catch {
    return false
  }
}

const localId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now())

export const readLocalMessages = () => readList<LocalMessage>(MESSAGES_KEY)
export const writeLocalMessages = (messages: LocalMessage[]) => writeList(MESSAGES_KEY, messages)
export const createLocalMessage = (input: { text: string; sender: string; projectId?: string }) => ({
  id: localId(),
  text: input.text.trim(),
  sender: input.sender.trim() || 'You',
  projectId: input.projectId,
  createdAt: new Date().toISOString(),
} satisfies LocalMessage)

export const readLocalTeamMembers = () => readList<LocalTeamMember>(TEAM_KEY)
export const writeLocalTeamMembers = (members: LocalTeamMember[]) => writeList(TEAM_KEY, members)
export const createLocalTeamMember = (input: { name: string; email: string; role: string }) => ({
  id: localId(),
  name: input.name.trim(),
  email: input.email.trim(),
  role: input.role.trim() || 'Member',
  createdAt: new Date().toISOString(),
} satisfies LocalTeamMember)

export const readLocalCalendarEvents = () =>
  readList<LocalCalendarEvent>(CALENDAR_KEY).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
export const writeLocalCalendarEvents = (events: LocalCalendarEvent[]) => writeList(CALENDAR_KEY, events)
export const createLocalCalendarEvent = (input: { title: string; date: string; time: string; notes?: string; projectId?: string }) => ({
  id: localId(),
  title: input.title.trim(),
  date: input.date,
  time: input.time,
  notes: input.notes?.trim() || '',
  projectId: input.projectId,
  createdAt: new Date().toISOString(),
} satisfies LocalCalendarEvent)

export const readLocalFiles = () => readList<LocalFileRecord>(FILES_KEY)
export const writeLocalFiles = (files: LocalFileRecord[]) => writeList(FILES_KEY, files)
export const createLocalFileRecord = (input: { name: string; type: string; owner: string; projectId?: string }) => ({
  id: localId(),
  name: input.name.trim(),
  type: input.type.trim() || 'Document',
  owner: input.owner.trim() || 'You',
  projectId: input.projectId,
  createdAt: new Date().toISOString(),
} satisfies LocalFileRecord)
