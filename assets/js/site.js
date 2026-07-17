const CART_KEY = "jakesBakesCustomerCart";
const SLOT_KEY = "jakesBakesCollectionSlot";

function money(value) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

function basePath() {
  return location.pathname.includes("/policies/") ? "../" : "";
}

function getState() {
  const params = new URLSearchParams(location.search);
  const queryState = params.get("state");
  const allowed = ["upcoming", "open", "low", "soldout", "closed", "preparing"];
  if ((location.hostname === "localhost" || location.hostname === "127.0.0.1") && allowed.includes(queryState)) return queryState;
  return STORE_CONFIG.preorderState;
}

function preorderCopy() {
  const state = getState();
  const map = {
    upcoming: { bar: "This week's preorder opens Friday.", cta: "Remind me", product: "Preorders open Friday", canOrder: false },
    open: { bar: "This week's preorder is open — limited to 25 boxes.", cta: "Pre-order now", product: "Add to cart", canOrder: true },
    low: { bar: `Only ${STORE_CONFIG.inventoryRemaining} boxes remain this week.`, cta: "Pre-order now", product: "Add to cart", canOrder: true },
    soldout: { bar: "This week's boxes have sold out. The next drop opens Friday.", cta: "Remind me", product: "Sold out this week", canOrder: false },
    closed: { bar: "Orders are closed while this week's boxes are being prepared.", cta: "Remind me", product: "Preorders open Friday", canOrder: false },
    preparing: { bar: "This week's cookies are being prepared for Friday.", cta: "Collection info", product: "Preorders open Friday", canOrder: false }
  };
  return map[state] || map.open;
}

function cart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cartchange"));
}

function cartCount() {
  return cart().reduce((sum, item) => sum + item.quantity, 0);
}

function cartSubtotal() {
  return cart().reduce((sum, item) => sum + item.quantity * item.price, 0);
}

function selectedSlot() {
  return localStorage.getItem(SLOT_KEY) || "";
}

function saveSlot(slot) {
  localStorage.setItem(SLOT_KEY, slot);
  window.dispatchEvent(new Event("cartchange"));
}

function addToCart(size) {
  const count = size === "four" ? 4 : 6;
  const price = size === "four" ? STORE_CONFIG.fourPackPrice : STORE_CONFIG.sixPackPrice;
  const items = cart();
  const existing = items.find((item) => item.size === size);
  if (existing) existing.quantity += 1;
  else items.push({ id: `box-${size}`, size, boxSize: count, title: STORE_CONFIG.productName, price, quantity: 1 });
  saveCart(items);
  openCartDrawer();
}

