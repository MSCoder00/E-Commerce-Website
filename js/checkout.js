// ==========================================================================
// MS STORE - Checkout & Payment Controller
// Multi-step checkout wizard, interactive 3D credit card flip preview,
// Luhn card validation, payment processing simulation, Firestore order saving,
// and drawing checkmark + confetti celebratory modal
// Compliant with PRD Section 6.10, 6.11, 6.12
// ==========================================================================

import { cart } from "./cart.js";
import { getCurrentUser } from "./auth.js";
import { createOrder, getUserProfile } from "./firebase-service.js";
import { showToast } from "./ui.js";
import { getProductUrl } from "./utils.js";

class CheckoutPage {
  constructor() {
    this.currentStep = 1;
    this.selectedDelivery = "standard"; // "standard" ($0) or "express" ($15)
    this.deliveryFee = 0;
    this.paymentMethod = "card"; // "card" or "cod"
    this.orderResult = null;

    this.init();
  }

  async init() {
    // Check if cart is empty
    if (cart.getItems().length === 0) {
      window.location.href = "cart.html";
      return;
    }

    this.prefillUserData();
    this.renderOrderSummary();
    this.setupStepNavigation();
    this.setupDeliveryOptions();
    this.setupPaymentMethodSwitch();
    this.setupInteractive3DCard();
    this.setupPaymentSubmission();
  }

  async prefillUserData() {
    const user = getCurrentUser();
    if (user) {
      const emailInput = document.getElementById("shipping-email");
      const nameInput = document.getElementById("shipping-fullname");
      if (emailInput) emailInput.value = user.email || "";
      if (nameInput) nameInput.value = user.displayName || "";

      // Try fetching saved address
      const profile = await getUserProfile(user.uid);
      if (profile && profile.addresses && profile.addresses.length > 0) {
        const addr = profile.addresses[0];
        if (document.getElementById("shipping-phone")) document.getElementById("shipping-phone").value = addr.phone || "";
        if (document.getElementById("shipping-address")) document.getElementById("shipping-address").value = addr.address || "";
        if (document.getElementById("shipping-city")) document.getElementById("shipping-city").value = addr.city || "";
        if (document.getElementById("shipping-zip")) document.getElementById("shipping-zip").value = addr.zip || "";
        if (document.getElementById("shipping-country")) document.getElementById("shipping-country").value = addr.country || "United States";
      }
    }
  }

