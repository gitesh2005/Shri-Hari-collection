/* ═══════════════════════════════════════════════════════════════════
   ZAFRAN 2.0 – Enhanced Shared JavaScript
   Features: Cart, Wishlist, Dark Mode, Animations, UI Helpers
   ═══════════════════════════════════════════════════════════════════ */

const API_BASE = 'https://shri-hari-collection.onrender.com/api';

/* ═══════════════════════════════════════════════════════════════════
   AUTH HELPERS
   ═══════════════════════════════════════════════════════════════════ */
const getToken = () => localStorage.getItem('zafran_token');
const getUser  = () => JSON.parse(localStorage.getItem('zafran_user') || 'null');

const setAuth = (token, user) => {
  localStorage.setItem('zafran_token', token);
  localStorage.setItem('zafran_user', JSON.stringify(user));
};

const clearAuth = () => {
  localStorage.removeItem('zafran_token');
  localStorage.removeItem('zafran_user');
  clearCart();
  clearWishlist();
};

/* ═══════════════════════════════════════════════════════════════════
   CARTS & WISHLIST (LocalStorage)
   ═══════════════════════════════════════════════════════════════════ */
const CART_KEY     = 'zafran_cart';
const WISHLIST_KEY = 'zafran_wishlist';
const THEME_KEY    = 'zafran_theme';

// Cart
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
    cart.push({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      category: product.category,
      qty,
      size
    });
  }

  setCart(cart);
  showToast('Added to cart 🛒', 'success');
  openCartDrawer();
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
  const cart = getCart().filter(i => i.id !== id);
  setCart(cart);
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

// Wishlist
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
    list.push({
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      category: product.category
    });
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

/* ═══════════════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
   ═══════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════
   PRICE FORMATTING
   ═══════════════════════════════════════════════════════════════════ */
function formatPrice(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN');
}

/* ═══════════════════════════════════════════════════════════════════
   SKELETON & LOADING
   ═══════════════════════════════════════════════════════════════════ */
