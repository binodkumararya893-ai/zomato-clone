/**
 * Firebase env config read karta hai — pure function, koi side effect nahi.
 * Isko main.tsx app import karne se pehle use karta hai taaki
 * config missing ho to crash ke bajaye setup screen dikhe.
 */

export interface FirebaseEnv {
  apiKey?: string
  authDomain?: string
  projectId?: string
  storageBucket?: string
  messagingSenderId?: string
  appId?: string
}

export function readFirebaseEnv(): FirebaseEnv {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }
}

/** Empty/missing env keys ki list. */
export function missingFirebaseEnvKeys(): string[] {
  const env = readFirebaseEnv()
  return Object.entries(env)
    .filter(([, value]) => !value || !value.trim())
    .map(([key]) => `VITE_${key.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()}`)
}