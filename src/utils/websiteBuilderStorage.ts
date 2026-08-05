import { createCodeWebsite, createStarterWebsite, createWebsiteFromTemplate } from '../data/websiteProjectFactory'
import { generateAiWebsiteProject, type AiWebsiteStyle } from '../data/aiWebsiteGenerator'
import { generateWebsiteWithFirebaseAi } from '../services/firebaseAiWebsite'
import type { WebsiteProject, WebsiteVersion } from '../types/websiteBuilder'

const LOCAL_WEBSITES_KEY = 'collabos:websites'
const LOCAL_PUBLIC_WEBSITES_KEY = 'collabos:publicWebsites'
let memoryWebsites: WebsiteProject[] = []
let memoryPublicWebsites: WebsiteProject[] = []

export type WebsiteSaveTarget = 'cloud' | 'local'

export interface WebsiteSaveResult {
  project: WebsiteProject
  target: WebsiteSaveTarget
}

const getFirebaseAuthState = async () => {
  const { getConfiguredAuth, isFirebaseConfigured } = await import('../firebase/config')
  const auth = await getConfiguredAuth()

  return { auth, isFirebaseConfigured }
}

const getFirebase = async () => {
  const { auth, isFirebaseConfigured } = await getFirebaseAuthState()

  if (!auth?.currentUser || !isFirebaseConfigured) {
    return {
      collection: null,
      deleteDoc: null,
      doc: null,
      getDoc: null,
      getDocs: null,
      setDoc: null,
      auth,
      db: null,
      isFirebaseConfigured,
    }
  }

  const [
    { collection, deleteDoc, doc, getDoc, getDocs, setDoc },
    { getConfiguredDb },
  ] = await Promise.all([
    import('firebase/firestore'),
    import('../firebase/config'),
  ])
  const db = await getConfiguredDb()

  return { collection, deleteDoc, doc, getDoc, getDocs, setDoc, auth, db, isFirebaseConfigured }
}

const getPublicFirebase = async () => {
  const { isFirebaseConfigured, getConfiguredDb } = await import('../firebase/config')

  if (!isFirebaseConfigured) {
    return {
      doc: null,
      getDoc: null,
      db: null,
      isFirebaseConfigured,
    }
  }

  const [{ doc, getDoc }, db] = await Promise.all([import('firebase/firestore'), getConfiguredDb()])
  return { doc, getDoc, db, isFirebaseConfigured }
}

const getPublicCollectionFirebase = async () => {
  const { isFirebaseConfigured, getConfiguredDb } = await import('../firebase/config')

  if (!isFirebaseConfigured) {
    return {
      collection: null,
      getDocs: null,
      db: null,
      isFirebaseConfigured,
    }
  }

  const [{ collection, getDocs }, db] = await Promise.all([import('firebase/firestore'), getConfiguredDb()])
  return { collection, getDocs, db, isFirebaseConfigured }
}

const getOwnerId = () => 'local-user'

const readBrowserWebsites = () => {
  if (typeof window === 'undefined') return []

  try {
    const value = window.localStorage.getItem(LOCAL_WEBSITES_KEY)
    return value ? (JSON.parse(value) as WebsiteProject[]) : []
  } catch {
    return []
  }
}

const readBrowserPublicWebsites = () => {
  if (typeof window === 'undefined') return []

  try {
    const value = window.localStorage.getItem(LOCAL_PUBLIC_WEBSITES_KEY)
    return value ? (JSON.parse(value) as WebsiteProject[]) : []
  } catch {
    return []
  }
}

const writeBrowserWebsites = (websites: WebsiteProject[]) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(LOCAL_WEBSITES_KEY, JSON.stringify(websites))
  } catch {
    // Keep the in-memory fallback when storage quota or privacy settings block localStorage.
  }
}

const writeBrowserPublicWebsites = (websites: WebsiteProject[]) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(LOCAL_PUBLIC_WEBSITES_KEY, JSON.stringify(websites))
  } catch {
    // Keep the in-memory fallback when storage quota or privacy settings block localStorage.
  }
}

const readLocalWebsites = () => {
  const browserWebsites = readBrowserWebsites()
  const merged = [...memoryWebsites]

  browserWebsites.forEach((website) => {
    if (!merged.some((item) => item.id === website.id)) merged.push(website)
  })

  return merged
}

const readLocalPublicWebsites = () => {
  const browserWebsites = readBrowserPublicWebsites()
  const merged = [...memoryPublicWebsites]

  browserWebsites.forEach((website) => {
    if (!merged.some((item) => item.id === website.id)) merged.push(website)
  })

  return merged
}

const writeLocalWebsites = (websites: WebsiteProject[]) => {
  memoryWebsites = websites
  writeBrowserWebsites(websites)
}

const writeLocalPublicWebsites = (websites: WebsiteProject[]) => {
  memoryPublicWebsites = websites
  writeBrowserPublicWebsites(websites)
}

