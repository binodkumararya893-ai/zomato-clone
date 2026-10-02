import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { FirebaseSetupError } from '@/lib/firebaseErrors'
import { missingFirebaseEnvKeys, readFirebaseEnv } from '@/lib/firebaseEnv'

/**
 * Firebase config env se aata hai. VITE_ prefix client-safe values expose karta hai,
 * isliye yahan koi secret nahi hona chahiye.
 */
const missing = missingFirebaseEnvKeys()
if (missing.length > 0) throw new FirebaseSetupError(missing)

const firebaseConfig = readFirebaseEnv()

/** Dev mein multiple HMR reloads pe duplicate app na bane. */
export const firebaseApp: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth: Auth = getAuth(firebaseApp)
export const db: Firestore = getFirestore(firebaseApp)
export const storage: FirebaseStorage = getStorage(firebaseApp)