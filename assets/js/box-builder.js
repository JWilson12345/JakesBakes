document.addEventListener("DOMContentLoaded", () => {
  const builder = document.querySelector("[data-box-builder]");
  if (!builder) return;

  const config = window.STORE_CONFIG;
  const quantities = Object.fromEntries(config.flavours.map((flavour) => [flavour.id, 0]));
  const flavourList = builder.querySelector("[data-flavour-list]");
  const slots = builder.querySelector("[data-box-slots]");
  const selectedCounts = builder.querySelectorAll("[data-selected-count]");
  const remainingCount = builder.querySelector("[data-remaining-count]");
  const progressCopy = builder.querySelector("[data-progress-copy]");
  const progressFill = builder.querySelector("[data-progress-fill]");
  const prices = builder.querySelectorAll("[data-builder-price]");
  const premiumStatus = builder.querySelector("[data-premium-status]");
  const breakdown = builder.querySelector("[data-breakdown]");
  const addButtons = builder.querySelectorAll("[data-add-box]");
  const live = builder.querySelector("[data-builder-live]");

  function totalSelected() {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  }

  function isPremium() {
    return config.flavours.some((flavour) => flavour.premium && quantities[flavour.id] > 0);
  }

  function currentPrice() {
    return isPremium() ? config.premiumBoxPrice : config.baseBoxPrice;
  }

  function renderFlavours() {
    flavourList.innerHTML = "";
    config.flavours.forEach((flavour) => {
      const row = document.createElement("article");
      row.className = "card flavour-row";
      row.innerHTML = `
        <img src="${flavour.image}" alt="${flavour.name} cookie">
        <div class="stack">
          <div>
            <h3>${flavour.name}</h3>
            <p>${flavour.description}</p>
          </div>
          ${flavour.premium ? '<span class="badge">Makes the box £18.49</span>' : '<span class="badge">Included in the £15.99 box</span>'}
        </div>
        <div class="qty-controls" aria-label="${flavour.name} quantity controls">
          <button type="button" data-minus="${flavour.id}" aria-label="Remove one ${flavour.shortName} cookie">-</button>
          <span class="qty-count" data-qty="${flavour.id}">0</span>
          <button type="button" data-plus="${flavour.id}" aria-label="Add one ${flavour.shortName} cookie">+</button>
        </div>
      `;
      flavourList.append(row);
    });
  }

  function renderSlots() {
    const chosen = [];
    config.flavours.forEach((flavour) => {
      for (let index = 0; index < quantities[flavour.id]; index += 1) {
        chosen.push(flavour.shortName);
      }
    });

    slots.innerHTML = "";
    for (let index = 0; index < config.cookiesPerBox; index += 1) {
      const slot = document.createElement("div");
      slot.className = `box-slot${chosen[index] ? " filled" : ""}`;
      slot.textContent = chosen[index] || "Empty";
      slots.append(slot);
    }
  }

  function render() {
    const total = totalSelected();
    const remaining = config.cookiesPerBox - total;
    const premium = isPremium();

    selectedCounts.forEach((node) => {
      node.textContent = String(total);
    });
    remainingCount.textContent = String(Math.max(remaining, 0));
    progressFill.style.width = `${(total / config.cookiesPerBox) * 100}%`;
    prices.forEach((node) => {
      node.textContent = formatMoney(currentPrice());
    });
    premiumStatus.textContent = premium ? "Includes Oreo or Biscoff" : "Chocolate Chip only";
    progressCopy.textContent =
      total === config.cookiesPerBox
        ? "Your box is full"
        : total === 0
          ? "Choose your six cookies"
          : `Choose ${remaining} more`;

    breakdown.innerHTML = config.flavours
      .filter((flavour) => quantities[flavour.id] > 0)
      .map((flavour) => `<li>${quantities[flavour.id]} ${flavour.shortName}</li>`)
      .join("") || "<li>No cookies selected yet</li>";

    builder.querySelectorAll("[data-qty]").forEach((node) => {
      node.textContent = String(quantities[node.dataset.qty]);
    });
    builder.querySelectorAll("[data-plus]").forEach((button) => {
      button.disabled = total >= config.cookiesPerBox || window.currentPreorderState?.canOrder === false;
    });
    builder.querySelectorAll("[data-minus]").forEach((button) => {
      button.disabled = quantities[button.dataset.minus] <= 0 || window.currentPreorderState?.canOrder === false;
    });

    addButtons.forEach((button) => {
      button.disabled = total !== config.cookiesPerBox || window.currentPreorderState?.canOrder === false;
      button.textContent = total === config.cookiesPerBox ? "Add box to cart" : `Choose ${remaining} more`;
    });
    live.textContent = `${total} of ${config.cookiesPerBox} selected. ${progressCopy.textContent}. Total ${formatMoney(currentPrice())}.`;
    renderSlots();
  }

  renderFlavours();

  builder.addEventListener("click", (event) => {
    const plus = event.target.closest("[data-plus]");
    const minus = event.target.closest("[data-minus]");
    if (plus && totalSelected() < config.cookiesPerBox) {
      quantities[plus.dataset.plus] += 1;
      render();
    }
    if (minus && quantities[minus.dataset.minus] > 0) {
      quantities[minus.dataset.minus] -= 1;
      render();
    }
  });

  function addBox() {
    if (totalSelected() !== config.cookiesPerBox) return;
    const items = config.flavours.map((flavour) => ({
      id: flavour.id,
      shortName: flavour.shortName,
      quantity: quantities[flavour.id],
    }));
    saveCart({
      product: "Build Your Own Box of Six",
      variant: isPremium() ? "Premium Mix Box" : "Classic Box",
      isPremium: isPremium(),
      price: currentPrice(),
      items,
      addedAt: new Date().toISOString(),
    });
    live.textContent = "Your six-cookie box has been added.";
    addButtons.forEach((button) => {
      button.textContent = "Added";
    });
    setTimeout(() => {
      window.location.href = "cart.html";
    }, 450);
  }

  addButtons.forEach((button) => {
    button.addEventListener("click", addBox);
  });

  window.addEventListener("preorderstatechange", render);
  render();
});
