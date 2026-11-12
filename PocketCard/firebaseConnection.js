// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDR9U-ORSmTwaZqnPV6bYBSP4jG9OT5-zg",
  authDomain: "pocketcard-e9b85.firebaseapp.com",
  projectId: "pocketcard-e9b85",
  storageBucket: "pocketcard-e9b85.firebasestorage.app",
  messagingSenderId: "218638191593",
  appId: "1:218638191593:web:9fec5a27b59c427ba39978",
  measurementId: "G-L05V9D9T0Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);