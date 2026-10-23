// ==========================================================================
// MS STORE - Shared Utilities & Helpers
// Single source of truth for URL builders and common helpers
// ==========================================================================

/**
 * Returns the canonical URL for a product detail page.
 * Accepts a product object (with .id or .productId) or a string product ID.
 * @param {Object|string} product - The product object or product ID
 * @returns {string} The canonical product detail URL, e.g. "/product.html?id=prod-elec-01"
 */
export function getProductUrl(product) {
  if (!product) return "/product.html";
  let id = "";
  if (typeof product === "string") {
    id = product.trim();
  } else if (typeof product === "object") {
    id = (product.id || product.productId || "").toString().trim();
  }
  return `/product.html?id=${encodeURIComponent(id)}`;
}

// Expose on window for convenience
if (typeof window !== "undefined") {
  window.getProductUrl = getProductUrl;
}
