import React from 'react'
import type { User as FirebaseUser } from 'firebase/auth'
import {
  createDefaultProfile,
  isLegacyGenericProfile,
  resetLegacyGenericProfile,
  type UserProfile,
} from '../types/profile'
import { publishPublicProfile } from '../utils/publicProfileStorage'

interface AuthContextValue {
  firebaseUser: FirebaseUser | null
  profile: UserProfile | null
  loading: boolean
  saveProfile: (profile: UserProfile) => Promise<void>
  uploadProfileAsset: (file: File, kind: 'profile' | 'cover' | 'project') => Promise<string>
  setLocalProfileSeed: (seed: { name: string; email: string; workspace?: string } | null) => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const LOCAL_PROFILE_KEY = 'collabos:profile'

const readLocalProfile = () => {
  if (typeof window === 'undefined') return null

  try {
    const value = window.localStorage.getItem(LOCAL_PROFILE_KEY)
    return value ? (JSON.parse(value) as UserProfile) : null
  } catch {
    return null
  }
}

const writeLocalProfile = (profile: UserProfile) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile))
  } catch {
    // The in-memory React state remains the fallback when browser storage is unavailable.
  }
}

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Could not read file.'))
    reader.readAsDataURL(file)
  })

const firebaseUserProfileSeed = (nextUser: FirebaseUser) => ({
  uid: nextUser.uid,
  name: nextUser.displayName || nextUser.email?.split('@')[0] || 'CollabOS User',
  email: nextUser.email || '',
  photoURL: nextUser.photoURL || '',
})

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = React.useState<FirebaseUser | null>(null)
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [localSeed, setLocalProfileSeed] = React.useState<AuthContextValue['setLocalProfileSeed'] extends (
    seed: infer Seed
  ) => void
    ? Seed
    : never>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    let unsubscribe: (() => void) | undefined
    let cancelled = false

    const connectAuth = async () => {
      const [{ onAuthStateChanged }, { getConfiguredAuth, getConfiguredDb, isFirebaseConfigured }] =
        await Promise.all([import('firebase/auth'), import('../firebase/config')])

      if (cancelled) return

      const auth = await getConfiguredAuth()

      if (!auth || !isFirebaseConfigured) {
        setProfile((current) => current || readLocalProfile() || createDefaultProfile())
        setLoading(false)
        return
      }

      unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
        setFirebaseUser(nextUser)

        if (!nextUser) {
          setProfile(null)
          setLoading(false)
          return
        }

        const userSeed = firebaseUserProfileSeed(nextUser)
        const defaultProfile = createDefaultProfile(userSeed)
        setProfile(defaultProfile)
        writeLocalProfile(defaultProfile)
        setLoading(false)

        try {
          const [{ doc, getDoc, serverTimestamp, setDoc }, db] = await Promise.all([
            import('firebase/firestore'),
            getConfiguredDb(),
          ])

          if (!db) return

          const profileRef = doc(db, 'users', nextUser.uid)
          const snapshot = await getDoc(profileRef)

          if (snapshot.exists()) {
            const savedProfile = snapshot.data() as Partial<UserProfile>
            const legacyProfile = isLegacyGenericProfile(savedProfile)
            const nextProfile = legacyProfile
              ? resetLegacyGenericProfile(savedProfile, userSeed)
              : {
                  ...defaultProfile,
                  ...savedProfile,
                  uid: nextUser.uid,
                  name: savedProfile.name || defaultProfile.name,
                  username: savedProfile.username || defaultProfile.username,
                  email: defaultProfile.email,
                  photoURL: savedProfile.photoURL || defaultProfile.photoURL,
                }

            setProfile(nextProfile)
            writeLocalProfile(nextProfile)
            void publishPublicProfile(nextProfile)

            if (legacyProfile) {
              await setDoc(
                profileRef,
                {
                  ...nextProfile,
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              )
            }
          } else {
            await setDoc(profileRef, {
              ...defaultProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            })
          }
        } catch {
          setProfile(defaultProfile)
          writeLocalProfile(defaultProfile)
        }
      })
    }

    connectAuth().catch(() => {
      if (!cancelled) {
        setProfile((current) => current || readLocalProfile() || createDefaultProfile())
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  React.useEffect(() => {
    if (firebaseUser || !localSeed) return

    const savedProfile = readLocalProfile()
    const nextProfile =
      savedProfile ||
      createDefaultProfile({
        uid: 'local-user',
        name: localSeed.name,
        email: localSeed.email,
      })

    const mergedProfile = {
      ...nextProfile,
      name: localSeed.name || nextProfile.name,
      email: localSeed.email || nextProfile.email,
      updatedAt: new Date().toISOString(),
    }

    writeLocalProfile(mergedProfile)
    setProfile(mergedProfile)
  }, [firebaseUser, localSeed])

  const saveProfile = React.useCallback(async (nextProfile: UserProfile) => {
    const profileWithTimestamp = {
      ...nextProfile,
      updatedAt: new Date().toISOString(),
    }

    writeLocalProfile(profileWithTimestamp)
    setProfile(profileWithTimestamp)
    void publishPublicProfile(profileWithTimestamp)

    if (!firebaseUser) return

    const syncProfile = async () => {
      const [{ doc, serverTimestamp, setDoc }, { getConfiguredDb, isFirebaseConfigured }] = await Promise.all([
        import('firebase/firestore'),
        import('../firebase/config'),
      ])
      const db = await getConfiguredDb()

      if (db && isFirebaseConfigured) {
        await setDoc(
          doc(db, 'users', firebaseUser.uid),
          {
            ...profileWithTimestamp,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      }
    }

    void syncProfile().catch(() => undefined)
  }, [firebaseUser])

  const uploadProfileAsset = React.useCallback(async (file: File, kind: 'profile' | 'cover' | 'project') => {
    const localUrl = await fileToDataUrl(file)

    if (!firebaseUser) return localUrl

    const upload = async () => {
      const [{ getDownloadURL, ref, uploadBytes }, { getConfiguredStorage, isFirebaseConfigured }] = await Promise.all([
        import('firebase/storage'),
        import('../firebase/config'),
      ])
      const storage = await getConfiguredStorage()

      if (!storage || !isFirebaseConfigured) return localUrl

      const storageRef = ref(storage, `users/${firebaseUser.uid}/${kind}/${Date.now()}-${file.name}`)
      await uploadBytes(storageRef, file)
      return getDownloadURL(storageRef)
    }

    try {
      const cloudUrl = await Promise.race([
        upload(),
        new Promise<string>((resolve) => globalThis.setTimeout(() => resolve(localUrl), 1500)),
      ])
      return cloudUrl
    } catch {
      void upload().catch(() => undefined)
      return localUrl
    }
  }, [firebaseUser])

  const value = React.useMemo(
    () => ({
      firebaseUser,
      profile,
      loading,
      saveProfile,
      uploadProfileAsset,
      setLocalProfileSeed,
    }),
    [firebaseUser, profile, loading, saveProfile, uploadProfileAsset]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
