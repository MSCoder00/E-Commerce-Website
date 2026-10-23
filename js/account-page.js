// ==========================================================================
// MS STORE - My Account & Order History Controller
// Profile editing, address book, past orders, and tracking status modal
// Compliant with PRD Section 6.13
// ==========================================================================

import { getCurrentUser, logoutUser, requireAuth } from "./auth.js";
import { getUserOrders, getUserProfile, saveUserProfile } from "./firebase-service.js";
import { showToast } from "./ui.js";
import { getProductUrl } from "./utils.js";

class AccountPage {
  constructor() {
    this.user = null;
    this.profileData = null;
    this.orders = [];
    this.init();
  }

  async init() {
    // Check authentication
    if (!requireAuth()) return;

    this.user = getCurrentUser();
    this.setupTabs();
    this.renderUserProfileHeader();
    await this.loadProfileData();
    await this.loadOrders();
    this.setupProfileForm();
    this.setupAddressBook();
    this.setupLogout();
    this.checkHashRoute();
  }

  checkHashRoute() {
    if (window.location.hash === "#orders") {
      this.switchTab("orders");
    }
  }

  setupTabs() {
    const tabs = document.querySelectorAll(".account-nav-item");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const target = tab.getAttribute("data-tab");
        if (target === "logout") {
          logoutUser();
          return;
        }
        this.switchTab(target);
      });
    });
  }

  switchTab(targetTab) {
    document.querySelectorAll(".account-nav-item").forEach(t => {
      t.classList.toggle("active", t.getAttribute("data-tab") === targetTab);
    });

    document.querySelectorAll(".account-tab-pane").forEach(p => {
      p.style.display = (p.id === `pane-${targetTab}`) ? "block" : "none";
    });
  }

  renderUserProfileHeader() {
    const nameEl = document.getElementById("account-display-name");
    const emailEl = document.getElementById("account-display-email");
    const avatarEl = document.getElementById("account-display-avatar");

    const name = this.user.displayName || this.user.email.split("@")[0];
    const avatar = this.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff`;

    if (nameEl) nameEl.textContent = name;
    if (emailEl) emailEl.textContent = this.user.email;
    if (avatarEl) avatarEl.src = avatar;
  }

  async loadProfileData() {
    this.profileData = (await getUserProfile(this.user.uid)) || {
      displayName: this.user.displayName,
      email: this.user.email,
      phone: "",
      addresses: []
    };

    const nameInput = document.getElementById("profile-name-input");
    const emailInput = document.getElementById("profile-email-input");
    const phoneInput = document.getElementById("profile-phone-input");

    if (nameInput) nameInput.value = this.profileData.displayName || this.user.displayName || "";
    if (emailInput) emailInput.value = this.profileData.email || this.user.email || "";
    if (phoneInput) phoneInput.value = this.profileData.phone || "";

    this.renderAddressList();
  }

  setupProfileForm() {
    const form = document.getElementById("account-profile-form");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newName = document.getElementById("profile-name-input").value.trim();
      const newPhone = document.getElementById("profile-phone-input").value.trim();

      const updated = {
        ...this.profileData,
        displayName: newName,
        phone: newPhone
      };

      await saveUserProfile(this.user.uid, updated);
      this.profileData = updated;
      this.user.displayName = newName;
      this.renderUserProfileHeader();
      showToast("Profile Updated", "Your personal details have been saved.", "success");
    });
  }

  renderAddressList() {
    const listEl = document.getElementById("addresses-list-container");
    if (!listEl) return;

    const addresses = this.profileData.addresses || [];

    if (addresses.length === 0) {
      listEl.innerHTML = `
        <div style="padding:2rem;text-align:center;border:1px dashed var(--border-color);border-radius:var(--radius-md);color:var(--text-muted);font-size:0.875rem;">
          No delivery addresses saved yet. Add one below for faster checkout.
        </div>
      `;
      return;
    }

    listEl.innerHTML = addresses.map((addr, i) => `
      <div style="background:var(--slate-50);border:1px solid var(--border-color);border-radius:var(--radius-md);padding:1.25rem;display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
        <div>
          <div style="font-weight:700;font-size:0.95rem;margin-bottom:0.25rem;">${addr.label || "Delivery Address"}</div>
          <div style="font-size:0.875rem;color:var(--text-main);">${addr.address}, ${addr.city}, ${addr.zip}</div>
          <div style="font-size:0.775rem;color:var(--text-muted);">${addr.country} â€¢ Phone: ${addr.phone || "N/A"}</div>
        </div>
        <button class="btn btn-outline btn-sm btn-delete-address" data-index="${i}" style="color:var(--danger);border-color:var(--border-color);">
          <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
          <span>Delete</span>
        </button>
      </div>
    `).join("");

    listEl.querySelectorAll(".btn-delete-address").forEach(btn => {
      btn.addEventListener("click", async () => {
        const idx = Number(btn.getAttribute("data-index"));
        this.profileData.addresses.splice(idx, 1);
        await saveUserProfile(this.user.uid, this.profileData);
        this.renderAddressList();
        showToast("Address Removed", "The address was removed from your address book.", "info");
      });
    });

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  setupAddressBook() {
    const form = document.getElementById("new-address-form");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const label = document.getElementById("addr-label")?.value.trim() || "Home";
      const address = document.getElementById("addr-street")?.value.trim();
      const city = document.getElementById("addr-city")?.value.trim();
      const zip = document.getElementById("addr-zip")?.value.trim();
      const country = document.getElementById("addr-country")?.value || "United States";
      const phone = document.getElementById("addr-phone")?.value.trim();

      if (!address || !city || !zip) return;

      if (!this.profileData.addresses) this.profileData.addresses = [];
      this.profileData.addresses.push({ label, address, city, zip, country, phone });

      await saveUserProfile(this.user.uid, this.profileData);
      form.reset();
      this.renderAddressList();
      showToast("Address Saved", "New shipping address added successfully.", "success");
    });
  }

  // ==========================================================================
  // Past Orders List & Track Order Modal
  // ==========================================================================
  async loadOrders() {
    const listEl = document.getElementById("orders-history-list");
    if (!listEl) return;

    this.orders = await getUserOrders(this.user.uid);

    if (this.orders.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:4rem 1.5rem;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);">
          <div style="width:68px;height:68px;border-radius:50%;background:var(--slate-100);color:var(--slate-400);display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
            <i data-lucide="package" style="width:34px;height:34px;"></i>
          </div>
          <h3 style="margin-bottom:0.5rem;">No Orders Placed Yet</h3>
          <p style="color:var(--text-muted);font-size:0.9rem;max-width:380px;margin:0 auto 1.5rem;">When you place orders, your order status, items summary, and live tracking will appear here.</p>
          <a href="shop.html" class="btn btn-primary btn-sm">Explore Shop</a>
        </div>
      `;
      if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
      return;
    }

    listEl.innerHTML = this.orders.map(order => `
      <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:1.5rem;margin-bottom:1.5rem;box-shadow:var(--shadow-xs);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;padding-bottom:1rem;margin-bottom:1rem;border-bottom:1px solid var(--border-color);">
          <div>
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <strong style="font-family:monospace;font-size:1.05rem;color:var(--primary);">${order.orderId}</strong>
              <span class="badge badge-new" style="background:var(--success-light);color:var(--success);">${order.orderStatus || "Processing"}</span>
            </div>
            <div style="font-size:0.775rem;color:var(--text-muted);margin-top:0.25rem;">
              Placed on ${new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:1rem;">
            <div style="text-align:right;">
              <div style="font-size:0.75rem;color:var(--text-muted);">Total Paid</div>
              <strong style="font-size:1.15rem;color:var(--text-main);">$${order.total.toFixed(2)}</strong>
            </div>
            <button class="btn btn-outline btn-sm btn-track-order" data-id="${order.orderId}">
              <i data-lucide="truck" style="width:15px;height:15px;"></i>
              <span>Track Order</span>
            </button>
          </div>
        </div>

        <!-- Ordered Items Preview -->
        <div style="display:flex;flex-direction:column;gap:0.6rem;">
          ${(order.items || []).map(item => `
            <div style="display:flex;align-items:center;justify-content:space-between;font-size:0.875rem;">
              <a href="${getProductUrl(item.productId)}" style="display:flex;align-items:center;gap:0.75rem;color:inherit;text-decoration:none;">
                <img src="${item.image || '/assets/images/placeholder.svg'}" alt="${item.name}" width="40" height="40" loading="lazy" style="width:40px;height:40px;border-radius:var(--radius-xs);object-fit:cover;background:var(--slate-100);" onerror="this.onerror=null;this.src='/assets/images/placeholder.svg';">
                <span>${item.name}${item.variant ? ` <span style="color:var(--text-muted);font-size:0.8rem;">(${item.variant})</span>` : ""} &times; <strong>${item.quantity}</strong></span>
              </a>
              <span style="font-weight:600;">$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `).join("");

    listEl.querySelectorAll(".btn-track-order").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const order = this.orders.find(o => o.orderId === id);
        if (order) this.openTrackModal(order);
      });
    });

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  openTrackModal(order) {
    const modal = document.getElementById("order-track-modal");
    if (!modal) return;

    document.getElementById("track-modal-order-id").textContent = order.orderId;
    document.getElementById("track-modal-date").textContent = new Date(order.createdAt).toLocaleDateString();

    modal.classList.add("is-open");
    document.body.style.overflow = "hidden";

    document.getElementById("track-modal-close")?.addEventListener("click", () => {
      modal.classList.remove("is-open");
      document.body.style.overflow = "";
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("is-open");
        document.body.style.overflow = "";
      }
    });

    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  setupLogout() {
    document.getElementById("account-logout-btn")?.addEventListener("click", () => {
      logoutUser();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new AccountPage();
});
