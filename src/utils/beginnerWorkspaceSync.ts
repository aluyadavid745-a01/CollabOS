import { getConfiguredAuth, getConfiguredDb, isFirebaseConfigured } from '../firebase/config'
import { readLocalActivity, writeLocalActivity, type LocalActivityItem } from './localActivity'
import { readLocalProjects, writeLocalProjects, type LocalProject } from './localProjects'
import { readLocalTasks, writeLocalTasks, type LocalTask } from './localTasks'
import {
  readLocalCalendarEvents,
  readLocalFiles,
  readLocalMessages,
  readLocalTeamMembers,
  writeLocalCalendarEvents,
  writeLocalFiles,
  writeLocalMessages,
  writeLocalTeamMembers,
  type LocalCalendarEvent,
  type LocalFileRecord,
  type LocalMessage,
  type LocalTeamMember,
} from './localWorkspace'

export interface BeginnerWorkspaceSnapshot {
  projects: LocalProject[]
  tasks: LocalTask[]
  messages: LocalMessage[]
  teamMembers: LocalTeamMember[]
  calendarEvents: LocalCalendarEvent[]
  files: LocalFileRecord[]
  activity: LocalActivityItem[]
  updatedAt: string
}

const mergeById = <Value extends { id: string; createdAt?: string; updatedAt?: string }>(local: Value[], cloud: Value[]) => {
  const byId = new Map<string, Value>()

  ;[...cloud, ...local].forEach((item) => {
    const existing = byId.get(item.id)
    if (!existing) {
      byId.set(item.id, item)
      return
    }

    const existingTime = existing.updatedAt || existing.createdAt || ''
    const itemTime = item.updatedAt || item.createdAt || ''
    if (itemTime >= existingTime) byId.set(item.id, item)
  })

  return Array.from(byId.values())
}

export const readBeginnerWorkspaceSnapshot = (): BeginnerWorkspaceSnapshot => ({
  projects: readLocalProjects(),
  tasks: readLocalTasks(),
  messages: readLocalMessages(),
  teamMembers: readLocalTeamMembers(),
  calendarEvents: readLocalCalendarEvents(),
  files: readLocalFiles(),
  activity: readLocalActivity(),
  updatedAt: new Date().toISOString(),
})

export const writeBeginnerWorkspaceSnapshot = (snapshot: BeginnerWorkspaceSnapshot) => {
  writeLocalProjects(snapshot.projects || [])
  writeLocalTasks(snapshot.tasks || [])
  writeLocalMessages(snapshot.messages || [])
  writeLocalTeamMembers(snapshot.teamMembers || [])
  writeLocalCalendarEvents(snapshot.calendarEvents || [])
  writeLocalFiles(snapshot.files || [])
  writeLocalActivity(snapshot.activity || [])
}

const getCloudRef = async () => {
  if (!isFirebaseConfigured) return null

  const [auth, db, firestore] = await Promise.all([
    getConfiguredAuth(),
    getConfiguredDb(),
    import('firebase/firestore'),
  ])

  if (!auth?.currentUser || !db) return null

  return {
    ...firestore,
    db,
    ref: firestore.doc(db, 'users', auth.currentUser.uid, 'beginnerWorkspace', 'state'),
  }
}

export const syncBeginnerWorkspaceToCloud = async () => {
  try {
    const cloud = await getCloudRef()
    if (!cloud) return false

    await cloud.setDoc(
      cloud.ref,
      {
        ...readBeginnerWorkspaceSnapshot(),
        updatedAt: cloud.serverTimestamp(),
      },
      { merge: true }
    )
    return true
  } catch {
    return false
  }
}

export const loadBeginnerWorkspaceFromCloud = async () => {
  try {
    const cloud = await getCloudRef()
    if (!cloud) return false

    const snapshot = await cloud.getDoc(cloud.ref)
    if (!snapshot.exists()) {
      await syncBeginnerWorkspaceToCloud()
      return false
    }

    const cloudSnapshot = snapshot.data() as Partial<BeginnerWorkspaceSnapshot>
    const localSnapshot = readBeginnerWorkspaceSnapshot()
    const merged: BeginnerWorkspaceSnapshot = {
      projects: mergeById(localSnapshot.projects, cloudSnapshot.projects || []),
      tasks: mergeById(localSnapshot.tasks, cloudSnapshot.tasks || []),
      messages: mergeById(localSnapshot.messages, cloudSnapshot.messages || []),
      teamMembers: mergeById(localSnapshot.teamMembers, cloudSnapshot.teamMembers || []),
      calendarEvents: mergeById(localSnapshot.calendarEvents, cloudSnapshot.calendarEvents || []),
      files: mergeById(localSnapshot.files, cloudSnapshot.files || []),
      activity: mergeById(localSnapshot.activity, cloudSnapshot.activity || []),
      updatedAt: new Date().toISOString(),
    }

    writeBeginnerWorkspaceSnapshot(merged)
    await syncBeginnerWorkspaceToCloud()
    return true
  } catch {
    return false
  }
}
