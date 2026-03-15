// ── Firebase SDK imports ──────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ── Firebase project config ───────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyCdSf_sldOjh1IQQperouTEC4Y1pYDzDII",
  authDomain:        "localyze-487918.firebaseapp.com",
  projectId:         "localyze-487918",
  storageBucket:     "localyze-487918.firebasestorage.app",
  messagingSenderId: "433289778815",
  appId:             "1:433289778815:web:eadfdddfaed7072df4514a",
};

// ── Initialize app ────────────────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);

// ── Auth exports (unchanged) ──────────────────────────────────────────────────
export const auth           = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { sendPasswordResetEmail };

// ── Firestore export (new) ────────────────────────────────────────────────────
export const db = getFirestore(app);