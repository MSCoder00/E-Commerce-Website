// ==========================================================================
// MS STORE - Core UI Controller
// Global header, live search autocomplete, theme switcher, quick view modal, toasts
// ==========================================================================

import { PRODUCTS_CATALOG } from "./products-data.js";
import { cart } from "./cart.js";
import { wishlist } from "./wishlist.js";
import { subscribeNewsletter } from "./firebase-service.js";
import { getProductUrl } from "./utils.js";

// ==========================================================================
// 1. Toast Notification System
// ==========================================================================
export function showToast(title, message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let iconName = "info";
  if (type === "success") iconName = "check-circle";
  if (type === "error") iconName = "alert-circle";

  toast.innerHTML = `
    <div class="toast-icon">
      <i data-lucide="${iconName}" style="width:18px;height:18px;"></i>
    </div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close-btn" aria-label="Close notification">
      <i data-lucide="x" style="width:16px;height:16px;"></i>
    </button>
  `;

  container.appendChild(toast);

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons({ root: toast });
  }

  const dismiss = () => {
    toast.classList.add("is-leaving");
    setTimeout(() => toast.remove(), 250);
  };

  toast.querySelector(".toast-close-btn")?.addEventListener("click", dismiss);
  setTimeout(dismiss, 3500);
}

window.showToast = showToast; // global handle

