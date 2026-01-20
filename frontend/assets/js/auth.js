import { auth } from './app.js';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Signed in:", result.user);
    return result.user;
  } catch (err) {
    console.error("Google sign-in failed", err);
  }
}

export function observeAuth(cb) {
  onAuthStateChanged(auth, user => cb(user));
}

export function signOutUser() {
  return signOut(auth);
}