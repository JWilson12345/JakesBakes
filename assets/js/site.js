const CART_KEY = "jakesBakesCustomerCart";
const SLOT_KEY = "jakesBakesCollectionSlot";
const REVIEW_KEY = "jakesBakesReviews";
const EMAIL_OUTBOX_KEY = "jakesBakesEmailOutbox";
const EMAILJS_SRC = "https://cdn.jsdelivr.net/npm/emailjs-com@3.2.0/dist/email.min.js";
const REVIEW_ADMIN_CODE = "1234";
let emailJsLoader;

function money(value) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);
}

function basePath() {
  return location.pathname.includes("/policies/") ? "../" : "";
}

function pageUrl(path = "") {
  const p = basePath();
  return `${p}${path}`;
}

function safeJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function loadEmailJs() {
  if (window.emailjs) return Promise.resolve(window.emailjs);
  if (emailJsLoader) return emailJsLoader;
  emailJsLoader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = EMAILJS_SRC;
    script.async = true;
    script.onload = () => window.emailjs ? resolve(window.emailjs) : reject(new Error("EmailJS did not load."));
    script.onerror = () => reject(new Error("EmailJS could not be loaded."));
    document.head.append(script);
  });
  return emailJsLoader;
}

function emailMessage(type, payload, meta) {
  if (type === "review") {
    return [
      "NEW JAKE'S BAKES REVIEW",
      "========================",
      "",
      `Customer: ${payload.name}`,
      `Rating: ${payload.rating}/5 ${stars(payload.rating)}`,
      `Submitted: ${new Date(meta.submittedAt).toLocaleString("en-GB")}`,
      "",
      "Review",
      "------",
      payload.text,
      "",
      "Photo",
      "-----",
      payload.photoAttached ? "A photo was uploaded with this review." : "No photo was uploaded.",
      payload.photoName ? `File name: ${payload.photoName}` : "",
      payload.emailPhoto ? "Photo preview is included in the EmailJS template variable named photo_preview." : "",
      payload.photoSendNote || "",
      "",
      "Browser details",
      "---------------",
      `Submitted: ${meta.submittedAt}`,
      `Device: ${meta.device}`,
      `Viewport: ${meta.viewport}`
    ].filter(Boolean).join("\n");
  }

  if (type === "preorder") {
    return [
      "NEW JAKE'S BAKES PREORDER REQUEST",
      "=================================",
      "",
      `Name: ${payload.name || ""}`,
      `Email: ${payload.email || ""}`,
      `Phone: ${payload.phone || ""}`,
      `Collection date: ${payload.collectionDate || ""}`,
      `Collection slot: ${payload.slot || ""}`,
      `Subtotal: ${payload.total || ""}`,
      "",
      "Items",
      "-----",
      ...(payload.items || []).map((item) => `${item.quantity} x ${item.boxSize} Cookie Box - ${money(item.price)} each`),
      "",
      "Notes",
      "-----",
      payload.notes || "No notes supplied.",
      "",
      "Browser details",
      "---------------",
      `Submitted: ${meta.submittedAt}`,
      `Device: ${meta.device}`,
      `Viewport: ${meta.viewport}`
    ].join("\n");
  }

  return [
    "New Jake's Bakes contact message",
    `Name: ${payload.name || ""}`,
    `Email: ${payload.email || ""}`,
    `Phone: ${payload.phone || ""}`,
    `Order number: ${payload.orderNumber || ""}`,
    `Reason: ${payload.reason || ""}`,
    `Message: ${payload.message || ""}`,
    `Submitted: ${meta.submittedAt}`,
    `Device: ${meta.device}`,
    `Viewport: ${meta.viewport}`
  ].join("\n");
}

function emailHtmlMessage(type, payload, meta) {
  if (type !== "review") return "";
  const photoHtml = payload.emailPhoto
    ? `<img src="${payload.emailPhoto}" alt="Uploaded review photo" style="display:block;max-width:260px;width:100%;height:auto;border-radius:8px;margin-top:12px;">`
    : `<p>${payload.photoAttached ? "Photo was uploaded, but the email preview could not be included." : "No photo was uploaded."}</p>`;
  return `
    <div style="font-family:Arial,sans-serif;color:#22302b;line-height:1.5">
      <h2 style="margin:0 0 12px">New Jake's Bakes review</h2>
      <p><strong>Customer:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>Rating:</strong> ${payload.rating}/5 ${stars(payload.rating)}</p>
      <p><strong>Submitted:</strong> ${new Date(meta.submittedAt).toLocaleString("en-GB")}</p>
      <h3>Review</h3>
      <p>${escapeHtml(payload.text)}</p>
      <h3>Photo</h3>
      <p>${payload.photoAttached ? `Photo uploaded: ${escapeHtml(payload.photoName || "review photo")}` : "No photo was uploaded."}</p>
      ${photoHtml}
    </div>`;
}