// ==========================================================================
// 2. Product Card HTML Generator
// ==========================================================================
export function createProductCardHTML(product, isListView = false) {
  const id = (product.id || product.productId || product.docId || (product.doc && product.doc.id) || "").toString().trim();
  const isWishlisted = wishlist.isInWishlist(id);
  const primaryImg = product.images && product.images[0] ? product.images[0] : "";
  const productUrl = getProductUrl(id || product);

  return `
    <div class="product-card ${isListView ? "is-list-view" : ""}" data-id="${id}" data-product-id="${id}">
      <a href="${productUrl}" class="product-img-wrap">
        <img src="${primaryImg || '/assets/images/placeholder.svg'}" alt="${product.name}" class="product-img" loading="lazy" width="300" height="300" style="object-fit:cover;" onerror="this.onerror=null;this.src='/assets/images/placeholder.svg';">
      </a>

      <div class="product-badge-wrap">
        ${product.isDeal ? `<span class="badge badge-deal">-${product.discount}% OFF</span>` : ""}
        ${product.isFeatured && !product.isDeal ? `<span class="badge badge-new">HOT</span>` : ""}
      </div>

      <div class="product-actions">
        <button class="action-icon-btn btn-wishlist-toggle ${isWishlisted ? "is-active" : ""}" data-id="${id}" aria-label="Add to wishlist" title="Add to wishlist">
          <i data-lucide="heart" style="width:16px;height:16px;"></i>
        </button>
        <button class="action-icon-btn btn-quick-view" data-id="${id}" aria-label="Quick view" title="Quick view">
          <i data-lucide="eye" style="width:16px;height:16px;"></i>
        </button>
      </div>

      <div class="product-content">
        <span class="product-category">${product.category}</span>
        <a href="${productUrl}">
          <h3 class="product-title">${product.name}</h3>
        </a>

        ${isListView ? `<p class="product-description-snippet">${product.description}</p>` : ""}

        <div class="product-rating">
          <div class="stars-list">
            ${generateStarRatingHTML(product.rating)}
          </div>
          <span>(${product.reviewCount})</span>
        </div>

        <div class="product-footer">
          <div class="price-wrap">
            <span class="current-price">$${product.price.toFixed(2)}</span>
            ${product.oldPrice ? `<span class="old-price">$${product.oldPrice.toFixed(2)}</span>` : ""}
          </div>
          <button class="btn-add-cart btn-quick-add" data-id="${id}" aria-label="Add to cart">
            <i data-lucide="shopping-bag" style="width:15px;height:15px;"></i>
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function generateStarRatingHTML(rating) {
  const fullStars = Math.floor(rating);
  let starsHTML = "";
  for (let i = 0; i < fullStars; i++) {
    starsHTML += `<i data-lucide="star" style="width:14px;height:14px;fill:#FBBF24;"></i>`;
  }
  if (rating % 1 >= 0.4) {
    starsHTML += `<i data-lucide="star-half" style="width:14px;height:14px;fill:#FBBF24;"></i>`;
  }
  return starsHTML;
}

// Bind product card events (Add to cart, Wishlist, Quick view)
export function attachProductCardListeners(container = document) {
  container.querySelectorAll(".btn-quick-add").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = btn.getAttribute("data-id");
      const card = btn.closest(".product-card");
      const img = card ? card.querySelector(".product-img") : null;
      const product = PRODUCTS_CATALOG.find(p => p.id === id);
      if (product) {
        cart.addItem(product, 1, "", img);
      }
    });
  });

  container.querySelectorAll(".btn-wishlist-toggle").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = btn.getAttribute("data-id");
      wishlist.toggle(id, btn);
    });
  });

  container.querySelectorAll(".btn-quick-view").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = btn.getAttribute("data-id");
      const product = PRODUCTS_CATALOG.find(p => p.id === id);
      if (product) {
        openQuickViewModal(product);
      }
    });
  });

  container.querySelectorAll(".product-card:not(.skeleton-card)").forEach(card => {
    if (card._cardClickBound) return;
    card._cardClickBound = true;
    card.addEventListener("click", (e) => {
      if (e.target.closest("button") || e.target.closest("a")) return;
      const id = (card.getAttribute("data-id") || card.getAttribute("data-product-id") || "").trim();
      if (id) {
        window.location.href = getProductUrl(id);
      }
    });
  });

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

// ==========================================================================
// 3. Quick View Modal
// ==========================================================================
export function openQuickViewModal(product) {
  let modalWrap = document.getElementById("quick-view-modal");
  if (!modalWrap) {
    modalWrap = document.createElement("div");
    modalWrap.id = "quick-view-modal";
    modalWrap.className = "modal-backdrop";
    document.body.appendChild(modalWrap);
  }

  const isWishlisted = wishlist.isInWishlist(product.id);
  const primaryImg = product.images && product.images[0] ? product.images[0] : "";

  modalWrap.innerHTML = `
    <div class="modal-dialog" style="max-width:820px;text-align:left;padding:2rem;">
      <button class="drawer-close-btn" id="modal-close-btn" style="position:absolute;top:1rem;right:1rem;" aria-label="Close modal">
        <i data-lucide="x" style="width:20px;height:20px;"></i>
      </button>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:2rem;">
        <div>
          <div style="aspect-ratio:1/1;border-radius:var(--radius-md);overflow:hidden;background-color:var(--slate-100);margin-bottom:0.75rem;">
            <img id="qv-main-img" src="${primaryImg || '/assets/images/placeholder.svg'}" alt="${product.name}" width="400" height="400" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null;this.src='/assets/images/placeholder.svg';">
          </div>
          <div style="display:flex;gap:0.5rem;overflow-x:auto;">
            ${(product.images || []).map((img, i) => `
              <img src="${img}" alt="Thumbnail ${i}" class="qv-thumb" width="60" height="60" loading="lazy" style="width:60px;height:60px;object-fit:cover;border-radius:var(--radius-xs);cursor:pointer;border:2px solid ${i === 0 ? "var(--primary)" : "transparent"};" data-src="${img}" onerror="this.onerror=null;this.src='/assets/images/placeholder.svg';">
            `).join("")}
          </div>
        </div>

        <div style="display:flex;flex-direction:column;">
          <span style="font-size:0.75rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.35rem;">${product.brand}</span>
          <h2 style="font-size:1.45rem;margin-bottom:0.65rem;">${product.name}</h2>

          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;font-size:0.875rem;">
            <div style="display:flex;color:#FBBF24;">${generateStarRatingHTML(product.rating)}</div>
            <span style="color:var(--text-muted);">${product.rating} (${product.reviewCount} reviews)</span>
            <span style="color:var(--border-color);">•</span>
            <span style="color:var(--success);font-weight:600;">In Stock (${product.stock} units)</span>
          </div>

          <div style="display:flex;align-items:baseline;gap:0.75rem;margin-bottom:1.25rem;">
            <span style="font-size:1.65rem;font-weight:800;color:var(--text-main);">$${product.price.toFixed(2)}</span>
            ${product.oldPrice ? `<span style="font-size:1.05rem;color:var(--text-muted);text-decoration:line-through;">$${product.oldPrice.toFixed(2)}</span>` : ""}
            ${product.isDeal ? `<span class="badge badge-deal">Save ${product.discount}%</span>` : ""}
          </div>

          <p style="font-size:0.875rem;color:var(--text-muted);line-height:1.6;margin-bottom:1.5rem;">
            ${product.description.substring(0, 160)}...
          </p>

          <div style="margin-top:auto;display:flex;flex-direction:column;gap:1rem;">
            <div style="display:flex;align-items:center;gap:1rem;">
              <div class="drawer-qty-control" style="height:44px;">
                <button id="qv-qty-minus" class="drawer-qty-btn" style="width:36px;height:42px;">−</button>
                <span id="qv-qty-val" class="drawer-qty-val" style="width:44px;font-size:1rem;">1</span>
                <button id="qv-qty-plus" class="drawer-qty-btn" style="width:36px;height:42px;">+</button>
              </div>

              <button id="qv-add-cart-btn" class="btn btn-primary" style="flex:1;height:44px;">
                <i data-lucide="shopping-bag" style="width:18px;height:18px;"></i>
                <span>Add to Cart</span>
              </button>

              <button id="qv-wishlist-btn" class="btn btn-outline btn-icon ${isWishlisted ? "is-active" : ""}" style="width:44px;height:44px;">
                <i data-lucide="heart" style="width:18px;height:18px;"></i>
              </button>
            </div>

            <a href="${getProductUrl(product)}" class="btn btn-ghost btn-sm" style="text-align:center;">
              View Full Product Details →
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  modalWrap.classList.add("is-open");
  document.body.style.overflow = "hidden";

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons({ root: modalWrap });
  }

  // Thumbnails click
  const mainImg = modalWrap.querySelector("#qv-main-img");
  modalWrap.querySelectorAll(".qv-thumb").forEach(thumb => {
    thumb.addEventListener("click", () => {
      modalWrap.querySelectorAll(".qv-thumb").forEach(t => t.style.borderColor = "transparent");
      thumb.style.borderColor = "var(--primary)";
      mainImg.src = thumb.getAttribute("data-src");
    });
  });

  // Quantity control
  let qty = 1;
  const qtyVal = modalWrap.querySelector("#qv-qty-val");
  modalWrap.querySelector("#qv-qty-minus")?.addEventListener("click", () => {
    if (qty > 1) {
      qty--;
      qtyVal.textContent = qty;
    }
  });
  modalWrap.querySelector("#qv-qty-plus")?.addEventListener("click", () => {
    qty++;
    qtyVal.textContent = qty;
  });

  // Add to Cart
  modalWrap.querySelector("#qv-add-cart-btn")?.addEventListener("click", () => {
    cart.addItem(product, qty, "", mainImg);
    closeQuickViewModal();
  });

  // Wishlist toggle
  const wishBtn = modalWrap.querySelector("#qv-wishlist-btn");
  wishBtn?.addEventListener("click", () => {
    wishlist.toggle(product.id, wishBtn);
  });

  // Close handlers
  const close = () => closeQuickViewModal();
  modalWrap.querySelector("#modal-close-btn")?.addEventListener("click", close);
  modalWrap.addEventListener("click", (e) => {
    if (e.target === modalWrap) close();
  });
}

