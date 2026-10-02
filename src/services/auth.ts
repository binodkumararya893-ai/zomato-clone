/** Auth operations — components se alag layer. */
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

const googleProvider = new GoogleAuthProvider()

export async function loginWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password)
}

export async function signupWithEmail(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })
}

export async function loginWithGoogle() {
  await signInWithPopup(auth, googleProvider)
}

export async function logout() {
  await fbSignOut(auth)
}