'use strict';

// storefront logic shared across pages.
// product catalog, a localStorage cart, the header badge, and the per-page renderers.

(function () {
  // Product catalog
  const PRODUCTS = [
    {
      id: 'bmsb-220-30',
      name: 'Breast Milk Storage Bags 220ml',
      pack: '30 Pack',
      price: 14.95,
      image: 'assets/banner.png',
      badge: 'Best Seller',
      blurb: 'Pre-sterilised, self-standing storage bags with a smart temperature indicator and double-zip seal.',
      specs: ['220ml capacity', '30 bags', 'Gamma-ray pre-sterilised', 'BPA-free PET/LDPE'],
    },
    {
      id: 'bmsb-220-60',
      name: 'Breast Milk Storage Bags 220ml',
      pack: '60 Pack (Value)',
      price: 26.95,
      image: 'assets/banner.png',
      badge: 'Best Value',
      blurb: 'Double the supply for busy weeks. Same trusted seal, temperature indicator and self-standing base.',
      specs: ['220ml capacity', '60 bags', 'Gamma-ray pre-sterilised', 'BPA-free PET/LDPE'],
    },
    {
      id: 'bmsb-220-90',
      name: 'Breast Milk Storage Bags 220ml',
      pack: '90 Pack (Family)',
      price: 37.95,
      image: 'assets/banner.png',
      badge: null,
      blurb: 'Our largest pack for stocking up the freezer. Eco-friendly, recyclable and freezer-safe.',
      specs: ['220ml capacity', '90 bags', 'Gamma-ray pre-sterilised', 'BPA-free PET/LDPE'],
    },
  ];

  const CART_KEY = 'pk_cart';
  const CURRENCY = '$';

  // Cart storage
  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '{}'); }
    catch (_) { return {}; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
  }

  function getProduct(id) {
    return PRODUCTS.find(p => p.id === id);
  }

  function cartCount() {
    const cart = loadCart();
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }

  function cartTotal() {
    const cart = loadCart();
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = getProduct(id);
      return p ? sum + p.price * qty : sum;
    }, 0);
  }

  function addToCart(id, qty = 1) {
    const cart = loadCart();
    cart[id] = (cart[id] || 0) + qty;
    saveCart(cart);
  }

  function setQty(id, qty) {
    const cart = loadCart();
    if (qty <= 0) delete cart[id];
    else cart[id] = qty;
    saveCart(cart);
  }

  function removeFromCart(id) {
    const cart = loadCart();
    delete cart[id];
    saveCart(cart);
  }

  function money(n) {
    return CURRENCY + n.toFixed(2);
  }

  // Header badge
  function updateCartBadge() {
    const badges = document.querySelectorAll('.cart-count');
    const count = cartCount();
    badges.forEach(b => {
      b.textContent = count;
      b.hidden = count === 0;
    });
  }

  // Mobile nav toggle
  function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.querySelector('.nav-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Toast
  function toast(msg) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 2200);
  }

  // Renderers
  function productCardHTML(p) {
    return `
      <article class="product-card">
        <a class="product-card-media" href="product.html?id=${p.id}" aria-label="${p.name}, ${p.pack}">
          ${p.badge ? `<span class="card-badge">${p.badge}</span>` : ''}
          <img src="${p.image}" alt="${p.name} ${p.pack}" loading="lazy"
               onerror="this.style.display='none'" />
          <span class="product-card-fallback" aria-hidden="true">🐨</span>
        </a>
        <div class="product-card-body">
          <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
          <p class="pack-label">${p.pack}</p>
          <div class="product-card-foot">
            <span class="price">${money(p.price)}</span>
            <button class="btn btn-primary btn-sm" data-add="${p.id}">Add to Cart</button>
          </div>
        </div>
      </article>`;
  }

  function renderProductGrid(target, list) {
    const el = document.querySelector(target);
    if (!el) return;
    el.innerHTML = list.map(productCardHTML).join('');
  }

  function renderProductDetail() {
    const wrap = document.querySelector('#product-detail');
    if (!wrap) return;
    const params = new URLSearchParams(location.search);
    const p = getProduct(params.get('id')) || PRODUCTS[0];

    document.title = `${p.name} (${p.pack}) · Precious Koala`;
    wrap.innerHTML = `
      <div class="detail-media">
        <img src="${p.image}" alt="${p.name} ${p.pack}" onerror="this.style.display='none'" />
        <span class="product-card-fallback big" aria-hidden="true">🐨</span>
      </div>
      <div class="detail-info">
        ${p.badge ? `<span class="card-badge static">${p.badge}</span>` : ''}
        <h1>${p.name}</h1>
        <p class="pack-label">${p.pack}</p>
        <p class="price detail-price">${money(p.price)}</p>
        <p class="detail-blurb">${p.blurb}</p>
        <ul class="detail-specs">
          ${p.specs.map(s => `<li>${s}</li>`).join('')}
        </ul>
        <div class="qty-row">
          <label for="qty">Qty</label>
          <div class="qty-control">
            <button type="button" data-step="-1" aria-label="Decrease quantity">−</button>
            <input id="qty" type="number" value="1" min="1" inputmode="numeric" />
            <button type="button" data-step="1" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" id="detail-add" data-add="${p.id}">Add to Cart</button>
        <p class="detail-note">Free shipping on orders over $50 · Ships in 1-2 business days</p>
      </div>`;

    const qtyInput = wrap.querySelector('#qty');
    wrap.querySelectorAll('[data-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = Math.max(1, (parseInt(qtyInput.value, 10) || 1) + Number(btn.dataset.step));
        qtyInput.value = next;
      });
    });
    wrap.querySelector('#detail-add').addEventListener('click', () => {
      addToCart(p.id, Math.max(1, parseInt(qtyInput.value, 10) || 1));
      toast(`Added to cart: ${p.pack}`);
    });
  }

  function renderCart() {
    const wrap = document.querySelector('#cart-view');
    if (!wrap) return;
    const cart = loadCart();
    const ids = Object.keys(cart);

    if (ids.length === 0) {
      wrap.innerHTML = `
        <div class="cart-empty">
          <span aria-hidden="true">🐨</span>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <a href="products.html" class="btn btn-primary">Shop Products</a>
        </div>`;
      return;
    }

    const rows = ids.map(id => {
      const p = getProduct(id);
      if (!p) return '';
      const qty = cart[id];
      return `
        <div class="cart-row" data-id="${id}">
          <div class="cart-row-media">
            <img src="${p.image}" alt="" onerror="this.style.display='none'" />
            <span class="product-card-fallback" aria-hidden="true">🐨</span>
          </div>
          <div class="cart-row-info">
            <h3>${p.name}</h3>
            <p class="pack-label">${p.pack}</p>
            <button class="link-btn" data-remove="${id}">Remove</button>
          </div>
          <div class="qty-control small">
            <button type="button" data-cart-step="-1" data-id="${id}" aria-label="Decrease quantity">−</button>
            <input type="number" value="${qty}" min="1" data-cart-qty="${id}" inputmode="numeric" />
            <button type="button" data-cart-step="1" data-id="${id}" aria-label="Increase quantity">+</button>
          </div>
          <div class="cart-row-price">${money(p.price * qty)}</div>
        </div>`;
    }).join('');

    const total = cartTotal();
    const shipping = total >= 50 || total === 0 ? 0 : 6.95;

    wrap.innerHTML = `
      <div class="cart-list">${rows}</div>
      <aside class="cart-summary">
        <h2>Order Summary</h2>
        <div class="summary-line"><span>Subtotal</span><span>${money(total)}</span></div>
        <div class="summary-line"><span>Shipping</span><span>${shipping === 0 ? 'Free' : money(shipping)}</span></div>
        <div class="summary-line total"><span>Total</span><span>${money(total + shipping)}</span></div>
        <button class="btn btn-primary btn-lg" id="checkout-btn">Checkout</button>
        <a href="products.html" class="link-btn center">Continue shopping</a>
        <p class="cart-note">Payment isn't enabled yet. This is a demo checkout.</p>
      </aside>`;

    wrap.querySelectorAll('[data-cart-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        setQty(id, (cart[id] || 1) + Number(btn.dataset.cartStep));
        renderCart();
      });
    });
    wrap.querySelectorAll('[data-cart-qty]').forEach(input => {
      input.addEventListener('change', () => {
        setQty(input.dataset.cartQty, Math.max(0, parseInt(input.value, 10) || 0));
        renderCart();
      });
    });
    wrap.querySelectorAll('[data-remove]').forEach(btn => {
      btn.addEventListener('click', () => { removeFromCart(btn.dataset.remove); renderCart(); });
    });
    wrap.querySelector('#checkout-btn').addEventListener('click', () => {
      toast('Checkout is a demo. Payments coming soon!');
    });
  }

  // Global add-to-cart delegation (grids)
  function initAddButtons() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add]');
      if (!btn || btn.id === 'detail-add') return;
      addToCart(btn.dataset.add, 1);
      const p = getProduct(btn.dataset.add);
      toast(p ? `Added to cart: ${p.pack}` : 'Added to cart');
    });
  }

  // Insta carousel
  function initCarousel() {
    const track = document.getElementById('insta-track');
    if (!track) return;
    const prev = document.querySelector('.carousel-btn.prev');
    const next = document.querySelector('.carousel-btn.next');

    const step = () => {
      const card = track.querySelector('.insta-card');
      const gap = parseFloat(getComputedStyle(track).columnGap) || 20;
      return card ? card.offsetWidth + gap : track.clientWidth * 0.8;
    };
    prev?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  }

  // Boot
  document.addEventListener('DOMContentLoaded', () => {
    console.log('%c🐨 Precious Koala. Made with love for little ones.', 'color:#E89A8A;font-size:1.1rem;font-weight:bold;');
    initNavToggle();
    initAddButtons();
    initCarousel();
    updateCartBadge();

    renderProductGrid('#featured-grid', PRODUCTS.slice(0, 3));
    renderProductGrid('#all-products', PRODUCTS);
    renderProductDetail();
    renderCart();
  });
})();