function updateQty(size, delta) {
  const next = cart().map((item) => item.size === size ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter((item) => item.quantity > 0);
  saveCart(next);
}

function removeItem(size) {
  saveCart(cart().filter((item) => item.size !== size));
}

function headerHtml() {
  const p = basePath();
  const state = preorderCopy();
  return `
    <div class="announcement">${state.bar} <a href="${p}product.html">${state.cta}</a></div>
    <header class="site-header">
      <div class="header-inner">
        <button class="mobile-menu-button" type="button" data-menu-open aria-controls="mobile-menu" aria-expanded="false">Menu</button>
        <a class="logo" href="${p}index.html"><strong>${STORE_CONFIG.brandName}</strong><span>${STORE_CONFIG.logoLine}</span></a>
        <nav class="desktop-nav" aria-label="Main navigation">
          <a href="${p}shop.html">Shop</a><a href="${p}how-it-works.html">How It Works</a><a href="${p}about.html">About</a><a href="${p}reviews.html">Reviews</a><a href="${p}faq.html">FAQs</a><a href="${p}contact.html">Contact</a>
        </nav>
        <div class="desktop-actions"><a href="${p}account.html">Account</a><button class="icon-button cart-button" type="button" data-cart-open>Cart <span class="cart-count" data-cart-count>0</span></button></div>
        <button class="icon-button cart-button" type="button" data-cart-open aria-label="Open cart">Cart <span class="cart-count" data-cart-count>0</span></button>
      </div>
    </header>
    <div class="mobile-panel" data-mobile-panel aria-hidden="true">
      <nav class="mobile-menu" id="mobile-menu" aria-label="Mobile navigation">
        <button class="mobile-menu-button" type="button" data-menu-close>Close</button>
        <a href="${p}shop.html">Shop</a><a href="${p}product.html">Pre-order now</a><a href="${p}how-it-works.html">How It Works</a><a href="${p}collection.html">Collection</a><a href="${p}ingredients-allergens.html">Ingredients & Allergens</a><a href="${p}reviews.html">Reviews</a><a href="${p}faq.html">FAQs</a><a href="${p}contact.html">Contact</a><a href="${p}account.html">Account</a>
      </nav>
    </div>`;
}

function footerHtml() {
  const p = basePath();
  return `<footer class="footer"><div class="container footer-grid">
    <div class="stack"><strong>${STORE_CONFIG.brandName}</strong><small>${STORE_CONFIG.tagline}</small><small>${STORE_CONFIG.location}</small><small>${STORE_CONFIG.businessEmail}</small><small>Accepted payment methods shown at Shopify checkout.</small></div>
    <div class="stack"><strong>Order</strong><a href="${p}shop.html">Shop</a><a href="${p}product.html">Pre-order now</a><button class="button secondary" type="button" data-cart-open>Cart</button><a href="${p}account.html">Account</a></div>
    <div class="stack"><strong>Information</strong><a href="${p}how-it-works.html">How it works</a><a href="${p}collection.html">Collection</a><a href="${p}ingredients-allergens.html">Ingredients and allergens</a><a href="${p}storage-reheating.html">Storage and reheating</a><a href="${p}order-changes-cancellations.html">Order changes</a><a href="${p}faq.html">FAQs</a><a href="${p}reviews.html">Reviews</a></div>
    <div class="stack"><strong>About</strong><a href="${p}about.html">About Jake's Bakes</a><a href="${p}contact.html">Contact</a><a href="${p}contact.html">Instagram</a><a href="${p}contact.html">TikTok</a></div>
    <div class="stack"><strong>Policies</strong><a href="${p}policies/privacy.html">Privacy</a><a href="${p}policies/terms.html">Terms</a><a href="${p}policies/refunds.html">Refunds</a><a href="${p}policies/cancellations.html">Cancellations</a><a href="${p}policies/missed-collection.html">Missed collection</a><a href="${p}policies/cookies.html">Cookie policy</a><a href="${p}policies/accessibility.html">Accessibility</a><a href="${p}policies/contact-information.html">Contact information</a></div>
  </div><div class="container" style="margin-top:1.5rem"><small>© ${new Date().getFullYear()} ${STORE_CONFIG.brandName}. Built for Shopify recreation.</small></div></footer>`;
}

function drawerHtml() {
  const p = basePath();
  return `<div class="drawer-backdrop" data-drawer-backdrop aria-hidden="true"><aside class="drawer" role="dialog" aria-modal="true" aria-label="Cart drawer">
    <div class="cluster" style="justify-content:space-between"><h2>Your cart</h2><button class="icon-button" type="button" data-cart-close>Close</button></div>
    <div data-drawer-lines></div>
    <a class="button full" href="${p}cart.html">View cart</a>
  </aside></div>`;
}

function renderCartLines(container, compact = false) {
  const items = cart();
  if (!items.length) {
    container.innerHTML = `<div class="note"><strong>Your cart is empty.</strong><p>Choose a box of four or six cookies to start your preorder.</p></div>`;
    return;
  }
  container.innerHTML = `<div class="stack">${items.map((item) => `
    <article class="card pad cart-row">
      ${compact ? "" : `<img src="assets/images/four-box.webp" alt="Plain white cookie box with chocolate-chip cookies" loading="lazy">`}
      <div class="stack">
        <h3>${item.boxSize} cookie box</h3>
        <p>${item.title}</p>
        <p><strong>${money(item.price)}</strong> each</p>
        <div class="quantity" aria-label="Quantity for ${item.boxSize} cookie box"><button type="button" data-qty-minus="${item.size}">−</button><span>${item.quantity}</span><button type="button" data-qty-plus="${item.size}">+</button></div>
        <button class="button secondary" type="button" data-remove="${item.size}">Remove</button>
      </div>
    </article>`).join("")}
    <div class="note"><strong>Subtotal: ${money(cartSubtotal())}</strong><p>Collection only from Barnsley. Exact instructions will be included with your order.</p></div>
  </div>`;
}

function renderSlots(container) {
  const current = selectedSlot();
  container.innerHTML = `<div class="slot-grid">${STORE_CONFIG.collectionSlots.slots.map((slot) => {
    const disabled = STORE_CONFIG.collectionSlots.disabledSlots.includes(slot);
    return `<button class="slot-button ${current === slot ? "is-selected" : ""}" type="button" data-slot="${slot}" ${disabled ? "disabled" : ""}>${slot}${disabled ? " unavailable" : ""}</button>`;
  }).join("")}</div><p class="lead">Prototype slots are configurable. The final slot may be shorter because five 25-minute slots run slightly over a two-hour window.</p>`;
}

function updateCartBadges() {
  document.querySelectorAll("[data-cart-count]").forEach((node) => node.textContent = String(cartCount()));
  const live = document.querySelector("[data-cart-live]");
  if (live) live.textContent = `${cartCount()} item${cartCount() === 1 ? "" : "s"} in cart.`;
}

function openCartDrawer() {
  const backdrop = document.querySelector("[data-drawer-backdrop]");
  const lines = document.querySelector("[data-drawer-lines]");
  if (!backdrop || !lines) return;
  renderCartLines(lines, true);
  backdrop.classList.add("is-open");
  backdrop.setAttribute("aria-hidden", "false");
  backdrop.querySelector("[data-cart-close]").focus();
}

function closeCartDrawer() {
  const backdrop = document.querySelector("[data-drawer-backdrop]");
  if (!backdrop) return;
  backdrop.classList.remove("is-open");
  backdrop.setAttribute("aria-hidden", "true");
}

function renderReviews() {
  document.querySelectorAll("[data-review-mode]").forEach((node) => {
    node.innerHTML = STORE_CONFIG.useDemoReviews
      ? `<span class="demo-marker">Demonstration review — replace before launch</span>`
      : `<span class="badge">New bakery — customer reviews will appear after the first collection.</span>`;
  });
}

function productInit() {
  const form = document.querySelector("[data-product-form]");
  if (!form) return;
  const state = preorderCopy();
  const add = form.querySelector("[data-add-product]");
  const price = form.querySelector("[data-product-price]");
  const stickyPrice = document.querySelector("[data-sticky-product-price]");
  const radios = form.querySelectorAll("input[name='box-size']");
  function selected() { return form.querySelector("input[name='box-size']:checked").value; }
  function refresh() {
    const value = selected();
    const amount = value === "four" ? STORE_CONFIG.fourPackPrice : STORE_CONFIG.sixPackPrice;
    price.textContent = money(amount);
    if (stickyPrice) stickyPrice.textContent = money(amount);
    document.querySelectorAll(".select-card").forEach((card) => card.classList.toggle("selected", card.querySelector("input").checked));
  }
  radios.forEach((radio) => radio.addEventListener("change", refresh));
  const params = new URLSearchParams(location.search);
  if (params.get("box") === "four") form.querySelector("input[value='four']").checked = true;
  if (params.get("box") === "six") form.querySelector("input[value='six']").checked = true;
  add.textContent = state.product;
  add.disabled = !state.canOrder;
  form.addEventListener("submit", (event) => { event.preventDefault(); if (state.canOrder) addToCart(selected()); });
  document.querySelectorAll("[data-add-product-sticky]").forEach((btn) => {
    btn.textContent = state.product;
    btn.disabled = !state.canOrder;
    btn.addEventListener("click", () => { if (state.canOrder) addToCart(selected()); });
  });
  refresh();
}

function galleryInit() {
  const main = document.querySelector("[data-gallery-main]");
  if (!main) return;
  document.querySelectorAll("[data-gallery-thumb]").forEach((button) => {
    button.addEventListener("click", () => {
      main.src = button.dataset.galleryThumb;
      main.alt = button.querySelector("img").alt;
      document.querySelectorAll("[data-gallery-thumb]").forEach((b) => b.classList.remove("is-active"));
      button.classList.add("is-active");
    });
  });
}

function accordionInit() {
  document.querySelectorAll("[data-accordion]").forEach((accordion) => {
    accordion.addEventListener("click", (event) => {
      const btn = event.target.closest("button");
      if (!btn) return;
      const item = btn.closest(".accordion-item");
      const open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });
}

function formInit() {
  document.querySelectorAll("[data-validate-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const summary = form.querySelector("[data-error-summary]");
      const missing = [...form.querySelectorAll("[required]")].filter((field) => !field.value.trim());
      if (missing.length) {
        summary.textContent = "Please complete the required fields before sending.";
        missing[0].focus();
      } else {
        summary.textContent = "Thanks. This prototype has recorded the message visually; Shopify would send it through the contact form.";
        form.reset();
      }
    });
  });
}

