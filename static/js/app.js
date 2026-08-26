/**
 * SAVERZ SHOP - Interactive Frontend Engine
 */

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('saverz_cart') || '[]');
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  updateCartBadge();
  await loadProducts();
  setupEventListeners();
  loadReviews();
}

function setupEventListeners() {
  // Category filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentCategory = e.currentTarget.dataset.category;
      renderProducts();
    });
  });

  // Cart drawer open/close
  const cartBtn = document.getElementById('cart-btn');
  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const closeCartBtn = document.getElementById('close-cart-btn');

  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      renderCartDrawer();
      cartDrawerOverlay.classList.add('open');
    });
  }

  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => {
      cartDrawerOverlay.classList.remove('open');
    });
  }

  if (cartDrawerOverlay) {
    cartDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === cartDrawerOverlay) {
        cartDrawerOverlay.classList.remove('open');
      }
    });
  }

  // Checkout modal
  const btnCheckout = document.getElementById('btn-checkout');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', () => {
      if (cart.length === 0) {
        showToast('سبد خرید شما خالی است!');
        return;
      }
      cartDrawerOverlay.classList.remove('open');
      openModal('checkout-modal');
    });
  }

  // Order tracking
  const btnTrackOrder = document.getElementById('btn-track-order');
  if (btnTrackOrder) {
    btnTrackOrder.addEventListener('click', () => {
      openModal('track-modal');
    });
  }

  // Tour booking
  document.querySelectorAll('.btn-book-tour').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tourName = e.currentTarget.dataset.tour;
      const tourInput = document.getElementById('tour-name-input');
      if (tourInput) tourInput.value = tourName;
      openModal('tour-modal');
    });
  });

  // Search input
  const searchInput = document.getElementById('product-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      filterProductsBySearch(query);
    });
  }
}

async function loadProducts() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success) {
      allProducts = data.products;
      renderProducts();
    }
  } catch (err) {
    console.error('Error loading products:', err);
  }
}

function getIconForCategory(cat, iconType) {
  if (cat === 'honey') return '🍯';
  if (cat === 'herbs') return '🌿';
  if (cat === 'dairy' || cat === 'food') return '🧈';
  if (cat === 'crafts') return '🧶';
  if (cat === 'nuts') return '🌰';
  return '🏔️';
}

function formatPrice(num) {
  return new Intl.NumberFormat('fa-IR').format(num) + ' تومان';
}