export function closeQuickViewModal() {
  const modalWrap = document.getElementById("quick-view-modal");
  if (modalWrap) {
    modalWrap.classList.remove("is-open");
    document.body.style.overflow = "";
  }
}

// ==========================================================================
// 4. Live Search Autocomplete
// ==========================================================================
export function initLiveSearch() {
  const searchInputs = document.querySelectorAll(".search-input");
  const dropdown = document.getElementById("search-results-dropdown");
  const resultsList = document.getElementById("search-results-list");

  if (!dropdown || !resultsList) return;

  searchInputs.forEach(input => {
    let debounceTimer = null;

    input.addEventListener("input", (e) => {
      clearTimeout(debounceTimer);
      const query = e.target.value.trim().toLowerCase();

      if (query.length < 2) {
        dropdown.classList.remove("is-open");
        return;
      }

      debounceTimer = setTimeout(() => {
        const matches = PRODUCTS_CATALOG.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.subCategory.toLowerCase().includes(query) ||
          (p.tags && p.tags.some(t => t.toLowerCase().includes(query)))
        ).slice(0, 5);

        if (matches.length > 0) {
          resultsList.innerHTML = matches.map(prod => `
            <a href="${getProductUrl(prod)}" class="search-result-item">
              <img src="${prod.images && prod.images[0] ? prod.images[0] : '/assets/images/placeholder.svg'}" alt="${prod.name}" class="search-result-thumb" width="44" height="44" loading="lazy" style="object-fit:cover;" onerror="this.onerror=null;this.src='/assets/images/placeholder.svg';">
              <div class="search-result-info">
                <div class="search-result-title">${prod.name}</div>
                <div class="search-result-meta">
                  <span>${prod.category}</span>
                  <span>•</span>
                  <span class="search-result-price">$${prod.price.toFixed(2)}</span>
                </div>
              </div>
            </a>
          `).join("");

          const viewAllBtn = dropdown.querySelector(".search-view-all-btn");
          if (viewAllBtn) {
            viewAllBtn.onclick = () => {
              window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
            };
          }

          dropdown.classList.add("is-open");
        } else {
          resultsList.innerHTML = `
            <div style="padding:1.5rem;text-align:center;color:var(--text-muted);font-size:0.875rem;">
              No matches found for "<strong>${query}</strong>".
            </div>
          `;
          dropdown.classList.add("is-open");
        }
      }, 200);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const query = input.value.trim();
        if (query) {
          window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".header-search") && !e.target.closest("#search-results-dropdown")) {
      dropdown.classList.remove("is-open");
    }
  });
}

