// ==========================================================================
// MS STORE - Wishlist Page Controller
// Render wishlist items, Move to Cart, Remove from Wishlist, Batch Add All
// Compliant with PRD Section 6.8
// ==========================================================================

import { wishlist } from "./wishlist.js";
import { getProductById } from "./firebase-service.js";
import { cart } from "./cart.js";
import { showToast } from "./ui.js";
import { getProductUrl } from "./utils.js";

async function renderWishlistPage(productIds) {
  const grid = document.getElementById("wishlist-items-grid");
  const emptyState = document.getElementById("wishlist-empty-state");
  const countEl = document.getElementById("wishlist-page-count");

  if (!grid || !emptyState) return;

  if (countEl) countEl.textContent = `${productIds.length} Saved Item${productIds.length === 1 ? "" : "s"}`;

  if (productIds.length === 0) {
    grid.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  grid.style.display = "grid";
  emptyState.style.display = "none";

  // Fetch product objects
  const products = [];
  for (const id of productIds) {
    const prod = await getProductById(id);
    if (prod) products.push(prod);
  }

  grid.innerHTML = products.map(prod => {
    const prodImg = prod.images && prod.images[0] ? prod.images[0] : '/assets/images/placeholder.svg';
    return `
    <div class="product-card" data-id="${prod.id}">
      <a href="${getProductUrl(prod)}" class="product-img-wrap">
        <img src="${prodImg}" alt="${prod.name}" class="product-img" width="300" height="300" loading="lazy" style="object-fit:cover;" onerror="this.onerror=null;this.src='/assets/images/placeholder.svg';">
      </a>

      <div class="product-content">
        <span class="product-category">${prod.category}</span>
        <a href="${getProductUrl(prod)}">
          <h3 class="product-title">${prod.name}</h3>
        </a>

        <div class="price-wrap" style="margin-bottom:1rem;">
          <span class="current-price">$${prod.price.toFixed(2)}</span>
          ${prod.oldPrice ? `<span class="old-price">$${prod.oldPrice.toFixed(2)}</span>` : ""}
        </div>

        <div style="display:flex;flex-direction:column;gap:0.5rem;margin-top:auto;">
          <button class="btn btn-primary btn-sm btn-move-cart" data-id="${prod.id}">
            <i data-lucide="shopping-bag" style="width:15px;height:15px;"></i>
            <span>Move to Bag</span>
          </button>
          <button class="btn btn-outline btn-sm btn-remove-wishlist" data-id="${prod.id}" style="color:var(--danger);border-color:var(--border-color);">
            <i data-lucide="trash-2" style="width:15px;height:15px;"></i>
            <span>Remove</span>
          </button>
        </div>
      </div>
    </div>
  `;
  }).join("");

  // Attach buttons
  grid.querySelectorAll(".btn-move-cart").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await wishlist.moveToCart(id);
      showToast("Moved to Bag", "Product moved to your shopping bag.", "success");
    });
  });

  grid.querySelectorAll(".btn-remove-wishlist").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      wishlist.toggle(id);
    });
  });

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  wishlist.subscribe(ids => {
    renderWishlistPage(ids);
  });

  // Batch Add All to Cart
  document.getElementById("btn-add-all-cart")?.addEventListener("click", async () => {
    const ids = [...wishlist.productIds];
    if (ids.length === 0) return;

    for (const id of ids) {
      await wishlist.moveToCart(id);
    }
    showToast("Added to Bag", "All wishlist items were added to your bag.", "success");
  });
});