const snapshotProject = (project: WebsiteProject): Omit<WebsiteProject, 'versions'> => {
  const snapshot = { ...project }
  delete snapshot.versions
  return JSON.parse(JSON.stringify(snapshot)) as Omit<WebsiteProject, 'versions'>
}

const publishLocalProject = (project: WebsiteProject) => {
  const publicWebsites = readLocalPublicWebsites()
  writeLocalPublicWebsites(
    publicWebsites.some((site) => site.id === project.id)
      ? publicWebsites.map((site) => (site.id === project.id ? project : site))
      : [project, ...publicWebsites]
  )
}

const unpublishLocalProject = (siteId: string) => {
  writeLocalPublicWebsites(readLocalPublicWebsites().filter((site) => site.id !== siteId))
}

export const listCachedWebsiteProjects = () => readLocalWebsites().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

export const listWebsiteProjects = async (): Promise<WebsiteProject[]> => {
  const { collection, db, getDocs, auth, isFirebaseConfigured } = await getFirebase()

  if (collection && getDocs && db && auth?.currentUser && isFirebaseConfigured) {
    try {
      const snapshot = await getDocs(collection(db, 'users', auth.currentUser.uid, 'websites'))
      return snapshot.docs.map((item) => item.data() as unknown as WebsiteProject).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    } catch {
      return readLocalWebsites().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    }
  }

  return readLocalWebsites().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export const getWebsiteStorageTarget = async (): Promise<WebsiteSaveTarget> => {
  const { auth, db, isFirebaseConfigured } = await getFirebase()
  return db && auth?.currentUser && isFirebaseConfigured ? 'cloud' : 'local'
}

export const getWebsiteProject = async (siteId: string): Promise<WebsiteProject | null> => {
  const localProject = readLocalWebsites().find((site) => site.id === siteId) || null
  if (localProject) return localProject

  const { doc, db, getDoc, auth, isFirebaseConfigured } = await getFirebase()

  if (doc && getDoc && db && auth?.currentUser && isFirebaseConfigured) {
    try {
      const snapshot = await getDoc(doc(db, 'users', auth.currentUser.uid, 'websites', siteId))
      return snapshot.exists() ? (snapshot.data() as unknown as WebsiteProject) : null
    } catch {
      return null
    }
  }

  return null
}

export const getPublicWebsiteProject = async (siteId: string): Promise<WebsiteProject | null> => {
  const localProject = readLocalPublicWebsites().find((site) => site.id === siteId && site.status === 'published') || null
  if (localProject) return localProject

  const { doc, db, getDoc, isFirebaseConfigured } = await getPublicFirebase()

  if (doc && getDoc && db && isFirebaseConfigured) {
    try {
      const snapshot = await getDoc(doc(db, 'publicWebsites', siteId))
      const project = snapshot.exists() ? (snapshot.data() as unknown as WebsiteProject) : null
      return project?.status === 'published' ? project : null
    } catch {
      return null
    }
  }

  return null
}

export const listPublicWebsiteProjects = async (ownerId?: string): Promise<WebsiteProject[]> => {
  const localProjects = readLocalPublicWebsites()
    .filter((project) => project.status === 'published' && (!ownerId || project.ownerId === ownerId))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  const { collection, db, getDocs, isFirebaseConfigured } = await getPublicCollectionFirebase()

  if (collection && getDocs && db && isFirebaseConfigured) {
    try {
      const snapshot = await getDocs(collection(db, 'publicWebsites'))
      const cloudProjects = snapshot.docs
        .map((item) => item.data() as unknown as WebsiteProject)
        .filter((project) => project.status === 'published' && (!ownerId || project.ownerId === ownerId))

      cloudProjects.forEach((project) => {
        if (!localProjects.some((item) => item.id === project.id)) localProjects.push(project)
      })
    } catch {
      // Public local projects remain available.
    }
  }

  return localProjects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export const saveWebsiteProjectWithStatus = async (project: WebsiteProject): Promise<WebsiteSaveResult> => {
  const updatedProject = {
    ...project,
    ownerId: project.ownerId || getOwnerId(),
    updatedAt: new Date().toISOString(),
  }

  const websites = readLocalWebsites()
  const nextWebsites = websites.some((site) => site.id === updatedProject.id)
    ? websites.map((site) => (site.id === updatedProject.id ? updatedProject : site))
    : [updatedProject, ...websites]
  writeLocalWebsites(nextWebsites)

  if (updatedProject.status === 'published') publishLocalProject(updatedProject)
  if (updatedProject.status !== 'published') unpublishLocalProject(updatedProject.id)

  const { doc, db, setDoc, auth, isFirebaseConfigured } = await getFirebase()

  if (doc && setDoc && db && auth?.currentUser && isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'users', auth.currentUser.uid, 'websites', updatedProject.id), updatedProject, { merge: true })
      await setDoc(doc(db, 'publicWebsites', updatedProject.id), updatedProject, { merge: true })
      return { project: updatedProject, target: 'cloud' }
    } catch {
      // Fall through to local/session fallback so the editor still opens.
    }
  }

  return { project: updatedProject, target: 'local' }
}

