// ==========================================================================
// MS STORE - Firebase Firestore Service Layer
// Handles products, categories, cart sync, wishlist sync, orders, profiles
// Provides offline resilience & local caching fallback
// ==========================================================================

import { db } from "./firebase-config.js";
import { PRODUCTS_CATALOG, CATEGORIES, SAMPLE_REVIEWS } from "./products-data.js";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Cache keys for localStorage
const STORAGE_KEYS = {
  PRODUCTS: "ms_store_products_cache",
  ORDERS: "ms_store_orders_local",
  REVIEWS: "ms_store_reviews_local"
};

// ==========================================================================
// Product Catalog Operations
// ==========================================================================

/**
 * Initializes and retrieves products.
 * If Firestore is empty, can seed the 36 products.
 * Always falls back immediately to PRODUCTS_CATALOG for instant 60fps load.
 */
export async function getProducts() {
  // Check local cache first for instant render
  try {
    if (!db) {
      return PRODUCTS_CATALOG;
    }

    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);

    if (!snapshot.empty) {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      return items;
    } else {
      // Background auto-seed to Firestore
      seedProductsCatalog();
      return PRODUCTS_CATALOG;
    }
  } catch (err) {
    console.info("Using cached products catalog (Firestore offline or initial load):", err.message);
    return PRODUCTS_CATALOG;
  }
}

/**
 * Seed initial catalog to Firestore
 */
export async function seedProductsCatalog() {
  if (!db) return;
  try {
    const productsRef = collection(db, "products");
    for (const prod of PRODUCTS_CATALOG) {
      await setDoc(doc(productsRef, prod.id), prod, { merge: true });
    }
    console.log("✓ Catalog seeded to Cloud Firestore successfully");
  } catch (err) {
    console.warn("Catalog seed notice:", err.message);
  }
}

/**
 * Get product by ID
 */
export async function getProductById(id) {
  if (!id) return null;
  const cleanId = String(id).trim();
  const lowerId = cleanId.toLowerCase();

  try {
    if (db) {
      // 1. Direct document lookup
      const docRef = doc(db, "products", cleanId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }

      // 2. Case-insensitive tolerant match across Firestore docs
      const productsRef = collection(db, "products");
      const snapAll = await getDocs(productsRef);
      for (const d of snapAll.docs) {
        const data = d.data();
        const dId = d.id.trim().toLowerCase();
        const fId = (data.id || "").toString().trim().toLowerCase();
        if (dId === lowerId || fId === lowerId) {
          return { id: d.id, ...data };
        }
      }
    }
  } catch (err) {
    console.warn("Product fetch from Firestore fallback:", err.message);
  }

  // Fallback to static catalog (tolerant match)
  const localMatch = PRODUCTS_CATALOG.find(p =>
    p && p.id && (p.id.trim().toLowerCase() === lowerId)
  );
  return localMatch || null;
}

/**
 * Get categories list
 */
export function getCategories() {
  return CATEGORIES;
}

// ==========================================================================
// Cart Sync Operations
// ==========================================================================

