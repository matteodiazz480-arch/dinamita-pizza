import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCfC7nX0wK6wplAdbRTgeeR3mWTIlPH6HE",
  authDomain: "nexo-creative-49c75.firebaseapp.com",
  projectId: "nexo-creative-49c75",
  storageBucket: "nexo-creative-49c75.firebasestorage.app",
  messagingSenderId: "968486634617",
  appId: "1:968486634617:web:51ec959a8d3fdb6bf080a8",
  measurementId: "G-HHZLD51699"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export default app;
