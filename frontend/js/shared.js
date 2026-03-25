/* ═══════════════════════════════════════════════════════
   shared.js  –  Utilities used across all pages
   ═══════════════════════════════════════════════════════ */

const API_BASE = 'https://shri-hari-collection.onrender.com/api';

/* ── Token helpers ─────────────────────────────────────── */
const getToken = ()         => localStorage.getItem('zafran_token');
const getUser  = ()         => JSON.parse(localStorage.getItem('zafran_user') || 'null');
const setAuth  = (token, user) => {
  localStorage.setItem('zafran_token', token);
  localStorage.setItem('zafran_user',  JSON.stringify(user));
};
const clearAuth = () => {
  localStorage.removeItem('zafran_token');
  localStorage.removeItem('zafran_user');
};

/* ── Toast ─────────────────────────────────────────────── */
function showToast(message, type = 'success', duration = 3500) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.className   = `show ${type}`;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.className = ''; }, duration);
}

/* ── Fetch wrapper ─────────────────────────────────────── */
async function apiFetch(endpoint, options = {}) {
  try {
    const token = getToken();
    const headers = { ...options.headers };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      body: options.body instanceof FormData
        ? options.body
        : options.body
          ? JSON.stringify(options.body)
          : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || 'API error');
    }

    return await res.json();

  } catch (err) {
    console.error("FETCH ERROR:", err);
    throw err;
  }
}

/* ── Nav active link ───────────────────────────────────── */
function setActiveNav() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = new URL(a.href, window.location.origin).pathname.replace(/\/$/, '') || '/';
    a.classList.toggle('active', href === path);
  });
}

/* ── Hamburger menu ────────────────────────────────────── */
function initHamburger() {
  const btn   = document.querySelector('.nav-hamburger');
  const links = document.querySelector('.nav-links');
  if (!btn) return;
  btn.addEventListener('click', () => links.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !links.contains(e.target))
      links.classList.remove('open');
  });
}

/* ── Build nav user state ──────────────────────────────── */
function buildNavAuth() {
  const user        = getUser();
  const navLinks    = document.querySelector('.nav-links');
  const logoutItem  = document.getElementById('nav-logout');
  const adminItem   = document.getElementById('nav-admin');
  const loginItem   = document.getElementById('nav-login');
  const signupItem  = document.getElementById('nav-signup');

  if (user) {
    if (loginItem)  loginItem.style.display  = 'none';
    if (signupItem) signupItem.style.display = 'none';
    if (logoutItem) logoutItem.style.display = 'list-item';
    if (adminItem && user.role === 'admin') adminItem.style.display = 'list-item';
  } else {
    if (logoutItem) logoutItem.style.display = 'none';
    if (adminItem)  adminItem.style.display  = 'none';
  }
}

/* ── Logout ────────────────────────────────────────────── */
function initLogout() {
  const btn = document.getElementById('logout-btn');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    clearAuth();
    window.location.href = '/login.html';
  });
}

/* ── Format price ──────────────────────────────────────── */
function formatPrice(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

/* ── Skeleton cards ────────────────────────────────────── */
function skeletonCards(n = 4) {
  return Array.from({ length: n }, () => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line"></div>
        <div class="skeleton skeleton-line shorter"></div>
      </div>
    </div>`).join('');
}

/* ── DOMContentLoaded bootstrap ───────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initHamburger();
  buildNavAuth();
  initLogout();
});