// ==========================================================================
// 5. Theme Switcher (Dark / Light Mode)
// ==========================================================================
export function initThemeToggle() {
  const savedTheme = localStorage.getItem("ms_store_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const toggles = document.querySelectorAll(".theme-toggle-btn");
  toggles.forEach(btn => {
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("ms_store_theme", next);
      showToast("Theme Updated", `Switched to ${next} mode`, "info");
    });
  });
}

// ==========================================================================
// 6. Global Event Handlers & Init
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Global image error fallback for any img that fails to load
  window.addEventListener("error", (e) => {
    if (e.target && e.target.tagName === "IMG" && !e.target.dataset.fallbackApplied) {
      e.target.dataset.fallbackApplied = "true";
      e.target.src = "/assets/images/placeholder.svg";
    }
  }, true);

  // Initialize Lucide icons
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }

  // Sticky header scroll shadow
  const header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener("scroll", () => {
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    }, { passive: true });
  }

  // Back to top button
  const backToTop = document.getElementById("back-to-top-btn");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("is-visible", window.scrollY > 350);
    }, { passive: true });
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Mini-cart drawer toggles
  document.getElementById("header-cart-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    cart.openMiniCart();
  });
  document.getElementById("cart-drawer-close-btn")?.addEventListener("click", () => cart.closeMiniCart());
  document.getElementById("cart-drawer-overlay")?.addEventListener("click", () => cart.closeMiniCart());

  // Mobile menu drawer toggle
  const mobileToggle = document.getElementById("mobile-menu-toggle");
  const mobileDrawer = document.getElementById("mobile-nav-drawer");
  const mobileClose = document.getElementById("mobile-drawer-close");
  const mobileOverlay = document.getElementById("mobile-drawer-overlay");

  if (mobileToggle && mobileDrawer) {
    const openMobile = () => {
      mobileDrawer.classList.add("is-open");
      if (mobileOverlay) mobileOverlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };
    const closeMobile = () => {
      mobileDrawer.classList.remove("is-open");
      if (mobileOverlay) mobileOverlay.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    mobileToggle.addEventListener("click", openMobile);
    mobileClose?.addEventListener("click", closeMobile);
    mobileOverlay?.addEventListener("click", closeMobile);
  }

  // Initialize search and theme
  initLiveSearch();
  initThemeToggle();

  // Newsletter form submission
  document.querySelectorAll(".newsletter-form").forEach(form => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector("input[type='email']");
      if (input && input.value) {
        await subscribeNewsletter(input.value.trim());
        showToast("Subscribed!", "Thank you for subscribing to MS STORE updates & VIP sales.", "success");
        input.value = "";
      }
    });
  });

  // Initial cart & wishlist badge refresh
  cart.updateHeaderBadge();
  wishlist.updateHeaderBadge();
});
