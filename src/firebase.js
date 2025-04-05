// Import the necessary Firebase SDK modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// ✅ Your actual Firebase configuration (from ecocoin-ui/ecocoin-final phase)
const firebaseConfig = {
  apiKey: "AIzaSyBueKj-RH8Fi7VZ29mQoY8BQgr0cApwE2U",
  authDomain: "ecocoin-app.firebaseapp.com",
  projectId: "ecocoin-app",
  storageBucket: "ecocoin-app.appspot.com",
  messagingSenderId: "852261689056",
  appId: "1:852261689056:web:b72e0b22259bfe2c77cb92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Setup Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

// Export for use in the project
export { db, auth };