function cartPageInit() {
  const cartLines = document.querySelector("[data-cart-lines]");
  if (!cartLines) return;
  const slotBox = document.querySelector("[data-slot-picker]");
  const checkout = document.querySelector("[data-checkout]");
  const error = document.querySelector("[data-cart-error]");
  function render() {
    renderCartLines(cartLines);
    if (slotBox) renderSlots(slotBox);
    const slotText = document.querySelector("[data-selected-slot]");
    if (slotText) slotText.textContent = selectedSlot() || "No slot selected yet";
  }
  render();
  checkout?.addEventListener("click", () => {
    if (!cart().length) { error.textContent = "Choose a box before continuing."; return; }
    if (!selectedSlot()) { error.textContent = "Choose a collection slot before continuing to checkout."; slotBox.querySelector("button:not(:disabled)")?.focus(); return; }
    const order = { number: "JB-1042", items: cart(), slot: selectedSlot(), total: cartSubtotal(), collectionDate: STORE_CONFIG.collectionDate };
    sessionStorage.setItem("jakesBakesLastOrder", JSON.stringify(order));
    location.href = "order-confirmation.html";
  });
  window.addEventListener("cartchange", render);
}

function orderConfirmationInit() {
  const target = document.querySelector("[data-order-confirmation]");
  if (!target) return;
  let order;
  try { order = JSON.parse(sessionStorage.getItem("jakesBakesLastOrder")); } catch {}
  if (!order) {
    target.innerHTML = `<div class="note warning"><strong>No simulated paid order found.</strong><p>Add a box to your cart, choose a collection slot and continue to checkout to preview this page.</p></div><a class="button" href="product.html">Pre-order now</a>`;
    return;
  }
  target.innerHTML = `<div class="card pad stack"><h2>Order ${order.number}</h2>${order.items.map((item) => `<p>${item.quantity} × ${item.boxSize} cookie box — ${money(item.price)} each</p>`).join("")}<p><strong>Total paid: ${money(order.total)}</strong></p><p>Collection date: ${order.collectionDate}</p><p>Collection slot: ${order.slot}</p><p>Contact details: provided during Shopify checkout.</p><div class="cluster"><a class="button" href="collection.html">Collection information</a><a class="button secondary" href="ingredients-allergens.html">Allergen information</a><a class="button secondary" href="account.html">Account option</a></div></div>`;
}