const EmailService = {
  async send(type, payload) {
    const message = {
      type,
      submittedAt: new Date().toISOString(),
      browser: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      device: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "Mobile or tablet" : "Desktop",
      payload
    };

    const emailJsConfig = STORE_CONFIG.emailJs || {};
    if (emailJsConfig.serviceId && emailJsConfig.templateId && emailJsConfig.publicKey && emailJsConfig.toEmail) {
      const emailjs = await loadEmailJs();
      const subject = type === "review"
        ? `New ${payload.rating || ""}-star Jake's Bakes review from ${payload.name || "a customer"}`
        : type === "preorder"
          ? `New Jake's Bakes preorder request from ${payload.name || "the website"}`
        : `New Jake's Bakes contact message from ${payload.name || "the website"}`;
      await emailjs.send(emailJsConfig.serviceId, emailJsConfig.templateId, {
        subject,
        title: subject,
        message: emailMessage(type, payload, message),
        message_html: emailHtmlMessage(type, payload, message),
        from_name: payload.name || "Jake's Bakes website",
        from_email: payload.email || emailJsConfig.toEmail,
        reply_to: payload.email || emailJsConfig.toEmail,
        to_email: emailJsConfig.toEmail,
        review_name: payload.name || "",
        review_rating: payload.rating || "",
        review_text: payload.text || "",
        photo_name: payload.photoName || "",
        photo_attached: payload.photoAttached ? "Yes" : "No",
        photo_preview: payload.emailPhoto || "",
        photo_preview_html: payload.emailPhoto
          ? `<img src="${payload.emailPhoto}" alt="Uploaded review photo" style="display:block;max-width:260px;width:100%;height:auto;border-radius:8px;">`
          : ""
      }, emailJsConfig.publicKey);
      return { sent: true, provider: "emailjs" };
    }

    if (STORE_CONFIG.emailEndpoint) {
      const response = await fetch(STORE_CONFIG.emailEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message)
      });
      if (!response.ok) throw new Error("Email endpoint did not accept the message.");
      return { sent: true };
    }

    if (STORE_CONFIG.useEmailOutboxFallback) {
      const outbox = safeJson(EMAIL_OUTBOX_KEY, []);
      outbox.unshift(message);
      localStorage.setItem(EMAIL_OUTBOX_KEY, JSON.stringify(outbox.slice(0, 50)));
      return { sent: false, queued: true };
    }

    throw new Error("No email endpoint is configured.");
  }
};

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
    open: { bar: "This week's preorder is open - limited to 25 boxes.", cta: "Pre-order now", product: "Add to cart", canOrder: true },
    low: { bar: `Only ${STORE_CONFIG.inventoryRemaining} boxes remain this week.`, cta: "Pre-order now", product: "Add to cart", canOrder: true },
    soldout: { bar: "This week's boxes have sold out. The next drop opens Friday.", cta: "Remind me", product: "Sold out this week", canOrder: false },
    closed: { bar: "Orders are closed while this week's boxes are being prepared.", cta: "Remind me", product: "Preorders open Friday", canOrder: false },
    preparing: { bar: "This week's cookies are being prepared for Friday.", cta: "Collection info", product: "Preorders open Friday", canOrder: false }
  };
  return map[state] || map.open;
}

function cart() {
  return safeJson(CART_KEY, [])
    .filter((item) => item && (item.size === "four" || item.size === "six"))
    .map((item) => {
      const isFour = item.size === "four";
      return {
        ...item,
        id: `box-${item.size}`,
        boxSize: isFour ? 4 : 6,
        title: STORE_CONFIG.productName,
        price: isFour ? STORE_CONFIG.fourPackPrice : STORE_CONFIG.sixPackPrice,
        quantity: Math.max(1, Number(item.quantity) || 1)
      };
    });
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
  if (existing) {
    existing.quantity += 1;
    existing.id = `box-${size}`;
    existing.boxSize = count;
    existing.title = STORE_CONFIG.productName;
    existing.price = price;
  }
  else items.push({ id: `box-${size}`, size, boxSize: count, title: STORE_CONFIG.productName, price, quantity: 1 });
  saveCart(items);
  openCartDrawer();
}

