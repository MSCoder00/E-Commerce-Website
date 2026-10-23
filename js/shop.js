// ==========================================================================
// MS STORE - Shop & Category Page Logic
// Filters, Sorting, Search, Grid/List view toggle, Load More pagination
// Compliant with PRD Section 6.4
// ==========================================================================

import { getProducts, getCategories } from "./firebase-service.js";
import { createProductCardHTML, attachProductCardListeners } from "./ui.js";

class ShopPage {
  constructor() {
    this.allProducts = [];
    this.filteredProducts = [];
    this.displayedCount = 12;
    this.pageSize = 12;
    this.isListView = false;

    // Filter states
    this.selectedCategory = "all";
    this.selectedSubCategory = "all";
    this.maxPrice = 200;
    this.minRating = 0;
    this.selectedBrands = new Set();
    this.onlyInStock = false;
    this.currentSort = "popular";
    this.searchQuery = "";

    this.init();
  }

  async init() {
    this.parseURLParams();
    this.setupEventListeners();
    await this.loadCatalog();
  }

  parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("category")) {
      this.selectedCategory = params.get("category");
    }
    if (params.has("sub")) {
      this.selectedSubCategory = params.get("sub");
    }
    if (params.has("search")) {
      this.searchQuery = params.get("search");
    }
    if (params.has("filter") && params.get("filter") === "deals") {
      this.onlyDeals = true;
    }
    if (params.has("sort")) {
      this.currentSort = params.get("sort");
    }
  }

  async loadCatalog() {
    const grid = document.getElementById("shop-products-grid");
    if (grid) {
      grid.innerHTML = this.renderSkeletons(8);
    }

    this.allProducts = await getProducts();
    this.populateBrandFilters();
    this.syncFilterControlsUI();
    this.applyFiltersAndSort();
  }

  renderSkeletons(count = 8) {
    let html = "";
    for (let i = 0; i < count; i++) {
      html += `
        <div class="product-card">
          <div class="skeleton" style="aspect-ratio:1/1;width:100%;"></div>
          <div class="product-content" style="gap:0.75rem;">
            <div class="skeleton" style="height:14px;width:35%;"></div>
            <div class="skeleton" style="height:18px;width:85%;"></div>
            <div class="skeleton" style="height:14px;width:50%;"></div>
            <div class="skeleton" style="height:28px;width:100%;margin-top:auto;"></div>
          </div>
        </div>
      `;
    }
    return html;
  }

  populateBrandFilters() {
    const brandListEl = document.getElementById("filter-brand-list");
    if (!brandListEl) return;

    const brands = Array.from(new Set(this.allProducts.map(p => p.brand))).sort();
    brandListEl.innerHTML = brands.map(brand => `
      <label class="filter-checkbox-label" style="display:flex;align-items:center;gap:0.5rem;font-size:0.875rem;cursor:pointer;margin-bottom:0.4rem;">
        <input type="checkbox" class="brand-filter-cb" value="${brand}" ${this.selectedBrands.has(brand) ? "checked" : ""}>
        <span>${brand}</span>
      </label>
    `).join("");

    brandListEl.querySelectorAll(".brand-filter-cb").forEach(cb => {
      cb.addEventListener("change", () => {
        if (cb.checked) {
          this.selectedBrands.add(cb.value);
        } else {
          this.selectedBrands.delete(cb.value);
        }
        this.displayedCount = this.pageSize;
        this.applyFiltersAndSort();
      });
    });
  }

  syncFilterControlsUI() {
    // Price Slider
    const priceSlider = document.getElementById("price-range-slider");
    const priceValDisplay = document.getElementById("price-val-display");
    if (priceSlider && priceValDisplay) {
      priceSlider.value = this.maxPrice;
      priceValDisplay.textContent = `$${this.maxPrice}`;
    }

    // Sort Dropdown
    const sortSelect = document.getElementById("shop-sort-select");
    if (sortSelect) {
      sortSelect.value = this.currentSort;
    }

    // Category Radio/Buttons
    const categoryRadios = document.querySelectorAll(".category-filter-radio");
    categoryRadios.forEach(radio => {
      radio.checked = (radio.value.toLowerCase() === this.selectedCategory.toLowerCase());
    });

    // In Stock toggle
    const inStockToggle = document.getElementById("filter-in-stock");
    if (inStockToggle) {
      inStockToggle.checked = this.onlyInStock;
    }

    // Search header title
    const searchBanner = document.getElementById("shop-search-banner");
    const searchTitle = document.getElementById("shop-page-title");
    if (this.searchQuery && searchTitle) {
      searchTitle.textContent = `Search results for "${this.searchQuery}"`;
      if (searchBanner) searchBanner.style.display = "block";
    } else if (this.selectedCategory !== "all" && searchTitle) {
      searchTitle.textContent = `${this.selectedCategory} Collection`;
    }
  }

  setupEventListeners() {
    // Price Slider
    const priceSlider = document.getElementById("price-range-slider");
    const priceValDisplay = document.getElementById("price-val-display");
    if (priceSlider && priceValDisplay) {
      priceSlider.addEventListener("input", (e) => {
        this.maxPrice = Number(e.target.value);
        priceValDisplay.textContent = `$${this.maxPrice}`;
        this.displayedCount = this.pageSize;
        this.applyFiltersAndSort();
      });
    }

    // Category Radios
    document.querySelectorAll(".category-filter-radio").forEach(radio => {
      radio.addEventListener("change", (e) => {
        this.selectedCategory = e.target.value;
        this.selectedSubCategory = "all";
        this.displayedCount = this.pageSize;
        this.applyFiltersAndSort();
      });
    });

    // Rating Radios
    document.querySelectorAll(".rating-filter-radio").forEach(radio => {
      radio.addEventListener("change", (e) => {
        this.minRating = Number(e.target.value);
        this.displayedCount = this.pageSize;
        this.applyFiltersAndSort();
      });
    });

    // In Stock
    document.getElementById("filter-in-stock")?.addEventListener("change", (e) => {
      this.onlyInStock = e.target.checked;
      this.displayedCount = this.pageSize;
      this.applyFiltersAndSort();
    });

    // Sort Dropdown
    document.getElementById("shop-sort-select")?.addEventListener("change", (e) => {
      this.currentSort = e.target.value;
      this.applyFiltersAndSort();
    });

    // Grid vs List view toggle
    document.getElementById("view-grid-btn")?.addEventListener("click", () => {
      this.isListView = false;
      document.getElementById("view-grid-btn")?.classList.add("btn-primary");
      document.getElementById("view-grid-btn")?.classList.remove("btn-outline");
      document.getElementById("view-list-btn")?.classList.add("btn-outline");
      document.getElementById("view-list-btn")?.classList.remove("btn-primary");
      this.renderProducts();
    });

    document.getElementById("view-list-btn")?.addEventListener("click", () => {
      this.isListView = true;
      document.getElementById("view-list-btn")?.classList.add("btn-primary");
      document.getElementById("view-list-btn")?.classList.remove("btn-outline");
      document.getElementById("view-grid-btn")?.classList.add("btn-outline");
      document.getElementById("view-grid-btn")?.classList.remove("btn-primary");
      this.renderProducts();
    });

    // Load More Button
    document.getElementById("btn-load-more")?.addEventListener("click", () => {
      this.displayedCount += this.pageSize;
      this.renderProducts();
    });

    // Reset Filters Button
    document.getElementById("btn-reset-filters")?.addEventListener("click", () => {
      this.resetAllFilters();
    });

    // Mobile Filter Drawer / Bottom Sheet toggle
    const filterBtn = document.getElementById("mobile-filter-open-btn");
    const filterBtnToolbar = document.getElementById("mobile-filter-open-btn-toolbar");
    const sidebar = document.getElementById("shop-filter-sidebar");
    const backdrop = document.getElementById("shop-filter-backdrop");
    const closeSidebarBtn = document.getElementById("filter-sidebar-close-btn");
    const clearMobileBtn = document.getElementById("btn-clear-filters-mobile");
    const applyMobileBtn = document.getElementById("btn-apply-filters-mobile");

    const openFilters = () => {
      sidebar?.classList.add("is-open");
      backdrop?.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };

    const closeFilters = () => {
      sidebar?.classList.remove("is-open");
      backdrop?.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    filterBtn?.addEventListener("click", openFilters);
    filterBtnToolbar?.addEventListener("click", openFilters);
    closeSidebarBtn?.addEventListener("click", closeFilters);
    backdrop?.addEventListener("click", closeFilters);

    clearMobileBtn?.addEventListener("click", () => {
      this.resetAllFilters();
    });

    applyMobileBtn?.addEventListener("click", () => {
      closeFilters();
      document.getElementById("shop-toolbar")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  resetAllFilters() {
    this.selectedCategory = "all";
    this.selectedSubCategory = "all";
    this.maxPrice = 200;
    this.minRating = 0;
    this.selectedBrands.clear();
    this.onlyInStock = false;
    this.searchQuery = "";
    this.onlyDeals = false;
    this.displayedCount = this.pageSize;

    // Reset inputs
    document.querySelectorAll(".brand-filter-cb").forEach(cb => cb.checked = false);
    document.querySelectorAll(".rating-filter-radio").forEach(r => r.checked = (r.value === "0"));
    const allCatRadio = document.querySelector(".category-filter-radio[value='all']");
    if (allCatRadio) allCatRadio.checked = true;

    this.syncFilterControlsUI();
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    let result = [...this.allProducts];

    // Search query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Deals filter
    if (this.onlyDeals) {
      result = result.filter(p => p.isDeal);
    }

    // Category
    if (this.selectedCategory && this.selectedCategory !== "all") {
      result = result.filter(p => p.category.toLowerCase() === this.selectedCategory.toLowerCase());
    }

    // Sub-Category
    if (this.selectedSubCategory && this.selectedSubCategory !== "all") {
      result = result.filter(p => p.subCategory.toLowerCase() === this.selectedSubCategory.toLowerCase());
    }

    // Price
    result = result.filter(p => p.price <= this.maxPrice);

    // Rating
    if (this.minRating > 0) {
      result = result.filter(p => p.rating >= this.minRating);
    }

    // Brands
    if (this.selectedBrands.size > 0) {
      result = result.filter(p => this.selectedBrands.has(p.brand));
    }

    // In Stock
    if (this.onlyInStock) {
      result = result.filter(p => p.stock > 0);
    }

    // Sorting
    switch (this.currentSort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
        break;
      case "newest":
        result.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "popular":
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.reviewCount - a.reviewCount);
        break;
    }

    this.filteredProducts = result;
    this.renderProducts();
    this.renderActiveFilterChips();
  }

  renderProducts() {
    const grid = document.getElementById("shop-products-grid");
    const countEl = document.getElementById("shop-results-count");
    const loadMoreBtn = document.getElementById("btn-load-more");

    if (!grid) return;

    if (countEl) {
      countEl.textContent = `Showing 1–${Math.min(this.displayedCount, this.filteredProducts.length)} of ${this.filteredProducts.length} items`;
    }

    if (this.filteredProducts.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:4rem 1.5rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);">
          <div style="width:72px;height:72px;border-radius:50%;background:var(--slate-100);color:var(--slate-400);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
            <i data-lucide="package-search" style="width:36px;height:36px;"></i>
          </div>
          <h3 style="margin-bottom:0.5rem;">No Products Found</h3>
          <p style="color:var(--text-muted);font-size:0.925rem;max-width:400px;margin:0 auto 1.5rem;">
            We couldn't find any products matching your active criteria. Try broadening your price range or clearing filters.
          </p>
          <button class="btn btn-primary" id="empty-clear-filters-btn">Clear All Filters</button>
        </div>
      `;

      document.getElementById("empty-clear-filters-btn")?.addEventListener("click", () => this.resetAllFilters());

      if (loadMoreBtn) loadMoreBtn.style.display = "none";
      if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
      return;
    }

    const visibleItems = this.filteredProducts.slice(0, this.displayedCount);

    if (this.isListView && window.innerWidth > 1024) {
      grid.classList.add("is-list-view-active");
      grid.style.display = "flex";
      grid.style.flexDirection = "column";
      grid.style.gap = "1.25rem";
      grid.innerHTML = visibleItems.map(p => createProductCardHTML(p, true)).join("");
    } else {
      grid.classList.remove("is-list-view-active");
      grid.style.display = "grid";
      grid.style.flexDirection = "";
      grid.style.gap = "";
      grid.innerHTML = visibleItems.map(p => createProductCardHTML(p, false)).join("");
    }

    attachProductCardListeners(grid);

    // Toggle Load More button
    if (loadMoreBtn) {
      loadMoreBtn.style.display = this.displayedCount >= this.filteredProducts.length ? "none" : "inline-flex";
    }

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  renderActiveFilterChips() {
    const chipsContainer = document.getElementById("active-filter-chips");
    if (!chipsContainer) return;

    const chips = [];

    if (this.selectedCategory !== "all") {
      chips.push({ label: `Category: ${this.selectedCategory}`, onRemove: () => {
        this.selectedCategory = "all";
        const r = document.querySelector(".category-filter-radio[value='all']");
        if (r) r.checked = true;
      }});
    }

    if (this.maxPrice < 200) {
      chips.push({ label: `Max: $${this.maxPrice}`, onRemove: () => {
        this.maxPrice = 200;
        const slider = document.getElementById("price-range-slider");
        if (slider) slider.value = 200;
        document.getElementById("price-val-display").textContent = "$200";
      }});
    }

    if (this.minRating > 0) {
      chips.push({ label: `${this.minRating}★ & above`, onRemove: () => {
        this.minRating = 0;
        const r = document.querySelector(".rating-filter-radio[value='0']");
        if (r) r.checked = true;
      }});
    }

    this.selectedBrands.forEach(b => {
      chips.push({ label: `Brand: ${b}`, onRemove: () => {
        this.selectedBrands.delete(b);
        const cb = document.querySelector(`.brand-filter-cb[value="${b}"]`);
        if (cb) cb.checked = false;
      }});
    });

    if (this.onlyInStock) {
      chips.push({ label: "In Stock Only", onRemove: () => {
        this.onlyInStock = false;
        const cb = document.getElementById("filter-in-stock");
        if (cb) cb.checked = false;
      }});
    }

    if (chips.length === 0) {
      chipsContainer.innerHTML = "";
      chipsContainer.style.display = "none";
      return;
    }

    chipsContainer.style.display = "flex";
    chipsContainer.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;padding:0.75rem 0 1.25rem;">
        <span style="font-size:0.8125rem;font-weight:600;color:var(--text-muted);">Active Filters:</span>
        ${chips.map((c, i) => `
          <button class="badge badge-deal-code chip-item" data-index="${i}" style="background:var(--slate-200);color:var(--slate-800);display:inline-flex;align-items:center;gap:0.35rem;padding:0.3rem 0.65rem;">
            <span>${c.label}</span>
            <i data-lucide="x" style="width:12px;height:12px;"></i>
          </button>
        `).join("")}
        <button id="chip-clear-all" style="font-size:0.775rem;font-weight:600;color:var(--danger);cursor:pointer;margin-left:0.5rem;">Clear All</button>
      </div>
    `;

    chipsContainer.querySelectorAll(".chip-item").forEach(btn => {
      const idx = Number(btn.getAttribute("data-index"));
      btn.addEventListener("click", () => {
        chips[idx].onRemove();
        this.applyFiltersAndSort();
      });
    });

    chipsContainer.querySelector("#chip-clear-all")?.addEventListener("click", () => {
      this.resetAllFilters();
    });

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons({ root: chipsContainer });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ShopPage();
});
