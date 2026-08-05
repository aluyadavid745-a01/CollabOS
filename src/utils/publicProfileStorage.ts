import type { UserProfile } from '../types/profile'

const LOCAL_PUBLIC_PROFILES_KEY = 'collabos:publicProfiles'
let memoryProfiles: UserProfile[] = []

const readLocalProfiles = () => {
  if (typeof window === 'undefined') return memoryProfiles

  try {
    const value = window.localStorage.getItem(LOCAL_PUBLIC_PROFILES_KEY)
    const browserProfiles = value ? (JSON.parse(value) as UserProfile[]) : []
    const merged = [...memoryProfiles]
    browserProfiles.forEach((profile) => {
      if (!merged.some((item) => item.username === profile.username)) merged.push(profile)
    })
    return merged
  } catch {
    return memoryProfiles
  }
}

const writeLocalProfiles = (profiles: UserProfile[]) => {
  memoryProfiles = profiles
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(LOCAL_PUBLIC_PROFILES_KEY, JSON.stringify(profiles))
  } catch {
    // Keep the in-memory fallback when localStorage is unavailable.
  }
}

export const publishPublicProfile = async (profile: UserProfile) => {
  const profiles = readLocalProfiles()
  writeLocalProfiles(
    profiles.some((item) => item.username === profile.username)
      ? profiles.map((item) => (item.username === profile.username ? profile : item))
      : [profile, ...profiles]
  )

  const { getConfiguredDb, isFirebaseConfigured } = await import('../firebase/config')
  if (!isFirebaseConfigured) return

  try {
    const [{ doc, setDoc }, db] = await Promise.all([import('firebase/firestore'), getConfiguredDb()])
    if (!db) return
    await setDoc(doc(db, 'publicProfiles', profile.username), profile, { merge: true })
  } catch {
    // Local profile sharing still works when Firebase is unavailable.
  }
}

export const getPublicProfile = async (username: string) => {
  const localProfile = readLocalProfiles().find((profile) => profile.username === username) || null
  if (localProfile) return localProfile

  const { getConfiguredDb, isFirebaseConfigured } = await import('../firebase/config')
  if (!isFirebaseConfigured) return null

  try {
    const [{ doc, getDoc }, db] = await Promise.all([import('firebase/firestore'), getConfiguredDb()])
    if (!db) return null
    const snapshot = await getDoc(doc(db, 'publicProfiles', username))
    return snapshot.exists() ? (snapshot.data() as unknown as UserProfile) : null
  } catch {
    return null
  }
}

export const getPublicProfileUrl = (username: string) => {
  if (typeof window === 'undefined') return `/u/${username}`
  return `${window.location.origin}/u/${username}`
}