export const saveWebsiteProject = async (project: WebsiteProject) => {
  const result = await saveWebsiteProjectWithStatus(project)
  return result.project
}

const cacheWebsiteProject = (project: WebsiteProject) => {
  const updatedProject = {
    ...project,
    ownerId: project.ownerId || getOwnerId(),
    updatedAt: new Date().toISOString(),
  }
  const websites = readLocalWebsites()
  writeLocalWebsites(
    websites.some((site) => site.id === updatedProject.id)
      ? websites.map((site) => (site.id === updatedProject.id ? updatedProject : site))
      : [updatedProject, ...websites]
  )
  return updatedProject
}

export const createWebsiteProject = async (ownerId = getOwnerId()) => {
  const project = createStarterWebsite(ownerId)
  return saveWebsiteProject(project)
}

export const createWebsiteProjectInstant = (ownerId = getOwnerId()) => {
  const project = cacheWebsiteProject(createStarterWebsite(ownerId))
  void saveWebsiteProject(project)
  return project
}

export const createWebsiteProjectFromTemplate = async (templateId: string, ownerId = getOwnerId()) => {
  const project = createWebsiteFromTemplate(templateId, ownerId)
  return saveWebsiteProject(project)
}

export const createWebsiteProjectFromTemplateInstant = (templateId: string, ownerId = getOwnerId()) => {
  const project = cacheWebsiteProject(createWebsiteFromTemplate(templateId, ownerId))
  void saveWebsiteProject(project)
  return project
}

export const createCodeWebsiteProjectInstant = (ownerId = getOwnerId()) => {
  const project = cacheWebsiteProject(createCodeWebsite(ownerId))
  void saveWebsiteProject(project)
  return project
}

export const createAiWebsiteProjectInstant = (prompt: string, style: AiWebsiteStyle, ownerId = getOwnerId()) => {
  const project = cacheWebsiteProject(generateAiWebsiteProject({ prompt, style, ownerId }))
  void saveWebsiteProject(project)
  return project
}

export const createFirebaseAiWebsiteProject = async (prompt: string, style: AiWebsiteStyle, ownerId = getOwnerId()) => {
  const project = cacheWebsiteProject(await generateWebsiteWithFirebaseAi(prompt, style, ownerId))
  void saveWebsiteProject(project)
  return project
}

export const duplicateWebsiteProject = async (project: WebsiteProject) => {
  const now = new Date().toISOString()
  const duplicate: WebsiteProject = {
    ...project,
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `site-${Date.now()}`,
    name: `${project.name} Copy`,
    status: 'draft',
    publishedAt: undefined,
    versions: [],
    createdAt: now,
    updatedAt: now,
  }
  return saveWebsiteProject(duplicate)
}

export const deleteWebsiteProject = async (siteId: string) => {
  const { doc, deleteDoc, db, auth, isFirebaseConfigured } = await getFirebase()

  if (doc && deleteDoc && db && auth?.currentUser && isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'websites', siteId))
      await deleteDoc(doc(db, 'publicWebsites', siteId))
    } catch {
      // Also remove from local fallback below.
    }
  }

  writeLocalWebsites(readLocalWebsites().filter((site) => site.id !== siteId))
  unpublishLocalProject(siteId)
}

export const createWebsiteVersion = async (project: WebsiteProject, label = 'Manual restore point') => {
  const version: WebsiteVersion = {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `version-${Date.now()}`,
    label,
    createdAt: new Date().toISOString(),
    project: snapshotProject(project),
  }

  const updatedProject: WebsiteProject = {
    ...project,
    versions: [version, ...(project.versions || [])].slice(0, 12),
  }

  return saveWebsiteProject(updatedProject)
}

export const restoreWebsiteVersion = async (project: WebsiteProject, versionId: string) => {
  const version = (project.versions || []).find((item) => item.id === versionId)
  if (!version) return project

  const restored: WebsiteProject = {
    ...version.project,
    id: project.id,
    ownerId: project.ownerId,
    name: project.name,
    status: 'draft',
    publishedAt: undefined,
    versions: project.versions,
    updatedAt: new Date().toISOString(),
  }

  return saveWebsiteProject(restored)
}

export const getPublicWebsiteUrl = (siteId: string) => {
  if (typeof window === 'undefined') return `/sites/${siteId}`
  return `${window.location.origin}/sites/${siteId}`
}

export const exportWebsiteProject = (project: WebsiteProject) => {
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'collabos-website'}.json`
  link.click()
  URL.revokeObjectURL(url)
}
