// ==========================================================================
// MS STORE - Full Cart Page Controller
// Table rendering, quantity stepper, coupon applicator, summary calculation
// Compliant with PRD Section 6.7
// ==========================================================================

import { cart } from "./cart.js";
import { showToast } from "./ui.js";
import { getProductUrl } from "./utils.js";

function renderFullCartPage(items, totals) {
  const tableContainer = document.getElementById("cart-page-items-container");
  const emptyState = document.getElementById("cart-page-empty-state");
  const layoutContainer = document.getElementById("cart-page-content");

  // Summary elements
  const subtotalEl = document.getElementById("cart-summary-subtotal");
  const shippingEl = document.getElementById("cart-summary-shipping");
  const taxEl = document.getElementById("cart-summary-tax");
  const discountRow = document.getElementById("cart-summary-discount-row");
  const discountAmountEl = document.getElementById("cart-summary-discount-amount");
  const totalEl = document.getElementById("cart-summary-total");

  // Free shipping progress
  const meterText = document.getElementById("cart-page-meter-text");
  const meterFill = document.getElementById("cart-page-meter-fill");

  if (!tableContainer || !emptyState || !layoutContainer) return;

  if (items.length === 0) {
    layoutContainer.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  layoutContainer.style.display = "grid";
  emptyState.style.display = "none";

  // Free shipping meter
  if (meterText && meterFill) {
    if (totals.subtotal >= totals.freeShippingThreshold) {
      meterText.innerHTML = `<span>✓ You've unlocked <strong>FREE Worldwide Express Delivery!</strong></span>`;
      meterFill.style.width = "100%";
    } else {
      const pct = Math.min(100, Math.round((totals.subtotal / totals.freeShippingThreshold) * 100));
      meterText.innerHTML = `Add <strong>$${totals.amountToFreeShipping.toFixed(2)}</strong> more to unlock <strong>FREE Shipping</strong>!`;
      meterFill.style.width = `${pct}%`;
    }
  }

  // Render Table
  tableContainer.innerHTML = items.map(item => `
    <tr style="border-bottom:1px solid var(--border-color);" data-id="${item.productId}" data-variant="${item.variant || ""}">
      <td style="padding:1.25rem 0.75rem;display:flex;align-items:center;gap:1rem;">
        <img src="${item.image || '/assets/images/placeholder.svg'}" alt="${item.name}" width="72" height="72" loading="lazy" style="width:72px;height:72px;object-fit:cover;border-radius:var(--radius-sm);background-color:var(--slate-100);flex-shrink:0;" onerror="this.onerror=null;this.src='/assets/images/placeholder.svg';">
        <div>
          <a href="${getProductUrl(item.productId)}" style="font-weight:600;font-size:0.95rem;color:var(--text-main);display:block;margin-bottom:0.25rem;">${item.name}</a>
          ${item.variant ? `<div style="font-size:0.8125rem;color:var(--text-muted);">${item.variant}</div>` : ""}
          <div style="font-size:0.875rem;color:var(--primary);font-weight:700;margin-top:0.25rem;">$${item.price.toFixed(2)}</div>
        </div>
      </td>
      <td style="padding:1.25rem 0.75rem;vertical-align:middle;">
        <div class="drawer-qty-control" style="width:fit-content;">
          <button class="drawer-qty-btn cart-qty-minus" aria-label="Decrease quantity">−</button>
          <span class="drawer-qty-val">${item.quantity}</span>
          <button class="drawer-qty-btn cart-qty-plus" aria-label="Increase quantity">+</button>
        </div>
      </td>
      <td style="padding:1.25rem 0.75rem;vertical-align:middle;font-weight:700;font-size:1.05rem;color:var(--text-main);">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
      <td style="padding:1.25rem 0.75rem;vertical-align:middle;text-align:right;">
        <button class="drawer-item-remove cart-item-remove" aria-label="Remove item" title="Remove">
          <i data-lucide="trash-2" style="width:18px;height:18px;"></i>
        </button>
      </td>
    </tr>
  `).join("");

  // Attach Table Listeners
  tableContainer.querySelectorAll("tr").forEach(row => {
    const id = row.getAttribute("data-id");
    const variant = row.getAttribute("data-variant") || "";

    row.querySelector(".cart-qty-minus")?.addEventListener("click", () => {
      const cur = items.find(i => i.productId === id && (i.variant || "") === variant);
      if (cur) cart.updateQuantity(id, variant, cur.quantity - 1);
    });

    row.querySelector(".cart-qty-plus")?.addEventListener("click", () => {
      const cur = items.find(i => i.productId === id && (i.variant || "") === variant);
      if (cur) cart.updateQuantity(id, variant, cur.quantity + 1);
    });

    row.querySelector(".cart-item-remove")?.addEventListener("click", () => {
      cart.removeItem(id, variant);
      showToast("Item Removed", "Product removed from your shopping bag.", "info");
    });
  });

  // Summary Card values
  if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
  if (shippingEl) shippingEl.textContent = totals.shippingFee === 0 ? "FREE" : `$${totals.shippingFee.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${totals.estimatedTax.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${totals.finalTotal.toFixed(2)}`;

  if (discountRow && discountAmountEl) {
    if (totals.appliedCoupon && totals.discountAmount > 0) {
      discountRow.style.display = "flex";
      discountAmountEl.textContent = `-$${totals.discountAmount.toFixed(2)}`;
    } else {
      discountRow.style.display = "none";
    }
  }

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Subscribe to cart changes
  cart.subscribe((items, totals) => {
    renderFullCartPage(items, totals);
  });

  // Coupon form
  const couponForm = document.getElementById("cart-coupon-form");
  const couponInput = document.getElementById("cart-coupon-input");

  couponForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = couponInput.value.trim();
    const res = cart.applyCoupon(code);
    if (res.success) {
      showToast("Coupon Applied", res.message, "success");
    } else {
      showToast("Coupon Error", res.message, "error");
    }
  });
});
