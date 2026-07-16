const CART_KEY = "jakesBakesPrototypeCart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || null;
  } catch {
    return null;
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cartchange"));
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("cartchange"));
}

function updateCartCount() {
  const cart = getCart();
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = cart ? "1" : "0";
  });
}

function renderCartPage() {
  const empty = document.querySelector("[data-cart-empty]");
  const filled = document.querySelector("[data-cart-filled]");
  if (!empty || !filled) return;
  const cart = getCart();
  empty.hidden = Boolean(cart);
  filled.hidden = !cart;
  if (!cart) return;

  filled.querySelector("[data-cart-price]").textContent = formatMoney(cart.price);
  filled.querySelector("[data-cart-type]").textContent = cart.isPremium ? "Box with Oreo or Biscoff" : "Chocolate Chip box";
  filled.querySelector("[data-cart-breakdown]").innerHTML = cart.items
    .filter((item) => item.quantity > 0)
    .map((item) => `<li>${item.quantity} ${item.shortName}</li>`)
    .join("");
}

function initCartForms() {
  const checkout = document.querySelector("[data-checkout]");
  const slot = document.querySelector("[data-slot-select]");
  const error = document.querySelector("[data-slot-error]");
  if (checkout && slot) {
    checkout.addEventListener("click", (event) => {
      if (!slot.value) {
        event.preventDefault();
        error.textContent = "Choose a Friday collection slot before continuing.";
        slot.focus();
        return;
      }
      const cart = getCart();
      saveCart({ ...cart, collectionSlot: slot.value });
      window.location.href = "order-success.html";
    });
  }

  document.querySelectorAll("[data-clear-cart]").forEach((button) => {
    button.addEventListener("click", () => {
      clearCart();
      renderCartPage();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCartPage();
  initCartForms();
});

window.addEventListener("cartchange", () => {
  updateCartCount();
  renderCartPage();
});
