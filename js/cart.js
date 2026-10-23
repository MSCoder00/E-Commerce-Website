// ==========================================================================
// MS STORE - Shopping Cart Module
// Cart State, Storage, Discounts, Fly-to-Cart Animation, Mini-Cart Drawer
// Compliant with PRD Section 6.7 & Section 8
// ==========================================================================

import { getProductById } from "./firebase-service.js";
import { saveCartToCloud, getCartFromCloud } from "./firebase-service.js";
import { getCurrentUser } from "./auth.js";
import { getProductUrl } from "./utils.js";

const CART_STORAGE_KEY = "ms_store_cart_v1";
const COUPON_STORAGE_KEY = "ms_store_applied_coupon";

const VALID_COUPONS = {
  "WELCOME10": { code: "WELCOME10", discountPercent: 10, label: "10% Welcome Discount" },
  "SPRING20": { code: "SPRING20", discountPercent: 20, label: "20% Seasonal Promo" },
  "FREESHIP": { code: "FREESHIP", freeShipping: true, label: "Complimentary Express Delivery" }
};

class CartService {
  constructor() {
    this.items = this.loadCartLocal();
    this.appliedCoupon = this.loadCouponLocal();
    this.subscribers = [];
    this.initCloudSync();
  }

  loadCartLocal() {
    try {
      const data = localStorage.getItem(CART_STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      // Migrate old items: strip colour/color field, merge duplicate lines
      const mergedMap = new Map();
      for (const item of parsed) {
        if (!item || !item.productId) continue;
        const clean = { ...item };
        delete clean.colour;
        delete clean.color;
        const key = `${clean.productId}_${clean.variant || ""}`;
        if (mergedMap.has(key)) {
          const existing = mergedMap.get(key);
          existing.quantity = (existing.quantity || 1) + (clean.quantity || 1);
        } else {
          mergedMap.set(key, clean);
        }
      }
      return Array.from(mergedMap.values());
    } catch (e) {
      return [];
    }
  }

  saveCartLocal() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
      this.updateHeaderBadge();
      this.renderMiniCart();
      this.notifySubscribers();

      // Cloud sync if user logged in
      const user = getCurrentUser();
      if (user && user.uid) {
        saveCartToCloud(user.uid, this.items);
      }
    } catch (e) {
      console.error("Cart save error", e);
    }
  }

  loadCouponLocal() {
    try {
      const c = localStorage.getItem(COUPON_STORAGE_KEY);
      return c ? JSON.parse(c) : null;
    } catch (e) {
      return null;
    }
  }

  saveCouponLocal(coupon) {
    this.appliedCoupon = coupon;
    if (coupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
    this.notifySubscribers();
    this.renderMiniCart();
  }

  async initCloudSync() {
    const user = getCurrentUser();
    if (user && user.uid) {
      const cloudItems = await getCartFromCloud(user.uid);
      if (cloudItems && cloudItems.length > 0) {
        // Merge cloud items with local items (key = productId + size variant)
        const map = new Map();
        [...cloudItems, ...this.items].forEach(item => {
          if (!item || !item.productId) return;
          const clean = { ...item };
          delete clean.colour;
          delete clean.color;
          const key = `${clean.productId}-${clean.variant || ""}`;
          if (map.has(key)) {
            map.get(key).quantity += (clean.quantity || 1);
          } else {
            map.set(key, clean);
          }
        });
        this.items = Array.from(map.values());
        this.saveCartLocal();
      }
    }
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.getItems(), this.getTotals());
  }

  notifySubscribers() {
    const items = this.getItems();
    const totals = this.getTotals();
    this.subscribers.forEach(cb => cb(items, totals));
  }

  getItems() {
    return this.items;
  }

  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  async addItem(product, quantity = 1, variant = "", sourceImgElement = null) {
    if (!product) return;

    const itemImg = (product.images && product.images.length > 0)
      ? product.images[0]
      : "/assets/images/placeholder.svg";

    // Key is productId + size variant (no colour)
    const key = `${product.id}-${variant || ""}`;
    const existingIndex = this.items.findIndex(i => `${i.productId}-${i.variant || ""}` === key);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: itemImg,
        category: product.category,
        variant: variant || "",
        quantity: quantity
      });
    }

    // Fly-To-Cart Animation
    if (sourceImgElement) {
      this.triggerFlyToCartAnimation(sourceImgElement);
    }

    this.saveCartLocal();

    if (window.showToast) {
      window.showToast("Added to Cart", `${product.name} (${quantity}) added to your bag.`, "success");
    }

    this.openMiniCart();
  }

  removeItem(productId, variant = "") {
    const key = `${productId}-${variant}`;
    this.items = this.items.filter(i => `${i.productId}-${i.variant || ""}` !== key);
    this.saveCartLocal();
  }

  updateQuantity(productId, variant = "", quantity) {
    const key = `${productId}-${variant}`;
    const item = this.items.find(i => `${i.productId}-${i.variant || ""}` === key);
    if (!item) return;

    if (quantity <= 0) {
      this.removeItem(productId, variant);
    } else {
      item.quantity = Math.min(99, quantity);
      this.saveCartLocal();
    }
  }

  clearCart() {
    this.items = [];
    this.saveCartLocal();
  }

  applyCoupon(code) {
    const cleanCode = (code || "").trim().toUpperCase();
    if (!cleanCode) return { success: false, message: "Please enter a valid coupon code." };

    if (VALID_COUPONS[cleanCode]) {
      this.saveCouponLocal(VALID_COUPONS[cleanCode]);
      return { success: true, message: `Promo code ${cleanCode} applied successfully!` };
    }
    return { success: false, message: "Invalid promo code. Try WELCOME10 or SPRING20." };
  }

  removeCoupon() {
    this.saveCouponLocal(null);
  }

  getTotals() {
    const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const freeShippingThreshold = 50;

    let shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 5.99;
    let discountAmount = 0;

    if (this.appliedCoupon) {
      if (this.appliedCoupon.freeShipping) {
        shippingFee = 0;
      }
      if (this.appliedCoupon.discountPercent) {
        discountAmount = Math.round((subtotal * this.appliedCoupon.discountPercent) / 100);
      }
    }

    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const estimatedTax = taxableAmount > 0 ? Math.round(taxableAmount * 0.08 * 100) / 100 : 0;
    const finalTotal = Math.max(0, taxableAmount + shippingFee + estimatedTax);

    return {
      subtotal,
      shippingFee,
      freeShippingThreshold,
      amountToFreeShipping: Math.max(0, freeShippingThreshold - subtotal),
      discountAmount,
      appliedCoupon: this.appliedCoupon,
      estimatedTax,
      finalTotal: Math.round(finalTotal * 100) / 100
    };
  }

  // ==========================================================================
  // Micro-Animations & Drawer UI
  // ==========================================================================

  triggerFlyToCartAnimation(sourceElement) {
    try {
      const cartIcon = document.getElementById("header-cart-btn") || document.querySelector(".header-cart-icon");
      if (!cartIcon || !sourceElement) return;

      const srcRect = sourceElement.getBoundingClientRect();
      const targetRect = cartIcon.getBoundingClientRect();

      const flyingImg = document.createElement("img");
      flyingImg.src = sourceElement.src || (sourceElement.querySelector("img") ? sourceElement.querySelector("img").src : "");
      if (!flyingImg.src) return;

      flyingImg.className = "flying-img-clone";
      flyingImg.style.top = `${srcRect.top}px`;
      flyingImg.style.left = `${srcRect.left}px`;
      flyingImg.style.width = `${srcRect.width}px`;
      flyingImg.style.height = `${srcRect.height}px`;

      document.body.appendChild(flyingImg);
      flyingImg.getBoundingClientRect(); // Force reflow

      requestAnimationFrame(() => {
        flyingImg.style.top = `${targetRect.top + 8}px`;
        flyingImg.style.left = `${targetRect.left + 8}px`;
        flyingImg.style.width = "20px";
        flyingImg.style.height = "20px";
        flyingImg.style.opacity = "0.2";
        flyingImg.style.transform = "rotate(360deg)";
      });

      setTimeout(() => {
        flyingImg.remove();
        const badge = document.getElementById("cart-badge-count");
        if (badge) {
          badge.classList.remove("badge-bounce");
          void badge.offsetWidth;
          badge.classList.add("badge-bounce");
        }
      }, 750);
    } catch (e) {
      console.warn("Fly animation skipped:", e);
    }
  }

  updateHeaderBadge() {
    const badge = document.getElementById("cart-badge-count");
    if (!badge) return;
    const count = this.getTotalCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }

  renderMiniCart() {
    const bodyEl = document.getElementById("cart-drawer-items-list");
    const subtotalEl = document.getElementById("mini-cart-subtotal");
    const totalEl = document.getElementById("mini-cart-total");
    const freeShippingText = document.getElementById("free-shipping-meter-text");
    const freeShippingFill = document.getElementById("free-shipping-progress-fill");

    if (!bodyEl) return;

    const items = this.getItems();
    const totals = this.getTotals();

    // Free shipping progress
    if (freeShippingText && freeShippingFill) {
      if (totals.subtotal >= totals.freeShippingThreshold || items.length === 0) {
        freeShippingText.innerHTML = `<span>✓ You have unlocked <strong>FREE Shipping!</strong></span>`;
        freeShippingFill.style.width = items.length === 0 ? "0%" : "100%";
      } else {
        const percent = Math.min(100, Math.round((totals.subtotal / totals.freeShippingThreshold) * 100));
        freeShippingText.innerHTML = `Add <strong>$${totals.amountToFreeShipping.toFixed(2)}</strong> more to unlock <strong>FREE Shipping</strong>!`;
        freeShippingFill.style.width = `${percent}%`;
      }
    }

    if (items.length === 0) {
      bodyEl.innerHTML = `
        <div class="drawer-empty-state">
          <div class="drawer-empty-icon">
            <i data-lucide="shopping-bag" style="width:36px;height:36px;"></i>
          </div>
          <h4 style="margin-bottom:0.35rem;">Your Cart is Empty</h4>
          <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.5rem;">Explore our latest deals and add your favourite pieces.</p>
          <a href="shop.html" class="btn btn-primary btn-sm drawer-close-trigger">Explore Shop</a>
        </div>
      `;
    } else {
      bodyEl.innerHTML = items.map(item => `
        <div class="drawer-cart-item" data-id="${item.productId}" data-variant="${item.variant || ""}">
          <a href="${getProductUrl(item.productId)}" class="drawer-item-img-link" style="display:block;flex-shrink:0;">
            <img src="${item.image || '/assets/images/placeholder.svg'}" alt="${item.name}" class="drawer-item-img" width="70" height="70" loading="lazy" style="object-fit:cover;" onerror="this.onerror=null;this.src='/assets/images/placeholder.svg';">
          </a>
          <div class="drawer-item-details">
            <div>
              <a href="${getProductUrl(item.productId)}" style="color:inherit;text-decoration:none;">
                <div class="drawer-item-title">${item.name}</div>
              </a>
              ${item.variant ? `<div class="drawer-item-variant">${item.variant}</div>` : ""}
            </div>
            <div class="drawer-item-bottom">
              <div class="drawer-qty-control">
                <button class="drawer-qty-btn btn-qty-minus" aria-label="Decrease quantity">−</button>
                <span class="drawer-qty-val">${item.quantity}</span>
                <button class="drawer-qty-btn btn-qty-plus" aria-label="Increase quantity">+</button>
              </div>
              <div class="drawer-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
              <button class="drawer-item-remove btn-item-del" aria-label="Remove item">
                <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
              </button>
            </div>
          </div>
        </div>
      `).join("");
    }

    if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${totals.finalTotal.toFixed(2)}`;

    this.attachDrawerListeners(bodyEl);

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  attachDrawerListeners(bodyEl) {
    bodyEl.querySelectorAll(".drawer-cart-item").forEach(itemEl => {
      const id = itemEl.getAttribute("data-id");
      const variant = itemEl.getAttribute("data-variant") || "";

      itemEl.querySelector(".btn-qty-minus")?.addEventListener("click", () => {
        const current = this.items.find(i => i.productId === id && (i.variant || "") === variant);
        if (current) this.updateQuantity(id, variant, current.quantity - 1);
      });

      itemEl.querySelector(".btn-qty-plus")?.addEventListener("click", () => {
        const current = this.items.find(i => i.productId === id && (i.variant || "") === variant);
        if (current) this.updateQuantity(id, variant, current.quantity + 1);
      });

      itemEl.querySelector(".btn-item-del")?.addEventListener("click", () => {
        this.removeItem(id, variant);
      });
    });

    bodyEl.querySelectorAll(".drawer-close-trigger").forEach(btn => {
      btn.addEventListener("click", () => this.closeMiniCart());
    });
  }

  openMiniCart() {
    const drawer = document.getElementById("cart-slide-drawer");
    const overlay = document.getElementById("cart-drawer-overlay");
    if (drawer && overlay) {
      drawer.classList.add("is-open");
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    this.renderMiniCart();
  }

  closeMiniCart() {
    const drawer = document.getElementById("cart-slide-drawer");
    const overlay = document.getElementById("cart-drawer-overlay");
    if (drawer && overlay) {
      drawer.classList.remove("is-open");
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  }
}

export const cart = new CartService();
window.cartInstance = cart;