function updateQty(size, delta) {
  const next = cart()
    .map((item) => item.size === size ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
    .filter((item) => item.quantity > 0);
  saveCart(next);
}

function removeItem(size) {
  saveCart(cart().filter((item) => item.size !== size));
}

function reviews() {
  return safeJson(REVIEW_KEY, []);
}

function saveReview(review) {
  const next = [review, ...reviews()].slice(0, 80);
  localStorage.setItem(REVIEW_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("reviewschange"));
}

function removeReview(id) {
  localStorage.setItem(REVIEW_KEY, JSON.stringify(reviews().filter((review) => review.id !== id)));
  window.dispatchEvent(new Event("reviewschange"));
}

function boxDetails(size) {
  const isFour = size === "four";
  return {
    image: isFour ? "assets/images/four-box.webp" : "assets/images/six-box.webp",
    alt: isFour
      ? "White box of 4 Biscoff Royale cookies with Nutella-milk drizzle"
      : "White box of 6 Biscoff Royale cookies with Nutella-milk drizzle",
    label: isFour ? "4 Cookie Box selected" : "6 Cookie Box selected"
  };
}

function reviewStats() {
  const list = reviews();
  if (!list.length) return { count: 0, average: 0 };
  const average = list.reduce((sum, review) => sum + Number(review.rating), 0) / list.length;
  return { count: list.length, average: Math.round(average * 10) / 10 };
}

function stars(rating) {
  const value = Math.round(Number(rating) || 0);
  return "\u2605\u2605\u2605\u2605\u2605".split("").map((star, index) => index < value ? star : "\u2606").join("");
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
          <a href="${p}shop.html">Shop</a><a href="${p}how-it-works.html">How It Works</a><a href="${p}about.html">About</a><a href="${p}reviews.html">Reviews</a><a href="${p}faq.html">FAQs</a><a href="${p}search.html">Search</a><a href="${p}contact.html">Contact</a>
        </nav>
        <div class="desktop-actions"><a href="${p}account.html">Account</a><button class="icon-button cart-button" type="button" data-cart-open>Cart <span class="cart-count" data-cart-count>0</span></button></div>
        <button class="icon-button cart-button mobile-cart-button" type="button" data-cart-open aria-label="Open cart">Cart <span class="cart-count" data-cart-count>0</span></button>
      </div>
    </header>
    <div class="mobile-panel" data-mobile-panel aria-hidden="true">
      <nav class="mobile-menu" id="mobile-menu" aria-label="Mobile navigation">
        <button class="mobile-menu-button" type="button" data-menu-close>Close</button>
        <a href="${p}shop.html">Shop</a><a href="${p}product.html">Pre-order now</a><a href="${p}how-it-works.html">How It Works</a><a href="${p}collection.html">Collection</a><a href="${p}ingredients-allergens.html">Ingredients & Allergens</a><a href="${p}reviews.html">Reviews</a><a href="${p}faq.html">FAQs</a><a href="${p}search.html">Search</a><a href="${p}contact.html">Contact</a><a href="${p}account.html">Account</a>
      </nav>
    </div>`;
}

function footerHtml() {
  const p = basePath();
  return `<footer class="footer"><div class="container footer-grid">
    <div class="stack"><strong>${STORE_CONFIG.brandName}</strong><small>${STORE_CONFIG.tagline}</small><small>${STORE_CONFIG.location}</small><small>${STORE_CONFIG.contactLabel}</small><small>Preorder requests are confirmed by Jake before payment.</small></div>
    <div class="stack"><strong>Order</strong><a href="${p}shop.html">Shop</a><a href="${p}product.html">Pre-order now</a><button class="footer-link-button" type="button" data-cart-open>Cart</button><a href="${p}account.html">Account</a></div>
    <div class="stack"><strong>Information</strong><a href="${p}how-it-works.html">How it works</a><a href="${p}collection.html">Collection</a><a href="${p}ingredients-allergens.html">Ingredients and allergens</a><a href="${p}storage-reheating.html">Storage and reheating</a><a href="${p}order-changes-cancellations.html">Order changes</a><a href="${p}faq.html">FAQs</a><a href="${p}reviews.html">Reviews</a><a href="${p}search.html">Search</a></div>
    <div class="stack"><strong>About</strong><a href="${p}about.html">About Jake's Bakes</a><a href="${p}contact.html">Contact</a><a href="https://instagram.com/" rel="noopener">Instagram</a><a href="https://www.tiktok.com/" rel="noopener">TikTok</a></div>
    <div class="stack"><strong>Policies</strong><a href="${p}policies/privacy.html">Privacy</a><a href="${p}policies/terms.html">Terms</a><a href="${p}policies/refunds.html">Refunds</a><a href="${p}policies/cancellations.html">Cancellations</a><a href="${p}policies/missed-collection.html">Missed collection</a><a href="${p}policies/cookies.html">Cookie policy</a><a href="${p}policies/accessibility.html">Accessibility</a><a href="${p}policies/contact-information.html">Contact information</a></div>
  </div><div class="container" style="margin-top:1.5rem"><small>&copy; ${new Date().getFullYear()} ${STORE_CONFIG.brandName}. Barnsley, South Yorkshire.</small></div></footer>`;
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
    container.innerHTML = `<div class="note"><strong>Your cart is empty.</strong><p>Choose a 4 or 6 Cookie Box to start your preorder.</p></div>`;
    return;
  }
  container.innerHTML = `<div class="stack">${items.map((item) => `
    <article class="card pad cart-row ${compact ? "cart-row-compact" : ""}">
      ${compact ? "" : `<img src="${boxDetails(item.size).image}" alt="${boxDetails(item.size).alt}" loading="lazy">`}
      <div class="cart-item-copy">
        <h3>${item.boxSize} Cookie Box</h3>
        <p>${item.title}</p>
        <p><strong>${money(item.price)}</strong> each</p>
        <div class="cart-actions">
          <div class="quantity" aria-label="Quantity for ${item.boxSize} Cookie Box"><button type="button" data-qty-minus="${item.size}" aria-label="Reduce quantity">-</button><span>${item.quantity}</span><button type="button" data-qty-plus="${item.size}" aria-label="Increase quantity">+</button></div>
          <button class="button secondary cart-remove" type="button" data-remove="${item.size}">Remove</button>
        </div>
      </div>
    </article>`).join("")}
    <div class="note"><strong>Subtotal: ${money(cartSubtotal())}</strong><p>Collection only from Barnsley. Exact instructions are included with your order details.</p></div>
  </div>`;
}

function renderSlots(container) {
  const current = selectedSlot();
  container.innerHTML = `<div class="slot-grid">${STORE_CONFIG.collectionSlots.slots.map((slot) => {
    const disabled = STORE_CONFIG.collectionSlots.disabledSlots.includes(slot);
    return `<button class="slot-button ${current === slot ? "is-selected" : ""}" type="button" data-slot="${slot}" ${disabled ? "disabled" : ""}>${slot}${disabled ? " fully booked" : ""}</button>`;
  }).join("")}</div><p class="lead">Collection runs ${STORE_CONFIG.collectionWindow}. The last slot is shorter so every order stays inside the collection window.</p>`;
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

function refreshOpenCartDrawer() {
  const backdrop = document.querySelector("[data-drawer-backdrop]");
  const lines = document.querySelector("[data-drawer-lines]");
  if (!backdrop?.classList.contains("is-open") || !lines) return;
  renderCartLines(lines, true);
}

function closeCartDrawer() {
  const backdrop = document.querySelector("[data-drawer-backdrop]");
  if (!backdrop) return;
  backdrop.classList.remove("is-open");
  backdrop.setAttribute("aria-hidden", "true");
}

function ratingSummaryText() {
  const stats = reviewStats();
  if (!stats.count) return "No customer reviews yet";
  return `${stats.average} from ${stats.count} review${stats.count === 1 ? "" : "s"}`;
}

function renderRatingSummary() {
  const stats = reviewStats();
  document.querySelectorAll("[data-rating-summary]").forEach((node) => {
    node.innerHTML = stats.count
      ? `<span class="stars" aria-hidden="true">${stars(stats.average)}</span><strong>${stats.average}</strong><span>${stats.count} review${stats.count === 1 ? "" : "s"}</span>`
      : `<span class="stars" aria-hidden="true">\u2606\u2606\u2606\u2606\u2606</span><span>First customer reviews will appear here.</span>`;
    node.setAttribute("aria-label", ratingSummaryText());
  });
}

function renderRatingBreakdown() {
  const list = reviews();
  const total = list.length;
  document.querySelectorAll("[data-rating-breakdown]").forEach((node) => {
    node.innerHTML = [5, 4, 3, 2, 1].map((rating) => {
      const count = list.filter((review) => Number(review.rating) === rating).length;
      const percent = total ? Math.round((count / total) * 100) : 0;
      return `<div class="rating-row"><span>${rating} star</span><meter min="0" max="100" value="${percent}">${percent}%</meter><small>${count}</small></div>`;
    }).join("");
  });
}

function reviewCard(review, canManage = false) {
  const image = review.photo ? `<img class="review-photo" src="${review.photo}" alt="Photo uploaded with ${review.name}'s review" loading="lazy">` : "";
  const remove = canManage ? `<button class="button secondary" type="button" data-review-remove="${review.id}">Remove review</button>` : "";
  return `<article class="card review-card">${image}<div class="stars" aria-label="${review.rating} out of 5 stars">${stars(review.rating)}</div><p>${escapeHtml(review.text)}</p><strong>- ${escapeHtml(review.name)}</strong><small>${new Date(review.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</small>${remove}</article>`;
}

function renderReviewLists() {
  const list = reviews();
  document.querySelectorAll("[data-review-list]").forEach((node) => {
    const limit = Number(node.dataset.reviewLimit || list.length || 0);
    const selected = list.slice(0, limit || list.length);
    const canManage = node.hasAttribute("data-review-admin-list") && document.body.classList.contains("review-admin-unlocked");
    node.innerHTML = selected.length
      ? selected.map((review) => reviewCard(review, canManage)).join("")
      : `<div class="card pad"><p>No customer reviews have been submitted yet. After collection, customers can share honest feedback here.</p></div>`;
  });
  renderRatingSummary();
  renderRatingBreakdown();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function readFileAsDataUrl(file, max = 760, quality = 0.72) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, max / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.onerror = () => resolve(reader.result);
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


function productInit() {
  const form = document.querySelector("[data-product-form]");
  if (!form) return;
  const state = preorderCopy();
  const add = form.querySelector("[data-add-product]");
  const price = form.querySelector("[data-product-price]");
  const boxImage = form.querySelector("[data-selected-box-image]");
  const boxCaption = form.querySelector("[data-selected-box-caption]");
  const stickyPrice = document.querySelector("[data-sticky-product-price]");
  const radios = form.querySelectorAll("input[name='box-size']");
  function selected() { return form.querySelector("input[name='box-size']:checked").value; }
  function refresh() {
    const value = selected();
    const amount = value === "four" ? STORE_CONFIG.fourPackPrice : STORE_CONFIG.sixPackPrice;
    const details = boxDetails(value);
    price.textContent = money(amount);
    if (stickyPrice) stickyPrice.textContent = money(amount);
    if (boxImage) {
      boxImage.src = details.image;
      boxImage.alt = details.alt;
    }
    if (boxCaption) boxCaption.textContent = details.label;
    setGalleryImage(details.image, details.alt);
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

function setGalleryImage(src, alt) {
  const main = document.querySelector("[data-gallery-main]");
  if (!main) return;
  main.src = src;
  main.alt = alt;
  main.classList.toggle("gallery-box-image", src.includes("-box.webp"));
  document.querySelectorAll("[data-gallery-thumb]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.galleryThumb === src);
  });
}

function galleryInit() {
  const main = document.querySelector("[data-gallery-main]");
  if (!main) return;
  document.querySelectorAll("[data-gallery-thumb]").forEach((button) => {
    button.addEventListener("click", () => {
      setGalleryImage(button.dataset.galleryThumb, button.querySelector("img").alt);
    });
  });
}

function accordionInit() {
  document.querySelectorAll("[data-accordion]").forEach((accordion) => {
    accordion.addEventListener("click", (event) => {
      const btn = event.target.closest("button");
      if (!btn) return;
      accordion.querySelectorAll(".accordion-item").forEach((item) => {
        if (item !== btn.closest(".accordion-item")) {
          item.classList.remove("is-open");
          item.querySelector("button")?.setAttribute("aria-expanded", "false");
        }
      });
      const item = btn.closest(".accordion-item");
      const open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });
}

function faqSearchInit() {
  const input = document.querySelector("[data-faq-search]");
  const items = [...document.querySelectorAll("[data-faq-item]")];
  const count = document.querySelector("[data-faq-count]");
  if (!input || !items.length) return;
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    let visible = 0;
    items.forEach((item) => {
      const matches = item.textContent.toLowerCase().includes(query);
      item.hidden = !matches;
      if (matches) visible += 1;
    });
    count.textContent = `${visible} question${visible === 1 ? "" : "s"} shown`;
  });
}

function characterCountersInit() {
  document.querySelectorAll("[data-count]").forEach((field) => {
    const output = document.querySelector(`[data-count-output="${field.dataset.count}"]`);
    const update = () => { if (output) output.textContent = `${field.value.length}/${field.maxLength}`; };
    field.addEventListener("input", update);
    update();
  });
}

function formInit() {
  document.querySelectorAll("[data-contact-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await handleContactSubmit(form);
    });
  });

  document.querySelectorAll("[data-review-form]").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await handleReviewSubmit(form);
    });
  });
}

function ratingPickerInit() {
  document.querySelectorAll(".rating-picker").forEach((picker) => {
    const output = picker.querySelector("[data-rating-choice-text]");
    const labels = [...picker.querySelectorAll(".star-choice label")];
    const copy = {
      1: "1 star - Not quite right",
      2: "2 stars - Could be better",
      3: "3 stars - Good",
      4: "4 stars - Really good",
      5: "5 stars - Loved it"
    };
    function update(value) {
      labels.forEach((label) => {
        const rating = Number(label.querySelector("input").value);
        label.classList.toggle("is-filled", rating <= Number(value));
      });
      if (output) output.textContent = copy[value] || "Choose a rating";
    }
    labels.forEach((label) => {
      const input = label.querySelector("input");
      label.addEventListener("mouseenter", () => update(input.value));
      label.addEventListener("focusin", () => update(input.value));
      input.addEventListener("change", () => update(input.value));
    });
    picker.addEventListener("mouseleave", () => update(picker.querySelector("input:checked")?.value || ""));
    update(picker.querySelector("input:checked")?.value || "");
  });
}

function reviewAdminInit() {
  const form = document.querySelector("[data-review-code-form]");
  const panel = document.querySelector("[data-review-admin-panel]");
  const message = document.querySelector("[data-review-code-message]");
  if (!form || !panel) return;

  function lockManager() {
    document.body.classList.remove("review-admin-unlocked");
    panel.hidden = true;
    if (message) message.textContent = "";
    renderReviewLists();
  }

  function showManager() {
    if (document.body.classList.contains("review-admin-unlocked")) {
      lockManager();
      return;
    }
    panel.hidden = !panel.hidden;
    form.querySelector("input")?.focus();
  }

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "r") {
      event.preventDefault();
      showManager();
    }
  });

  if (location.hash === "#review-manager") showManager();

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = form.elements.reviewCode;
    if (input.value.trim() !== REVIEW_ADMIN_CODE) {
      if (message) message.textContent = "That code is not correct.";
      input.select();
      return;
    }
    document.body.classList.add("review-admin-unlocked");
    panel.hidden = true;
    input.value = "";
    if (message) message.textContent = "";
    renderReviewLists();
  });
}

function formError(form, message, field) {
  const summary = form.querySelector("[data-error-summary]");
  summary.textContent = message;
  summary.classList.add("error-summary");
  summary.classList.remove("success-summary");
  if (field) field.focus();
}

function formSuccess(form, message) {
  const summary = form.querySelector("[data-error-summary]");
  summary.textContent = message;
  summary.classList.remove("error-summary");
  summary.classList.add("success-summary");
}

function validateRequired(form) {
  const checkedGroups = new Set();
  for (const field of form.querySelectorAll("[required]")) {
    if ((field.type === "radio" || field.type === "checkbox") && field.name) {
      if (checkedGroups.has(field.name)) continue;
      checkedGroups.add(field.name);
      const group = [...form.elements].filter((element) => element.name === field.name);
      if (!group.some((element) => element.checked)) {
        return { valid: false, message: "Please choose a star rating.", field };
      }
      continue;
    }
    if (!String(field.value || "").trim()) {
      return { valid: false, message: "Please complete all required fields.", field };
    }
  }
  const email = form.querySelector("input[type='email']");
  if (email && email.value && !email.checkValidity()) return { valid: false, message: "Please enter a valid email address.", field: email };
  return { valid: true };
}

async function handleContactSubmit(form) {
  const check = validateRequired(form);
  if (!check.valid) return formError(form, check.message, check.field);
  const button = form.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "Sending...";
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    await EmailService.send("contact", data);
    formSuccess(form, "Thanks - your message has been received. Jake will reply as soon as he can.");
    form.reset();
    characterCountersInit();
  } catch {
    formError(form, "The message could not be sent. Please try again in a moment.");
  } finally {
    button.disabled = false;
    button.textContent = "Send message";
  }
}

async function handleReviewSubmit(form) {
  const check = validateRequired(form);
  if (!check.valid) return formError(form, check.message, check.field);
  const button = form.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "Sending...";
  const formData = new FormData(form);
  const photoFile = form.querySelector("input[type='file']")?.files?.[0];
  const photo = photoFile ? await readFileAsDataUrl(photoFile, 760, 0.72) : "";
  const emailPhoto = photoFile ? await readFileAsDataUrl(photoFile, 220, 0.42) : "";
  const emailReview = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: String(formData.get("name")).trim(),
    rating: Number(formData.get("rating")),
    text: String(formData.get("review")).trim(),
    date: new Date().toISOString(),
    photoAttached: Boolean(photoFile),
    photoName: photoFile?.name || "",
    emailPhoto
  };
  try {
    try {
      await EmailService.send("review", emailReview);
    } catch (error) {
      if (!emailPhoto) throw error;
      await EmailService.send("review", {
        ...emailReview,
        emailPhoto: "",
        photoSendNote: "A photo was uploaded, but EmailJS rejected the email preview. The review was still submitted and the photo remains visible on the site."
      });
    }
    const review = { ...emailReview, photo };
    saveReview(review);
    formSuccess(form, "Thank you for reviewing Jake's Bakes. Your review has been received.");
    form.reset();
    characterCountersInit();
  } catch {
    formError(form, "The review could not be sent. Please try again in a moment.");
  } finally {
    button.disabled = false;
    button.textContent = "Submit review";
  }
}

function cartPageInit() {
  const cartLines = document.querySelector("[data-cart-lines]");
  if (!cartLines) return;
  const slotBox = document.querySelector("[data-slot-picker]");
  const checkout = document.querySelector("[data-cart-checkout]");
  const submitButton = document.querySelector("[data-preorder-submit]");
  const error = document.querySelector("[data-cart-error]");
  const name = document.querySelector("input[name='cartName']");
  const email = document.querySelector("input[name='cartEmail']");
  const phone = document.querySelector("input[name='cartPhone']");
  const notes = document.querySelector("textarea[name='cartNotes']");
  function render() {
    renderCartLines(cartLines);
    if (checkout) checkout.hidden = !cart().length;
    if (slotBox) renderSlots(slotBox);
    const slotText = document.querySelector("[data-selected-slot]");
    if (slotText) slotText.textContent = selectedSlot() || "No slot selected yet";
  }
  render();
  submitButton?.addEventListener("click", async () => {
    error.textContent = "";
    if (!cart().length) { error.textContent = "Choose a box before continuing."; return; }
    if (!selectedSlot()) { error.textContent = "Choose a collection slot before sending your preorder request."; slotBox.querySelector("button:not(:disabled)")?.focus(); return; }
    if (!name.value.trim()) { error.textContent = "Enter your name before sending the preorder request."; name.focus(); return; }
    if (!email.value.trim() || !email.checkValidity()) { error.textContent = "Enter a valid email address before sending the preorder request."; email.focus(); return; }
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    const order = {
      number: `JB-${Date.now().toString().slice(-5)}`,
      name: name.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      notes: notes.value.trim(),
      items: cart(),
      slot: selectedSlot(),
      total: money(cartSubtotal()),
      collectionDate: STORE_CONFIG.collectionDate
    };
    try {
      await EmailService.send("preorder", order);
      sessionStorage.setItem("jakesBakesLastOrder", JSON.stringify(order));
      saveCart([]);
      saveSlot("");
    } catch {
      error.textContent = "The preorder request could not be sent. Please try again in a moment.";
      submitButton.disabled = false;
      submitButton.textContent = "Send preorder request";
      return;
    }
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
    target.innerHTML = `<div class="note warning"><strong>No preorder request is available yet.</strong><p>Add a box to your cart, choose a collection slot and send your preorder request to see your confirmation.</p></div><a class="button" href="product.html">Pre-order now</a>`;
    return;
  }
  target.innerHTML = `<div class="card pad stack"><h2>Request ${order.number}</h2>${order.items.map((item) => `<p>${item.quantity} x ${item.boxSize} Cookie Box - ${money(item.price)} each</p>`).join("")}<p><strong>Estimated subtotal: ${order.total}</strong></p><p>Collection date: ${order.collectionDate}</p><p>Collection slot: ${order.slot}</p><p>Jake will reply to ${escapeHtml(order.email)} to confirm availability, payment and collection details.</p><div class="cluster"><a class="button" href="collection.html">Collection information</a><a class="button secondary" href="ingredients-allergens.html">Allergen information</a><a class="button secondary" href="contact.html">Contact Jake</a></div></div>`;
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

function backToTopInit() {
  const button = document.createElement("button");
  button.className = "back-to-top";
  button.type = "button";
  button.textContent = "Back to top";
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.body.append(button);
  window.addEventListener("scroll", () => button.classList.toggle("is-visible", window.scrollY > 700), { passive: true });
}

function searchInit() {
  const input = document.querySelector("[data-site-search]");
  const results = document.querySelector("[data-search-results]");
  if (!input || !results) return;
  const pages = [
    ["Shop", "Choose The Biscoff Royale as a 4 or 6 Cookie Box.", "shop.html"],
    ["Product", "The Biscoff Royale Cookie Box.", "product.html"],
    ["How It Works", "Friday preorder and Friday collection.", "how-it-works.html"],
    ["Collection", "Barnsley collection slot information.", "collection.html"],
    ["Ingredients and Allergens", "Ingredients, allergens and dietary information.", "ingredients-allergens.html"],
    ["Storage and Reheating", "How to keep and warm your cookies.", "storage-reheating.html"],
    ["Reviews", "Customer reviews and review form.", "reviews.html"],
    ["FAQs", "Answers about ordering, allergens and collection.", "faq.html"],
    ["Contact", "Send Jake a message.", "contact.html"]
  ];
  function render() {
    const query = input.value.trim().toLowerCase();
    const matches = pages.filter((page) => page.join(" ").toLowerCase().includes(query));
    results.innerHTML = matches.map(([title, copy, href]) => `<a class="card pad" href="${href}"><strong>${title}</strong><p>${copy}</p></a>`).join("");
  }
  input.addEventListener("input", render);
  render();
}

function seoInit() {
  const canonical = document.createElement("link");
  canonical.rel = "canonical";
  canonical.href = location.origin + location.pathname;
  document.head.append(canonical);
  const twitter = [
    ["twitter:card", "summary_large_image"],
    ["twitter:title", document.title],
    ["twitter:description", document.querySelector("meta[name='description']")?.content || STORE_CONFIG.tagline]
  ];
  twitter.forEach(([name, content]) => {
    const meta = document.createElement("meta");
    meta.name = name;
    meta.content = content;
    document.head.append(meta);
  });
  if (location.pathname.endsWith("/") || location.pathname.endsWith("index.html")) {
    const schema = document.createElement("script");
    schema.type = "application/ld+json";
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Bakery",
      name: STORE_CONFIG.brandName,
      description: STORE_CONFIG.tagline,
      address: { "@type": "PostalAddress", addressLocality: "Barnsley", addressRegion: "South Yorkshire", addressCountry: "GB" },
      areaServed: STORE_CONFIG.location,
      servesCuisine: "Bakery",
      url: location.origin + location.pathname
    });
    document.head.append(schema);
  }
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
  faqSearchInit();
  characterCountersInit();
  formInit();
  ratingPickerInit();
  reviewAdminInit();
  cartPageInit();
  orderConfirmationInit();
  backToTopInit();
  searchInit();
  renderReviewLists();
  updateCartBadges();
  seoInit();
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
    const reviewRemove = event.target.closest("[data-review-remove]");
    if (reviewRemove && document.body.classList.contains("review-admin-unlocked") && window.confirm("Remove this review from the site?")) {
      removeReview(reviewRemove.dataset.reviewRemove);
    }
    const slot = event.target.closest("[data-slot]");
    if (slot && !slot.disabled) saveSlot(slot.dataset.slot);
  });
  window.addEventListener("cartchange", () => {
    updateCartBadges();
    refreshOpenCartDrawer();
  });
  window.addEventListener("reviewschange", renderReviewLists);
});
