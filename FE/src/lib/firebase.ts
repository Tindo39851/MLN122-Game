import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";

const rawConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCITqMRG1V23Tv7qtVqpiy39NTOj3bbnm4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mln122-7302d.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://mln122-7302d-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mln122-7302d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mln122-7302d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1092955424989",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1092955424989:web:c4aa915130762246873334",
};

export const missingFirebaseConfig = Object.entries(rawConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const usingEmulator = import.meta.env.VITE_USE_EMULATOR === "true";

const safeConfig = rawConfig;

const app = getApps().length ? getApp() : initializeApp(safeConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

if (usingEmulator) {
  const isHttps = location.protocol === "https:";
  const port = Number(location.port) || (isHttps ? 443 : 80);
  connectAuthEmulator(auth, location.origin, { disableWarnings: true });
  connectDatabaseEmulator(database, location.hostname, port);
  const repoInfo = (database as unknown as { _repoInternal?: { repoInfo_?: { secure?: boolean } } })._repoInternal?.repoInfo_;
  if (repoInfo && isHttps) repoInfo.secure = true;
}