function mobileMenuInit() {
  const panel = document.querySelector("[data-mobile-panel]");
  const open = document.querySelector("[data-menu-open]");
  const close = document.querySelector("[data-menu-close]");
  function set(opened) {
    panel.classList.toggle("is-open", opened);
    panel.setAttribute("aria-hidden", String(!opened));
    document.body.classList.toggle("nav-open", opened);
    open.setAttribute("aria-expanded", String(opened));
    if (opened) close.focus();
  }
  open?.addEventListener("click", () => set(true));
  close?.addEventListener("click", () => set(false));
  panel?.addEventListener("click", (event) => { if (event.target === panel) set(false); });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { set(false); closeCartDrawer(); }
    if (event.key === "Tab" && panel?.classList.contains("is-open")) {
      const focusable = [...panel.querySelectorAll("a, button")].filter((el) => !el.disabled);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

function cookieNoticeInit() {
  if (localStorage.getItem("jakesBakesCookieNotice") === "accepted") return;
  const notice = document.createElement("div");
  notice.className = "cookie-notice";
  notice.innerHTML = `<p><strong>Cookies:</strong> this prototype uses essential browser storage for the cart and collection slot. Review the cookie policy before launch if analytics or marketing tools are added.</p><button class="button" type="button">Got it</button>`;
  document.body.append(notice);
  notice.querySelector("button").addEventListener("click", () => {
    localStorage.setItem("jakesBakesCookieNotice", "accepted");
    notice.remove();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("[data-site-header]").innerHTML = headerHtml();
  document.querySelector("[data-site-footer]").innerHTML = footerHtml();
  document.querySelector("[data-cart-drawer]").innerHTML = drawerHtml();
  document.body.insertAdjacentHTML("beforeend", '<div class="sr-only" aria-live="polite" data-cart-live></div>');
  mobileMenuInit();
  productInit();
  galleryInit();
  accordionInit();
  formInit();
  cartPageInit();
  orderConfirmationInit();
  cookieNoticeInit();
  renderReviews();
  updateCartBadges();
  document.addEventListener("click", (event) => {
    const add = event.target.closest("[data-add-box]");
    if (add) addToCart(add.dataset.addBox);
    const open = event.target.closest("[data-cart-open]");
    if (open) openCartDrawer();
    const close = event.target.closest("[data-cart-close]");
    if (close) closeCartDrawer();
    const plus = event.target.closest("[data-qty-plus]");
    if (plus) updateQty(plus.dataset.qtyPlus, 1);
    const minus = event.target.closest("[data-qty-minus]");
    if (minus) updateQty(minus.dataset.qtyMinus, -1);
    const remove = event.target.closest("[data-remove]");
    if (remove) removeItem(remove.dataset.remove);
    const slot = event.target.closest("[data-slot]");
    if (slot && !slot.disabled) saveSlot(slot.dataset.slot);
  });
  window.addEventListener("cartchange", updateCartBadges);
  if (STORE_CONFIG.useDemoReviews) console.warn("USE_DEMO_REVIEWS is true. Replace or hide demo reviews before production launch.");
});
