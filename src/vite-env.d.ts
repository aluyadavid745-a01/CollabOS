/// <reference types="vite/client" />

declare module 'firebase/app' {
  export interface FirebaseApp {}
  export type FirebaseOptions = Record<string, string | undefined>
  export function initializeApp(options: FirebaseOptions): FirebaseApp
  export function getApps(): FirebaseApp[]
}

declare module 'firebase/auth' {
  export interface User {
    uid: string
    displayName: string | null
    email: string | null
    emailVerified: boolean
    photoURL: string | null
  }

  export interface Auth {
    currentUser: User | null
  }
  export interface UserCredential {
    user: User
  }
  export interface ActionCodeSettings {
    url: string
    handleCodeInApp?: boolean
  }
  export interface AuthProvider {}
  export class GoogleAuthProvider implements AuthProvider {
    addScope(scope: string): GoogleAuthProvider
  }
  export function getAuth(app?: unknown): Auth
  export function onAuthStateChanged(
    auth: Auth,
    nextOrObserver: (user: User | null) => void | Promise<void>
  ): () => void
  export function applyActionCode(auth: Auth, code: string): Promise<void>
  export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>
  export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>
  export function signInWithPopup(auth: Auth, provider: AuthProvider): Promise<UserCredential>
  export function sendEmailVerification(user: User, actionCodeSettings?: ActionCodeSettings): Promise<void>
  export function sendPasswordResetEmail(auth: Auth, email: string): Promise<void>
  export function signOut(auth: Auth): Promise<void>
  export function updateProfile(user: User, profile: { displayName?: string | null; photoURL?: string | null }): Promise<void>
  export function reload(user: User): Promise<void>
}

declare module 'firebase/firestore' {
  export interface Firestore {}
  export interface DocumentReference {}
  export interface DocumentSnapshot {
    exists(): boolean
    data(): Record<string, unknown>
  }
  export interface QuerySnapshot {
    docs: Array<{ data(): Record<string, unknown> }>
  }
  export interface CollectionReference {}

  export function getFirestore(app?: unknown): Firestore
  export function doc(firestore: Firestore, path: string, pathSegment: string): DocumentReference
  export function doc(firestore: Firestore, path: string, pathSegment: string, subPath: string, subPathSegment: string): DocumentReference
  export function collection(firestore: Firestore, path: string): CollectionReference
  export function collection(firestore: Firestore, path: string, pathSegment: string, subPath: string): CollectionReference
  export function getDoc(reference: DocumentReference): Promise<DocumentSnapshot>
  export function getDocs(reference: CollectionReference): Promise<QuerySnapshot>
  export function deleteDoc(reference: DocumentReference): Promise<void>
  export function setDoc(reference: DocumentReference, data: unknown, options?: { merge?: boolean }): Promise<void>
  export function serverTimestamp(): unknown
}

declare module 'firebase/storage' {
  export interface FirebaseStorage {}
  export interface StorageReference {}

  export function getStorage(app?: unknown): FirebaseStorage
  export function ref(storage: FirebaseStorage, path: string): StorageReference
  export function uploadBytes(reference: StorageReference, data: Blob | Uint8Array | ArrayBuffer): Promise<unknown>
  export function getDownloadURL(reference: StorageReference): Promise<string>
}