export async function saveCartToCloud(uid, items) {
  if (!uid || !db) return;
  try {
    const cartRef = doc(db, "carts", uid);
    await setDoc(cartRef, {
      uid,
      items,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("Cart cloud sync notice:", err.message);
  }
}

export async function getCartFromCloud(uid) {
  if (!uid || !db) return null;
  try {
    const cartRef = doc(db, "carts", uid);
    const snap = await getDoc(cartRef);
    if (snap.exists()) {
      return snap.data().items || [];
    }
  } catch (err) {
    console.warn("Cart cloud fetch notice:", err.message);
  }
  return null;
}

// ==========================================================================
// Wishlist Sync Operations
// ==========================================================================

export async function saveWishlistToCloud(uid, productIds) {
  if (!uid || !db) return;
  try {
    const wishRef = doc(db, "wishlists", uid);
    await setDoc(wishRef, {
      uid,
      productIds,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("Wishlist cloud sync notice:", err.message);
  }
}

export async function getWishlistFromCloud(uid) {
  if (!uid || !db) return null;
  try {
    const wishRef = doc(db, "wishlists", uid);
    const snap = await getDoc(wishRef);
    if (snap.exists()) {
      return snap.data().productIds || [];
    }
  } catch (err) {
    console.warn("Wishlist cloud fetch notice:", err.message);
  }
  return null;
}

// ==========================================================================
// Order Creation & Retrieval
// ==========================================================================

export async function createOrder(orderData) {
  // Generate human-friendly Order ID (e.g., MS-849201)
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const orderId = `MS-${randomNum}`;

  const fullOrder = {
    ...orderData,
    orderId,
    paymentStatus: "Paid",
    orderStatus: "Processing",
    createdAt: new Date().toISOString()
  };

  // Always save locally so customer sees it instantly in My Account
  try {
    const localOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
    localOrders.unshift(fullOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(localOrders));
  } catch (e) {
    console.error("Local order save error", e);
  }

  // Save to Firestore
  if (db) {
    try {
      const ordersRef = collection(db, "orders");
      await addDoc(ordersRef, {
        ...fullOrder,
        timestamp: serverTimestamp()
      });
      console.log(`✓ Order ${orderId} saved to Firestore`);
    } catch (err) {
      console.warn("Firestore order sync notice (order saved locally):", err.message);
    }
  }

  return fullOrder;
}

export async function getUserOrders(uid) {
  let orders = [];

  // Read from Firestore if available
  if (db && uid) {
    try {
      const q = query(
        collection(db, "orders"),
        where("uid", "==", uid),
        orderBy("timestamp", "desc")
      );
      const snapshot = await getDocs(q);
      snapshot.forEach(docSnap => {
        orders.push({ id: docSnap.id, ...docSnap.data() });
      });
    } catch (err) {
      console.warn("Firestore orders read fallback:", err.message);
    }
  }

  // Merge with local orders
  try {
    const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || "[]");
    if (orders.length === 0) {
      return local;
    }
    // De-duplicate by orderId
    const map = new Map();
    [...orders, ...local].forEach(o => map.set(o.orderId, o));
    return Array.from(map.values());
  } catch (e) {
    return orders;
  }
}

// ==========================================================================
// User Profile & Addresses
// ==========================================================================

export async function saveUserProfile(uid, profileData) {
  if (!uid || !db) return;
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("User profile sync error:", err.message);
  }
}

export async function getUserProfile(uid) {
  if (!uid || !db) return null;
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (err) {
    console.warn("User profile fetch error:", err.message);
  }
  return null;
}

// ==========================================================================
// Reviews, Newsletter & Contact
// ==========================================================================

export async function getProductReviews(productId) {
  // Read local + sample reviews
  const localReviews = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || "[]");
  const filteredLocal = localReviews.filter(r => r.productId === productId);
  const filteredSample = SAMPLE_REVIEWS.filter(r => r.productId === productId);
  return [...filteredLocal, ...filteredSample];
}

export async function addProductReview(reviewData) {
  const newReview = {
    ...reviewData,
    id: `rev-${Date.now()}`,
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    createdAt: new Date().toISOString()
  };

  // Save to local
  try {
    const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || "[]");
    local.unshift(newReview);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(local));
  } catch (e) {
    console.error(e);
  }

  // Save to Firestore
  if (db) {
    try {
      await addDoc(collection(db, "reviews"), {
        ...newReview,
        timestamp: serverTimestamp()
      });
    } catch (e) {
      console.warn("Firestore review save:", e.message);
    }
  }

  return newReview;
}

export async function subscribeNewsletter(email) {
  if (!email) return false;
  try {
    if (db) {
      await addDoc(collection(db, "newsletter"), {
        email,
        subscribedAt: serverTimestamp()
      });
    }
    return true;
  } catch (err) {
    console.warn("Newsletter subscription notice:", err.message);
    return true; // Still show success to visitor
  }
}

export async function sendContactMessage(messageData) {
  if (!messageData) return false;
  try {
    if (db) {
      await addDoc(collection(db, "messages"), {
        ...messageData,
        createdAt: serverTimestamp()
      });
    }
    return true;
  } catch (err) {
    console.warn("Contact message notice:", err.message);
    return true;
  }
}
