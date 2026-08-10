import { initializeApp, getApps } from 'firebase/app'
import type { Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.appId
)

export const app = isFirebaseConfigured ? getApps()[0] || initializeApp(firebaseConfig) : null
let authPromise: Promise<Auth | null> | null = null

export const getConfiguredAuth = async () => {
  if (!app || !isFirebaseConfigured) return null
  authPromise ??= import('firebase/auth').then(async ({ getAuth, inMemoryPersistence, setPersistence }) => {
    const auth = getAuth(app)
    await setPersistence(auth, inMemoryPersistence)
    return auth
  })
  return authPromise
}

export const getConfiguredDb = async () => {
  if (!app || !isFirebaseConfigured) return null
  const { getFirestore } = await import('firebase/firestore')
  return getFirestore(app)
}

export const getConfiguredStorage = async () => {
  if (!app || !isFirebaseConfigured) return null
  const { getStorage } = await import('firebase/storage')
  return getStorage(app)
}
