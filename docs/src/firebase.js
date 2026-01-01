// Firebase helpers for auth + Firestore persistence
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// NOTE: For production, move these config values to environment variables or a secure runtime.
const firebaseConfig = {
  apiKey: 'AIzaSyChB4LIztDi0EcvSodWlNw8664-YDjZsrM',
  authDomain: 'drop-d8ad2.firebaseapp.com',
  projectId: 'drop-d8ad2',
  storageBucket: 'drop-d8ad2.firebasestorage.app',
  messagingSenderId: '632897597373',
  appId: '1:632897597373:web:bd855b412cd4f075a2ecd4',
  measurementId: 'G-BYSBF51J6D',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function firebaseSignInAnonymous() {
  const res = await signInAnonymously(auth);
  return res.user.uid;
}

export function subscribeToAuthState(cb) {
  return onAuthStateChanged(auth, cb);
}

export function userStateDocRef(uid) {
  // Document shape: { schemaVersion, lastUpdated, state }
  return doc(db, 'users', uid, 'state', 'main');
}

export async function firestoreLoadState(uid) {
  const ref = userStateDocRef(uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return data?.state ?? null;
}

export async function firestoreSaveState(uid, state) {
  const ref = userStateDocRef(uid);
  await setDoc(
    ref,
    {
      schemaVersion: state?.meta?._version ?? null,
      lastUpdated: new Date().toISOString(),
      state,
    },
    { merge: true }
  );
}
