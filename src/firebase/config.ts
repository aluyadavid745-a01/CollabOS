import { initializeApp, getApps } from 'firebase/app'

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

export const getConfiguredAuth = async () => {
  if (!app || !isFirebaseConfigured) return null
  const { getAuth } = await import('firebase/auth')
  return getAuth(app)
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
