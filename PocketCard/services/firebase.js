import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  connectFirestoreEmulator,
} from 'firebase/firestore';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(config);

const useEmulator = process.env.EXPO_PUBLIC_USE_EMULATOR === 'true';
const host = process.env.EXPO_PUBLIC_EMULATOR_HOST || 'localhost';

let db;
try {
  // Long polling evita problemas de conexão do Firestore no React Native
  db = initializeFirestore(app, { experimentalForceLongPolling: true });

  // Só conecta no emulador quando EXPO_PUBLIC_USE_EMULATOR=true (ver .env.local)
  if (useEmulator) {
    connectFirestoreEmulator(db, host, 8080);
  }
} catch {
  // Já inicializado (hot reload)
  db = getFirestore(app);
}

export { db };