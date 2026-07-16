const PREORDER_STATES = {
  upcoming: {
    label: "Before preorders open",
    headline: "Preorders open Friday",
    copy: "This week's drop opens on Friday at 9:00am. You can preview the box builder now.",
    cta: "Preorders open Friday",
    boxesLeft: 25,
    canOrder: false,
  },
  open: {
    label: "Preorders open",
    headline: "This week's preorder is open",
    copy: "Choose your six cookies and place your order before Sunday, or before 25 boxes sell out.",
    cta: "Pre-order now",
    boxesLeft: 18,
    canOrder: true,
  },
  low: {
    label: "Almost sold out",
    headline: "Only 4 boxes left this week",
    copy: "This value is a prototype example. In Shopify it must come from real inventory.",
    cta: "Pre-order now",
    boxesLeft: 4,
    canOrder: true,
  },
  soldout: {
    label: "Sold out",
    headline: "This week's 25 boxes have gone",
    copy: "Thank you. The next preorder opens Friday.",
    cta: "Remind me about the next drop",
    boxesLeft: 0,
    canOrder: false,
  },
  closed: {
    label: "Preorder closed",
    headline: "This week's preorder is closed",
    copy: "Jake is getting this week's boxes ready. The next drop opens on Friday.",
    cta: "Remind me about the next drop",
    boxesLeft: 0,
    canOrder: false,
  },
  preparing: {
    label: "Preparing orders",
    headline: "This week's boxes are being prepared",
    copy: "Orders are closed while Jake prepares the cookies for Friday collection.",
    cta: "Next drop opens Friday",
    boxesLeft: 0,
    canOrder: false,
  },
  ready: {
    label: "Ready for collection",
    headline: "Collection day is here",
    copy: "Customers should follow their confirmation and ready-for-pickup notification.",
    cta: "View collection info",
    boxesLeft: 0,
    canOrder: false,
  },
};

function getPreorderStateKey() {
  const params = new URLSearchParams(window.location.search);
  const queryState = params.get("state");
  return PREORDER_STATES[queryState] ? queryState : "open";
}

function applyPreorderState(key = getPreorderStateKey()) {
  const state = PREORDER_STATES[key] || PREORDER_STATES.open;
  document.querySelectorAll("[data-preorder-headline]").forEach((node) => {
    node.textContent = state.headline;
  });
  document.querySelectorAll("[data-preorder-copy]").forEach((node) => {
    node.textContent = state.copy;
  });
  document.querySelectorAll("[data-preorder-cta]").forEach((node) => {
    node.textContent = state.cta;
    if (node.matches("a, button")) {
      node.toggleAttribute("aria-disabled", !state.canOrder);
    }
  });
  document.querySelectorAll("[data-boxes-left]").forEach((node) => {
    node.textContent = String(state.boxesLeft);
  });
  document.querySelectorAll("[data-order-dependent]").forEach((node) => {
    node.toggleAttribute("disabled", !state.canOrder);
    node.classList.toggle("is-disabled", !state.canOrder);
  });
  window.currentPreorderState = state;
  window.dispatchEvent(new CustomEvent("preorderstatechange", { detail: state }));
}

document.addEventListener("DOMContentLoaded", () => {
  const control = document.querySelector("[data-state-control]");
  if (control) {
    Object.entries(PREORDER_STATES).forEach(([key, state]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = state.label;
      control.append(option);
    });
    control.value = getPreorderStateKey();
    control.addEventListener("change", () => {
      const url = new URL(window.location.href);
      url.searchParams.set("state", control.value);
      window.history.replaceState({}, "", url);
      applyPreorderState(control.value);
    });
  }
  applyPreorderState();
});
