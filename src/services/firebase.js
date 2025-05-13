// Import the functions from the SDKs
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getFirestore } from "firebase/firestore"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNv0zmPNy_U_NPVTLN90NPluY-1YM-ubI",
  authDomain: "hashbro-ed84f.firebaseapp.com",
  projectId: "hashbro-ed84f",
  storageBucket: "hashbro-ed84f.firebasestorage.app",
  messagingSenderId: "517461590516",
  appId: "1:517461590516:web:c837bd9cedc6e45b6f79a1",
  measurementId: "G-W5QXFFEPZE",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
let analytics = null

// Only initialize analytics on the client side
if (typeof window !== "undefined") {
  analytics = getAnalytics(app)
}

// Initialize Firestore
const db = getFirestore(app)

// Export the initialized services
export { app, analytics, db }
