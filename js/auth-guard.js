// ==========================================================================
// MS STORE - Auth Guard
// Intercepts checkout navigation links and shows a login prompt
// if the visitor is not signed in. Works on every page.
// ==========================================================================

import { getCurrentUser } from "./auth.js";

// ---------------------------------------------------------------------------
// Modal HTML (injected once into <body>)
// ---------------------------------------------------------------------------
function injectModal() {
  if (document.getElementById("auth-guard-modal")) return;

  const overlay = document.createElement("div");
  overlay.id = "auth-guard-modal";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "auth-guard-title");
  overlay.style.cssText = [
    "display:none",
    "position:fixed",
    "inset:0",
    "z-index:9999",
    "background:rgba(0,0,0,0.55)",
    "backdrop-filter:blur(4px)",
    "align-items:center",
    "justify-content:center",
    "padding:1.25rem"
  ].join(";");

  overlay.innerHTML = `
    <div style="background:var(--bg-card,#fff);border-radius:var(--radius-lg,1rem);box-shadow:0 24px 64px rgba(0,0,0,0.18);max-width:420px;width:100%;padding:2.25rem 2rem 2rem;position:relative;animation:agFadeIn 0.22s ease;">
      <button id="auth-guard-close" aria-label="Close" style="position:absolute;top:1rem;right:1rem;background:none;border:none;cursor:pointer;color:var(--text-muted,#64748b);padding:0.25rem;display:flex;align-items:center;justify-content:center;border-radius:var(--radius-sm,0.375rem);transition:color 0.15s,background 0.15s;" onmouseover="this.style.background='var(--slate-100,#f1f5f9)'" onmouseout="this.style.background='none'">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div style="text-align:center;margin-bottom:1.5rem;">
        <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--primary,#4F46E5),var(--primary-light,#6366f1));display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <h2 id="auth-guard-title" style="font-size:1.35rem;font-weight:700;margin-bottom:0.5rem;color:var(--text-main,#0f172a);">Sign In to Continue</h2>
        <p style="color:var(--text-muted,#64748b);font-size:0.9375rem;line-height:1.6;max-width:300px;margin:0 auto;">Please sign in to your MS STORE account to complete your purchase.</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:0.75rem;">
        <a id="auth-guard-signin-btn" href="login.html" class="btn btn-primary btn-lg btn-block" style="justify-content:center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:0.5rem;"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          Sign In
        </a>
        <a id="auth-guard-register-btn" href="login.html?tab=register" class="btn btn-outline btn-lg btn-block" style="justify-content:center;">Create a Free Account</a>
      </div>
    </div>
  `;

  // Keyframe animation
  if (!document.getElementById("auth-guard-styles")) {
    const style = document.createElement("style");
    style.id = "auth-guard-styles";
    style.textContent = "@keyframes agFadeIn{from{opacity:0;transform:translateY(-12px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}";
    document.head.appendChild(style);
  }

  document.body.appendChild(overlay);

  // Close when clicking outside the card
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });

  // Close button
  document.getElementById("auth-guard-close")?.addEventListener("click", closeModal);

  // Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.style.display !== "none") closeModal();
  });
}

function openModal(redirectUrl) {
  const overlay = document.getElementById("auth-guard-modal");
  if (!overlay) return;
  const encoded = encodeURIComponent(redirectUrl || window.location.href);
  const signinBtn = document.getElementById("auth-guard-signin-btn");
  const registerBtn = document.getElementById("auth-guard-register-btn");
  if (signinBtn) signinBtn.href = `login.html?redirect=${encoded}`;
  if (registerBtn) registerBtn.href = `login.html?tab=register&redirect=${encoded}`;
  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";
  document.getElementById("auth-guard-close")?.focus();
}

function closeModal() {
  const overlay = document.getElementById("auth-guard-modal");
  if (overlay) overlay.style.display = "none";
  document.body.style.overflow = "";
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run `action` only if the user is signed in.
 * If not, show the sign-in modal instead.
 * @param {Function} action
 * @param {string} [redirectUrl]
 */
export function requireAuthForAction(action, redirectUrl) {
  const user = getCurrentUser();
  if (user) {
    action();
  } else {
    openModal(redirectUrl || window.location.href);
  }
}

// ---------------------------------------------------------------------------
// Auto-intercept all <a href="checkout.html"> links on this page
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  injectModal();

  document.addEventListener("click", (e) => {
    const anchor = e.target.closest("a");
    if (!anchor) return;
    const href = anchor.getAttribute("href") || "";
    if (!href.startsWith("checkout.html") && !href.includes("/checkout.html")) return;

    const user = getCurrentUser();
    if (!user) {
      e.preventDefault();
      openModal("checkout.html");
    }
    // Logged in – let navigation proceed normally
  });
});
