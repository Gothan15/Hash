// FIREBASE CONFIGURATION DISABLED - NOW USING SQLITE
// This file has been disabled as the application now uses SQLite exclusively
// Original Firebase configuration moved to firebaseConfig-backup.js

/*
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Import Firestore
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBNv0zmPNy_U_NPVTLN90NPluY-1YM-ubI",
  authDomain: "hashbro-ed84f.firebaseapp.com",
  projectId: "hashbro-ed84f",
  storageBucket: "hashbro-ed84f.firebasestorage.app",
  messagingSenderId: "517461590516",
  appId: "1:517461590516:web:c837bd9cedc6e45b6f79a1",
  measurementId: "G-W5QXFFEPZE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // Initialize Firestore

// Export the initialized services
export { app, analytics, db };
*/

// SQLite is now used exclusively through the backend API
// No Firebase configuration needed
console.log("🗃️ Application configured to use SQLite database exclusively");

// Export empty objects for compatibility (in case any components still import these)
export const app = null;
export const analytics = null;
export const db = null;
