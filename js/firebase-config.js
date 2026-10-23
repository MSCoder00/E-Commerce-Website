// ==========================================================================
// MS STORE - Firebase Configuration & Initialization
// Uses Firebase v10 Modular Web SDK
// ==========================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase configuration from PRD Appendix A
const firebaseConfig = {
  apiKey: "AIzaSyDhbiLyWASsXgQW-j4m-tRtHo5OvlrZ-qs",
  authDomain: "ms-store-9c263.firebaseapp.com",
  projectId: "ms-store-9c263",
  storageBucket: "ms-store-9c263.firebasestorage.app",
  messagingSenderId: "1064610853166",
  appId: "1:1064610853166:web:cf21e4f6b810c8f7cc4abf",
  measurementId: "G-V7R2T29CSV"
};

// Initialize Firebase
let app = null;
let auth = null;
let db = null;
let googleProvider = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  console.log("✓ Firebase initialized successfully for MS STORE");
} catch (error) {
  console.warn("Firebase initialization notice:", error.message);
}

export { app, auth, db, googleProvider, firebaseConfig };
