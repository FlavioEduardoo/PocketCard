import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const fallbackConfig = {
  apiKey: "AIzaSyDR9U-ORSmTwaZqnPV6bYBSP4jG9OT5-zg",
  authDomain: "pocketcard-e9b85.firebaseapp.com",
  projectId: "pocketcard-e9b85",
  storageBucket: "pocketcard-e9b85.firebasestorage.app",
  messagingSenderId: "218638191593",
  appId: "1:218638191593:web:9fec5a27b59c427ba39978",
};

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || fallbackConfig.apiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || fallbackConfig.authDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || fallbackConfig.projectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || fallbackConfig.storageBucket,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || fallbackConfig.messagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || fallbackConfig.appId,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export default app;
