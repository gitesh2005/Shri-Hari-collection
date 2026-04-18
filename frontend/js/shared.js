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
    showToast('Logged out successfully', 'info');
    setTimeout(() => window.location.href = '/login.html', 800);
  });
}

/* ── ACCOUNT MENU (Mobile) ───────────────────────────────── */
function openAccountMenu() {
  const user = getUser();
  if (user) {
    if (user.role === 'admin') window.location.href = '/admin.html';
    else window.location.href = '/';
  } else {
    window.location.href = '/login.html';
  }
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

/* ═══════════════════════════════════════════════════════════════════
   ENHANCEMENTS: Cart, Wishlist, Theme, Scroll, Cart Drawer
   ═══════════════════════════════════════════════════════════════════ */

/* ── Theme (Dark Mode) ─────────────────────────────────── */
const THEME_KEY = 'zafran_theme';
function getTheme() {
  return localStorage.getItem(THEME_KEY) ||
         (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  updateThemeToggle();
}
function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}
function initTheme() {
  setTheme(getTheme());
}
function updateThemeToggle() {
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = getTheme() === 'dark' ? '☀️' : '🌙';
}

/* ── Cart ──────────────────────────────────────────────── */
const CART_KEY = 'zafran_cart';
function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}
function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartUI();
}
function addToCart(product, qty = 1, size = 'M') {
  const cart = getCart();
  const existing = cart.find(i => i.id === product._id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: product._id, name: product.name, price: product.price, image: product.imageUrl, category: product.category, qty, size });
  }
  setCart(cart);
  showToast('Added to cart 🛒', 'success');
}
function updateCartQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(id);
    else setCart(cart);
  }
}
function removeFromCart(id) {
  setCart(getCart().filter(i => i.id !== id));
}
function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartUI();
}
function getCartTotal() {
  return getCart().reduce((sum, i) => sum + (i.price * i.qty), 0);
}
function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

/* ── Wishlist ──────────────────────────────────────────── */
const WISHLIST_KEY = 'zafran_wishlist';
function getWishlist() {
  return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
}
function setWishlist(items) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  updateWishlistUI();
}
function toggleWishlist(product) {
  const list = getWishlist();
  const idx = list.findIndex(i => i.id === product._id);
  if (idx > -1) {
    list.splice(idx, 1);
    showToast('Removed from wishlist ❤️', 'info');
    setWishlist(list);
    return false;
  } else {
    list.push({ id: product._id, name: product.name, price: product.price, image: product.imageUrl, category: product.category });
    showToast('Added to wishlist 💖', 'success');
    setWishlist(list);
    return true;
  }
}
function isInWishlist(id) {
  return getWishlist().some(i => i.id === id);
}
function clearWishlist() {
  localStorage.removeItem(WISHLIST_KEY);
  updateWishlistUI();
}

/* ── Cart Drawer UI ────────────────────────────────────── */
function updateCartUI() {
  renderCartItems();
  updateCartCount();
  updateCartTotal();
}
function renderCartItems() {
  const container = document.getElementById('cart-items');
  if (!container) return;
  const cart = getCart();
  if (cart.length === 0) {
    container.innerHTML = `<div class="cart-empty" style="text-align:center;padding:40px 20px;color:var(--midtone)"><p>Your cart is empty</p></div>`;
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img"><img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x100?text=N/A'"></div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
        <div class="cart-item-actions">
          <button class="cart-qty-btn" onclick="updateCartQty('${item.id}', -1)">−</button>
          <span>${item.qty}</span>
          <button class="cart-qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
          <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
}
function updateCartCount() {
  // Desktop badge
  const badge = document.querySelector('.nav-icon-btn[onclick="openCartDrawer()"] .icon-badge');
  const mobileBadge = document.getElementById('mobile-cart-badge');
  const count = getCartCount();

  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'block' : 'none';
  }
  if (mobileBadge) {
    mobileBadge.textContent = count;
    mobileBadge.style.display = count > 0 ? 'block' : 'none';
  }
}
function updateCartTotal() {
  const total = document.getElementById('cart-total');
  if (total) total.textContent = formatPrice(getCartTotal());
}
function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  if (drawer && overlay) {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ── Wishlist UI ───────────────────────────────────────── */
function updateWishlistUI() {
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const id = btn.getAttribute('data-id');
    if (id && isInWishlist(id)) {
      btn.classList.add('active');
      btn.textContent = '❤️';
    } else if (id) {
      btn.classList.remove('active');
      btn.textContent = '🤍';
    }
  });
}

/* ── Scroll Animation ──────────────────────────────────── */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
}

/* ── Back to Top ───────────────────────────────────────── */
function initBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.innerHTML = '↑';
  btn.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(btn);
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) btn.classList.add('visible');
    else btn.classList.remove('visible');
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ── Extend DOMContentLoaded ───────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initScrollAnimations();
  initBackToTop();
  updateCartUI();

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (nav) {
      if (window.scrollY > 50) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
  });

  // Close modals on outside click
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target.id === 'lightbox') closeLightbox();
    });
  }
});