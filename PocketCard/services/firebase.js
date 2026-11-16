import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';
import {
  getAuth,
  connectAuthEmulator,
} from 'firebase/auth';

const fallbackConfig = {
  apiKey: "AIzaSyDR9U-ORSmTwaZqnPV6bYBSP4jG9OT5-zg",
  authDomain: "pocketcard-e9b85.firebaseapp.com",
  projectId: "pocketcard-e9b85",
  storageBucket: "pocketcard-e9b85.firebasestorage.app",
  messagingSenderId: "218638191593",
  appId: "1:218638191593:web:9fec5a27b59c427ba39978",
};

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || fallbackConfig.appId,
};

const app = getApps().length ? getApp() : initializeApp(config);

const useEmulator = process.env.EXPO_PUBLIC_USE_EMULATOR === 'true';
const host = process.env.EXPO_PUBLIC_EMULATOR_HOST || 'localhost';

let db;
try {
  // Inicialização padrão do Firestore (sem forçar long polling na web)
  db = initializeFirestore(app, {});

  if (useEmulator) {
    connectFirestoreEmulator(db, host, 8080);
  }
} catch {
  db = getFirestore(app);
}

const auth = getAuth(app);
if (useEmulator) {
  try {
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  } catch {
    // Emulator already connected
  }
}

export { app, db, auth };
