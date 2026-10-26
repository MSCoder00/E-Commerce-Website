// ==========================================================================
// MS STORE - Product Detail Page Controller
// Supports dynamic product loading by URL ?id=, size variants,
// image gallery with smooth fade transition, keyboard accessible buttons,
// Add to Cart / Buy Now, wishlist sync, reviews,
// and related products from same category
// ==========================================================================

import { getProductById, getProducts, getProductReviews, addProductReview } from "./firebase-service.js";
import { PRODUCTS_CATALOG } from "./products-data.js";
import { cart } from "./cart.js";
import { wishlist } from "./wishlist.js";
import { getCurrentUser } from "./auth.js";
import { createProductCardHTML, attachProductCardListeners, showToast } from "./ui.js";
import { getProductUrl } from "./utils.js";
import { requireAuthForAction } from "./auth-guard.js";

class ProductDetailPage {
  constructor() {
    this.product = null;
    this.sizesList = [];
    this.selectedSize = "";
    this.currentImages = [];
    this.activeImageIndex = 0;
    this.quantity = 1;
    this.productId = this.extractProductId();

    this.init();
    this.setupHistoryListener();
  }

  extractProductId() {
    // 1. Query parameter ?id=
    const params = new URLSearchParams(window.location.search);
    const queryId = params.get("id");
    if (queryId && queryId.trim()) return queryId.trim();

    // 2. Hash fallback #id
    if (window.location.hash) {
      const hashId = window.location.hash.replace(/^#/, "").trim();
      if (hashId && !hashId.includes("/")) return hashId;
    }

    // 3. Last path segment fallback (e.g. /product/prod-elec-01)
    const segments = window.location.pathname.split("/").filter(Boolean);
    const lastSeg = segments[segments.length - 1];
    if (lastSeg && lastSeg !== "product" && lastSeg !== "product.html") {
      return decodeURIComponent(lastSeg).replace(/\.html$/, "").trim();
    }

    return "";
  }

  setupHistoryListener() {
    const handleUrlChange = () => {
      const newId = this.extractProductId();
      if (newId !== this.productId) {
        this.productId = newId;
        this.init();
      } else if (this.product) {
        this.syncSizeFromUrl();
      }
    };
    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("hashchange", handleUrlChange);
  }

  async init() {
    this.productId = this.extractProductId();

    if (!this.productId) {
      console.error(
        "[MS STORE] Product ID missing from URL (?id=...). Available catalog IDs:",
        PRODUCTS_CATALOG.map(p => p.id)
      );
      this.renderNotFound();
      return;
    }

    // Keep the main detail layout showing its skeleton while fetching
    const skeleton = document.getElementById("pdp-img-skeleton");
    if (skeleton) skeleton.style.display = "block";

    await this.loadProduct();
    if (this.product) {
      this.saveRecentlyViewed(this.product.id);
      this.prepareVariants();
      this.renderProductInfo();
      this.initGalleryAndZoom();
      this.initVariantsAndQuantity();
      this.initActions();
      this.initTabs();
      this.loadReviews();
      this.loadRelatedProducts();
      this.loadRecentlyViewed();
    }
  }

  async loadProduct() {
    this.product = await getProductById(this.productId);
    if (!this.product) {
      console.error(
        `[MS STORE] Product Not Found for ID: "${this.productId}". Available catalog IDs:`,
        PRODUCTS_CATALOG.map(p => p.id)
      );
      this.renderNotFound();
      return;
    }
    document.title = `${this.product.name} | MS STORE`;
  }

  renderNotFound() {
    document.title = "Product Not Found | MS STORE";
    const container = document.getElementById("product-detail-container");
    if (container) {
      container.innerHTML = `
        <div style="text-align:center;padding:5rem 1rem;">
          <div style="width:68px;height:68px;border-radius:50%;background:var(--slate-100);color:var(--slate-400);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
            <i data-lucide="help-circle" style="width:34px;height:34px;"></i>
          </div>
          <h2 style="font-size:2rem;margin-bottom:0.75rem;">Product Not Found</h2>
          <p style="color:var(--text-muted);font-size:1rem;max-width:440px;margin:0 auto 2rem;">The item you are searching for might be out of stock, renamed, or relocated.</p>
          <a href="shop.html" class="btn btn-primary btn-lg">Return to Shop</a>
        </div>
      `;
      if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
      }
    }
  }

