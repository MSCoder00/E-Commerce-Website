// ==========================================================================
// MS STORE - Wishlist Service
// Toggle state, cloud & local sync, heart pop micro-animation, badge count
// Compliant with PRD Section 6.8 & Section 8
// ==========================================================================

import { saveWishlistToCloud, getWishlistFromCloud, getProductById } from "./firebase-service.js";
import { getCurrentUser } from "./auth.js";
import { cart } from "./cart.js";

const WISHLIST_STORAGE_KEY = "ms_store_wishlist_ids";

const REMOVED_PRODUCT_IDS = new Set([
  "prod-elec-04",
  "prod-elec-06",
  "prod-home-03",
  "prod-beau-01",
  "prod-beau-05",
  "prod-beau-06",
  "prod-acc-02"
]);

class WishlistService {
  constructor() {
    this.productIds = this.loadLocal();
    this.subscribers = [];
    this.initCloudSync();
  }

  loadLocal() {
    try {
      const data = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      const normalized = parsed
        .map(item => (item && typeof item === "object") ? (item.productId || item.id) : item)
        .filter(id => id && typeof id === "string" && !REMOVED_PRODUCT_IDS.has(id));
      const unique = Array.from(new Set(normalized));
      if (unique.length !== parsed.length) {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(unique));
      }
      return unique;
    } catch (e) {
      return [];
    }
  }

  saveLocal() {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(this.productIds));
      this.updateHeaderBadge();
      this.notifySubscribers();

      const user = getCurrentUser();
      if (user && user.uid) {
        saveWishlistToCloud(user.uid, this.productIds);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async initCloudSync() {
    const user = getCurrentUser();
    if (user && user.uid) {
      const cloudIds = await getWishlistFromCloud(user.uid);
      if (cloudIds && cloudIds.length > 0) {
        const set = new Set([...this.productIds, ...cloudIds]);
        this.productIds = Array.from(set);
        this.saveLocal();
      }
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.productIds);
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => cb(this.productIds));
  }

  isInWishlist(productId) {
    return this.productIds.includes(productId);
  }

  toggle(productId, buttonElement = null) {
    const index = this.productIds.indexOf(productId);
    let added = false;

    if (index > -1) {
      this.productIds.splice(index, 1);
      added = false;
    } else {
      this.productIds.push(productId);
      added = true;
    }

    this.saveLocal();

    // Trigger micro-animation on heart button
    if (buttonElement) {
      buttonElement.classList.remove("heart-popping");
      void buttonElement.offsetWidth;
      buttonElement.classList.add("heart-popping");
      buttonElement.classList.toggle("is-active", added);
    }

    if (window.showToast) {
      if (added) {
        window.showToast("Saved to Wishlist", "Item added to your saved favourites.", "info");
      } else {
        window.showToast("Removed from Wishlist", "Item removed from your favourites.", "info");
      }
    }

    return added;
  }

  updateHeaderBadge() {
    const badge = document.getElementById("wishlist-badge-count");
    if (!badge) return;
    const count = this.productIds.length;
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }

  async moveToCart(productId) {
    const product = await getProductById(productId);
    if (product) {
      cart.addItem(product, 1, "", null);
      this.toggle(productId);
    }
  }
}

export const wishlist = new WishlistService();
window.wishlistInstance = wishlist;
