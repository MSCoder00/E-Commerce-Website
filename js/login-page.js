// ==========================================================================
// MS STORE - Login & Registration Page Controller
// Tab toggling, password strength meter, email/password & Google Auth,
// forgot password modal, and redirect handling
// Compliant with PRD Section 6.9
// ==========================================================================

import { loginWithEmail, registerWithEmail, loginWithGoogle, resetPassword, getCurrentUser } from "./auth.js";
import { showToast } from "./ui.js";

class AuthPage {
  constructor() {
    this.redirectUrl = new URLSearchParams(window.location.search).get("redirect") || "index.html";
    this.init();
  }

  init() {
    // If user already logged in, redirect them immediately
    const user = getCurrentUser();
    if (user) {
      window.location.href = this.redirectUrl;
      return;
    }

    this.setupTabs();
    this.setupPasswordStrengthMeter();
    this.setupLoginForm();
    this.setupRegisterForm();
    this.setupGoogleAuth();
    this.setupForgotPassword();
  }

  setupTabs() {
    const tabLogin = document.getElementById("auth-tab-login");
    const tabRegister = document.getElementById("auth-tab-register");
    const formLogin = document.getElementById("login-form-pane");
    const formRegister = document.getElementById("register-form-pane");

    tabLogin?.addEventListener("click", () => {
      tabLogin.classList.add("active");
      tabRegister.classList.remove("active");
      if (formLogin) formLogin.style.display = "block";
      if (formRegister) formRegister.style.display = "none";
    });

    tabRegister?.addEventListener("click", () => {
      tabRegister.classList.add("active");
      tabLogin.classList.remove("active");
      if (formRegister) formRegister.style.display = "block";
      if (formLogin) formLogin.style.display = "none";
    });
  }

  // Password Strength Meter
  setupPasswordStrengthMeter() {
    const pwdInput = document.getElementById("reg-password");
    const bar = document.getElementById("pwd-strength-bar");
    const text = document.getElementById("pwd-strength-text");

    if (!pwdInput || !bar || !text) return;

    pwdInput.addEventListener("input", (e) => {
      const val = e.target.value;
      if (!val) {
        bar.style.width = "0%";
        text.textContent = "";
        return;
      }

      let score = 0;
      if (val.length >= 8) score++;
      if (/[A-Z]/.test(val)) score++;
      if (/[0-9]/.test(val)) score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;

      if (score <= 1) {
        bar.style.width = "25%";
        bar.style.backgroundColor = "var(--danger)";
        text.textContent = "Weak password (add numbers or uppercase)";
        text.style.color = "var(--danger)";
      } else if (score === 2 || score === 3) {
        bar.style.width = "65%";
        bar.style.backgroundColor = "var(--warning)";
        text.textContent = "Moderate strength (add symbols for optimal protection)";
        text.style.color = "var(--warning)";
      } else {
        bar.style.width = "100%";
        bar.style.backgroundColor = "var(--success)";
        text.textContent = "Strong password";
        text.style.color = "var(--success)";
      }
    });
  }

  setupLoginForm() {
    const form = document.getElementById("form-signin");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email")?.value.trim();
      const password = document.getElementById("login-password")?.value;
      const btn = form.querySelector("button[type='submit']");

      if (!email || !password) return;

      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span> <span>Signing in...</span>`;

      try {
        await loginWithEmail(email, password);
        showToast("Welcome Back!", "Signed in successfully. Redirecting...", "success");
        setTimeout(() => {
          window.location.href = this.redirectUrl;
        }, 800);
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = "Sign In";
        showToast("Login Failed", err.message, "error");
      }
    });
  }

  setupRegisterForm() {
    const form = document.getElementById("form-signup");
    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("reg-name")?.value.trim();
      const email = document.getElementById("reg-email")?.value.trim();
      const password = document.getElementById("reg-password")?.value;
      const btn = form.querySelector("button[type='submit']");

      if (password.length < 8) {
        showToast("Password Too Short", "Password must be at least 8 characters long.", "error");
        return;
      }

      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span> <span>Creating account...</span>`;

      try {
        await registerWithEmail(name, email, password);
        showToast("Account Created", "Welcome to MS STORE! Redirecting...", "success");
        setTimeout(() => {
          window.location.href = this.redirectUrl;
        }, 800);
      } catch (err) {
        btn.disabled = false;
        btn.innerHTML = "Create Account";
        showToast("Sign Up Notice", err.message, "error");
      }
    });
  }

  setupGoogleAuth() {
    const googleBtns = document.querySelectorAll(".btn-google-auth");
    googleBtns.forEach(btn => {
      btn.addEventListener("click", async () => {
        try {
          await loginWithGoogle();
          showToast("Welcome!", "Signed in with Google successfully.", "success");
          setTimeout(() => {
            window.location.href = this.redirectUrl;
          }, 800);
        } catch (err) {
          showToast("Google Sign-In", err.message, "error");
        }
      });
    });
  }

  setupForgotPassword() {
    const forgotLink = document.getElementById("btn-forgot-password");
    const modal = document.getElementById("forgot-pwd-modal");
    const modalClose = document.getElementById("forgot-modal-close");
    const form = document.getElementById("forgot-pwd-form");

    forgotLink?.addEventListener("click", (e) => {
      e.preventDefault();
      modal?.classList.add("is-open");
    });

    modalClose?.addEventListener("click", () => modal?.classList.remove("is-open"));

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("forgot-email-input")?.value.trim();
      if (!email) return;

      try {
        await resetPassword(email);
        modal?.classList.remove("is-open");
        showToast("Reset Link Sent", `A password recovery email has been sent to ${email}.`, "success");
      } catch (err) {
        showToast("Password Reset", err.message, "error");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new AuthPage();
});