function renderProducts(productsToRender = null) {
  const container = document.getElementById('products-grid');
  if (!container) return;

  const list = productsToRender || (currentCategory === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.category === currentCategory));

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
        محصولی در این دسته یافت نشد.
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(p => {
    const icon = getIconForCategory(p.category, p.icon_type);
    const badgesHtml = p.badges.map(b => `<span class="badge-tag">${b}</span>`).join('');
    const hasDiscount = p.discount_price && p.discount_price < p.price;
    const finalPrice = hasDiscount ? p.discount_price : p.price;

    return `
      <div class="product-card">
        <div>
          <div class="product-badges">${badgesHtml}</div>
          <div class="product-img-box">
            <span class="product-icon-art">${icon}</span>
          </div>
          <div class="product-info">
            <div class="product-meta">
              <span>📍 ${p.harvest_region}</span>
              <span>•</span>
              <span>⛰️ ${p.altitude}</span>
            </div>
            <h4>${p.title}</h4>
            <p class="product-desc">${p.short_desc}</p>
          </div>
        </div>

        <div class="product-footer">
          <div class="product-price-box">
            ${hasDiscount ? `<span class="price-old">${new Intl.NumberFormat('fa-IR').format(p.price)}</span>` : ''}
            <span class="price-current">${new Intl.NumberFormat('fa-IR').format(finalPrice)} <span class="price-unit">تومان</span></span>
          </div>
          <button class="btn-add-cart" onclick="addToCart(${p.id})" title="افزودن به سبد">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function filterProductsBySearch(query) {
  if (!query) {
    renderProducts();
    return;
  }
  const filtered = allProducts.filter(p => 
    p.title.toLowerCase().includes(query) || 
    p.short_desc.toLowerCase().includes(query) ||
    p.harvest_region.toLowerCase().includes(query)
  );
  renderProducts(filtered);
}

function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.product_id === productId);
  const finalPrice = product.discount_price || product.price;

  if (existing) {
    existing.quantity += 1;
    existing.total = existing.quantity * existing.price;
  } else {
    cart.push({
      product_id: product.id,
      title: product.title,
      price: finalPrice,
      quantity: 1,
      total: finalPrice,
    });
  }

  saveCart();
  updateCartBadge();
  showToast(`«${product.title}» به سبد خرید اضافه شد ✨`);
}

function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function saveCart() {
  localStorage.setItem('saverz_cart', JSON.stringify(cart));
}

function renderCartDrawer() {
  const container = document.getElementById('cart-drawer-items');
  const totalElem = document.getElementById('cart-total-amount');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 50px 20px; color: var(--text-muted);">
        <p style="font-size: 2.5rem; margin-bottom: 12px;">🧺</p>
        <p>سبد خرید شما در حال حاضر خالی است.</p>
      </div>
    `;
    if (totalElem) totalElem.textContent = '۰ تومان';
    return;
  }

  let grandTotal = 0;
  container.innerHTML = cart.map((item, idx) => {
    grandTotal += item.total;
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <h5>${item.title}</h5>
          <span class="cart-item-price">${new Intl.NumberFormat('fa-IR').format(item.price)} تومان</span>
        </div>
        <div class="cart-qty-ctrl">
          <button class="btn-qty" onclick="changeQty(${idx}, 1)">+</button>
          <span style="font-weight: 700; font-size: 0.9rem;">${item.quantity}</span>
          <button class="btn-qty" onclick="changeQty(${idx}, -1)">-</button>
        </div>
      </div>
    `;
  }).join('');

  if (totalElem) {
    totalElem.textContent = new Intl.NumberFormat('fa-IR').format(grandTotal) + ' تومان';
  }
}

function changeQty(idx, delta) {
  if (!cart[idx]) return;
  cart[idx].quantity += delta;
  if (cart[idx].quantity <= 0) {
    cart.splice(idx, 1);
  } else {
    cart[idx].total = cart[idx].quantity * cart[idx].price;
  }
  saveCart();
  updateCartBadge();
  renderCartDrawer();
}

// Modal handling
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

// Order submission
async function submitOrder(e) {
  e.preventDefault();
  if (cart.length === 0) return;

  const btn = document.getElementById('btn-submit-order');
  btn.disabled = true;
  btn.textContent = 'در حال ثبت سفارش...';

  const orderData = {
    customer_name: document.getElementById('order-name').value,
    phone: document.getElementById('order-phone').value,
    province: document.getElementById('order-province').value,
    city: document.getElementById('order-city').value,
    address: document.getElementById('order-address').value,
    postal_code: document.getElementById('order-postal').value || null,
    note: document.getElementById('order-note').value || null,
    items: cart,
    payment_method: 'پرداخت در محل / کارت به کارت امن',
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();

    if (data.success) {
      cart = [];
      saveCart();
      updateCartBadge();
      closeModal('checkout-modal');

      // Show success modal
      document.getElementById('success-tracking-code').textContent = data.tracking_code;
      openModal('order-success-modal');
    } else {
      alert(data.error || 'خطا در ثبت سفارش');
    }
  } catch (err) {
    alert('خطا در برقراری ارتباط با سرور');
  } finally {
    btn.disabled = false;
    btn.textContent = 'تایید و ثبت نهایی سفارش';
  }
}

// Track Order
async function trackOrder(e) {
  e.preventDefault();
  const code = document.getElementById('track-input').value.trim();
  const resultDiv = document.getElementById('track-result');
  if (!code) return;

  resultDiv.innerHTML = '<p style="color: var(--text-muted);">در حال جستجو...</p>';

  try {
    const res = await fetch(`/api/orders/${encodeURIComponent(code)}`);
    const data = await res.json();

    if (data.success && data.order) {
      const o = data.order;
      resultDiv.innerHTML = `
        <div style="background: var(--bg-card-alt); padding: 18px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-top: 14px;">
          <h5 style="color: var(--color-primary); font-weight: 800; margin-bottom: 8px;">سفارش: ${o.tracking_code}</h5>
          <p style="font-size: 0.9rem; margin-bottom: 4px;">👤 تحویل‌گیرنده: <b>${o.customer_name}</b></p>
          <p style="font-size: 0.9rem; margin-bottom: 4px;">🚚 وضعیت فعلی: <span style="color: var(--color-amber); font-weight: 700;">${o.status}</span></p>
          <p style="font-size: 0.9rem; margin-bottom: 4px;">💳 مبلغ کل: <b>${new Intl.NumberFormat('fa-IR').format(o.total_amount)} تومان</b></p>
          <p style="font-size: 0.85rem; color: var(--text-light);">📅 زمان ثبت: ${o.created_at}</p>
        </div>
      `;
    } else {
      resultDiv.innerHTML = '<p style="color: var(--color-terracotta); margin-top: 10px;">سفارشی با این شماره رهگیری یافت نشد.</p>';
    }
  } catch (err) {
    resultDiv.innerHTML = '<p style="color: var(--color-terracotta); margin-top: 10px;">خطا در استعلام سفارش.</p>';
  }
}

// Tour booking
async function submitTourBooking(e) {
  e.preventDefault();
  const req = {
    tour_name: document.getElementById('tour-name-input').value,
    customer_name: document.getElementById('tour-customer-name').value,
    phone: document.getElementById('tour-phone').value,
    requested_date: document.getElementById('tour-date').value,
    guests_count: parseInt(document.getElementById('tour-guests').value) || 1,
    experience_level: document.getElementById('tour-level').value,
    note: document.getElementById('tour-note').value || null,
  };

  try {
    const res = await fetch('/api/tours/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    const data = await res.json();
    if (data.success) {
      closeModal('tour-modal');
      showToast(`درخواست تور با کد «${data.booking_code}» ثبت شد.`);
    } else {
      alert(data.error || 'خطا در رزرو تور');
    }
  } catch (err) {
    alert('خطا در رزرو تور');
  }
}

// Reviews
async function loadReviews() {
  try {
    const res = await fetch('/api/reviews');
    const data = await res.json();
    if (data.success && data.reviews) {
      const container = document.getElementById('reviews-list');
      if (!container) return;
      container.innerHTML = data.reviews.map(r => `
        <div style="background: var(--bg-card); padding: 22px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 700; color: var(--color-primary);">${r.author_name}</span>
            <span style="color: var(--color-amber);">⭐⭐⭐⭐⭐</span>
          </div>
          <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6;">${r.comment}</p>
          <span style="font-size: 0.78rem; color: var(--text-light); margin-top: 10px; display: block;">خریدار تایید شده • ${r.created_at}</span>
        </div>
      `).join('');
    }
  } catch (err) {
    console.error('Error loading reviews:', err);
  }
}

// Toast
function showToast(msg) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>🌲</span><span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
