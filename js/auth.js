// ==========================================================================
// MS STORE - Authentication Module (Firebase Auth)
// Email/Password, Google OAuth, Password Reset, Auth State & UI Sync
// Compliant with PRD Section 6.9
// ==========================================================================

import { auth, googleProvider } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { saveUserProfile, getUserProfile } from "./firebase-service.js";

const CURRENT_USER_KEY = "ms_store_active_user";

// Keep track of current user in memory & local storage
let currentUser = null;
const authListeners = [];

export function onAuthChange(callback) {
  authListeners.push(callback);
  if (currentUser !== null) {
    callback(currentUser);
  }
}

function notifyListeners(user) {
  currentUser = user;
  if (user) {
    const userSummary = {
      uid: user.uid,
      displayName: user.displayName || user.email.split("@")[0],
      email: user.email,
      photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=4F46E5&color=fff`
    };
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSummary));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
  authListeners.forEach(cb => cb(user));
  updateHeaderAuthUI(user);
}

// Initialize Auth Observer
if (auth) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Sync or fetch profile details from Firestore
      const profile = await getUserProfile(user.uid);
      if (profile && profile.displayName && !user.displayName) {
        user.displayName = profile.displayName;
      }
    }
    notifyListeners(user);
  });
} else {
  // If offline/no auth, check cached session
  try {
    const cached = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    if (cached) {
      currentUser = cached;
      updateHeaderAuthUI(cached);
    }
  } catch (e) {}
}

export function getCurrentUser() {
  return currentUser || JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
}

/**
 * Sign In with Email & Password
 */
export async function loginWithEmail(email, password) {
  if (!auth) throw new Error("Authentication service is currently offline");
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    notifyListeners(userCredential.user);
    return userCredential.user;
  } catch (error) {
    throw new Error(formatAuthError(error.code));
  }
}

/**
 * Sign Up with Name, Email & Password
 */
export async function registerWithEmail(name, email, password) {
  if (!auth) throw new Error("Authentication service is currently offline");
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Set display name in Firebase Auth
    await updateProfile(user, {
      displayName: name,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff`
    });

    // Save profile to Firestore
    await saveUserProfile(user.uid, {
      uid: user.uid,
      displayName: name,
      email: user.email,
      phone: "",
      addresses: [],
      createdAt: new Date().toISOString()
    });

    notifyListeners(user);
    return user;
  } catch (error) {
    throw new Error(formatAuthError(error.code));
  }
}

/**
 * Sign In with Google
 */
export async function loginWithGoogle() {
  if (!auth) throw new Error("Authentication service is currently offline");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Ensure Firestore profile exists
    await saveUserProfile(user.uid, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: new Date().toISOString()
    });

    notifyListeners(user);
    return user;
  } catch (error) {
    throw new Error(formatAuthError(error.code));
  }
}

/**
 * Send Password Reset Email
 */
export async function resetPassword(email) {
  if (!auth) throw new Error("Authentication service is currently offline");
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw new Error(formatAuthError(error.code));
  }
}

/**
 * Sign Out
 */
export async function logoutUser() {
  if (auth) {
    await signOut(auth);
  }
  notifyListeners(null);
  window.location.reload();
}

/**
 * Format Firebase Auth Error codes into user-friendly messages
 */
function formatAuthError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password. Please verify and try again.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Please sign in instead.";
    case "auth/weak-password":
      return "Password should be at least 8 characters long and include numbers or symbols.";
    case "auth/popup-closed-by-user":
      return "Sign in cancelled. Please try again.";
    default:
      return "Authentication error. Please check your network and try again.";
  }
}

/**
 * Updates Header User UI across all pages
 */
export function updateHeaderAuthUI(user) {
  const container = document.getElementById("header-auth-container");
  if (!container) return;

  if (user) {
    const name = user.displayName || user.email.split("@")[0];
    const avatar = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff`;

    container.innerHTML = `
      <div class="user-menu-wrap">
        <button class="user-profile-btn" id="user-profile-toggle" aria-label="Account Menu">
          <div class="user-avatar">
            <img src="${avatar}" alt="${name}" width="32" height="32" loading="lazy" style="object-fit:cover;" onerror="this.onerror=null;this.src='/assets/images/placeholder.svg';">
          </div>
          <span class="user-name-text">${name}</span>
          <i data-lucide="chevron-down" style="width:16px;height:16px;"></i>
        </button>

        <div class="user-dropdown" id="user-dropdown-menu">
          <div class="user-dropdown-header">
            <div class="user-dropdown-name">${name}</div>
            <div class="user-dropdown-email">${user.email}</div>
          </div>
          <a href="account.html" class="user-dropdown-item">
            <i data-lucide="user" style="width:16px;height:16px;"></i>
            <span>My Account</span>
          </a>
          <a href="account.html#orders" class="user-dropdown-item">
            <i data-lucide="package" style="width:16px;height:16px;"></i>
            <span>Order History</span>
          </a>
          <a href="wishlist.html" class="user-dropdown-item">
            <i data-lucide="heart" style="width:16px;height:16px;"></i>
            <span>Wishlist</span>
          </a>
          <div class="user-dropdown-divider"></div>
          <button id="btn-logout-header" class="user-dropdown-item text-danger" style="width:100%;text-align:left;">
            <i data-lucide="log-out" style="width:16px;height:16px;"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    `;

    const logoutBtn = document.getElementById("btn-logout-header");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => logoutUser());
    }
  } else {
    container.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-sm" id="btn-header-signin">
        <i data-lucide="user" style="width:16px;height:16px;"></i>
        <span>Sign In</span>
      </a>
    `;
  }

  // Re-initialize Lucide icons if available
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

/**
 * Route Guard for protected pages (e.g. checkout, account)
 */
export function requireAuth(redirectUrl = window.location.href) {
  const user = getCurrentUser();
  if (!user) {
    const encoded = encodeURIComponent(redirectUrl);
    window.location.href = `login.html?redirect=${encoded}`;
    return false;
  }
  return true;
}