  renderOrderSummary() {
    const itemsList = document.getElementById("checkout-items-list");
    const subtotalEl = document.getElementById("checkout-summary-subtotal");
    const shippingEl = document.getElementById("checkout-summary-shipping");
    const discountRow = document.getElementById("checkout-summary-discount-row");
    const discountValEl = document.getElementById("checkout-summary-discount");
    const taxEl = document.getElementById("checkout-summary-tax");
    const totalEl = document.getElementById("checkout-summary-total");

    const items = cart.getItems();
    const totals = cart.getTotals();

    if (itemsList) {
      itemsList.innerHTML = items.map(item => `
        <div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 0;border-bottom:1px solid var(--border-color);">
          <a href="${getProductUrl(item.productId)}" style="position:relative;width:48px;height:48px;border-radius:var(--radius-xs);overflow:hidden;background:var(--slate-100);flex-shrink:0;display:block;">
            <img src="${item.image || '/assets/images/placeholder.svg'}" alt="${item.name}" width="48" height="48" loading="lazy" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null;this.src='/assets/images/placeholder.svg';">
            <span style="position:absolute;top:0;right:0;background:var(--slate-800);color:#fff;font-size:0.65rem;font-weight:700;width:18px;height:18px;border-radius:50%;display:flex;align-items:center;justify-content:center;">${item.quantity}</span>
          </a>
          <div style="flex:1;min-width:0;">
            <a href="${getProductUrl(item.productId)}" style="font-size:0.875rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:inherit;text-decoration:none;display:block;">${item.name}</a>
            ${item.variant ? `<div style="font-size:0.75rem;color:var(--text-muted);">${item.variant}</div>` : ""}
          </div>
          <div style="font-size:0.9rem;font-weight:700;">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
      `).join("");
    }

    const calculatedShipping = this.selectedDelivery === "express" ? 15.00 : totals.shippingFee;
    const finalTotal = Math.max(0, totals.subtotal - totals.discountAmount + calculatedShipping + totals.estimatedTax);

    if (subtotalEl) subtotalEl.textContent = `$${totals.subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = calculatedShipping === 0 ? "FREE" : `$${calculatedShipping.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${totals.estimatedTax.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${finalTotal.toFixed(2)}`;

    if (discountRow && discountValEl) {
      if (totals.appliedCoupon && totals.discountAmount > 0) {
        discountRow.style.display = "flex";
        discountValEl.textContent = `-$${totals.discountAmount.toFixed(2)}`;
      } else {
        discountRow.style.display = "none";
      }
    }
  }

  // ==========================================================================
  // Step Navigation Wizard
  // ==========================================================================
  setupStepNavigation() {
    const step1Pane = document.getElementById("step-1-shipping");
    const step2Pane = document.getElementById("step-2-delivery");
    const step3Pane = document.getElementById("step-3-payment");

    const step1Ind = document.getElementById("step-ind-1");
    const step2Ind = document.getElementById("step-ind-2");
    const step3Ind = document.getElementById("step-ind-3");

    const toStep2Btn = document.getElementById("btn-to-step-2");
    const backTo1Btn = document.getElementById("btn-back-to-step-1");
    const toStep3Btn = document.getElementById("btn-to-step-3");
    const backTo2Btn = document.getElementById("btn-back-to-step-2");

    // To Step 2: Validate shipping form
    toStep2Btn?.addEventListener("click", () => {
      if (this.validateShippingForm()) {
        this.goToStep(2);
      }
    });

    backTo1Btn?.addEventListener("click", () => this.goToStep(1));
    toStep3Btn?.addEventListener("click", () => this.goToStep(3));
    backTo2Btn?.addEventListener("click", () => this.goToStep(2));
  }

  goToStep(step) {
    this.currentStep = step;

    const panes = [
      document.getElementById("step-1-shipping"),
      document.getElementById("step-2-delivery"),
      document.getElementById("step-3-payment")
    ];

    const indicators = [
      document.getElementById("step-ind-1"),
      document.getElementById("step-ind-2"),
      document.getElementById("step-ind-3")
    ];

    panes.forEach((p, i) => {
      if (p) p.style.display = (i + 1 === step) ? "block" : "none";
    });

    indicators.forEach((ind, i) => {
      if (ind) {
        ind.classList.toggle("is-active", i + 1 === step);
        ind.classList.toggle("is-completed", i + 1 < step);
      }
    });

    window.scrollTo({ top: 120, behavior: "smooth" });
  }

  validateShippingForm() {
    const name = document.getElementById("shipping-fullname")?.value.trim();
    const email = document.getElementById("shipping-email")?.value.trim();
    const phone = document.getElementById("shipping-phone")?.value.trim();
    const address = document.getElementById("shipping-address")?.value.trim();
    const city = document.getElementById("shipping-city")?.value.trim();
    const zip = document.getElementById("shipping-zip")?.value.trim();

    if (!name || !email || !phone || !address || !city || !zip) {
      showToast("Missing Information", "Please fill in all required shipping address fields.", "error");
      return false;
    }

    if (!email.includes("@") || !email.includes(".")) {
      showToast("Invalid Email", "Please enter a valid email address.", "error");
      return false;
    }

    return true;
  }

  // ==========================================================================
  // Delivery Method Selection
  // ==========================================================================
  setupDeliveryOptions() {
    const deliveryCards = document.querySelectorAll(".delivery-option-card");
    deliveryCards.forEach(card => {
      card.addEventListener("click", () => {
        deliveryCards.forEach(c => {
          c.classList.remove("is-selected");
          c.style.borderColor = "var(--border-color)";
          c.style.backgroundColor = "var(--bg-card)";
        });

        card.classList.add("is-selected");
        card.style.borderColor = "var(--primary)";
        card.style.backgroundColor = "var(--primary-light)";

        const radio = card.querySelector("input[type='radio']");
        if (radio) {
          radio.checked = true;
          this.selectedDelivery = radio.value;
          this.renderOrderSummary();
        }
      });
    });
  }

  // ==========================================================================
  // Payment Method Switcher (Card vs Cash on Delivery)
  // ==========================================================================
  setupPaymentMethodSwitch() {
    const cardOption = document.getElementById("pay-method-card");
    const codOption = document.getElementById("pay-method-cod");
    const cardSection = document.getElementById("credit-card-form-section");
    const codSection = document.getElementById("cod-info-section");

    cardOption?.addEventListener("click", () => {
      this.paymentMethod = "card";
      cardOption.classList.add("is-selected");
      cardOption.style.borderColor = "var(--primary)";
      cardOption.querySelector("input").checked = true;

      codOption.classList.remove("is-selected");
      codOption.style.borderColor = "var(--border-color)";

      if (cardSection) cardSection.style.display = "block";
      if (codSection) codSection.style.display = "none";
    });

    codOption?.addEventListener("click", () => {
      this.paymentMethod = "cod";
      codOption.classList.add("is-selected");
      codOption.style.borderColor = "var(--primary)";
      codOption.querySelector("input").checked = true;

      cardOption.classList.remove("is-selected");
      cardOption.style.borderColor = "var(--border-color)";

      if (cardSection) cardSection.style.display = "none";
      if (codSection) codSection.style.display = "block";
    });
  }

  // ==========================================================================
  // Interactive 3D Credit Card Preview & Live Formatting
  // ==========================================================================
  setupInteractive3DCard() {
    const cardWrap = document.getElementById("credit-card-preview");
    const cardNumInput = document.getElementById("payField1");
    const cardNameInput = document.getElementById("payField2");
    const cardExpiryInput = document.getElementById("payField3");
    const cardCvvInput = document.getElementById("payField4");

    const displayNum = document.getElementById("preview-card-number");
    const displayName = document.getElementById("preview-card-name");
    const displayExpiry = document.getElementById("preview-card-expiry");
    const displayCvv = document.getElementById("preview-card-cvv");
    const brandLogo = document.getElementById("preview-card-brand-logo");

    // 1. Card Number input formatting (groups of 4 with placeholder dots in preview)
    cardNumInput?.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "").substring(0, 16);
      let formatted = val.match(/.{1,4}/g)?.join(" ") || "";
      e.target.value = formatted;

      // Show typed digits in groups with placeholders: e.g. "3235 5252 3••• ••••"
      let padded = val.padEnd(16, "•");
      let previewFormatted = padded.match(/.{1,4}/g).join(" ");
      displayNum.textContent = previewFormatted;

      // Detect brand
      if (val.startsWith("4")) {
        brandLogo.textContent = "VISA";
      } else if (val.startsWith("5") || val.startsWith("2")) {
        brandLogo.textContent = "MASTERCARD";
      } else {
        brandLogo.textContent = "MS CARD";
      }
    });

    // 2. Card Name
    cardNameInput?.addEventListener("input", (e) => {
      const val = e.target.value.toUpperCase();
      displayName.textContent = val || "CARDHOLDER NAME";
    });

    // 3. Expiry date MM/YY formatting (keeps MM/YY until all 4 digits are entered)
    cardExpiryInput?.addEventListener("input", (e) => {
      let val = e.target.value.replace(/\D/g, "").substring(0, 4);
      let formatted = val;
      if (val.length >= 3) {
        formatted = `${val.substring(0, 2)}/${val.substring(2)}`;
      }
      e.target.value = formatted;

      if (val.length === 4) {
        displayExpiry.textContent = formatted;
      } else {
        displayExpiry.textContent = "MM/YY";
      }
    });

    // 4. CVV & 3D Flip Event
    cardCvvInput?.addEventListener("focus", () => {
      cardWrap?.classList.add("is-flipped");
    });

    cardCvvInput?.addEventListener("blur", () => {
      cardWrap?.classList.remove("is-flipped");
    });

    cardCvvInput?.addEventListener("input", (e) => {
      const val = e.target.value.replace(/\D/g, "").substring(0, 4);
      e.target.value = val;
      displayCvv.textContent = val || "•••";
    });
  }

  // ==========================================================================
  // Payment Validation & Processing Simulation
  // ==========================================================================
  setupPaymentSubmission() {
    const payBtn = document.getElementById("btn-complete-payment");

    payBtn?.addEventListener("click", async () => {
      // Require login before completing payment
      const user = getCurrentUser();
      if (!user) {
        const encoded = encodeURIComponent(window.location.href);
        window.location.href = `login.html?redirect=${encoded}`;
        return;
      }

      // If Card selected, validate card fields
      if (this.paymentMethod === "card") {
        if (!this.validateCardDetails()) {
          return;
        }
      }

      // Enter processing state
      payBtn.disabled = true;
      const originalHTML = payBtn.innerHTML;
      payBtn.innerHTML = `
        <span class="spinner"></span>
        <span>Processing your payment securely...</span>
      `;

      // 2-second realistic payment simulation
      setTimeout(async () => {
        try {
          const user = getCurrentUser();
          const items = cart.getItems();
          const totals = cart.getTotals();
          const calculatedShipping = this.selectedDelivery === "express" ? 15.00 : totals.shippingFee;
          const finalTotal = Math.max(0, totals.subtotal - totals.discountAmount + calculatedShipping + totals.estimatedTax);

          const shippingDetails = {
            fullName: document.getElementById("shipping-fullname")?.value.trim(),
            email: document.getElementById("shipping-email")?.value.trim(),
            phone: document.getElementById("shipping-phone")?.value.trim(),
            address: document.getElementById("shipping-address")?.value.trim(),
            city: document.getElementById("shipping-city")?.value.trim(),
            zip: document.getElementById("shipping-zip")?.value.trim(),
            country: document.getElementById("shipping-country")?.value || "United States"
          };

          // Save Order to Firestore (and local sync)
          const order = await createOrder({
            uid: user ? user.uid : "guest",
            items: items,
            shipping: shippingDetails,
            deliveryMethod: this.selectedDelivery,
            deliveryFee: calculatedShipping,
            subtotal: totals.subtotal,
            discount: totals.discountAmount,
            tax: totals.estimatedTax,
            total: finalTotal,
            paymentMethod: this.paymentMethod === "card" ? "Credit/Debit Card" : "Cash on Delivery"
          });

          this.orderResult = order;

          // Clear Shopping Cart
          cart.clearCart();

          // Reset button
          payBtn.disabled = false;
          payBtn.innerHTML = originalHTML;

          // Trigger Payment Complete Pop-up modal!
          this.showPaymentSuccessModal(order);

        } catch (err) {
          console.error(err);
          payBtn.disabled = false;
          payBtn.innerHTML = originalHTML;
          showToast("Payment Error", "Unable to confirm payment. Please try again.", "error");
        }
      }, 2000);
    });
  }

  // Luhn algorithm & card rules
  validateCardDetails() {
    const num = document.getElementById("payField1")?.value.replace(/\s/g, "");
    const name = document.getElementById("payField2")?.value.trim();
    const expiry = document.getElementById("payField3")?.value.trim();
    const cvv = document.getElementById("payField4")?.value.trim();

    if (!num || num.length < 15) {
      showToast("Card Error", "Please enter a valid 16-digit card number.", "error");
      return false;
    }

    if (!this.luhnCheck(num)) {
      showToast("Card Error", "Card number checksum validation failed. Please re-check.", "error");
      return false;
    }

    if (!name || name.length < 3) {
      showToast("Card Error", "Please provide the full name as displayed on card.", "error");
      return false;
    }

    if (!expiry || !expiry.includes("/")) {
      showToast("Expiry Error", "Please specify a valid expiry date in MM/YY format.", "error");
      return false;
    }

    const [month, year] = expiry.split("/").map(Number);
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (month < 1 || month > 12 || year < currentYear || (year === currentYear && month < currentMonth)) {
      showToast("Expiry Error", "The card expiration date must be in the future.", "error");
      return false;
    }

    if (!cvv || cvv.length < 3) {
      showToast("CVV Error", "Please enter the 3-digit CVV security code.", "error");
      return false;
    }

    return true;
  }

  luhnCheck(num) {
    let sum = 0;
    let shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return (sum % 10) === 0;
  }

  // ==========================================================================
  // Celebratory Payment Complete Pop-up Modal (PRD Section 6.12)
  // ==========================================================================
  showPaymentSuccessModal(order) {
    const modal = document.getElementById("payment-success-modal");
    if (!modal) return;

    // Delivery estimate: 3 to 5 business days in future
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (order.deliveryMethod === "express" ? 2 : 4));
    const formattedDate = deliveryDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    document.getElementById("success-order-id").textContent = order.orderId;
    document.getElementById("success-amount-paid").textContent = `$${order.total.toFixed(2)}`;
    document.getElementById("success-delivery-date").textContent = formattedDate;

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";

    // Trigger Celebratory Confetti Burst
    this.fireConfetti();

    // Attach Action Buttons
    document.getElementById("success-btn-track")?.addEventListener("click", () => {
      window.location.href = "account.html#orders";
    });

    document.getElementById("success-btn-continue")?.addEventListener("click", () => {
      window.location.href = "shop.html";
    });

    // Close on Escape or click outside
    const handleClose = () => {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
      window.location.href = "index.html";
    };

    modal.addEventListener("click", (e) => {
      if (e.target === modal) handleClose();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        handleClose();
      }
    });

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  fireConfetti() {
    if (typeof window.confetti === "function") {
      window.confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#4F46E5", "#FF6B6B", "#22C55E", "#F59E0B", "#818CF8"]
      });

      setTimeout(() => {
        window.confetti({
          particleCount: 80,
          angle: 60,
          spread: 60,
          origin: { x: 0 }
        });
        window.confetti({
          particleCount: 80,
          angle: 120,
          spread: 60,
          origin: { x: 1 }
        });
      }, 400);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new CheckoutPage();
});