function skeletonCards(n = 4) {
  return Array.from({ length: n }, () => `
    <div class="product-card fade-in-up">
      <div class="product-card-img">
        <div class="skeleton" style="height:100%"></div>
      </div>
      <div class="product-card-body">
        <div class="skeleton skeleton-line short"></div>
        <div class="skeleton skeleton-line" style="margin-top:10px"></div>
        <div class="skeleton skeleton-line shorter"></div>
        <div style="margin-top:16px;display:flex;justify-content:space-between;">
          <div class="skeleton skeleton-line" style="width:80px"></div>
          <div class="skeleton skeleton-line" style="width:60px"></div>
        </div>
      </div>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════════════════════════════
   API FETCH WITH AUTH
   ═══════════════════════════════════════════════════════════════════ */
async function apiFetch(endpoint, options = {}) {
  try {
    const headers = { ...options.headers };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (options.auth) {
      const token = getToken();
      if (!token) throw new Error('Please log in to continue.');
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
    if (!res.ok) throw new Error(data.message || 'API error');

    return data;
  } catch (err) {
    console.error('FETCH ERROR:', err);
    throw err;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   DARK MODE
   ═══════════════════════════════════════════════════════════════════ */
function initTheme() {
  const saved =
    localStorage.getItem(THEME_KEY) ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(saved);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  updateThemeToggle(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
}

function updateThemeToggle(theme) {
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.setAttribute(
      'title',
      theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
    );
  }
}

/* ═══════════════════════════════════════════════════════════════════
   NAVIGATION & UI HELPERS
   ═══════════════════════════════════════════════════════════════════ */
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
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    links.classList.toggle('open');
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('active');
      links.classList.remove('open');
    });
  });
}

function buildNavAuth() {
  const user = getUser();
  const logoutItem = document.getElementById('nav-logout');
  const loginItem = document.getElementById('nav-login');
  const signupItem = document.getElementById('nav-signup');
  const adminItem = document.getElementById('nav-admin');

  if (!user) {
    if (logoutItem) logoutItem.style.display = 'none';
    if (loginItem) loginItem.style.display = 'list-item';
    if (signupItem) signupItem.style.display = 'list-item';
    if (adminItem) adminItem.style.display = 'none';
  } else {
    if (loginItem) loginItem.style.display = 'none';
    if (signupItem) signupItem.style.display = 'none';
    if (logoutItem) logoutItem.style.display = 'list-item';
    if (user.role === 'admin' && adminItem) adminItem.style.display = 'list-item';
  }
}

function initLogout() {
  const btn = document.getElementById('logout-btn');
  if (!btn) return;

  btn.addEventListener('click', e => {
    e.preventDefault();
    clearAuth();
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 800);
  });
}

function initNavbar() {
  const user = getUser();
  const homeLink = document.getElementById('nav-home');
  const loginLink = document.getElementById('nav-login');
  const signupLink = document.getElementById('nav-signup');
  const logoutLink = document.getElementById('nav-logout');
  const productsLink = document.getElementById('nav-products');
  const adminLink = document.getElementById('nav-admin');

  if (!user) {
    if (homeLink) homeLink.style.display = 'list-item';
    if (loginLink) loginLink.style.display = 'list-item';
    if (signupLink) signupLink.style.display = 'list-item';
    if (logoutLink) logoutLink.style.display = 'none';
    if (productsLink) productsLink.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
  } else {
    if (homeLink) homeLink.style.display = 'none';
    if (loginLink) loginLink.style.display = 'none';
    if (signupLink) signupLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'list-item';
    if (productsLink) productsLink.style.display = 'list-item';
    if (adminLink) {
      adminLink.style.display = user.role === 'admin' ? 'list-item' : 'none';
    }
  }
}

/* ═══════════════════════════════════════════════════════════════════
   SCROLL ANIMATION OBSERVER
   ═══════════════════════════════════════════════════════════════════ */
function initScrollAnimations() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-in-up, .scroll-reveal').forEach(el => {
    observer.observe(el);
  });
}

/* ═══════════════════════════════════════════════════════════════════
   BACK TO TOP
   ═══════════════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════════════
   CART DRAWER
   ═══════════════════════════════════════════════════════════════════ */
function renderCartItems() {
  const container = document.getElementById('cart-items');
  const cart = getCart();

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div style="font-size:3rem;margin-bottom:12px;">🛒</div>
        <p style="color:var(--midtone);margin-bottom:8px;">Your cart is empty</p>
        <button class="btn btn-outline btn-sm" onclick="closeCartDrawer()" style="margin-top:8px;padding:8px 20px;">Continue Shopping</button>
      </div>
    `;
    return;
  }

  container.innerHTML = cart
    .map(
      item => `
    <div class="cart-item">
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/80x100?text=N/A'">
      </div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
        <div style="font-size:.8rem;color:var(--light-txt)">Size: ${item.size || 'M'}</div>
        <div class="cart-item-actions">
          <button class="cart-qty-btn" onclick="updateCartQty('${item.id}', -1)">−</button>
          <span style="font-weight:600;min-width:24px;text-align:center">${item.qty}</span>
          <button class="cart-qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
          <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

function updateCartUI() {
  renderCartItems();
  updateCartCount();
  updateCartTotal();
  updateCheckoutBtn();
}

function updateCartCount() {
  const badge = document.querySelector('.nav-icon-btn[onclick*="openCartDrawer"] .icon-badge');
  const count = getCartCount();

  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'block' : 'none';
  }
}

function updateCartTotal() {
  const totalEl = document.getElementById('cart-total');
  const totalBold = document.getElementById('cart-total-bold');
  if (totalEl) totalEl.textContent = formatPrice(getCartTotal());
  if (totalBold) totalBold.textContent = formatPrice(getCartTotal());
}

function updateCheckoutBtn() {
  const btn = document.getElementById('checkout-btn');
  if (btn) {
    btn.disabled = getCartCount() === 0;
    btn.textContent = getCartCount() === 0 ? 'Cart Empty' : 'Proceed to Checkout';
  }
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');

  if (!drawer || !overlay) return;

  drawer.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');

  if (!drawer || !overlay) return;

  drawer.classList.remove('open');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ═══════════════════════════════════════════════════════════════════
   WISHLIST UI
   ═══════════════════════════════════════════════════════════════════ */
function updateWishlistUI() {
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const productId = btn.getAttribute('data-id');
    if (productId && isInWishlist(productId)) {
      btn.classList.add('active');
      btn.textContent = '❤️';
    } else if (productId) {
      btn.classList.remove('active');
      btn.textContent = '🤍';
    }
  });
}

/* ═══════════════════════════════════════════════════════════════════
   ACCOUNT MENU (Mobile)
   ═══════════════════════════════════════════════════════════════════ */
function openAccountMenu() {
  const user = getUser();
  if (user) {
    if (user.role === 'admin') {
      window.location.href = '/admin.html';
    } else {
      window.location.href = '/profile.html';
    }
  } else {
    window.location.href = '/login.html';
  }
}

/* ═══════════════════════════════════════════════════════════════════
   QUICK VIEW MODAL
   ═══════════════════════════════════════════════════════════════════ */
function openQuickView(product) {
  const modal = document.getElementById('quick-view-modal');
  if (!modal) return;

  document.getElementById('qv-image').src = product.imageUrl;
  document.getElementById('qv-category').textContent = product.category;
  document.getElementById('qv-title').textContent = product.name;
  document.getElementById('qv-price').innerHTML = `
    ${formatPrice(product.price)}
    ${product.oldPrice ? `<del>${formatPrice(product.oldPrice)}</del>` : ''}
  `;
  document.getElementById('qv-desc').textContent =
    product.description || 'Premium quality ethnic wear crafted with care.';

  modal._product = product;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.querySelectorAll('.size-option').forEach(opt => opt.classList.remove('active'));
  const firstSize = document.querySelector('.size-option');
  if (firstSize) firstSize.classList.add('active');

  const qtyInput = document.getElementById('qv-qty');
  if (qtyInput) qtyInput.value = 1;
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    modal._product = null;
  }
}

/* ═══════════════════════════════════════════════════════════════════
   IMAGE LIGHTBOX
   ═══════════════════════════════════════════════════════════════════ */
function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (lb && img) {
    img.src = src;
    lb.classList.add('open');
  }
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.classList.remove('open');
}

/* ═══════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════ */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit = 200) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

function escHtml(str) {
  return str.replace(/['"&<>]/g, c => ({
    "'": '&#39;',
    '"': '&quot;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  }[c]));
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/* ═══════════════════════════════════════════════════════════════════
   INITIALIZE ON EVERY PAGE
   ═══════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initHamburger();
  buildNavAuth();
  initLogout();
  initTheme();
  initScrollAnimations();
  initBackToTop();
  updateCartUI();

  window.addEventListener(
    'scroll',
    throttle(() => {
      const nav = document.querySelector('.navbar');
      if (!nav) return;

      const current = window.scrollY;
      if (current > 50) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }, 100)
  );

  document.addEventListener('click', e => {
    const cartOverlay = document.getElementById('cart-overlay');
    const cartDrawer = document.getElementById('cart-drawer');
    if (
      cartOverlay &&
      cartDrawer &&
      cartDrawer.classList.contains('open') &&
      !cartDrawer.contains(e.target) &&
      !e.target.closest('[onclick="openCartDrawer()"]')
    ) {
      closeCartDrawer();
    }

    const lb = document.getElementById('lightbox');
    if (lb && lb.classList.contains('open') && e.target === lb) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeCartDrawer();
      closeQuickView();
      closeLightbox();
    }
  });
});