  prepareVariants() {
    // Size variants only (no colour)
    this.sizesList = this.product.sizes || (this.product.variants && this.product.variants.sizes) || [];

    // Parse initial size from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sizeParam = urlParams.get("size");

    if (this.sizesList.length > 0) {
      if (sizeParam && this.sizesList.includes(sizeParam)) {
        this.selectedSize = sizeParam;
      } else {
        this.selectedSize = this.sizesList[0];
      }
    } else {
      this.selectedSize = "";
    }

    // Use product images directly
    this.currentImages = (this.product.images && this.product.images.length > 0)
      ? this.product.images
      : ["/assets/images/placeholder.svg"];
  }

  syncSizeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const sizeParam = urlParams.get("size");
    if (this.sizesList.length > 0 && sizeParam && sizeParam !== this.selectedSize) {
      if (this.sizesList.includes(sizeParam)) {
        this.selectSize(sizeParam, false);
      }
    }
  }

  renderProductInfo() {
    // Breadcrumbs
    const catCrumb = document.getElementById("pdp-category-crumb");
    if (catCrumb) {
      catCrumb.textContent = this.product.category;
      catCrumb.href = `shop.html?category=${encodeURIComponent(this.product.category)}`;
    }
    const titleCrumb = document.getElementById("pdp-title-crumb");
    if (titleCrumb) titleCrumb.textContent = this.product.name;

    // Brand & Title
    const brandEl = document.getElementById("pdp-brand");
    if (brandEl) brandEl.textContent = this.product.brand;
    const titleEl = document.getElementById("pdp-title");
    if (titleEl) titleEl.textContent = this.product.name;

    // Rating
    const ratingEl = document.getElementById("pdp-rating-num");
    if (ratingEl) ratingEl.textContent = this.product.rating;
    const revCountEl = document.getElementById("pdp-review-count");
    if (revCountEl) revCountEl.textContent = `(${this.product.reviewCount} customer reviews)`;

    // Pricing
    const priceEl = document.getElementById("pdp-price");
    if (priceEl) priceEl.textContent = `$${this.product.price.toFixed(2)}`;
    const oldPriceEl = document.getElementById("pdp-old-price");
    const discountEl = document.getElementById("pdp-discount-badge");

    if (oldPriceEl) {
      if (this.product.oldPrice) {
        oldPriceEl.textContent = `$${this.product.oldPrice.toFixed(2)}`;
        oldPriceEl.style.display = "inline";
      } else {
        oldPriceEl.style.display = "none";
      }
    }

    if (discountEl) {
      if (this.product.isDeal && this.product.discount) {
        discountEl.textContent = `Save ${this.product.discount}%`;
        discountEl.style.display = "inline-block";
      } else {
        discountEl.style.display = "none";
      }
    }

    // Stock Status
    const stockEl = document.getElementById("pdp-stock-status");
    const addBtn = document.getElementById("pdp-add-cart-btn");
    const buyBtn = document.getElementById("pdp-buy-now-btn");
    const stock = Number(this.product.stock) || 0;

    if (stock <= 0) {
      if (stockEl) {
        stockEl.innerHTML = `<i data-lucide="x-circle" style="width:16px;height:16px;color:var(--error);"></i> <span style="color:var(--error);font-weight:600;">Out of Stock</span>`;
      }
      if (addBtn) {
        addBtn.disabled = true;
        addBtn.classList.add("disabled");
      }
      if (buyBtn) {
        buyBtn.disabled = true;
        buyBtn.classList.add("disabled");
      }
    } else if (stock <= 5) {
      if (stockEl) {
        stockEl.innerHTML = `<i data-lucide="alert-triangle" style="width:16px;height:16px;color:var(--warning);"></i> <span style="color:#B45309;font-weight:600;">Only ${stock} left in stock - order soon!</span>`;
      }
      if (addBtn) {
        addBtn.disabled = false;
        addBtn.classList.remove("disabled");
      }
      if (buyBtn) {
        buyBtn.disabled = false;
        buyBtn.classList.remove("disabled");
      }
    } else {
      if (stockEl) {
        stockEl.innerHTML = `<i data-lucide="check-circle" style="width:16px;height:16px;color:var(--success);"></i> <span style="color:var(--success);font-weight:600;">In Stock (${stock} units available)</span>`;
      }
      if (addBtn) {
        addBtn.disabled = false;
        addBtn.classList.remove("disabled");
      }
      if (buyBtn) {
        buyBtn.disabled = false;
        buyBtn.classList.remove("disabled");
      }
    }

    // Description snippet
    const descEl = document.getElementById("pdp-description-snippet");
    if (descEl) descEl.textContent = this.product.description;

    // Wishlist active state
    const wishBtn = document.getElementById("pdp-wishlist-btn");
    if (wishBtn && wishlist.isInWishlist(this.product.id)) {
      wishBtn.classList.add("is-active");
    }

    // Tab: Description
    const tabDesc = document.getElementById("pdp-tab-description");
    if (tabDesc) {
      tabDesc.innerHTML = `
        <p style="font-size:1rem;line-height:1.8;color:var(--text-main);margin-bottom:1.5rem;">${this.product.description}</p>
        <div style="background:var(--slate-50);padding:1.5rem;border-radius:var(--radius-md);border:1px solid var(--border-color);">
          <h4 style="margin-bottom:0.75rem;">Key Highlights</h4>
          <ul style="list-style:disc;padding-left:1.5rem;display:flex;flex-direction:column;gap:0.5rem;color:var(--text-muted);">
            ${(this.product.tags || []).map(tag => `<li>${tag}</li>`).join("")}
            <li>Authentic original release backed by MS STORE quality assurance</li>
            <li>Comprehensive manufacturer warranty with dedicated product support</li>
          </ul>
        </div>
      `;
    }

    // Tab: Specs
    const specsEl = document.getElementById("pdp-tab-specs");
    if (specsEl) {
      const specs = this.product.specs || {};
      const rows = Object.entries(specs).map(([key, val]) => `
        <tr style="border-bottom:1px solid var(--border-color);">
          <td style="padding:0.75rem 1rem;font-weight:600;width:35%;color:var(--text-main);background:var(--slate-50);">${key}</td>
          <td style="padding:0.75rem 1rem;color:var(--text-muted);">${val}</td>
        </tr>
      `).join("");

      specsEl.innerHTML = `
        <table style="width:100%;border-collapse:collapse;border:1px solid var(--border-color);border-radius:var(--radius-sm);overflow:hidden;">
          <tbody>${rows}</tbody>
        </table>
      `;
    }
  }

  // ==========================================================================
  // Gallery with Interactive Zoom and Smooth Fade Transition
  // ==========================================================================
  resolveImg(src) {
    if (!src) return "/assets/images/placeholder.svg";
    if (src.startsWith("http")) return src;
    return src.startsWith("/") ? src : "/" + src;
  }

  initGalleryAndZoom() {
    const mainImg = document.getElementById("pdp-main-image");
    const zoomContainer = document.getElementById("pdp-zoom-container");
    if (!mainImg) return;

    mainImg.style.transition = "opacity 0.25s ease, transform 0.15s ease";
    this.renderGalleryImages(0);

    // Hover Zoom on Desktop
    if (zoomContainer && !this._zoomInitialized) {
      this._zoomInitialized = true;
      zoomContainer.addEventListener("mousemove", (e) => {
        const { left, top, width, height } = zoomContainer.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        mainImg.style.transformOrigin = `${x}% ${y}%`;
        mainImg.style.transform = "scale(1.75)";
      });
      zoomContainer.addEventListener("mouseleave", () => {
        mainImg.style.transform = "scale(1)";
        mainImg.style.transformOrigin = "center center";
      });
    }
  }

  renderGalleryImages(activeIndex = 0) {
    const mainImg = document.getElementById("pdp-main-image");
    const thumbsContainer = document.getElementById("pdp-thumbnails");
    const skeleton = document.getElementById("pdp-img-skeleton");

    if (!mainImg || !thumbsContainer) return;

    this.activeImageIndex = activeIndex;
    const images = this.currentImages.length > 0 ? this.currentImages : ["/assets/images/placeholder.svg"];
    const targetSrc = this.resolveImg(images[activeIndex] || images[0]);

    // Smooth fade transition
    mainImg.style.opacity = "0";
    if (skeleton) skeleton.style.display = "block";

    const preloader = new Image();
    preloader.onload = () => {
      mainImg.src = targetSrc;
      if (skeleton) skeleton.style.display = "none";
      mainImg.style.opacity = "1";
    };
    preloader.onerror = () => {
      mainImg.src = "/assets/images/placeholder.svg";
      if (skeleton) skeleton.style.display = "none";
      mainImg.style.opacity = "1";
    };
    preloader.src = targetSrc;

    // Render Thumbnails
    thumbsContainer.innerHTML = images.map((img, i) => {
      const src = this.resolveImg(img);
      const isActive = i === activeIndex;
      return `
      <button type="button" class="pdp-thumb-wrap ${isActive ? "is-active" : ""}" data-index="${i}" data-src="${src}" aria-label="Product view ${i + 1}" style="width:76px;height:76px;border-radius:var(--radius-sm);overflow:hidden;cursor:pointer;border:2px solid ${isActive ? "var(--primary)" : "var(--border-color)"};flex-shrink:0;padding:0;background:transparent;transition:border-color 0.2s ease;">
        <img src="${src}" alt="${this.product.name} view ${i + 1}" width="76" height="76" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.onerror=null;this.src='/assets/images/placeholder.svg';">
      </button>`;
    }).join("");

    thumbsContainer.querySelectorAll(".pdp-thumb-wrap").forEach(wrap => {
      wrap.addEventListener("click", () => {
        const idx = Number(wrap.getAttribute("data-index"));
        this.selectThumbnail(idx);
      });
    });
  }

  selectThumbnail(index) {
    const mainImg = document.getElementById("pdp-main-image");
    const thumbsContainer = document.getElementById("pdp-thumbnails");
    const skeleton = document.getElementById("pdp-img-skeleton");

    if (!mainImg || !thumbsContainer) return;

    this.activeImageIndex = index;
    const images = this.currentImages.length > 0 ? this.currentImages : ["/assets/images/placeholder.svg"];
    const newSrc = this.resolveImg(images[index]);

    thumbsContainer.querySelectorAll(".pdp-thumb-wrap").forEach((w, i) => {
      if (i === index) {
        w.classList.add("is-active");
        w.style.borderColor = "var(--primary)";
      } else {
        w.classList.remove("is-active");
        w.style.borderColor = "var(--border-color)";
      }
    });

    mainImg.style.opacity = "0";
    if (skeleton) skeleton.style.display = "block";

    const preloader = new Image();
    preloader.onload = () => {
      mainImg.src = newSrc;
      if (skeleton) skeleton.style.display = "none";
      mainImg.style.opacity = "1";
    };
    preloader.onerror = () => {
      mainImg.src = "/assets/images/placeholder.svg";
      if (skeleton) skeleton.style.display = "none";
      mainImg.style.opacity = "1";
    };
    preloader.src = newSrc;
  }

  // ==========================================================================
  // Variants (Size only) with accessibility and keyboard navigation
  // ==========================================================================
  initVariantsAndQuantity() {
    const variantsContainer = document.getElementById("pdp-variants-container");
    if (!variantsContainer) return;

    variantsContainer.innerHTML = "";

    // Size Variant Picker (Fashion/Sports only)
    if (this.sizesList.length > 0) {
      const sizeWrap = document.createElement("div");
      sizeWrap.style.marginBottom = "1.5rem";

      sizeWrap.innerHTML = `
        <label style="display:block;font-size:0.875rem;font-weight:600;margin-bottom:0.6rem;">
          Select Size: <span id="pdp-selected-size-label" style="font-weight:500;color:var(--text-muted);">${this.selectedSize}</span>
        </label>
        <div class="size-options-wrap" role="radiogroup" aria-label="Product Sizes" style="display:flex;gap:0.65rem;flex-wrap:wrap;">
          ${this.sizesList.map(s => {
            const isSelected = this.selectedSize === s;
            return `
              <button
                type="button"
                role="radio"
                tabindex="0"
                aria-checked="${isSelected}"
                aria-label="Size: ${s}"
                class="btn variant-pill size-pill ${isSelected ? "btn-primary" : "btn-outline"}"
                data-size="${s}"
                style="min-height:44px;min-width:44px;display:inline-flex;align-items:center;justify-content:center;padding:0.5rem 1.15rem;border-radius:var(--radius-md);cursor:pointer;font-weight:600;font-size:0.875rem;transition:all 0.2s ease;"
              >
                ${s}
              </button>
            `;
          }).join("")}
        </div>
      `;

      variantsContainer.appendChild(sizeWrap);

      sizeWrap.querySelectorAll(".size-pill").forEach(btn => {
        btn.addEventListener("click", () => {
          const s = btn.getAttribute("data-size");
          this.selectSize(s, true);
        });
      });
    }

    // Quantity Selector
    const qtyValEl = document.getElementById("pdp-qty-val");
    const stockLimit = Number(this.product.stock) || 99;

    const setQty = (val) => {
      let num = parseInt(val, 10);
      if (isNaN(num) || num < 1) num = 1;
      if (stockLimit > 0 && num > stockLimit) {
        num = stockLimit;
        showToast("Stock Limit", `Only ${stockLimit} units are currently available.`, "info");
      }
      this.quantity = num;
      if (qtyValEl) {
        if ("value" in qtyValEl) qtyValEl.value = num;
        qtyValEl.textContent = num;
      }
    };

    setQty(1);

    document.getElementById("pdp-qty-minus")?.addEventListener("click", () => {
      if (this.quantity > 1) {
        setQty(this.quantity - 1);
      }
    });

    document.getElementById("pdp-qty-plus")?.addEventListener("click", () => {
      if (this.quantity < stockLimit) {
        setQty(this.quantity + 1);
      } else {
        showToast("Stock Limit", `Only ${stockLimit} units are currently available.`, "info");
      }
    });

    qtyValEl?.addEventListener("input", (e) => setQty(e.target.value));
    qtyValEl?.addEventListener("change", (e) => setQty(e.target.value));
  }

  selectSize(sizeStr, updateUrl = true) {
    if (!sizeStr) return;
    this.selectedSize = sizeStr;

    // Update Label
    const labelEl = document.getElementById("pdp-selected-size-label");
    if (labelEl) labelEl.textContent = sizeStr;

    // Highlight Button
    document.querySelectorAll(".size-pill").forEach(btn => {
      const isSelected = btn.getAttribute("data-size") === sizeStr;
      btn.setAttribute("aria-checked", isSelected);
      if (isSelected) {
        btn.classList.add("btn-primary");
        btn.classList.remove("btn-outline");
      } else {
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-outline");
      }
    });

    // Update URL without reloading (&size=...)
    if (updateUrl) {
      const url = new URL(window.location);
      url.searchParams.set("size", sizeStr);
      window.history.replaceState({}, "", url);
    }
  }

  getSelectedImage() {
    if (this.currentImages && this.currentImages.length > 0) {
      return this.currentImages[0];
    }
    if (this.product.images && this.product.images.length > 0) {
      return this.product.images[0];
    }
    return "/assets/images/placeholder.svg";
  }

  // ==========================================================================
  // Add to Cart, Buy Now, Wishlist Actions
  // ==========================================================================
  initActions() {
    const mainImg = document.getElementById("pdp-main-image");

    // Add to Cart
    document.getElementById("pdp-add-cart-btn")?.addEventListener("click", () => {
      if ((this.product.stock || 0) <= 0) {
        showToast("Out of Stock", "This product is currently out of stock.", "error");
        return;
      }
      if (this.sizesList.length > 0 && !this.selectedSize) {
        showToast("Select Size", "Please select a size before adding to bag.", "error");
        return;
      }
      cart.addItem(this.product, this.quantity, this.selectedSize, mainImg);
    });

    // Buy Now
    document.getElementById("pdp-buy-now-btn")?.addEventListener("click", () => {
      if ((this.product.stock || 0) <= 0) {
        showToast("Out of Stock", "This product is currently out of stock.", "error");
        return;
      }
      if (this.sizesList.length > 0 && !this.selectedSize) {
        showToast("Select Size", "Please select a size before proceeding to checkout.", "error");
        return;
      }
      requireAuthForAction(() => {
        cart.addItem(this.product, this.quantity, this.selectedSize, null);
        window.location.href = "checkout.html";
      });
    });

    // Wishlist
    const wishBtn = document.getElementById("pdp-wishlist-btn");
    wishBtn?.addEventListener("click", () => {
      wishlist.toggle(this.product.id, wishBtn);
    });
  }

  // ==========================================================================
  // Tabs Navigation
  // ==========================================================================
  initTabs() {
    const tabBtns = document.querySelectorAll(".pdp-tab-btn");
    const tabPanes = document.querySelectorAll(".pdp-tab-pane");

    tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-tab");

        tabBtns.forEach(b => b.classList.remove("active"));
        tabPanes.forEach(p => p.style.display = "none");

        btn.classList.add("active");
        const activePane = document.getElementById(`tab-${target}`);
        if (activePane) activePane.style.display = "block";
      });
    });
  }

  // ==========================================================================
  // Reviews & Write Review Form
  // ==========================================================================
  async loadReviews() {
    const reviewsListEl = document.getElementById("pdp-reviews-list");
    const writeFormEl = document.getElementById("pdp-write-review-form");
    const loginPromptEl = document.getElementById("pdp-review-login-prompt");

    if (!reviewsListEl) return;

    const reviews = await getProductReviews(this.product.id);

    if (reviews.length === 0) {
      reviewsListEl.innerHTML = `<p style="color:var(--text-muted);font-style:italic;">No customer reviews yet. Be the first to share your thoughts!</p>`;
    } else {
      reviewsListEl.innerHTML = reviews.map(r => `
        <div style="padding:1.25rem;border:1px solid var(--border-color);border-radius:var(--radius-md);margin-bottom:1rem;background:var(--bg-card);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <img src="${r.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName || "Customer")}&background=4F46E5&color=fff`}" alt="${r.userName}" width="36" height="36" loading="lazy" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" onerror="this.onerror=null;this.src='/assets/images/placeholder.svg';">
              <div>
                <strong style="font-size:0.9rem;">${r.userName || "Customer"}</strong>
                <div style="font-size:0.75rem;color:var(--text-muted);">${r.date || "Verified Purchase"}</div>
              </div>
            </div>
            <div style="display:flex;color:#FBBF24;">
              ${Array.from({ length: r.rating || 5 }).map(() => `<i data-lucide="star" style="width:14px;height:14px;fill:#FBBF24;"></i>`).join("")}
            </div>
          </div>
          ${r.title ? `<h5 style="margin-bottom:0.25rem;font-size:0.95rem;">${r.title}</h5>` : ""}
          <p style="font-size:0.9rem;color:var(--text-main);line-height:1.5;">${r.comment}</p>
        </div>
      `).join("");
    }

    // Form logic
    const user = getCurrentUser();
    if (user) {
      if (loginPromptEl) loginPromptEl.style.display = "none";
      if (writeFormEl) {
        writeFormEl.style.display = "block";
        writeFormEl.onsubmit = async (e) => {
          e.preventDefault();
          const title = writeFormEl.querySelector("#review-title-input").value.trim();
          const comment = writeFormEl.querySelector("#review-comment-input").value.trim();
          const rating = Number(writeFormEl.querySelector("#review-rating-select").value) || 5;

          await addProductReview({
            productId: this.product.id,
            uid: user.uid,
            userName: user.displayName || user.email.split("@")[0],
            userAvatar: user.photoURL,
            title,
            comment,
            rating
          });

          showToast("Review Submitted", "Thank you for sharing your verified review!", "success");
          writeFormEl.reset();
          this.loadReviews();
        };
      }
    } else {
      if (writeFormEl) writeFormEl.style.display = "none";
      if (loginPromptEl) loginPromptEl.style.display = "block";
    }

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // ==========================================================================
  // Related Products (same category, excluding current)
  // ==========================================================================
  async loadRelatedProducts() {
    const grid = document.getElementById("pdp-related-products-grid");
    if (!grid) return;

    const all = await getProducts();
    const related = all
      .filter(p => p.category === this.product.category && p.id !== this.product.id)
      .slice(0, 4);

    if (related.length > 0) {
      grid.innerHTML = related.map(p => createProductCardHTML(p)).join("");
      attachProductCardListeners(grid);
      if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons({ root: grid });
      }
    } else {
      const section = grid.closest("section");
      if (section) section.style.display = "none";
    }
  }

  // ==========================================================================
  // Recently Viewed Products
  // ==========================================================================
  saveRecentlyViewed(id) {
    if (!id) return;
    try {
      const KEY = "ms_store_recently_viewed";
      let list = JSON.parse(localStorage.getItem(KEY) || "[]");
      if (!Array.isArray(list)) list = [];
      list = [id, ...list.filter(x => x !== id)].slice(0, 8);
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (e) {
      // ignore
    }
  }

  async loadRecentlyViewed() {
    const grid = document.getElementById("pdp-recently-viewed-grid");
    const section = document.getElementById("pdp-recently-viewed-section");
    if (!grid || !section) return;

    try {
      const KEY = "ms_store_recently_viewed";
      const list = JSON.parse(localStorage.getItem(KEY) || "[]");
      const otherIds = list.filter(id => id !== this.product.id).slice(0, 4);
      if (otherIds.length === 0) {
        section.style.display = "none";
        return;
      }

      const all = await getProducts();
      const recentProducts = otherIds.map(id => all.find(p => p.id === id)).filter(Boolean);

      if (recentProducts.length > 0) {
        grid.innerHTML = recentProducts.map(p => createProductCardHTML(p)).join("");
        attachProductCardListeners(grid);
        section.style.display = "block";
        if (window.lucide && typeof window.lucide.createIcons === "function") {
          window.lucide.createIcons({ root: grid });
        }
      } else {
        section.style.display = "none";
      }
    } catch (e) {
      section.style.display = "none";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ProductDetailPage();
});
