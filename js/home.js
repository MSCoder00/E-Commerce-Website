// ==========================================================================
// MS STORE - Home Page Controller
// Hero slider, deals countdown timer, featured & bestseller sections
// ==========================================================================

import { getProducts } from "./firebase-service.js";
import { createProductCardHTML, attachProductCardListeners } from "./ui.js";

// ==========================================================================
// 1. Hero Banner Slider
// ==========================================================================
function initHeroSlider() {
  const container = document.getElementById("hero-slider-container");
  const dots = document.querySelectorAll(".hero-dot");
  const prevBtn = document.getElementById("hero-prev-btn");
  const nextBtn = document.getElementById("hero-next-btn");

  if (!container) return;

  let currentSlide = 0;
  const totalSlides = 3;
  let autoPlayTimer = null;

  function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    container.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === currentSlide);
    });
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(nextSlide, 5000);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      goToSlide(index);
      startAutoPlay();
    });
  });

  prevBtn?.addEventListener("click", () => {
    prevSlide();
    startAutoPlay();
  });

  nextBtn?.addEventListener("click", () => {
    nextSlide();
    startAutoPlay();
  });

  container.addEventListener("mouseenter", stopAutoPlay);
  container.addEventListener("mouseleave", startAutoPlay);

  startAutoPlay();
}

// ==========================================================================
// 2. Deals Countdown Timer
// ==========================================================================
function initDealsCountdown() {
  const hoursEl = document.getElementById("deal-hours");
  const minsEl = document.getElementById("deal-mins");
  const secsEl = document.getElementById("deal-secs");

  if (!hoursEl || !minsEl || !secsEl) return;

  // Set target to midnight tonight
  function updateTimer() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(23, 59, 59, 999);

    const diff = midnight - now;
    if (diff <= 0) {
      hoursEl.textContent = "23";
      minsEl.textContent = "59";
      secsEl.textContent = "59";
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    hoursEl.textContent = String(hours).padStart(2, "0");
    minsEl.textContent = String(mins).padStart(2, "0");
    secsEl.textContent = String(secs).padStart(2, "0");
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// ==========================================================================
// 3. Render Product Sections
// ==========================================================================
async function renderHomeProducts() {
  const products = await getProducts();

  // 1. Deals Section (isDeal: true)
  const dealsGrid = document.getElementById("deals-products-grid");
  if (dealsGrid) {
    const deals = products.filter(p => p.isDeal).slice(0, 4);
    dealsGrid.innerHTML = deals.map(p => createProductCardHTML(p)).join("");
    attachProductCardListeners(dealsGrid);
  }

  // 2. Featured Products
  const featuredGrid = document.getElementById("featured-products-grid");
  if (featuredGrid) {
    const featured = products.filter(p => p.isFeatured).slice(0, 8);
    featuredGrid.innerHTML = featured.map(p => createProductCardHTML(p)).join("");
    attachProductCardListeners(featuredGrid);
  }

  // 3. Best Sellers
  const bestSellersGrid = document.getElementById("bestsellers-products-grid");
  if (bestSellersGrid) {
    const bestSellers = [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);
    bestSellersGrid.innerHTML = bestSellers.map(p => createProductCardHTML(p)).join("");
    attachProductCardListeners(bestSellersGrid);
  }

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initHeroSlider();
  initDealsCountdown();
  renderHomeProducts();
});
