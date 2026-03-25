/* ═══════════════════════════════════════════════════════
   shared.js  –  FINAL WORKING VERSION (FIXED AUTH)
   ═══════════════════════════════════════════════════════ */

const API_BASE = 'https://shri-hari-collection.onrender.com/api';

/* ── Token helpers ─────────────────────────────────────── */
const getToken = () => localStorage.getItem('zafran_token');
const getUser = () => JSON.parse(localStorage.getItem('zafran_user') || 'null');

const setAuth = (token, user) => {
  localStorage.setItem('zafran_token', token);
  localStorage.setItem('zafran_user', JSON.stringify(user));
};

const clearAuth = () => {
  localStorage.removeItem('zafran_token');
  localStorage.removeItem('zafran_user');
};

/* ── Toast ─────────────────────────────────────────────── */
function showToast(message, type = 'success', duration = 3000) {
  const el = document.getElementById('toast');
  if (!el) return;

  el.textContent = message;
  el.className = `show ${type}`;

  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.className = '';
  }, duration);
}

/* ── Format price ─────────────────────────────────────── */
function formatPrice(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

/* ── Skeleton Cards ───────────────────────────────────── */
function skeletonCards(n = 4) {
  return Array.from({ length: n }, () => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line shorter"></div>
      </div>
    </div>
  `).join('');
}

/* ── Fetch wrapper (FIXED AUTH CHECK) ─────────────────── */
async function apiFetch(endpoint, options = {}) {
  try {
    const headers = { ...options.headers };

    // JSON header
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // 🔥 FIX: enforce token when auth is required
    if (options.auth) {
      const token = getToken();
      if (!token) {
        throw new Error("Not authenticated. Please log in.");
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      body: options.body instanceof FormData
        ? options.body
        : options.body
        ? JSON.stringify(options.body)
        : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'API error');
    }

    return data;

  } catch (err) {
    console.error("FETCH ERROR:", err);
    throw err;
  }
}

/* ── NAV + UI helpers ─────────────────────────────────── */
function setActiveNav() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = new URL(a.href, window.location.origin).pathname.replace(/\/$/, '') || '/';
    a.classList.toggle('active', href === path);
  });
}

function initHamburger() {
  const btn = document.querySelector('.nav-hamburger');
  const links = document.querySelector('.nav-links');
  if (!btn) return;

  btn.addEventListener('click', () => links.classList.toggle('open'));
}

function buildNavAuth() {
  const user = getUser();

  const logoutItem = document.getElementById('nav-logout');
  const loginItem = document.getElementById('nav-login');
  const signupItem = document.getElementById('nav-signup');

  if (user) {
    if (loginItem) loginItem.style.display = 'none';
    if (signupItem) signupItem.style.display = 'none';
    if (logoutItem) logoutItem.style.display = 'list-item';
  } else {
    if (logoutItem) logoutItem.style.display = 'none';
  }
}

function initLogout() {
  const btn = document.getElementById('logout-btn');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    clearAuth();
    window.location.href = '/login.html';
  });
}

/* ── SIGNUP HANDLER ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  setActiveNav();
  initHamburger();
  buildNavAuth();
  initLogout();

  const signupForm = document.getElementById("signup-form");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!name || !email || !password) {
        showToast("All fields are required", "error");
        return;
      }

      try {
        const data = await apiFetch('/auth/signup', {
          method: 'POST',
          body: { name, email, password }
        });

        showToast("Signup successful ✅");

        setAuth(data.token, data.user);

        setTimeout(() => {
          window.location.href = "/";
        }, 1000);

      } catch (err) {
        showToast(err.message, "error");
      }
    });
  }

});